import type { HomeAssistant } from "./types/home-assistant";

// Home Assistant's own sidebar, hidden while HomeDeck is open on devices that ask for it (a choice kept
// per device). Home Assistant listens to these events from its panels and saves the docking itself, so
// the state it had before is remembered here and given back when HomeDeck closes.

type Dock = NonNullable<HomeAssistant["dockedSidebar"]>;

const PREF_KEY = "homedeck-hide-ha-sidebar";
const BEFORE_KEY = "homedeck-ha-sidebar-before";
const PREF_EVENT = "homedeck-sidebar-pref";

function read(key: string): string | null {
  try { return window.localStorage.getItem(key); } catch { return null; }
}
function write(key: string, value: string | null): void {
  try { if (value == null) window.localStorage.removeItem(key); else window.localStorage.setItem(key, value); } catch { /* private mode: lasts this visit */ }
}

function dock(from: Element, value: Dock): void {
  from.dispatchEvent(new CustomEvent("hass-dock-sidebar", { bubbles: true, composed: true, detail: { dock: value } }));
}

export const hideSidebarPreferred = () => read(PREF_KEY) === "1";

/** Saves the choice for this device and applies it right away (the panel listens for the change). */
export function setHideSidebarPreferred(hidden: boolean): void {
  write(PREF_KEY, hidden ? "1" : null);
  window.dispatchEvent(new Event(PREF_EVENT));
}

/** Hides the sidebar, remembering how it was. */
export function hideSidebar(from: Element, current: Dock | undefined): void {
  if (current === "always_hidden") return;
  if (read(BEFORE_KEY) == null) write(BEFORE_KEY, current ?? "docked");
  dock(from, "always_hidden");
}

/** Gives the sidebar back as it was before HomeDeck hid it. */
export function restoreSidebar(from: Element): void {
  const before = read(BEFORE_KEY) as Dock | null;
  if (before == null) return;
  write(BEFORE_KEY, null);
  dock(from, before);
}

export const sidebarHidden = (hass: HomeAssistant) => hass.dockedSidebar === "always_hidden";

/** Opens the hidden sidebar over the page, like swiping from the left edge on a phone. */
export function openSidebar(from: Element): void {
  from.dispatchEvent(new CustomEvent("hass-toggle-menu", { bubbles: true, composed: true, detail: { open: true } }));
}
