import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { CSSProperties, KeyboardEvent } from "react";
import { domainLabel, hvacLabel, type TranslationKey } from "../i18n";
import type { DiscoveredEntity } from "../types/discovery";
import type { HassEntity, HomeAssistant } from "../types/home-assistant";
import { DEVICE_ICONS, domainIcon, EntityIcon, HA_ICON, HDIcon } from "./HDIcon";
import { VolumeButtons } from "./WideControls";
import { SpotifyPlayer } from "./SpotifyPlayer";
import { isSpotify } from "../spotify";
import { usePlan } from "../plan";
import { isNumericState } from "../history";
import { HistoryChart } from "./HistoryChart";
import { MAX_NAME, useCustomize } from "../personalize";
import { ALARM_ARMED, alarmCall, alarmCodeFormat, alarmModes, alarmStatus, cameraIsWebRtcOnly, cameraSnapshot, cameraStream, loadCameraPlayer, mediaArt, mediaSources, plantReadings, plantStatus, RUNNABLE, SELECTS, runEntity, selectOption, selectOptions, vacuumActions, vacuumStatus } from "../devices";

interface EntityModalProps {
  entity: DiscoveredEntity;
  hass: HomeAssistant;
  language?: string;
  onClose: () => void;
  roomName?: string;
  t: (key: TranslationKey) => string;
}

const LIGHT_SWATCHES = ["#ffd9a0", "#ffffff", "#9fd3ff", "#7aa8ff", "#8a7bff", "#ff9ac1", "#ff6b5e", "#ffb36b", "#7be0a0"];
const ACTIVE = new Set(["on", "open", "opening", "playing", "unlocked", "heat", "cool", "heat_cool", "auto", "dry", "fan_only", "cleaning", "returning", ...ALARM_ARMED]);
const COMMIT_KEYS = new Set(["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "PageUp", "PageDown"]);

function num(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function hexToRgb(value: string): number[] {
  return [1, 3, 5].map((index) => Number.parseInt(value.slice(index, index + 2), 16));
}

/** Pill slider like the cards' brightness bar: a rounded fill with its marker set a little inside the
 * end. Follows the finger and sends the value when released; `off` (a light that is off) shows no fill
 * and no value. */
function Slider({ label, off = false, onCommit, suffix = "%", value }: { label: string; off?: boolean; onCommit: (value: number) => void; suffix?: string; value: number }) {
  const [draft, setDraft] = useState<number | null>(null);
  const shown = Math.round(draft ?? value);
  const empty = draft == null && (off || shown === 0);
  const commit = (next: number) => { setDraft(null); onCommit(next); };
  return <label className={empty ? "hd-slider hd-slider--off" : "hd-slider"}>
    <span className="hd-slider__label"><b>{label}</b><i>{empty && off ? "" : `${shown}${suffix}`}</i></span>
    <span className="hd-slider__track" style={{ "--value": `${shown}%` } as CSSProperties}>
      <b aria-hidden="true" />
      <input aria-label={label} max="100" min="0" onChange={(event) => setDraft(Number(event.target.value))}
        onKeyUp={(event: KeyboardEvent<HTMLInputElement>) => { if (COMMIT_KEYS.has(event.key)) commit(Number(event.currentTarget.value)); }}
        onPointerUp={(event) => commit(Number(event.currentTarget.value))} type="range" value={shown} />
    </span>
  </label>;
}

export function EntityModal(props: EntityModalProps) {
  const { pro } = usePlan();
  if (pro && isSpotify(props.entity)) return <SpotifyPlayer entity={props.entity} hass={props.hass} onClose={props.onClose} t={props.t} />;
  return <EntityDetails {...props} />;
}

function EntityDetails({ entity, hass, language, onClose, roomName, t }: EntityModalProps) {
  const customize = useCustomize();
  const state = hass.states[entity.entity_id];
  const attrs = state?.attributes ?? {};
  const unavailable = !state || ["unavailable", "unknown"].includes(state.state);
  const [target, setTarget] = useState(num(attrs.temperature, num(attrs.current_temperature, 22)));
  const [busy, setBusy] = useState(false);

  useEffect(() => { setTarget(num(attrs.temperature, num(attrs.current_temperature, 22))); }, [state?.last_updated]);
  useEffect(() => {
    const close = (event: globalThis.KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [onClose]);

  const runOnce = async (action: () => Promise<unknown>) => {
    if (busy || unavailable) return;
    setBusy(true);
    try { await action(); } finally { setBusy(false); }
  };
  const call = (domain: string, service: string, data: Record<string, unknown> = {}) => runOnce(() => hass.callService(domain, service, { entity_id: entity.entity_id, ...data }));

  const domain = entity.domain;
  const on = Boolean(state && ACTIVE.has(state.state));
  const colorModes = Array.isArray(attrs.supported_color_modes) ? attrs.supported_color_modes.map(String) : [];
  const dimmable = typeof attrs.brightness === "number" || colorModes.some((mode) => mode !== "onoff");
  const colorful = colorModes.some((mode) => ["hs", "xy", "rgb", "rgbw", "rgbww"].includes(mode));
  const brightness = state?.state === "on" ? Math.round(num(attrs.brightness, 255) / 2.55) : 0;
  const unit = attrs.unit_of_measurement ? ` ${String(attrs.unit_of_measurement)}` : "";

  const status = (() => {
    if (unavailable) return t("unavailable");
    if (domain === "light") return state.state === "on" ? (dimmable ? `${brightness}%` : t("stateOn")) : t("stateOff");
    if (domain === "climate") return `${hvacLabel(state.state, language)}${typeof attrs.current_temperature === "number" ? ` · ${attrs.current_temperature}°` : ""}`;
    if (domain === "cover") return typeof attrs.current_position === "number" ? `${attrs.current_position}%` : state.state === "open" ? t("open") : t("closed");
    if (domain === "media_player") return state.state === "playing" ? String(attrs.media_title ?? t("on")) : state.state === "off" ? t("stateOff") : t("nothingPlaying");
    if (domain === "lock") return state.state === "locked" ? t("lock") : t("unlock");
    if (domain === "camera") return t("cameraLive");
    if (domain === "vacuum") return vacuumStatus(state, t);
    if (domain === "alarm_control_panel") return alarmStatus(state, t);
    if (domain === "plant") return plantStatus(state, t);
    if (domain === "script") return state.state === "on" ? t("scriptRunning") : t("runScript");
    if (domain === "button" || domain === "input_button") return t("pressButton");
    if (SELECTS.has(domain)) return state.state;
    if (state.state === "on") return t("stateOn");
    if (state.state === "off") return t("stateOff");
    return `${state.state.replaceAll("_", " ")}${unit}`;
  })();

  const primary = (() => {
    if (unavailable) return null;
    if (["light", "switch", "fan", "input_boolean"].includes(domain)) return { label: state.state === "on" ? t("turnOff") : t("turnOn"), run: () => call("homeassistant", "toggle") };
    if (domain === "climate") return { label: state.state === "off" ? t("turnOn") : t("turnOff"), run: () => call("climate", state.state === "off" ? "turn_on" : "turn_off") };
    if (domain === "media_player") return { label: state.state === "off" ? t("turnOn") : t("turnOff"), run: () => call("media_player", state.state === "off" ? "turn_on" : "turn_off") };
    if (domain === "lock") return { label: state.state === "locked" ? t("unlock") : t("lock"), run: () => call("lock", state.state === "locked" ? "unlock" : "lock") };
    if (domain === "scene") return { label: t("activate"), run: () => call("scene", "turn_on") };
    if (domain === "cover") return { label: state.state === "closed" ? t("openAction") : t("closeAction"), run: () => call("cover", state.state === "closed" ? "open_cover" : "close_cover") };
    if (RUNNABLE.has(domain)) return { label: domain === "script" ? t("runScript") : t("pressButton"), run: () => runOnce(() => runEntity(hass, entity.entity_id)) };
    return null;
  })();

  const stepTarget = (delta: number) => {
    const step = num(attrs.target_temp_step, 0.5);
    const next = Math.min(num(attrs.max_temp, 35), Math.max(num(attrs.min_temp, 7), Math.round((target + delta * step) / step) * step));
    setTarget(next);
    void call("climate", "set_temperature", { temperature: next });
  };

  return <div aria-labelledby="hd-detail-title" aria-modal="true" className="hd-sheet-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }} role="dialog">
    <section className={`hd-sheet hd-detail ${domain === "camera" ? "hd-detail--camera" : ""} ${busy ? "hd-detail--busy" : ""}`}>
      <header className="hd-detail__header">
        <span className={on ? "hd-detail__icon hd-detail__icon--on" : "hd-detail__icon"}><EntityIcon entity={customize?.lookup(entity.entity_id) ?? entity} size={24} /></span>
        <div><span className="eyebrow">{roomName ?? domainLabel(domain, language)}</span><EntityName entity={entity} t={t} /><p>{status}</p></div>
        <button aria-label={t("close")} className="hd-close" onClick={onClose} type="button"><HDIcon name="close" size={20} /></button>
      </header>

      {!unavailable && <div className="hd-detail__body">
        {domain === "light" && dimmable && <Slider label={t("brightness")} off={state?.state !== "on"} onCommit={(value) => void (value === 0 ? call("light", "turn_off") : call("light", "turn_on", { brightness_pct: value }))} value={brightness} />}
        {domain === "light" && colorful && <div className="hd-swatches" role="group" aria-label={t("predefinedColors")}>{LIGHT_SWATCHES.map((swatch) => <button aria-label={`${t("color")} ${swatch}`} key={swatch} onClick={() => void call("light", "turn_on", { rgb_color: hexToRgb(swatch) })} style={{ background: swatch }} type="button" />)}</div>}

        {domain === "climate" && <>
          <div className="hd-stepper">
            <button aria-label={t("decreaseTemperature")} disabled={target <= num(attrs.min_temp, 7)} onClick={() => stepTarget(-1)} type="button"><HDIcon name="minus" size={22} /></button>
            <span><small>{t("targetTemperature")}</small><strong>{target}°</strong></span>
            <button aria-label={t("increaseTemperature")} disabled={target >= num(attrs.max_temp, 35)} onClick={() => stepTarget(1)} type="button"><HDIcon name="plus" size={22} /></button>
          </div>
          {Array.isArray(attrs.hvac_modes) && attrs.hvac_modes.length > 1 && <div className="hd-segment" role="group" aria-label={t("mode")}>{attrs.hvac_modes.map(String).filter((mode) => mode !== "off").map((mode) => <button aria-pressed={state.state === mode} key={mode} onClick={() => void call("climate", "set_hvac_mode", { hvac_mode: mode })} type="button">{hvacLabel(mode, language)}</button>)}</div>}
        </>}

        {domain === "cover" && <>
          {typeof attrs.current_position === "number" && <Slider label={t("setPosition")} onCommit={(value) => void call("cover", "set_cover_position", { position: value })} value={num(attrs.current_position, 0)} />}
          <div className="hd-segment"><button onClick={() => void call("cover", "open_cover")} type="button">{t("openAction")}</button><button onClick={() => void call("cover", "stop_cover")} type="button">{t("stop")}</button><button onClick={() => void call("cover", "close_cover")} type="button">{t("closeAction")}</button></div>
        </>}

        {domain === "media_player" && <>
          {mediaArt(state) && <div className="hd-detail__art" style={{ backgroundImage: mediaArt(state)! }} />}
          {attrs.media_artist != null && <p className="hd-detail__meta">{String(attrs.media_artist)}</p>}
          <div className="hd-transport">
            <button aria-label={t("previous")} onClick={() => void call("media_player", "media_previous_track")} type="button"><HDIcon name="arrow" size={22} /></button>
            <button aria-label={t("playPause")} className="hd-transport__play" onClick={() => void call("media_player", "media_play_pause")} type="button"><HDIcon name={state.state === "playing" ? "pause" : "media"} size={24} /></button>
            <button aria-label={t("next")} onClick={() => void call("media_player", "media_next_track")} type="button"><HDIcon name="chevron" size={22} /></button>
          </div>
          <VolumeButtons className="hd-volume hd-volume--large" onStep={(service) => void call("media_player", service)} state={state} t={t} />
          {mediaSources(state).length > 1 && <div className="hd-detail__sources">
            <span className="eyebrow">{t("mediaSources")}</span>
            <div className="hd-options" role="group" aria-label={t("mediaSources")}>{mediaSources(state).map((source) => <button aria-pressed={attrs.source === source} key={source} onClick={() => void call("media_player", "select_source", { source })} type="button">{source}</button>)}</div>
          </div>}
        </>}

        {domain === "fan" && typeof attrs.percentage === "number" && <Slider label={t("fanSpeed")} off={state?.state !== "on"} onCommit={(value) => void call("fan", "set_percentage", { percentage: value })} value={num(attrs.percentage, 0)} />}

        {domain === "camera" && <CameraLive entity={entity} hass={hass} t={t} />}

        {domain === "vacuum" && (() => {
          const actions = vacuumActions(hass, state, t);
          return <div className="hd-segment">{[actions.main, actions.stop, actions.dock].map((action) => <button key={action.label} onClick={() => void runOnce(action.run)} type="button">{action.label}</button>)}</div>;
        })()}

        {domain === "alarm_control_panel" && <AlarmPanel busy={busy} hass={hass} run={runOnce} state={state} t={t} />}

        {domain === "plant" && <PlantPanel hass={hass} state={state} t={t} />}

        {SELECTS.has(domain) && <div className="hd-options" role="group" aria-label={t("chooseOption")}>
          {selectOptions(state).map((option) => <button aria-pressed={state.state === option} key={option} onClick={() => void runOnce(() => selectOption(hass, entity.entity_id, option))} type="button">{option}</button>)}
        </div>}

        {["sensor", "binary_sensor"].includes(domain) && <div className="hd-detail__reading"><strong>{status}</strong><small>{t("lastChanged")} {new Intl.DateTimeFormat(language, { hour: "2-digit", minute: "2-digit" }).format(new Date(state.last_changed))}</small></div>}
        {domain === "sensor" && isNumericState(state) && <HistoryChart entityId={entity.entity_id} hass={hass} language={language} t={t} unit={typeof attrs.unit_of_measurement === "string" ? attrs.unit_of_measurement : undefined} />}
      </div>}

      {primary && <button className={on ? "hd-detail__primary" : "hd-detail__primary hd-detail__primary--off"} disabled={busy} onClick={() => void primary.run()} type="button"><HDIcon name={domain === "scene" ? "scene" : domain === "lock" ? "lock" : RUNNABLE.has(domain) ? "play" : "power"} size={18} />{primary.label}</button>}
      <DeviceOptions entity={entity} t={t} />
    </section>
  </div>;
}

/** The device's own options, behind a small button: its tile icon (automatic, Home Assistant's, or a
 * HomeDeck icon) and, for what a tap switches, asking for a second tap first. */
function DeviceOptions({ entity: opened, t }: { entity: DiscoveredEntity; t: (key: TranslationKey) => string }) {
  const customize = useCustomize();
  const [open, setOpen] = useState(false);
  if (!customize) return null;
  const entity = customize.lookup(opened.entity_id) ?? opened;
  const chosen = entity.display_icon ?? "";
  const switches = ["light", "switch", "fan", "input_boolean", "automation", "scene", "cover", ...RUNNABLE].includes(entity.domain);
  const haIcon = entity.icon?.includes(":") && typeof customElements !== "undefined" && customElements.get("ha-icon") ? entity.icon : null;
  const pick = (icon: string) => customize.setEntity(entity.entity_id, { icon });
  if (!open) return <button className="hd-detail__options-toggle" onClick={() => setOpen(true)} type="button"><HDIcon name="settings" size={15} />{t("deviceOptions")}{entity.confirm && <HDIcon name="lock" size={13} />}</button>;
  return <section className="room-options hd-detail__options" aria-label={t("deviceOptions")}>
    <div className="room-options__row">
      <span className="eyebrow">{t("tileIcon")}</span>
      <div className="room-options__icons" role="radiogroup" aria-label={t("tileIcon")}>
        <button aria-checked={chosen === ""} aria-label={t("iconAuto")} className="room-options__auto" onClick={() => pick("")} role="radio" type="button"><HDIcon name={domainIcon(entity.domain)} size={18} /><span>{t("iconAuto")}</span></button>
        {haIcon && <button aria-checked={chosen === HA_ICON} aria-label={t("iconFromArea")} className="room-options__auto" onClick={() => pick(HA_ICON)} role="radio" type="button"><EntityIcon entity={{ ...entity, display_icon: HA_ICON }} size={18} /><span>{t("iconFromArea")}</span></button>}
        {DEVICE_ICONS.map((icon) => <button aria-checked={chosen === icon} aria-label={icon} key={icon} onClick={() => pick(icon)} role="radio" type="button"><HDIcon name={icon} size={18} /></button>)}
      </div>
    </div>
    {switches && <label className="hd-detail__confirm"><span><b>{t("confirmToggle")}</b><small>{t("confirmToggleDescription")}</small></span><input checked={Boolean(entity.confirm)} className="st-switch" onChange={(event) => customize.setEntity(entity.entity_id, { confirm: event.target.checked })} type="checkbox" /></label>}
  </section>;
}

/** Arm in the modes the panel supports, or disarm; the code field appears when the panel asks for
 * a code, and is cleared after each command. */
function AlarmPanel({ busy, hass, run, state, t }: { busy: boolean; hass: HomeAssistant; run: (action: () => Promise<unknown>) => Promise<void>; state: HassEntity; t: (key: TranslationKey) => string }) {
  const [code, setCode] = useState("");
  const armed = ALARM_ARMED.has(state.state) || ["arming", "pending", "triggered"].includes(state.state);
  // Many panels arm without a code and only ask for it to disarm.
  const format = armed || state.attributes.code_arm_required !== false ? alarmCodeFormat(state) : null;
  const send = (service: string) => void run(async () => { try { await alarmCall(hass, state, service, code); } finally { setCode(""); } });
  return <div className="hd-alarm">
    {format && <input aria-label={t("alarmCode")} autoComplete="off" className="hd-alarm__code" inputMode={format === "number" ? "numeric" : "text"} onChange={(event) => setCode(event.target.value)} placeholder={t("alarmCode")} type="password" value={code} />}
    {armed
      ? <button className="hd-detail__primary" disabled={busy || (format != null && !code)} onClick={() => send("alarm_disarm")} type="button"><HDIcon name="lock" size={18} />{t("alarmDisarm")}</button>
      : <div className="hd-options" role="group" aria-label={t("alarmArm")}>{alarmModes(state, t).map((mode) => <button disabled={busy || (format != null && !code)} key={mode.service} onClick={() => send(mode.service)} type="button">{mode.label}</button>)}</div>}
  </div>;
}

/** A plant's readings, with the ones out of range marked. */
function PlantPanel({ hass, state, t }: { hass: HomeAssistant; state: HassEntity; t: (key: TranslationKey) => string }) {
  const readings = plantReadings(hass, state);
  const picture = typeof state.attributes.entity_picture === "string" ? state.attributes.entity_picture : null;
  const species = typeof state.attributes.species === "string" ? state.attributes.species : null;
  return <div className="hd-plant">
    {(picture || species) && <div className="hd-plant__head">{picture && <img alt="" src={picture} />}{species && <span>{species}</span>}</div>}
    {readings.length > 0
      ? <ul className="hd-plant__readings">{readings.map((reading) => <li className={reading.problem ? "hd-plant__reading--problem" : undefined} key={reading.key}><span>{t(reading.label)}</span><b>{reading.value}</b>{reading.problem && <i>{t("plantCheck")}</i>}</li>)}</ul>
      : <p className="hd-detail__meta">{t("plantNoReadings")}</p>}
  </div>;
}

/** The device's name, with a pencil to give it a nickname inside HomeDeck (Home Assistant keeps its
 * own name). An empty name goes back to the one from Home Assistant. */
function EntityName({ entity: opened, t }: { entity: DiscoveredEntity; t: (key: TranslationKey) => string }) {
  const customize = useCustomize();
  const entity = customize?.lookup(opened.entity_id) ?? opened;
  const original = entity.original_name ?? entity.name;
  const [draft, setDraft] = useState<string | null>(null);
  if (!customize) return <h2 id="hd-detail-title">{entity.name}</h2>;
  if (draft == null) {
    return <h2 className="hd-detail__name" id="hd-detail-title"><span>{entity.name}</span><button aria-label={`${t("renameDevice")}: ${entity.name}`} className="hd-detail__rename" onClick={() => setDraft(entity.name)} type="button"><HDIcon name="pencil" size={14} /></button></h2>;
  }
  const save = () => { customize.rename(entity.entity_id, draft, original); setDraft(null); };
  return <div className="hd-detail__naming">
    <input aria-label={t("renameDevice")} autoFocus id="hd-detail-title" onFocus={(event) => event.currentTarget.select()} maxLength={MAX_NAME} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") save(); if (event.key === "Escape") { event.stopPropagation(); setDraft(null); } }} placeholder={original} value={draft} />
    <button aria-label={t("save")} onClick={save} type="button"><HDIcon name="check" size={16} /></button>
    {entity.original_name && <small>{t("nameInHomeAssistant")}: {original}</small>}
  </div>;
}

/** Home Assistant's camera player, given the same hass and state the panel has. */
export function HaCameraPlayer({ fit = "contain", hass, state }: { fit?: "contain" | "cover"; hass: HomeAssistant; state: HassEntity }) {
  const element = useRef<HTMLElement & Record<string, unknown>>(null);
  useEffect(() => {
    const player = element.current;
    if (!player) return;
    player.hass = hass;
    player.stateObj = state;
  }, [hass, state]);
  useEffect(() => {
    const player = element.current;
    if (!player) return;
    player.muted = true;
    player.controls = false;
    player.fitMode = fit;
  }, [fit]);
  return <ha-camera-stream class="hd-camera__player" ref={element} />;
}

/** The camera's live view: MJPEG, else Home Assistant's player (WebRTC / HLS), else stills every 2 seconds. */
export function CameraLive({ entity, hass, t }: { entity: DiscoveredEntity; hass: HomeAssistant; t: (key: TranslationKey) => string }) {
  const state = hass.states[entity.entity_id];
  // MJPEG first (what every camera that works today keeps using); WebRTC-only cameras, or MJPEG that
  // fails, use Home Assistant's own player (WebRTC / HLS); stills every 2 seconds when neither works.
  const [mode, setMode] = useState<"probe" | "mjpeg" | "player" | "still">("probe");
  const [tick, setTick] = useState(() => Date.now());
  useEffect(() => {
    if (mode !== "still") return;
    const timer = window.setInterval(() => setTick(Date.now()), 2000);
    return () => window.clearInterval(timer);
  }, [mode]);
  const stream = cameraStream(state);
  const fallBack = () => { void loadCameraPlayer().then((ready) => setMode(ready ? "player" : "still")); };
  useEffect(() => {
    if (mode !== "probe") return;
    let cancelled = false;
    void cameraIsWebRtcOnly(hass, entity.entity_id).then((only) => { if (cancelled) return; if (only) fallBack(); else setMode("mjpeg"); });
    return () => { cancelled = true; };
  }, [entity.entity_id, mode]);
  useEffect(() => { if (!stream && mode === "mjpeg") fallBack(); }, [stream, mode]);
  const source = mode === "still" ? cameraSnapshot(state, tick) : mode === "mjpeg" ? stream : null;
  const frame = useRef<HTMLDivElement>(null);
  const [full, setFull] = useState(false);
  // The browser's full screen when it allows it (not in every webview); otherwise the picture covers
  // the whole panel (drawn at the panel's root, since the details sheet would clip it).
  const enter = () => {
    const element = frame.current;
    if (element?.requestFullscreen) element.requestFullscreen().catch(() => setFull(true));
    else setFull(true);
  };
  const shell = frame.current?.closest(".app-shell") ?? null;
  const live = mode === "player" && Boolean(state);
  const picture = live ? <HaCameraPlayer hass={hass} state={state} />
    : source ? <img alt={entity.name} onError={() => (mode === "mjpeg" ? fallBack() : undefined)} src={source} />
      : mode === "mjpeg" || mode === "probe" ? <span className="mini-spinner" /> : <p>{t("cameraOffline")}</p>;
  return <div className="hd-camera" ref={frame}>
    {picture}
    {(source || live) && <button aria-label={t("fullScreen")} className="hd-camera__full" onClick={() => (document.fullscreenElement ? void document.exitFullscreen() : enter())} type="button"><HDIcon name="expand" size={18} /></button>}
    {full && shell && createPortal(<div className="hd-camera hd-camera--full" onClick={() => setFull(false)} role="dialog" aria-label={entity.name}>
      {picture}
      <button aria-label={t("exitFullScreen")} className="hd-camera__full" onClick={() => setFull(false)} type="button"><HDIcon name="shrink" size={18} /></button>
    </div>, shell)}
  </div>;
}
