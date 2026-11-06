"""Persistent local storage for HomeDeck."""

from copy import deepcopy
import re
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import DOMAIN, STORAGE_KEY, STORAGE_VERSION
from .models import ENERGY_FIELDS, HomeDeckConfig, default_config

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
_MAX_SECTIONS = 50
_MAX_NAME_LENGTH = 60
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


def _normalize_sections(value: Any) -> dict[str, str]:
    """Separator titles by key ("section:<id>")."""
    if not isinstance(value, dict):
        return {}
    return {
        key: title.strip()[:60]
        for key, title in list(value.items())[:_MAX_SECTIONS]
        if isinstance(key, str)
        and key.startswith("section:")
        and len(key) <= _MAX_KEY_LENGTH
        and isinstance(title, str)
        and title.strip()
    }


def _normalize_rooms(value: Any) -> dict[str, dict[str, str]]:
    """Per room: its name in HomeDeck, and the icon and temperature sensor chosen in Edit mode."""
    if not isinstance(value, dict):
        return {}
    rooms: dict[str, dict[str, str]] = {}
    for room_id, options in list(value.items())[:_MAX_LAYOUTS]:
        if not isinstance(room_id, str) or not room_id or len(room_id) > _MAX_KEY_LENGTH or not isinstance(options, dict):
            continue
        clean: dict[str, str] = {}
        name = options.get("name")
        if isinstance(name, str) and name.strip():
            clean["name"] = name.strip()[:_MAX_NAME_LENGTH]
        icon = options.get("icon")
        if isinstance(icon, str) and icon and len(icon) <= 60:
            clean["icon"] = icon
        temperature = options.get("temperature")
        if isinstance(temperature, str) and temperature.startswith("sensor.") and len(temperature) <= _MAX_KEY_LENGTH:
            clean["temperature"] = temperature
        if clean:
            rooms[room_id] = clean
    return rooms


def _normalize_names(value: Any) -> dict[str, str]:
    """Device nicknames given in HomeDeck, by entity id."""
    if not isinstance(value, dict):
        return {}
    return {
        entity_id: name.strip()[:_MAX_NAME_LENGTH]
        for entity_id, name in list(value.items())[:_MAX_LAYOUT_ITEMS]
        if isinstance(entity_id, str)
        and "." in entity_id
        and len(entity_id) <= _MAX_KEY_LENGTH
        and isinstance(name, str)
        and name.strip()
    }


_SEASON_IDS = {"christmas", "newyear", "halloween", "valentines", "easter", "carnival", "thanksgiving", "birthdays"}
_SEASON_EFFECTS = {"snow", "sparkle", "halloween", "hearts", "eggs", "confetti", "bunting", "leaves"}
_SEASON_DATE = re.compile(r"^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$")


def _normalize_entity_options(value: Any) -> dict[str, dict[str, Any]]:
    """Per device: its tile icon ("ha" or a HomeDeck icon name) and whether a tap asks to confirm."""
    if not isinstance(value, dict):
        return {}
    result: dict[str, dict[str, Any]] = {}
    for entity_id, options in list(value.items())[:_MAX_LAYOUT_ITEMS]:
        if not (isinstance(entity_id, str) and "." in entity_id and len(entity_id) <= _MAX_KEY_LENGTH and isinstance(options, dict)):
            continue
        clean: dict[str, Any] = {}
        icon = options.get("icon")
        if isinstance(icon, str) and icon and len(icon) <= 32 and all(char.isalnum() or char == "-" for char in icon):
            clean["icon"] = icon
        if options.get("confirm") is True:
            clean["confirm"] = True
        if clean:
            result[entity_id] = clean
    return result


def _normalize_layouts(value: Any) -> dict[str, dict[str, Any]]:
    """Return per-screen layouts: ordered, hidden and double-width item keys, and separators."""
    if not isinstance(value, dict):
        return {}
    layouts: dict[str, dict[str, Any]] = {}
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
            for key in ("order", "hidden", "wide", "added", "tall")
        }
        sections = _normalize_sections(layout.get("sections"))
        if sections:
            layouts[screen]["sections"] = sections
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

    config["rooms"] = _normalize_rooms(value.get("rooms"))
    config["names"] = _normalize_names(value.get("names"))
    config["entity_options"] = _normalize_entity_options(value.get("entity_options"))
    if isinstance(value.get("ha_icons"), bool):
        config["ha_icons"] = value["ha_icons"]

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
        if "order" in navigation:
            config["navigation"]["order"] = _unique_strings(navigation.get("order"))[:60]

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
        for key in ("enabled", "show_events", "show_todo"):
            if isinstance(screensaver.get(key), bool):
                config["screensaver"][key] = screensaver[key]
        delay = screensaver.get("delay")
        if isinstance(delay, int) and delay in _SCREENSAVER_DELAYS:
            config["screensaver"]["delay"] = delay

    agenda = value.get("agenda")
    if isinstance(agenda, dict):
        for key in ("show_calendar", "show_todo", "todo_no_date", "today_card"):
            if isinstance(agenda.get(key), bool):
                config["agenda"][key] = agenda[key]
        config["agenda"]["calendars"] = [
            item for item in _unique_strings(agenda.get("calendars")) if item.startswith("calendar.")
        ][:50]
        todo_entity = agenda.get("todo_entity")
        if isinstance(todo_entity, str) and (todo_entity == "" or todo_entity.startswith("todo.")):
            config["agenda"]["todo_entity"] = todo_entity

    cards = value.get("cards")
    if isinstance(cards, dict):
        for key, high in (("corners", 150), ("glass", 100)):
            number = cards.get(key)
            if isinstance(number, (int, float)) and not isinstance(number, bool):
                config["cards"][key] = max(0, min(high, round(number)))
        for key in ("frame", "animations", "sparklines"):
            if isinstance(cards.get(key), bool):
                config["cards"][key] = cards[key]

    widgets = value.get("widgets")
    if isinstance(widgets, dict):
        for key in ("weather", "sun", "energy"):
            if isinstance(widgets.get(key), bool):
                config["widgets"][key] = widgets[key]

    energy = value.get("energy")
    if isinstance(energy, dict):
        for key in ENERGY_FIELDS:
            entity_id = energy.get(key)
            if isinstance(entity_id, str) and (entity_id == "" or (entity_id.startswith("sensor.") and len(entity_id) <= _MAX_KEY_LENGTH)):
                config["energy"][key] = entity_id

    seasons = value.get("seasons")
    if isinstance(seasons, dict):
        if isinstance(seasons.get("enabled"), bool):
            config["seasons"]["enabled"] = seasons["enabled"]
        config["seasons"]["off"] = [item for item in _unique_strings(seasons.get("off")) if item in _SEASON_IDS]
        custom = []
        for item in seasons.get("custom") if isinstance(seasons.get("custom"), list) else []:
            if not isinstance(item, dict):
                continue
            name, date, effect = item.get("name"), item.get("date"), item.get("effect")
            if isinstance(name, str) and name.strip() and isinstance(date, str) and _SEASON_DATE.match(date) and effect in _SEASON_EFFECTS:
                custom.append({"name": name.strip()[:40], "date": date, "effect": effect})
        config["seasons"]["custom"] = custom[:20]

    if isinstance(value.get("live_cameras"), bool):
        config["live_cameras"] = value["live_cameras"]

    doorbell = value.get("doorbell")
    if isinstance(doorbell, dict):
        if isinstance(doorbell.get("enabled"), bool):
            config["doorbell"]["enabled"] = doorbell["enabled"]
        trigger = doorbell.get("trigger")
        if isinstance(trigger, str) and (trigger == "" or (trigger.split(".")[0] in ("event", "binary_sensor", "input_boolean") and len(trigger) <= _MAX_KEY_LENGTH)):
            config["doorbell"]["trigger"] = trigger
        camera = doorbell.get("camera")
        if isinstance(camera, str) and (camera == "" or (camera.startswith("camera.") and len(camera) <= _MAX_KEY_LENGTH)):
            config["doorbell"]["camera"] = camera
        seconds = doorbell.get("seconds")
        if isinstance(seconds, int) and not isinstance(seconds, bool) and seconds in (30, 60, 120, 300):
            config["doorbell"]["seconds"] = seconds

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

