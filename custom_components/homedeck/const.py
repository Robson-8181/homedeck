"""Constants for HomeDeck."""

from typing import Final

DOMAIN: Final = "homedeck"
NAME: Final = "HomeDeck"
VERSION: Final = "0.10.3"

PANEL_URL: Final = "/homedeck_static"
PANEL_PATH: Final = "homedeck"
PANEL_TITLE: Final = "HomeDeck"
PANEL_ICON: Final = "mdi:view-dashboard-variant"
PANEL_ELEMENT: Final = "homedeck-panel"

SUPPORTED_DOMAINS: Final = {
    "binary_sensor",
    "climate",
    "cover",
    "fan",
    "light",
    "lock",
    "media_player",
    "scene",
    "sensor",
    "switch",
}

STORAGE_KEY: Final = "homedeck.config"
STORAGE_VERSION: Final = 1

