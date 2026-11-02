"""Local WebSocket API for HomeDeck."""

from typing import Any

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback

from .const import DOMAIN
from .discovery import discover_home
from .license import (
    CONTROLLABLE_DOMAINS,
    FREE_DEVICES,
    FREE_ROOMS,
    LicenseError,
    async_activate,
    async_cancel_checkout,
    async_checkout,
    async_claim,
    async_deactivate,
    async_is_pro,
    async_license_status,
    async_portal,
    async_refresh,
)
from .storage import async_load_config, async_save_config, normalize_config

_COMMANDS_REGISTERED = "commands_registered"


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/rooms"})
@callback
def websocket_get_rooms(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Return the normalized Areas -> Devices -> Entities model."""
    connection.send_result(msg["id"], discover_home(hass))


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/config"})
@websocket_api.async_response
async def websocket_get_config(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Return local HomeDeck configuration."""
    connection.send_result(msg["id"], await async_load_config(hass))


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/config/save",
        vol.Required("config"): dict,
    }
)
@websocket_api.async_response
async def websocket_save_config(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Validate and persist local HomeDeck configuration."""
    if not await async_is_pro(hass):
        current = _free_usage(hass, await async_load_config(hass))
        wanted = _free_usage(hass, normalize_config(msg["config"]))
        # Only block changes that grow past the free limits, so a panel that was already
        # over them before an update can still be rearranged while it is being reduced.
        for key, limit in (("rooms", FREE_ROOMS), ("devices", FREE_DEVICES)):
            if wanted[key] > limit and wanted[key] > current[key]:
                connection.send_error(msg["id"], "pro_required", f"Free plan allows up to {limit} {key}")
                return
    config = await async_save_config(hass, msg["config"])
    connection.send_result(msg["id"], config)


def _free_usage(hass: HomeAssistant, config: dict[str, Any]) -> dict[str, int]:
    """Rooms in the panel and controllable devices that count toward the free plan."""
    rooms = discover_home(hass)["rooms"]
    ids = [room["id"] for room in rooms]
    # The free plan keeps its own room choice, so the full selection is intact for Pro.
    selected = (
        [room_id for room_id in config["free_rooms"] if room_id in ids]
        or [room_id for room_id in config["selected_rooms"] if room_id in ids]
        or ids
    )
    devices = config["free_devices"]
    if not devices:
        # No explicit choice yet: every controllable device of the selected rooms counts.
        devices = [
            entity["entity_id"]
            for room in rooms
            if room["id"] in selected
            for entity in room["entities"]
            if entity["domain"] in CONTROLLABLE_DOMAINS
        ]
    return {"rooms": len(selected), "devices": len(devices)}


@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/license", vol.Optional("refresh", default=False): bool}
)
@websocket_api.async_response
async def websocket_license(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Return the plan and license status; `refresh` checks with the license server first."""
    if msg["refresh"]:
        await async_refresh(hass, force=True)
    connection.send_result(msg["id"], await async_license_status(hass))


@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/license/activate", vol.Required("key"): str}
)
@websocket_api.async_response
async def websocket_license_activate(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Activate Pro with a license key."""
    try:
        status = await async_activate(hass, msg["key"])
    except LicenseError as err:
        connection.send_error(msg["id"], str(err), "This key does not unlock Pro here")
        return
    connection.send_result(msg["id"], status)


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/license/deactivate"})
@websocket_api.async_response
async def websocket_license_deactivate(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Remove the license from this installation."""
    connection.send_result(msg["id"], await async_deactivate(hass))


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/license/checkout",
        vol.Required("plan"): vol.In(["lifetime", "annual"]),
        vol.Optional("locale"): str,
    }
)
@websocket_api.async_response
async def websocket_license_checkout(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Start a Stripe checkout for this installation and return its URL."""
    try:
        connection.send_result(msg["id"], await async_checkout(hass, msg["plan"], msg.get("locale")))
    except LicenseError as err:
        connection.send_error(msg["id"], str(err), "The license server could not start the checkout")


@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/license/claim", vol.Optional("cancel", default=False): bool}
)
@websocket_api.async_response
async def websocket_license_claim(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Activate Pro if the pending checkout was paid, or forget it when cancelled."""
    claim = async_cancel_checkout if msg["cancel"] else async_claim
    connection.send_result(msg["id"], await claim(hass))


@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/license/portal", vol.Optional("return_url"): str}
)
@websocket_api.async_response
async def websocket_license_portal(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Return a Stripe customer portal link for the license on this installation."""
    try:
        connection.send_result(msg["id"], await async_portal(hass, msg.get("return_url")))
    except LicenseError as err:
        connection.send_error(msg["id"], str(err), "The license server could not open the portal")


def async_register_websocket_commands(hass: HomeAssistant) -> None:
    """Register HomeDeck commands once per Home Assistant process."""
    domain_data = hass.data.setdefault(DOMAIN, {})
    if domain_data.get(_COMMANDS_REGISTERED):
        return

    websocket_api.async_register_command(hass, websocket_get_rooms)
    websocket_api.async_register_command(hass, websocket_get_config)
    websocket_api.async_register_command(hass, websocket_save_config)
    websocket_api.async_register_command(hass, websocket_license)
    websocket_api.async_register_command(hass, websocket_license_activate)
    websocket_api.async_register_command(hass, websocket_license_deactivate)
    websocket_api.async_register_command(hass, websocket_license_checkout)
    websocket_api.async_register_command(hass, websocket_license_claim)
    websocket_api.async_register_command(hass, websocket_license_portal)
    domain_data[_COMMANDS_REGISTERED] = True
