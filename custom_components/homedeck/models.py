"""Data models and defaults for HomeDeck."""

from typing import Any, TypedDict


class HomeDeckPreferences(TypedDict):
    """Local display preferences."""

    clock: str
    temperature_unit: str


class HomeDeckHeaderConfig(TypedDict):
    """Visibility of contextual information on Home."""

    show_clock: bool
    show_weather: bool
    show_presence: bool


class HomeDeckGlobalActionsConfig(TypedDict):
    """Global Home actions exposed by the dashboard."""

    lights_on: bool
    lights_off: bool


class HomeDeckNavigationConfig(TypedDict):
    """Generated navigation visibility."""

    rooms: bool
    scenes: bool
    media: bool
    security: bool


class HomeDeckLayoutConfig(TypedDict):
    """Home layout preferences."""

    density: str
    featured_room: str | None


class HomeDeckBackgroundConfig(TypedDict):
    """Dynamic wallpaper preferences."""

    preset: str
    animated: bool
    include_devices: bool


class HomeDeckHomeCardsConfig(TypedDict):
    """Visibility of generated Home sections."""

    status: bool
    priority: bool
    rooms: bool
    shortcuts: bool
    scenes: bool


class HomeDeckPriorityConfig(TypedDict):
    """Automatic and user-selected cards shown above the rooms."""

    security: bool
    climate: bool
    media: bool
    featured_entity_ids: list[str]


class HomeDeckVisibilityConfig(TypedDict):
    """Visibility overrides for rooms and entities."""

    hidden_home_rooms: list[str]
    hidden_home_entities: list[str]
    visible_home_entities: list[str]
    hidden_room_entities: list[str]
    home_cards: HomeDeckHomeCardsConfig


class HomeDeckWeatherConfig(TypedDict):
    """Weather source and forecast preferences."""

    entity_id: str
    forecast_type: str


class HomeDeckPage(TypedDict):
    """User-created navigation page."""

    id: str
    title: str
    type: str
    icon: str
    entity_ids: list[str]


class HomeDeckScreenLayout(TypedDict):
    """Order, hidden items and double-width cards of one screen."""

    order: list[str]
    hidden: list[str]
    wide: list[str]
    added: list[str]


class HomeDeckScreensaverConfig(TypedDict):
    """Clock screensaver shown after a period without touches."""

    enabled: bool
    delay: int


class HomeDeckAgendaConfig(TypedDict):
    """Calendar and to-do buttons beside the clock on Home."""

    show_calendar: bool
    calendars: list[str]
    show_todo: bool
    todo_entity: str
    todo_no_date: bool


class HomeDeckConfig(TypedDict):
    """Persisted HomeDeck configuration."""

    version: int
    onboarding_complete: bool
    theme: str
    accent_color: str
    highlight_color: str
    locale: str
    selected_rooms: list[str]
    rooms: dict[str, dict[str, Any]]
    dashboard: dict[str, Any]
    favorites: list[str]
    free_devices: list[str]
    free_rooms: list[str]
    view_mode: str
    preferences: HomeDeckPreferences
    home: HomeDeckHeaderConfig
    global_actions: HomeDeckGlobalActionsConfig
    navigation: HomeDeckNavigationConfig
    layout: HomeDeckLayoutConfig
    background: HomeDeckBackgroundConfig
    visibility: HomeDeckVisibilityConfig
    priority_cards: HomeDeckPriorityConfig
    weather: HomeDeckWeatherConfig
    pages: list[HomeDeckPage]
    layouts: dict[str, HomeDeckScreenLayout]
    screensaver: HomeDeckScreensaverConfig
    agenda: HomeDeckAgendaConfig


def default_config() -> HomeDeckConfig:
    """Return a fresh default configuration."""
    return {
        "version": 9,
        "onboarding_complete": False,
        "theme": "glass",
        "accent_color": "#f4edd9",
        "highlight_color": "#ffc94d",
        "locale": "auto",
        "selected_rooms": [],
        "rooms": {},
        "dashboard": {},
        "favorites": [],
        "free_devices": [],
        "free_rooms": [],
        "view_mode": "grid",
        "preferences": {
            "temperature_unit": "auto",
            "clock": "auto",
        },
        "home": {
            "show_clock": True,
            "show_weather": True,
            "show_presence": True,
        },
        "global_actions": {
            "lights_on": True,
            "lights_off": True,
        },
        "navigation": {
            "rooms": True,
            "scenes": True,
            "media": True,
            "security": True,
        },
        "layout": {
            "density": "comfortable",
            "featured_room": None,
        },
        "background": {
            "preset": "adaptive_ember",
            "animated": True,
            "include_devices": True,
        },
        "visibility": {
            "hidden_home_rooms": [],
            "hidden_home_entities": [],
            "visible_home_entities": [],
            "hidden_room_entities": [],
            "home_cards": {
                "status": True,
                "priority": True,
                "rooms": True,
                "shortcuts": True,
                "scenes": True,
            },
        },
        "priority_cards": {
            "security": True,
            "climate": True,
            "media": True,
            "featured_entity_ids": [],
        },
        "weather": {
            "entity_id": "auto",
            "forecast_type": "daily",
        },
        "pages": [],
        "layouts": {},
        "screensaver": {
            "enabled": False,
            "delay": 180,
        },
        # Empty calendars means every calendar; an empty to-do entity means the first list.
        "agenda": {
            "show_calendar": True,
            "calendars": [],
            "show_todo": True,
            "todo_entity": "",
            "todo_no_date": False,
        },
    }

