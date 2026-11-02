"""Automatic Areas -> Devices -> Entities discovery."""

from collections import defaultdict
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers import area_registry as ar
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er

from .const import SUPPORTED_DOMAINS, VERSION

UNASSIGNED_ID = "__unassigned__"


def _entity_name(state: Any, registry_entry: Any | None) -> str:
    """Return the best user-facing name without changing user-owned text."""
    if registry_entry is not None:
        if registry_entry.name:
            return registry_entry.name
        if registry_entry.original_name:
            return registry_entry.original_name
    return (
        state.attributes.get("friendly_name")
        or state.entity_id.split(".", 1)[1].replace("_", " ").title()
    )


def _entity_payload(
    state: Any, registry_entry: Any | None, area_id: str
) -> dict[str, Any]:
    """Serialize discovery metadata; live state remains sourced from hass.states."""
    domain = state.entity_id.split(".", 1)[0]
    return {
        "entity_id": state.entity_id,
        "domain": domain,
        "name": _entity_name(state, registry_entry),
        "area_id": area_id,
        "device_id": registry_entry.device_id if registry_entry else None,
        "device_class": state.attributes.get("device_class"),
        "icon": state.attributes.get("icon"),
        "platform": registry_entry.platform if registry_entry else None,
    }


def discover_home(hass: HomeAssistant) -> dict[str, Any]:
    """Build HomeDeck's normalized discovery model."""
    area_registry = ar.async_get(hass)
    device_registry = dr.async_get(hass)
    entity_registry = er.async_get(hass)

    room_entities: dict[str, list[dict[str, Any]]] = defaultdict(list)
    room_devices: dict[str, set[str]] = defaultdict(set)

    for state in hass.states.async_all():
        domain = state.entity_id.split(".", 1)[0]
        if domain not in SUPPORTED_DOMAINS:
            continue

        registry_entry = entity_registry.async_get(state.entity_id)
        if registry_entry is not None and (
            registry_entry.disabled_by is not None
            or registry_entry.hidden_by is not None
        ):
            continue

        device = None
        if registry_entry is not None and registry_entry.device_id:
            device = device_registry.async_get(registry_entry.device_id)

        area_id = (
            registry_entry.area_id
            if registry_entry is not None and registry_entry.area_id
            else device.area_id
            if device is not None and device.area_id
            else UNASSIGNED_ID
        )

        room_entities[area_id].append(
            _entity_payload(state, registry_entry, area_id)
        )
        if device is not None:
            room_devices[area_id].add(device.id)

    rooms: list[dict[str, Any]] = []
    for area_id, entities in room_entities.items():
        area = (
            area_registry.async_get_area(area_id)
            if area_id != UNASSIGNED_ID
            else None
        )
        rooms.append(
            {
                "id": area_id,
                "name": area.name if area is not None else "Unassigned",
                "icon": area.icon if area is not None else "mdi:home-question",
                "aliases": (
                    sorted(getattr(area, "aliases", []))
                    if area is not None
                    else []
                ),
                "floor_id": (
                    getattr(area, "floor_id", None)
                    if area is not None
                    else None
                ),
                "device_count": len(room_devices[area_id]),
                "entities": sorted(
                    entities,
                    key=lambda item: (
                        item["domain"],
                        item["name"].casefold(),
                    ),
                ),
            }
        )

    rooms.sort(
        key=lambda room: (
            room["id"] == UNASSIGNED_ID,
            room["name"].casefold(),
        )
    )
    return {
        "version": VERSION,
        "rooms": rooms,
        "counts": {
            "rooms": len(
                [room for room in rooms if room["id"] != UNASSIGNED_ID]
            ),
            "devices": sum(room["device_count"] for room in rooms),
            "entities": sum(len(room["entities"]) for room in rooms),
        },
    }

