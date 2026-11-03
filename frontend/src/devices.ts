import type { TranslationKey } from "./i18n";
import type { HassEntity, HomeAssistant } from "./types/home-assistant";

// Cameras, vacuums, scripts, buttons and selects: what each card, row, chip and details sheet
// needs to show and control them, in one place.

/** Scripts and buttons run with one tap, like scenes. */
export const RUNNABLE = new Set(["script", "button", "input_button"]);
/** Dropdowns, such as a washing machine program. */
export const SELECTS = new Set(["select", "input_select"]);
/** Vacuum activities shown as "on": the card lights up while the robot is out. */
export const VACUUM_BUSY = new Set(["cleaning", "returning"]);

const VACUUM_LABELS: Record<string, TranslationKey> = {
  cleaning: "vacuumCleaning",
  docked: "vacuumDocked",
  returning: "vacuumReturning",
  paused: "vacuumPaused",
  idle: "vacuumIdle",
  error: "vacuumError",
};

export function runEntity(hass: HomeAssistant, entityId: string): Promise<unknown> {
  const domain = entityId.split(".")[0];
  return domain === "script"
    ? hass.callService("script", "turn_on", { entity_id: entityId })
    : hass.callService(domain, "press", { entity_id: entityId });
}

export function selectOptions(state?: HassEntity): string[] {
  return Array.isArray(state?.attributes.options) ? state.attributes.options.map(String) : [];
}

export function selectOption(hass: HomeAssistant, entityId: string, option: string): Promise<unknown> {
  return hass.callService(entityId.split(".")[0], "select_option", { entity_id: entityId, option });
}

/** A camera's latest still; `tick` changes the address so the image refreshes. */
export function cameraSnapshot(state: HassEntity | undefined, tick: number): string | null {
  const picture = state?.attributes.entity_picture;
  if (typeof picture !== "string" || !picture) return null;
  return `${picture}${picture.includes("?") ? "&" : "?"}t=${tick}`;
}

/** The live MJPEG stream Home Assistant serves for every camera, signed like the still. */
export function cameraStream(state: HassEntity | undefined): string | null {
  const picture = state?.attributes.entity_picture;
  return typeof picture === "string" && picture.includes("/api/camera_proxy/") ? picture.replace("/api/camera_proxy/", "/api/camera_proxy_stream/") : null;
}

export function vacuumStatus(state: HassEntity, t: (key: TranslationKey) => string): string {
  const label = VACUUM_LABELS[state.state] ? t(VACUUM_LABELS[state.state]) : state.state.replaceAll("_", " ");
  const battery = state.attributes.battery_level;
  return typeof battery === "number" ? `${label} · ${battery}%` : label;
}

/** Start while it rests, pause while it cleans, and send it home. */
export function vacuumActions(hass: HomeAssistant, state: HassEntity, t: (key: TranslationKey) => string) {
  const call = (service: string) => hass.callService("vacuum", service, { entity_id: state.entity_id });
  const cleaning = state.state === "cleaning";
  return {
    main: { icon: cleaning ? "pause" : "play", label: cleaning ? t("vacuumPause") : t("vacuumStart"), run: () => call(cleaning ? "pause" : "start") },
    dock: { icon: "home", label: t("vacuumDock"), run: () => call("return_to_base") },
    stop: { icon: "stop", label: t("vacuumStop"), run: () => call("stop") },
  } as const;
}
