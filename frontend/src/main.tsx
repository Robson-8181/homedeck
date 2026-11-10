import { pauseCameras } from "./cameraPause";
import { createRoot, type Root } from "react-dom/client";
import { App } from "./App";
import { installFonts } from "./fonts";
import { styles } from "./styles";
import { theme } from "./theme";
import { themeEditing } from "./theme-editing";
import { themeExtras } from "./theme-extras";
import { themePlan } from "./theme-plan";
import { themeLayouts } from "./theme-layouts";
import type { HomeAssistant, HomeDeckPanelInfo } from "./types/home-assistant";
import { hideSidebar, hideSidebarPreferred, restoreSidebar } from "./sidebar";
import { hidePageScrollbars } from "./scrollbars";

class HomeDeckPanel extends HTMLElement {
  private _hass?: HomeAssistant;
  private _panel?: HomeDeckPanelInfo;
  private readonly root: Root;
  private showScrollbars?: () => void;

  constructor() {
    super();
    installFonts();
    const shadow = this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = `@layer legacy{${styles}}${theme}${themeEditing}${themeExtras}${themePlan}${themeLayouts}`;
    const mount = document.createElement("div");
    shadow.append(style, mount);
    this.root = createRoot(mount);
  }

  set hass(value: HomeAssistant) {
    const first = !this._hass;
    this._hass = value;
    this.renderPanel();
    if (first) this.applySidebar();
  }

  set panel(value: HomeDeckPanelInfo) {
    this._panel = value;
    this.renderPanel();
  }

  connectedCallback() {
    pauseCameras("panel-closed", false);
    this.renderPanel();
    window.addEventListener("homedeck-sidebar-pref", this.applySidebar);
    this.applySidebar();
    this.showScrollbars?.();
    this.showScrollbars = hidePageScrollbars(this);
  }

  disconnectedCallback() {
    pauseCameras("panel-closed", true);
    window.removeEventListener("homedeck-sidebar-pref", this.applySidebar);
    this.showScrollbars?.();
    this.showScrollbars = undefined;
    // Leaving HomeDeck brings Home Assistant's sidebar back as it was.
    restoreSidebar(document.querySelector("home-assistant") ?? document.body);
  }

  /** Hides Home Assistant's sidebar while HomeDeck is open on a device that asked for it. */
  private readonly applySidebar = () => {
    if (!this.isConnected) return;
    if (hideSidebarPreferred()) hideSidebar(this, this._hass?.dockedSidebar);
    else restoreSidebar(this);
  };

  private renderPanel() {
    if (!this._hass) return;
    this.root.render(<App hass={this._hass} key={this._panel?.config?.version ?? "homedeck"} version={this._panel?.config?.version} />);
  }
}

if (!customElements.get("homedeck-panel")) {
  customElements.define("homedeck-panel", HomeDeckPanel);
}
