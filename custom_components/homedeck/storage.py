"""Persistent local storage for HomeDeck."""

from copy import deepcopy
import re
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import DOMAIN, STORAGE_KEY, STORAGE_VERSION
from .models import HomeDeckConfig, default_config

_CONFIG_DATA = "config"
_STORE_DATA = "store"
_ALLOWED_BACKGROUNDS = {
    "adaptive_ember",
    "adaptive_aurora",
    "adaptive_sunset",
    "fixed_night",
    "fixed_ocean",
    "fixed_graphite",
    "adaptive_forest",
    "adaptive_lagoon",
    "fixed_wine",
    "fixed_plum",
}
_ALLOWED_FORECAST_TYPES = {"daily", "hourly"}
_ALLOWED_VIEW_MODES = {"grid", "sidebar", "list", "focus"}
_ALLOWED_PAGE_TYPES = {"favorites", "scenes", "custom"}
_MAX_LAYOUTS = 300
_MAX_LAYOUT_ITEMS = 500
_MAX_KEY_LENGTH = 300
_SCREENSAVER_DELAYS = {30, 60, 120, 180, 300, 600, 900, 1800}


def _unique_strings(value: Any) -> list[str]:
    """Return ordered, unique strings from an arbitrary value."""
    if not isinstance(value, list):
        return []
    result: list[str] = []
    for item in value:
        if isinstance(item, str) and item not in result:
            result.append(item)
    return result


def _normalize_layouts(value: Any) -> dict[str, dict[str, list[str]]]:
    """Return per-screen layouts: ordered, hidden and double-width item keys."""
    if not isinstance(value, dict):
        return {}
    layouts: dict[str, dict[str, list[str]]] = {}
    for screen, layout in list(value.items())[:_MAX_LAYOUTS]:
        if not isinstance(screen, str) or not screen or len(screen) > _MAX_KEY_LENGTH:
            continue
        if not isinstance(layout, dict):
            continue
        layouts[screen] = {
            key: [
                item
                for item in _unique_strings(layout.get(key))
                if len(item) <= _MAX_KEY_LENGTH
            ][:_MAX_LAYOUT_ITEMS]
            for key in ("order", "hidden", "wide", "added")
        }
    return layouts


def _normalize_pages(value: Any) -> list[dict[str, Any]]:
    """Return safe user-created page definitions."""
    if not isinstance(value, list):
        return []
    pages: list[dict[str, Any]] = []
    used_ids: set[str] = set()
    for item in value:
        if not isinstance(item, dict):
            continue
        page_id = item.get("id")
        title = item.get("title")
        page_type = item.get("type")
        if (
            not isinstance(page_id, str)
            or not page_id
            or page_id in used_ids
            or not isinstance(title, str)
            or not title.strip()
            or page_type not in _ALLOWED_PAGE_TYPES
        ):
            continue
        used_ids.add(page_id)
        icon = item.get("icon")
        pages.append(
            {
                "id": page_id[:80],
                "title": title.strip()[:80],
                "type": page_type,
                "icon": icon[:40] if isinstance(icon, str) else "grid",
                "entity_ids": _unique_strings(item.get("entity_ids")),
            }
        )
    return pages


def normalize_config(value: Any) -> HomeDeckConfig:
    """Normalize stored or user-provided configuration."""
    config = default_config()
    if not isinstance(value, dict):
        return config

    config["onboarding_complete"] = bool(value.get("onboarding_complete", False))

    accent_color = value.get("accent_color")
    if isinstance(accent_color, str) and re.fullmatch(r"#[0-9a-fA-F]{6}", accent_color):
        config["accent_color"] = accent_color.lower()

    highlight_color = value.get("highlight_color")
    if isinstance(highlight_color, str) and re.fullmatch(r"#[0-9a-fA-F]{6}", highlight_color):
        config["highlight_color"] = highlight_color.lower()

    locale = value.get("locale")
    if isinstance(locale, str):
        config["locale"] = locale

    config["selected_rooms"] = _unique_strings(value.get("selected_rooms"))
    config["favorites"] = _unique_strings(value.get("favorites"))
    config["free_devices"] = _unique_strings(value.get("free_devices"))[:50]
    config["free_rooms"] = _unique_strings(value.get("free_rooms"))[:50]
    if value.get("view_mode") in _ALLOWED_VIEW_MODES:
        config["view_mode"] = value["view_mode"]

    rooms = value.get("rooms")
    if isinstance(rooms, dict):
        config["rooms"] = deepcopy(rooms)

    dashboard = value.get("dashboard")
    if isinstance(dashboard, dict):
        config["dashboard"] = deepcopy(dashboard)

    preferences = value.get("preferences")
    if isinstance(preferences, dict):
        temperature_unit = preferences.get("temperature_unit")
        clock = preferences.get("clock")
        if isinstance(temperature_unit, str):
            config["preferences"]["temperature_unit"] = temperature_unit
        if isinstance(clock, str):
            config["preferences"]["clock"] = clock

    home = value.get("home")
    if isinstance(home, dict):
        for key in ("show_clock", "show_weather", "show_presence"):
            if isinstance(home.get(key), bool):
                config["home"][key] = home[key]

    global_actions = value.get("global_actions")
    if isinstance(global_actions, dict):
        for key in ("lights_on", "lights_off"):
            if isinstance(global_actions.get(key), bool):
                config["global_actions"][key] = global_actions[key]

    navigation = value.get("navigation")
    if isinstance(navigation, dict):
        for key in ("rooms", "scenes", "media", "security"):
            if isinstance(navigation.get(key), bool):
                config["navigation"][key] = navigation[key]

    layout = value.get("layout")
    if isinstance(layout, dict):
        featured_room = layout.get("featured_room")
        if isinstance(featured_room, str) or featured_room is None:
            config["layout"]["featured_room"] = featured_room

    background = value.get("background")
    if isinstance(background, dict):
        preset = background.get("preset")
        if isinstance(preset, str) and preset in _ALLOWED_BACKGROUNDS:
            config["background"]["preset"] = preset
        for key in ("animated", "include_devices"):
            if isinstance(background.get(key), bool):
                config["background"][key] = background[key]

    visibility = value.get("visibility")
    if isinstance(visibility, dict):
        for key in (
            "hidden_home_rooms",
            "hidden_home_entities",
            "visible_home_entities",
            "hidden_room_entities",
        ):
            config["visibility"][key] = _unique_strings(visibility.get(key))
        home_cards = visibility.get("home_cards")
        if isinstance(home_cards, dict):
            for key in ("status", "priority", "rooms", "shortcuts", "scenes"):
                if isinstance(home_cards.get(key), bool):
                    config["visibility"]["home_cards"][key] = home_cards[key]

    priority_cards = value.get("priority_cards")
    if isinstance(priority_cards, dict):
        for key in ("security", "climate", "media"):
            if isinstance(priority_cards.get(key), bool):
                config["priority_cards"][key] = priority_cards[key]
        config["priority_cards"]["featured_entity_ids"] = _unique_strings(
            priority_cards.get("featured_entity_ids")
        )

    weather = value.get("weather")
    if isinstance(weather, dict):
        entity_id = weather.get("entity_id")
        forecast_type = weather.get("forecast_type")
        if isinstance(entity_id, str):
            config["weather"]["entity_id"] = entity_id
        if forecast_type in _ALLOWED_FORECAST_TYPES:
            config["weather"]["forecast_type"] = forecast_type

    config["pages"] = _normalize_pages(value.get("pages"))
    config["layouts"] = _normalize_layouts(value.get("layouts"))

    screensaver = value.get("screensaver")
    if isinstance(screensaver, dict):
        if isinstance(screensaver.get("enabled"), bool):
            config["screensaver"]["enabled"] = screensaver["enabled"]
        delay = screensaver.get("delay")
        if isinstance(delay, int) and delay in _SCREENSAVER_DELAYS:
            config["screensaver"]["delay"] = delay

    agenda = value.get("agenda")
    if isinstance(agenda, dict):
        for key in ("show_calendar", "show_todo", "todo_no_date"):
            if isinstance(agenda.get(key), bool):
                config["agenda"][key] = agenda[key]
        config["agenda"]["calendars"] = [
            item for item in _unique_strings(agenda.get("calendars")) if item.startswith("calendar.")
        ][:50]
        todo_entity = agenda.get("todo_entity")
        if isinstance(todo_entity, str) and (todo_entity == "" or todo_entity.startswith("todo.")):
            config["agenda"]["todo_entity"] = todo_entity

    return config


def _store(hass: HomeAssistant) -> Store[dict[str, Any]]:
    """Return the HomeDeck store instance."""
    domain_data = hass.data.setdefault(DOMAIN, {})
    if _STORE_DATA not in domain_data:
        domain_data[_STORE_DATA] = Store(
            hass,
            STORAGE_VERSION,
            STORAGE_KEY,
            minor_version=0,
        )
    return domain_data[_STORE_DATA]


async def async_load_config(hass: HomeAssistant) -> HomeDeckConfig:
    """Load and cache local configuration."""
    domain_data = hass.data.setdefault(DOMAIN, {})
    if _CONFIG_DATA in domain_data:
        return deepcopy(domain_data[_CONFIG_DATA])

    stored = await _store(hass).async_load()
    config = normalize_config(stored)
    domain_data[_CONFIG_DATA] = config
    return deepcopy(config)


async def async_save_config(
    hass: HomeAssistant, value: dict[str, Any]
) -> HomeDeckConfig:
    """Validate, persist and cache local configuration."""
    config = normalize_config(value)
    await _store(hass).async_save(config)
    hass.data.setdefault(DOMAIN, {})[_CONFIG_DATA] = config
    return deepcopy(config)

