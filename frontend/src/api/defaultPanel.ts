import type { HomeAssistant } from "../types/home-assistant";

// Home Assistant opens, in order: the user's default panel, the system default chosen by an
// admin, then a legacy per-browser value. All three live where the HA frontend reads them.
export const HOMEDECK_PANEL = "homedeck";
const LEGACY_KEY = "defaultPanel";

type CoreData = Record<string, unknown> & { default_panel?: string };

export interface DefaultPanelState {
  user: boolean;
  system: boolean;
  /** False on Home Assistant versions without frontend user data (before 2025): per-browser only. */
  synced: boolean;
}

async function read(hass: HomeAssistant, scope: "user" | "system"): Promise<CoreData> {
  const result = await hass.connection.sendMessagePromise<{ value?: CoreData | null }>({ type: `frontend/get_${scope}_data`, key: "core" });
  return result?.value ?? {};
}

async function write(hass: HomeAssistant, scope: "user" | "system", panel: string | undefined): Promise<void> {
  const current = await read(hass, scope);
  const next: CoreData = { ...current };
  if (panel) next.default_panel = panel;
  else delete next.default_panel;
  await hass.connection.sendMessagePromise({ type: `frontend/set_${scope}_data`, key: "core", value: next });
}

function legacy(): string | undefined {
  try { return JSON.parse(window.localStorage.getItem(LEGACY_KEY) ?? "null") ?? undefined; } catch { return undefined; }
}

export async function getDefaultPanel(hass: HomeAssistant): Promise<DefaultPanelState> {
  try {
    const [user, system] = await Promise.all([read(hass, "user"), read(hass, "system").catch(() => ({} as CoreData))]);
    return { user: user.default_panel === HOMEDECK_PANEL, system: system.default_panel === HOMEDECK_PANEL, synced: true };
  } catch {
    return { user: legacy() === HOMEDECK_PANEL, system: false, synced: false };
  }
}

/** For this user (or, on older Home Assistant versions, this browser). */
export async function setUserDefault(hass: HomeAssistant, on: boolean, synced: boolean): Promise<void> {
  if (!synced) {
    try {
      if (on) window.localStorage.setItem(LEGACY_KEY, JSON.stringify(HOMEDECK_PANEL));
      else window.localStorage.removeItem(LEGACY_KEY);
    } catch { /* storage unavailable */ }
    return;
  }
  await write(hass, "user", on ? HOMEDECK_PANEL : undefined);
}

/** For everyone in the house; Home Assistant only allows administrators. */
export function setSystemDefault(hass: HomeAssistant, on: boolean): Promise<void> {
  return write(hass, "system", on ? HOMEDECK_PANEL : undefined);
}
