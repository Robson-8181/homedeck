import { useMemo, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, MouseEvent, PointerEvent } from "react";
import { hvacLabel, type TranslationKey } from "../i18n";
import type { DiscoveredEntity } from "../types/discovery";
import type { HassEntity, HomeAssistant } from "../types/home-assistant";
import { useWideTile } from "./EditableGrid";
import { domainIcon, HDIcon } from "./HDIcon";
import { WideControls } from "./WideControls";
import { CameraCard } from "./CameraCard";
import { HDSelect } from "./HDSelect";
import { ALARM_ARMED, RUNNABLE, SELECTS, alarmStatus, mediaArt, plantStatus, runEntity, selectOption, selectOptions, vacuumActions, vacuumStatus } from "../devices";
import { SpotifyCard } from "./SpotifyCard";
import { usePlan } from "../plan";
import { isSpotify } from "../spotify";

const ACTIVE_STATES = new Set(["on", "open", "opening", "playing", "paused", "heat", "cool", "heat_cool", "auto", "dry", "fan_only", "unlocked", "cleaning", "returning", ...ALARM_ARMED]);
export const TOGGLES = new Set(["light", "switch", "fan", "input_boolean", "automation"]);
const HOLD_MS = 520;

/** Washing machines, dryers and dishwashers, by name: their card shakes while they run (with animations on). */
const APPLIANCE = /wash|dryer|lavar|lavadora|lava.?lou|secadora|secar|wasch|trockner|sp(ü|ue)l/i;
const IDLE = new Set(["off", "idle", "standby", "unavailable", "unknown", "0", "none", "finished", "complete", "completed", "ready", "paused", "stop", "stopped"]);

function isAppliance(entity: DiscoveredEntity): boolean {
  return ["switch", "sensor", "binary_sensor", "input_boolean"].includes(entity.domain) && APPLIANCE.test(`${entity.entity_id} ${entity.original_name ?? ""} ${entity.name}`);
}

function applianceRunning(state?: HassEntity): boolean {
  if (!state) return false;
  const value = state.state.toLowerCase();
  if (IDLE.has(value)) return false;
  // A finish time runs until it is reached.
  if (/^\d{4}-\d{2}-\d{2}t/.test(value)) return Date.parse(state.state) > Date.now();
  // A power sensor runs above a few watts; a remaining-time or status sensor whenever it has a value.
  const number = Number.parseFloat(value);
  return Number.isFinite(number) ? number > 5 : true;
}

export function displayState(state: HassEntity | undefined, entity: DiscoveredEntity, t: (key: TranslationKey) => string, language?: string): string {
  if (!state || state.state === "unavailable") return t("unavailable");
  if (state.state === "unknown") return t("unknown");
  if (entity.domain === "light" && state.state === "on") {
    const brightness = state.attributes.brightness;
    return typeof brightness === "number" ? `${Math.round((brightness / 255) * 100)}%` : t("on");
  }
  if (entity.domain === "media_player") return String(state.attributes.media_title ?? (state.state === "off" ? t("off") : state.state === "on" ? t("on") : state.state));
  if (entity.domain === "climate") {
    const current = state.attributes.current_temperature;
    return typeof current === "number" ? `${current}° · ${hvacLabel(state.state, language)}` : hvacLabel(state.state, language);
  }
  if (entity.domain === "cover") {
    const position = state.attributes.current_position;
    if (typeof position === "number") return position === 0 ? t("closed") : position === 100 ? t("open") : `${position}%`;
  }
  if (entity.domain === "lock") return state.state === "locked" ? t("lock") : t("unlock");
  if (entity.domain === "vacuum") return vacuumStatus(state, t);
  if (entity.domain === "alarm_control_panel") return alarmStatus(state, t);
  if (entity.domain === "plant") return plantStatus(state, t);
  if (entity.domain === "camera") return t("cameraTapLive");
  if (entity.domain === "script") return state.state === "on" ? t("scriptRunning") : t("runScript");
  if (entity.domain === "button" || entity.domain === "input_button") return t("pressButton");
  if (SELECTS.has(entity.domain)) return state.state;
  if (state.state === "on") return t("on");
  if (state.state === "off") return t("off");
  if (state.state === "open") return t("open");
  if (state.state === "closed") return t("closed");
  const unit = state.attributes.unit_of_measurement;
  return unit ? `${state.state} ${unit}` : state.state.replaceAll("_", " ");
}

interface EntityCardProps {
  entity: DiscoveredEntity;
  hass: HomeAssistant;
  language?: string;
  /** Press and hold (or right click) opens the details. */
  onLongPress: (entity: DiscoveredEntity) => void;
  t: (key: TranslationKey) => string;
}

/**
 * Tap: lights, switches and fans toggle; scenes, scripts and buttons run; covers open or close.
 * Climate, media, locks, cameras, vacuums and sensors open their details, so a stray tap never
 * unlocks a door or sends the robot out.
 */
/** A device card; Spotify (on Pro) uses the same player card as Home, wherever it appears, and a
 * camera shows its picture. */
export function EntityCard(props: EntityCardProps) {
  const plan = usePlan();
  if (plan.pro && isSpotify(props.entity)) return <SpotifyCard entity={props.entity} hass={props.hass} onOpen={props.onLongPress} t={props.t} />;
  if (props.entity.domain === "camera") return <CameraCard entity={props.entity} hass={props.hass} onOpen={props.onLongPress} t={props.t} />;
  return <DeviceCard {...props} />;
}

function DeviceCard({ entity, hass, language, onLongPress, t }: EntityCardProps) {
  const [busy, setBusy] = useState(false);
  const [brightnessDraft, setBrightnessDraft] = useState<number | null>(null);
  const holdTimer = useRef<number | null>(null);
  const holdOrigin = useRef<{ x: number; y: number } | null>(null);
  const held = useRef(false);
  const wide = useWideTile();
  const state = hass.states[entity.entity_id];
  const active = ACTIVE_STATES.has(state?.state ?? "");
  const unavailable = !state || ["unavailable", "unknown"].includes(state.state);
  const status = useMemo(() => displayState(state, entity, t, language), [state, entity, t, language]);
  const brightness = typeof state?.attributes.brightness === "number" ? Math.round((state.attributes.brightness / 255) * 100) : 0;
  const colorModes = Array.isArray(state?.attributes.supported_color_modes) ? state.attributes.supported_color_modes : [];
  // Modern lights advertise dimming through color modes; bit 1 of supported_features is the legacy flag.
  const dimmable = typeof state?.attributes.brightness === "number" || colorModes.some((mode) => mode !== "onoff") || Boolean(Number(state?.attributes.supported_features) & 1);
  const target = typeof state?.attributes.temperature === "number" ? state.attributes.temperature : undefined;
  const minimum = typeof state?.attributes.min_temp === "number" ? state.attributes.min_temp : 7;
  const maximum = typeof state?.attributes.max_temp === "number" ? state.attributes.max_temp : 35;
  const step = typeof state?.attributes.target_temp_step === "number" ? state.attributes.target_temp_step : 0.5;

  const run = async (action: () => Promise<unknown>) => {
    if (busy || unavailable) return;
    setBusy(true);
    try { await action(); } finally { setBusy(false); }
  };

  const tap = () => {
    const domain = entity.domain;
    if (TOGGLES.has(domain)) return void run(() => hass.callService("homeassistant", "toggle", { entity_id: entity.entity_id }));
    if (domain === "scene") return void run(() => hass.callService("scene", "turn_on", { entity_id: entity.entity_id }));
    if (RUNNABLE.has(domain)) return void run(() => runEntity(hass, entity.entity_id));
    if (domain === "cover") return void run(() => hass.callService("cover", "toggle", { entity_id: entity.entity_id }));
    onLongPress(entity);
  };

  const fromControl = (target: EventTarget) => Boolean((target as HTMLElement).closest("button, input, label"));
  const cancelHold = () => { if (holdTimer.current != null) window.clearTimeout(holdTimer.current); holdTimer.current = null; holdOrigin.current = null; };
  const startHold = (event: PointerEvent<HTMLElement>) => {
    held.current = false;
    if (fromControl(event.target)) return;
    cancelHold();
    holdOrigin.current = { x: event.clientX, y: event.clientY };
    holdTimer.current = window.setTimeout(() => { holdTimer.current = null; held.current = true; onLongPress(entity); }, HOLD_MS);
  };
  const moveHold = (event: PointerEvent<HTMLElement>) => {
    if (holdOrigin.current && Math.hypot(event.clientX - holdOrigin.current.x, event.clientY - holdOrigin.current.y) > 10) cancelHold();
  };
  const click = (event: MouseEvent<HTMLElement>) => {
    if (held.current) { held.current = false; return; }
    if (fromControl(event.target)) return;
    tap();
  };
  const key = (event: KeyboardEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === "Enter" || event.key === " ") { event.preventDefault(); tap(); }
    if (event.key === "ContextMenu") { event.preventDefault(); onLongPress(entity); }
  };
  const setBrightness = (value: number) => { setBrightnessDraft(null); void run(() => hass.callService("light", "turn_on", { entity_id: entity.entity_id, brightness_pct: value })); };
  const commitKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "PageUp", "PageDown"].includes(event.key)) setBrightness(Number(event.currentTarget.value));
  };
  const setTemperature = (value: number) => {
    const next = Math.min(maximum, Math.max(minimum, Math.round(value / step) * step));
    void run(() => hass.callService("climate", "set_temperature", { entity_id: entity.entity_id, temperature: next }));
  };

  return (
    <article
      aria-label={`${entity.name}: ${status}`}
      aria-pressed={TOGGLES.has(entity.domain) ? active : undefined}
      className={`device-tile device-tile--tap ${wide ? `device-tile--wide device-tile--wide-${entity.domain}` : ""} ${active ? "device-tile--active" : ""} ${state?.state === "cleaning" ? "device-tile--cleaning" : ""} ${state?.state === "triggered" || (entity.domain === "plant" && state?.state === "problem") ? "device-tile--alert" : ""} ${unavailable ? "device-tile--unavailable" : ""}`}
      data-domain={entity.domain}
      data-running={isAppliance(entity) && applianceRunning(state) ? "appliance" : undefined}
      onClick={click}
      onContextMenu={(event) => { event.preventDefault(); cancelHold(); onLongPress(entity); }}
      onKeyDown={key}
      onPointerCancel={cancelHold}
      onPointerDown={startHold}
      onPointerLeave={cancelHold}
      onPointerMove={moveHold}
      onPointerUp={cancelHold}
      role="button"
      tabIndex={0}
    >
      {busy && <span className="device-tile__busy" />}
      <div className="device-tile__top">{entity.domain === "media_player" && mediaArt(state)
        ? <span className="device-tile__icon device-tile__icon--art" style={{ backgroundImage: mediaArt(state)! }} />
        : <span className="device-tile__icon"><HDIcon name={domainIcon(entity.domain)} size={23} /></span>}</div>
      <div className="device-tile__copy"><strong>{entity.name}</strong>{entity.domain !== "scene" && !(SELECTS.has(entity.domain) && !wide) && <span>{status}</span>}</div>

      {wide && !unavailable && state && <div className="tile-wide"><WideControls entity={entity} hass={hass} language={language} state={state} t={t} /></div>}

      {!wide && entity.domain === "light" && !unavailable && dimmable && (
        <label className={state?.state === "on" ? "device-dimmer" : "device-dimmer device-dimmer--off"} style={{ "--value": `${brightnessDraft ?? brightness}%` } as CSSProperties}><span className="sr-only">{t("brightness")}</span><b aria-hidden="true" /><input aria-label={`${t("brightness")}: ${entity.name}`} max="100" min="1" onChange={(event) => setBrightnessDraft(Number(event.currentTarget.value))} onKeyUp={commitKey} onPointerUp={(event) => setBrightness(Number(event.currentTarget.value))} type="range" value={brightnessDraft ?? Math.max(1, brightness)} /></label>
      )}

      {!wide && entity.domain === "cover" && !unavailable && (
        <div className="device-controls device-controls--cover">
          <button aria-label={t("openCover")} onClick={() => void run(() => hass.callService("cover", "open_cover", { entity_id: entity.entity_id }))} type="button"><span className="rotate-up"><HDIcon name="chevron" size={20} /></span></button>
          <button aria-label={t("stopCover")} onClick={() => void run(() => hass.callService("cover", "stop_cover", { entity_id: entity.entity_id }))} type="button"><HDIcon name="stop" size={16} /></button>
          <button aria-label={t("closeCover")} onClick={() => void run(() => hass.callService("cover", "close_cover", { entity_id: entity.entity_id }))} type="button"><span className="rotate-down"><HDIcon name="chevron" size={20} /></span></button>
        </div>
      )}

      {!wide && entity.domain === "vacuum" && !unavailable && state && (() => {
        const actions = vacuumActions(hass, state, t);
        return <div className="device-controls device-controls--vacuum">
          {[actions.main, actions.dock].map((action) => <button aria-label={action.label} key={action.label} onClick={() => void run(action.run)} type="button"><HDIcon name={action.icon} size={17} /></button>)}
        </div>;
      })()}

      {!wide && SELECTS.has(entity.domain) && !unavailable && state && (
        <HDSelect ariaLabel={`${t("chooseOption")}: ${entity.name}`} className="device-select" onChange={(option) => void run(() => selectOption(hass, entity.entity_id, option))} options={selectOptions(state).map((option) => ({ label: option, value: option }))} value={state.state} />
      )}

      {!wide && entity.domain === "climate" && !unavailable && target != null && (
        <div className="climate-quick-control">
          <span>{target}°</span>
          <div><button aria-label={t("decreaseTemperature")} disabled={target <= minimum} onClick={() => setTemperature(target - step)} type="button"><HDIcon name="minus" size={18} /></button><button aria-label={t("increaseTemperature")} disabled={target >= maximum} onClick={() => setTemperature(target + step)} type="button"><HDIcon name="plus" size={18} /></button></div>
        </div>
      )}
    </article>
  );
}
