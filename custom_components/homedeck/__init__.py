"""HomeDeck integration."""

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.typing import ConfigType

from .const import DOMAIN
from .frontend import async_register_frontend, async_unregister_frontend
from .license import async_start_refresh
from .storage import async_load_config
from .websocket import async_register_websocket_commands

# Set up from the UI only; required by hassfest because async_setup exists.
CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Set up HomeDeck and its local WebSocket API."""
    hass.data.setdefault(DOMAIN, {})
    async_register_websocket_commands(hass)
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up HomeDeck from a config entry."""
    await async_load_config(hass)
    await async_register_frontend(hass)
    entry.async_on_unload(async_start_refresh(hass))
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload the HomeDeck config entry."""
    async_unregister_frontend(hass)
    return True

