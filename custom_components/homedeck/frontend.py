"""Register the HomeDeck frontend panel."""

from pathlib import Path

from homeassistant.components import frontend, panel_custom
from homeassistant.components.http import StaticPathConfig
from homeassistant.core import HomeAssistant

from .const import (
    DOMAIN,
    PANEL_ELEMENT,
    PANEL_ICON,
    PANEL_PATH,
    PANEL_TITLE,
    PANEL_URL,
    VERSION,
)

_STATIC_REGISTERED = "static_registered"


async def async_register_frontend(hass: HomeAssistant) -> None:
    """Register HomeDeck static assets and sidebar panel."""
    domain_data = hass.data.setdefault(DOMAIN, {})
    frontend_dir = Path(__file__).parent / "frontend"

    if not domain_data.get(_STATIC_REGISTERED):
        await hass.http.async_register_static_paths(
            [StaticPathConfig(PANEL_URL, str(frontend_dir), cache_headers=False)]
        )
        domain_data[_STATIC_REGISTERED] = True

    if frontend.async_panel_exists(hass, PANEL_PATH):
        return

    await panel_custom.async_register_panel(
        hass=hass,
        frontend_url_path=PANEL_PATH,
        webcomponent_name=PANEL_ELEMENT,
        module_url=f"{PANEL_URL}/homedeck-panel.js?v={VERSION}",
        sidebar_title=PANEL_TITLE,
        sidebar_icon=PANEL_ICON,
        require_admin=False,
        embed_iframe=False,
        config={"version": VERSION},
    )


def async_unregister_frontend(hass: HomeAssistant) -> None:
    """Remove the HomeDeck panel while keeping its harmless static route."""
    if frontend.async_panel_exists(hass, PANEL_PATH):
        frontend.async_remove_panel(hass, PANEL_PATH)

