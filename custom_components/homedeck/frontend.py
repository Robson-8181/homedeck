"""Register the HomeDeck frontend panel."""

import hashlib
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
# Where Home Assistant keeps its sidebar panels (a HassKey with this name on newer versions).
_PANELS = "frontend_panels"


def _bundle_tag(bundle: Path) -> str:
    """A short fingerprint of the panel bundle, so browsers fetch it again whenever it changes.

    The version alone isn't enough: a reinstalled or patched build with the same version kept the
    old file in the browser cache, even after a forced reload.
    """
    try:
        return hashlib.sha256(bundle.read_bytes()).hexdigest()[:10]
    except OSError:
        return ""


def _panel_exists(hass: HomeAssistant) -> bool:
    """frontend.async_panel_exists only exists from Home Assistant 2026.5 on."""
    exists = getattr(frontend, "async_panel_exists", None)
    if exists is not None:
        return exists(hass, PANEL_PATH)
    return PANEL_PATH in hass.data.get(_PANELS, {})


async def async_register_frontend(hass: HomeAssistant) -> None:
    """Register HomeDeck static assets and sidebar panel."""
    domain_data = hass.data.setdefault(DOMAIN, {})
    frontend_dir = Path(__file__).parent / "frontend"

    if not domain_data.get(_STATIC_REGISTERED):
        await hass.http.async_register_static_paths(
            [StaticPathConfig(PANEL_URL, str(frontend_dir), cache_headers=False)]
        )
        domain_data[_STATIC_REGISTERED] = True

    if _panel_exists(hass):
        return

    tag = await hass.async_add_executor_job(_bundle_tag, frontend_dir / "homedeck-panel.js")
    await panel_custom.async_register_panel(
        hass=hass,
        frontend_url_path=PANEL_PATH,
        webcomponent_name=PANEL_ELEMENT,
        module_url=f"{PANEL_URL}/homedeck-panel.js?v={VERSION}" + (f"-{tag}" if tag else ""),
        sidebar_title=PANEL_TITLE,
        sidebar_icon=PANEL_ICON,
        require_admin=False,
        embed_iframe=False,
        config={"version": VERSION},
    )


def async_unregister_frontend(hass: HomeAssistant) -> None:
    """Remove the HomeDeck panel while keeping its harmless static route."""
    if _panel_exists(hass):
        frontend.async_remove_panel(hass, PANEL_PATH)

