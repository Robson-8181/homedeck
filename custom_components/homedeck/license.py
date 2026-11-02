"""HomeDeck Pro licenses: offline verification of Ed25519-signed keys.

A key looks like ``HD1.<payload>.<signature>`` (base64url). The payload names the
Home Assistant installation it was issued for, so a key only unlocks Pro there.
"""

import asyncio
import base64
import binascii
from collections.abc import Callable
from datetime import timedelta
import json
import logging
import time
from typing import Any

import aiohttp

from cryptography.exceptions import InvalidSignature
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PublicKey

from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import instance_id
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.event import async_track_time_interval
from homeassistant.helpers.storage import Store

from .const import DOMAIN

PREFIX = "HD1"
# Signing keys by id. "dev" signs development licenses (scripts/dev_license.py) and "test1"
# the license server in Stripe test mode; both go away when the live key is added.
PUBLIC_KEYS: dict[str, str] = {
    "dev": "luX5CAtuGZNQBR2xEv_N2L8HGzaOEv3anjQGGD36PLk",
    "test1": "srCwmO-ZB6GEIkL_13IQL8yL_lIE7t1sFlTh68BK2SY",
}

FREE_ROOMS = 4
FREE_DEVICES = 10
# Only these count toward the free limit; sensors and scenes are always free.
CONTROLLABLE_DOMAINS = {"light", "switch", "fan", "cover", "climate", "media_player", "lock"}
# The license server (server/api in this repository): Stripe checkout, renewals and transfers.
LICENSE_SERVER = "https://homedeck.pro/api"
# Keys signed with these ids never reach the server: they were issued by hand.
OFFLINE_KIDS = {"dev"}
REFRESH_EVERY = 7 * 86400
_REFRESH_INTERVAL = timedelta(hours=12)
_TIMEOUT = aiohttp.ClientTimeout(total=20)
# Errors the server sends back that end a license on this installation.
_ENDED = {"revoked", "transferred", "expired"}

_LOGGER = logging.getLogger(__name__)

_STORE_KEY = "homedeck.license"
_STORE_DATA = "license_store"


class LicenseError(Exception):
    """A key or request that cannot unlock Pro here; the message is a stable error code."""


def _b64decode(value: str) -> bytes:
    return base64.urlsafe_b64decode(value + "=" * (-len(value) % 4))


def verify_key(key: str, installation: str, now: float | None = None) -> dict[str, Any]:
    """Return the payload of a valid key for this installation, or raise LicenseError."""
    try:
        prefix, body, signature = key.strip().split(".")
        if prefix != PREFIX:
            raise ValueError
        payload = json.loads(_b64decode(body))
        public = PUBLIC_KEYS[payload["kid"]]
        Ed25519PublicKey.from_public_bytes(_b64decode(public)).verify(
            _b64decode(signature), f"{prefix}.{body}".encode()
        )
    except (ValueError, KeyError, TypeError, binascii.Error, InvalidSignature) as err:
        raise LicenseError("invalid") from err
    if payload.get("plan") != "pro":
        raise LicenseError("invalid")
    if payload.get("iid") != installation:
        raise LicenseError("wrong_installation")
    expires = payload.get("exp")
    if expires is not None and (now or time.time()) > expires:
        raise LicenseError("expired")
    return payload


def _store(hass: HomeAssistant) -> Store[dict[str, Any]]:
    data = hass.data.setdefault(DOMAIN, {})
    if _STORE_DATA not in data:
        data[_STORE_DATA] = Store(hass, 1, _STORE_KEY)
    return data[_STORE_DATA]


def _mask(email: str) -> str:
    name, _, host = email.partition("@")
    return f"{name[:2]}•••@{host}" if host else "•••"


def _kid(key: str) -> str:
    try:
        return str(json.loads(_b64decode(key.split(".")[1])).get("kid", ""))
    except (IndexError, ValueError, binascii.Error):
        return ""


async def _server(hass: HomeAssistant, route: str, data: dict[str, Any]) -> dict[str, Any]:
    """POST to the license server; its error codes come back as LicenseError, outages as "offline"."""
    try:
        async with async_get_clientsession(hass).post(f"{LICENSE_SERVER}/{route}", json=data, timeout=_TIMEOUT) as response:
            body = await response.json(content_type=None)
    except (aiohttp.ClientError, asyncio.TimeoutError, ValueError) as err:
        raise LicenseError("offline") from err
    if not isinstance(body, dict):
        raise LicenseError("offline")
    if response.status >= 500:
        raise LicenseError("offline")
    if response.status >= 400:
        raise LicenseError(str(body.get("error", "invalid")))
    return body


async def async_license_status(hass: HomeAssistant) -> dict[str, Any]:
    """Plan, license details and free limits, as shown in the panel."""
    installation = await instance_id.async_get(hass)
    stored = await _store(hass).async_load() or {}
    status: dict[str, Any] = {
        "plan": "free",
        "status": stored.get("ended", "none"),
        "installation_id": installation,
        "limits": {"rooms": FREE_ROOMS, "devices": FREE_DEVICES},
        "controllable_domains": sorted(CONTROLLABLE_DOMAINS),
        "can_buy": bool(LICENSE_SERVER),
        "pending": bool(stored.get("pending")),
    }
    key = stored.get("key")
    if not key:
        return status
    try:
        payload = verify_key(key, installation)
    except LicenseError as err:
        status["status"] = str(err)
        return status
    status.update(
        plan="pro",
        status="active",
        kind=payload.get("kind"),
        email=_mask(str(payload.get("email", ""))),
        # Annual keys outlive the paid period by the offline grace; the panel shows the paid date.
        expires_at=payload.get("until", payload.get("exp")),
        cancels=bool(payload.get("cancels")),
        manage=payload.get("kid") not in OFFLINE_KIDS,
    )
    return status


async def _save_key(hass: HomeAssistant, key: str) -> None:
    await _store(hass).async_save({"key": key.strip(), "checked_at": time.time()})


async def async_activate(hass: HomeAssistant, key: str) -> dict[str, Any]:
    """Verify and store a key; a key from another installation is moved here through the server."""
    installation = await instance_id.async_get(hass)
    try:
        verify_key(key, installation)
    except LicenseError as err:
        if str(err) != "wrong_installation" or _kid(key) in OFFLINE_KIDS:
            raise
        key = (await _server(hass, "transfer", {"key": key.strip(), "installation": installation}))["key"]
        verify_key(key, installation)
    await _save_key(hass, key)
    return await async_license_status(hass)


async def async_deactivate(hass: HomeAssistant) -> dict[str, Any]:
    await _store(hass).async_save({})
    return await async_license_status(hass)


async def async_is_pro(hass: HomeAssistant) -> bool:
    return (await async_license_status(hass))["plan"] == "pro"


async def async_checkout(hass: HomeAssistant, plan: str, locale: str | None) -> dict[str, Any]:
    """Start a Stripe checkout for this installation; async_claim finishes it."""
    result = await _server(hass, "checkout", {"plan": plan, "installation": await instance_id.async_get(hass), "locale": locale})
    store = _store(hass)
    stored = await store.async_load() or {}
    await store.async_save({**stored, "pending": {"session": result["session"], "expires_at": result.get("expires_at")}})
    return {"url": result["url"]}


async def async_claim(hass: HomeAssistant) -> dict[str, Any]:
    """Activate Pro once the pending checkout is paid; the panel polls this while it waits."""
    store = _store(hass)
    stored = await store.async_load() or {}
    pending = stored.get("pending")
    if pending:
        installation = await instance_id.async_get(hass)
        try:
            key = (await _server(hass, "claim", {"session": pending["session"], "installation": installation}))["key"]
            verify_key(key, installation)
            await _save_key(hass, key)
        except LicenseError as err:
            if str(err) not in {"pending", "offline"}:
                _LOGGER.warning("HomeDeck checkout could not be claimed: %s", err)
                await store.async_save({name: value for name, value in stored.items() if name != "pending"})
    return await async_license_status(hass)


async def async_cancel_checkout(hass: HomeAssistant) -> dict[str, Any]:
    store = _store(hass)
    stored = await store.async_load() or {}
    await store.async_save({name: value for name, value in stored.items() if name != "pending"})
    return await async_license_status(hass)


async def async_portal(hass: HomeAssistant, return_url: str | None) -> dict[str, Any]:
    """Stripe's customer portal for the license on this installation."""
    stored = await _store(hass).async_load() or {}
    if not stored.get("key"):
        raise LicenseError("invalid")
    return {"url": (await _server(hass, "portal", {"key": stored["key"], "return_url": return_url}))["url"]}


async def async_refresh(hass: HomeAssistant, force: bool = False) -> None:
    """Renew the key from the server: extends annual plans and ends refunded or moved licenses."""
    store = _store(hass)
    stored = await store.async_load() or {}
    key = stored.get("key")
    if not key or _kid(key) in OFFLINE_KIDS:
        return
    if not force and time.time() - stored.get("checked_at", 0) < REFRESH_EVERY:
        return
    try:
        fresh = (await _server(hass, "refresh", {"key": key}))["key"]
        verify_key(fresh, await instance_id.async_get(hass))
    except LicenseError as err:
        if str(err) in _ENDED:
            _LOGGER.warning("HomeDeck Pro ended on this installation: %s", err)
            await store.async_save({"ended": str(err)})
        # Offline or a server problem: the stored key keeps working until it expires.
        return
    await store.async_save({**stored, "key": fresh, "checked_at": time.time()})


@callback
def async_start_refresh(hass: HomeAssistant) -> Callable[[], None]:
    """Check the license now and every 12 hours; returns the function that stops it."""

    async def _refresh(_now: Any = None) -> None:
        await async_refresh(hass)

    hass.async_create_background_task(_refresh(), "homedeck license refresh")
    return async_track_time_interval(hass, _refresh, _REFRESH_INTERVAL)
