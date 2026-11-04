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

/** The artwork of what a media player is playing (Apple TV, Sonos, Chromecast…), when it has one. */
export function mediaArt(state: HassEntity | undefined): string | null {
  const picture = state?.attributes.entity_picture;
  if (typeof picture !== "string" || !picture || !["playing", "paused"].includes(state?.state ?? "")) return null;
  return `url("${picture.replaceAll('"', "%22")}")`;
}

/** What a media player can switch to: Sonos favorites and playlists, Apple TV apps, inputs. */
export function mediaSources(state: HassEntity | undefined): string[] {
  return Array.isArray(state?.attributes.source_list) ? state.attributes.source_list.map(String).slice(0, 40) : [];
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

// Alarm panels (alarm_control_panel): status, the arm modes the panel supports and disarm, with the
// panel's code when it asks for one.

const ALARM_LABELS: Record<string, TranslationKey> = {
  disarmed: "alarmDisarmed",
  armed_home: "alarmArmedHome",
  armed_away: "alarmArmedAway",
  armed_night: "alarmArmedNight",
  armed_vacation: "alarmArmedVacation",
  armed_custom_bypass: "alarmArmedCustom",
  arming: "alarmArming",
  disarming: "alarmDisarming",
  pending: "alarmPending",
  triggered: "alarmTriggered",
};

/** Arm modes by supported_features bit, in the order shown. */
const ALARM_MODES: Array<{ bit: number; service: string; label: TranslationKey }> = [
  { bit: 1, service: "alarm_arm_home", label: "alarmArmHome" },
  { bit: 2, service: "alarm_arm_away", label: "alarmArmAway" },
  { bit: 4, service: "alarm_arm_night", label: "alarmArmNight" },
  { bit: 32, service: "alarm_arm_vacation", label: "alarmArmVacation" },
  { bit: 16, service: "alarm_arm_custom_bypass", label: "alarmArmCustom" },
];

export const ALARM_ARMED = new Set(["armed_home", "armed_away", "armed_night", "armed_vacation", "armed_custom_bypass"]);

export function alarmStatus(state: HassEntity, t: (key: TranslationKey) => string): string {
  return ALARM_LABELS[state.state] ? t(ALARM_LABELS[state.state]) : state.state.replaceAll("_", " ");
}

export function alarmModes(state: HassEntity, t: (key: TranslationKey) => string) {
  const features = Number(state.attributes.supported_features) || 0;
  return ALARM_MODES.filter((mode) => features & mode.bit).map((mode) => ({ service: mode.service, label: t(mode.label) }));
}

/** "number" or "text" when the panel needs a code; null when it doesn't. */
export function alarmCodeFormat(state: HassEntity): "number" | "text" | null {
  const format = state.attributes.code_format;
  return format === "number" || format === "text" ? format : null;
}

export function alarmCall(hass: HomeAssistant, state: HassEntity, service: string, code: string): Promise<unknown> {
  const needsCode = alarmCodeFormat(state) != null && (service === "alarm_disarm" || state.attributes.code_arm_required !== false);
  return hass.callService("alarm_control_panel", service, { entity_id: state.entity_id, ...(needsCode && code ? { code } : {}) });
}

// Plants (plant): the built-in Plant integration keeps the readings in attributes; Plant Monitor
// (with OpenPlantbook) keeps them in sensors of the same device and a status per reading.

export type PlantReading = { key: string; label: TranslationKey; value: string; problem: boolean };

const PLANT_KINDS: Array<{ key: string; label: TranslationKey; attribute: string; classes: string[]; match: RegExp }> = [
  { key: "moisture", label: "plantMoisture", attribute: "moisture", classes: ["moisture"], match: /moisture/ },
  { key: "temperature", label: "plantTemperature", attribute: "temperature", classes: ["temperature"], match: /temperature/ },
  { key: "illuminance", label: "plantLight", attribute: "brightness", classes: ["illuminance"], match: /illuminance|brightness/ },
  { key: "conductivity", label: "plantFertility", attribute: "conductivity", classes: ["conductivity"], match: /conductivity/ },
  { key: "humidity", label: "plantHumidity", attribute: "humidity", classes: ["humidity"], match: /humidity/ },
];

export function plantStatus(state: HassEntity, t: (key: TranslationKey) => string): string {
  if (state.state === "ok") return t("plantOk");
  if (state.state === "problem") return t("plantProblem");
  return state.state.replaceAll("_", " ");
}

export function plantReadings(hass: HomeAssistant, state: HassEntity): PlantReading[] {
  const attrs = state.attributes;
  const problems = String(attrs.problem ?? "").toLowerCase();
  // Sensors that belong to the plant's device (Plant Monitor), when the registry is available.
  const deviceId = hass.entities?.[state.entity_id]?.device_id;
  const siblings = deviceId
    ? Object.values(hass.entities ?? {}).filter((entry) => entry.device_id === deviceId && entry.entity_id.startsWith("sensor.")).map((entry) => hass.states[entry.entity_id]).filter((item): item is HassEntity => Boolean(item))
    : [];
  const readings: PlantReading[] = [];
  for (const kind of PLANT_KINDS) {
    const status = String(attrs[`${kind.key}_status`] ?? "").toLowerCase();
    const problem = (status !== "" && status !== "ok") || problems.includes(kind.attribute) || problems.includes(kind.key);
    const sensor = siblings.find((item) => kind.classes.includes(String(item.attributes.device_class ?? "")) || kind.match.test(item.entity_id));
    const unitOf = (attrs.unit_of_measurement_dict as Record<string, string> | undefined)?.[kind.attribute];
    let value: string | null = null;
    if (sensor && !["unavailable", "unknown"].includes(sensor.state)) value = `${sensor.state}${sensor.attributes.unit_of_measurement ? ` ${sensor.attributes.unit_of_measurement}` : ""}`;
    else if (typeof attrs[kind.attribute] === "number") value = `${attrs[kind.attribute]}${unitOf ? ` ${unitOf}` : ""}`;
    if (value != null) readings.push({ key: kind.key, label: kind.label, value, problem });
  }
  return readings;
}
