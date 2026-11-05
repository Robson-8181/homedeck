import type { HomeDeckConfig } from "../types/config";
import { DEFAULT_CARDS } from "../plan";
import type { HomeAssistant } from "../types/home-assistant";

export const EMPTY_ENERGY: HomeDeckConfig["energy"] = { consumption: "", grid_import: "", grid_export: "", solar: "", battery: "", solar_today: "" };

// Fields added in later versions get their defaults here, so a config saved by an
// older build (or an integration not yet restarted after an update) never breaks a screen.
function withDefaults(config: HomeDeckConfig): HomeDeckConfig {
  return {
    ...config,
    layouts: config.layouts ?? {},
    rooms: config.rooms ?? {},
    names: config.names ?? {},
    free_devices: config.free_devices ?? [],
    free_rooms: config.free_rooms ?? [],
    view_mode: config.view_mode ?? "grid",
    highlight_color: config.highlight_color ?? "#ffc94d",
    screensaver: { enabled: false, delay: 180, ...(config.screensaver as Partial<HomeDeckConfig["screensaver"]> | undefined) },
    cards: { ...DEFAULT_CARDS, ...(config.cards as Partial<HomeDeckConfig["cards"]> | undefined) },
    widgets: { weather: false, sun: false, energy: false, ...(config.widgets as Partial<HomeDeckConfig["widgets"]> | undefined) },
    energy: { ...EMPTY_ENERGY, ...(config.energy as Partial<HomeDeckConfig["energy"]> | undefined) },
    agenda: { show_calendar: true, calendars: [], show_todo: true, todo_entity: "", todo_no_date: false, today_card: false, ...(config.agenda as Partial<HomeDeckConfig["agenda"]> | undefined) },
  };
}

export async function getConfig(hass: HomeAssistant): Promise<HomeDeckConfig> {
  return withDefaults(await hass.connection.sendMessagePromise<HomeDeckConfig>({
    type: "homedeck/config",
  }));
}

export async function saveConfig(
  hass: HomeAssistant,
  config: HomeDeckConfig,
): Promise<HomeDeckConfig> {
  return withDefaults(await hass.connection.sendMessagePromise<HomeDeckConfig>({
    type: "homedeck/config/save",
    config,
  }));
}

