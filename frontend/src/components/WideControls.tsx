import { useEffect, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, PointerEvent } from "react";
import { hvacLabel, type TranslationKey } from "../i18n";
import type { DiscoveredEntity } from "../types/discovery";
import type { HassEntity, HomeAssistant } from "../types/home-assistant";
import { HDIcon } from "./HDIcon";
import { HDSelect } from "./HDSelect";
import { SELECTS, plantReadings, selectOption, selectOptions, vacuumActions } from "../devices";

// Extra controls shown when a card is double size. Every control stops at the card: taps on them
// never toggle the device underneath.

const COLOR_TEMPS: Array<[number, string]> = [[2700, "#ffb46b"], [4000, "#fff0dc"], [6500, "#dfe9ff"]];
const COLORS: Array<[number, number, number]> = [[255, 90, 90], [255, 176, 58], [95, 214, 138], [79, 179, 255], [167, 139, 250]];
const COLOR_MODES = new Set(["hs", "rgb", "rgbw", "rgbww", "xy"]);
const COVER_SET_POSITION = 4;
// Climate modes in the order they are offered; the wide card shows two of them plus off.
const CLIMATE_MODES = ["cool", "heat", "heat_cool", "auto", "dry", "fan_only"];
// The ring is a 270° arc: its length on a circle of radius 42.
const RING_ARC = 197.9;
const RING_CIRCLE = 263.9;

interface WideProps {
  entity: DiscoveredEntity;
  hass: HomeAssistant;
  language?: string;
  state: HassEntity;
  t: (key: TranslationKey) => string;
}

type Call = (domain: string, service: string, data?: Record<string, unknown>) => void;

const num = (value: unknown): number | undefined => (typeof value === "number" && Number.isFinite(value) ? value : undefined);

const VOLUME_SET = 4;
const VOLUME_STEP = 1024;

/** Volume as − and +. volume_down/volume_up work on TVs that can only step (many Samsung and LG TVs
 * ignore a level) and on players that take a level, where Home Assistant steps it for them. */
export function VolumeButtons({ className = "hd-volume", onStep, state, t }: { className?: string; onStep: (service: "volume_down" | "volume_up") => void; state: HassEntity; t: (key: TranslationKey) => string }) {
  const features = num(state.attributes.supported_features) ?? 0;
  const level = num(state.attributes.volume_level);
  if (!(features & (VOLUME_SET | VOLUME_STEP)) && level == null) return null;
  return <div aria-label={t("volume")} className={className} role="group" onClick={(event) => event.stopPropagation()}>
    <button aria-label={t("volumeDown")} onClick={() => onStep("volume_down")} type="button"><HDIcon name="minus" size={16} /></button>
    <button aria-label={t("volumeUp")} onClick={() => onStep("volume_up")} type="button"><HDIcon name="plus" size={16} /></button>
  </div>;
}

/** A range that follows the finger and sends one service call when released. `off` hides the fill and the value. */
export function TileSlider({ label, off = false, onCommit, suffix = "%", value, min = 0, max = 100 }: { label: string; off?: boolean; onCommit: (value: number) => void; suffix?: string; value: number; min?: number; max?: number }) {
  const [draft, setDraft] = useState<number | null>(null);
  const shown = draft ?? value;
  const commit = (next: number) => { setDraft(null); if (next !== value) onCommit(next); };
  const keyUp = (event: KeyboardEvent<HTMLInputElement>) => {
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "PageUp", "PageDown"].includes(event.key)) commit(Number(event.currentTarget.value));
  };
  return <label className={off && draft == null ? "tile-slider tile-slider--off" : "tile-slider"}>
    <span className="tile-slider__track" style={{ "--value": `${((shown - min) / (max - min || 1)) * 100}%` } as CSSProperties}>
      <b aria-hidden="true" />
      <input aria-label={label} max={max} min={min} onChange={(event) => setDraft(Number(event.currentTarget.value))} onKeyUp={keyUp} onPointerUp={(event) => commit(Number(event.currentTarget.value))} type="range" value={shown} />
    </span>
    <span>{off && draft == null ? "" : `${Math.round(shown)}${suffix}`}</span>
  </label>;
}

export function WideControls(props: WideProps) {
  const { entity, hass, state } = props;
  const call: Call = (domain, service, data = {}) => void hass.callService(domain, service, { entity_id: entity.entity_id, ...data });
  switch (entity.domain) {
    case "light": return <LightControls {...props} call={call} />;
    case "cover": return <CoverControls {...props} call={call} />;
    case "climate": return <ClimateControls {...props} call={call} />;
    case "media_player": return <MediaControls {...props} call={call} />;
    case "fan": return <FanControls {...props} call={call} />;
    case "lock": return <LockControls {...props} call={call} />;
    case "vacuum": return <VacuumControls {...props} />;
    case "select":
    case "input_select": return <SelectControls {...props} />;
    case "plant": return <PlantControls {...props} />;
    default: return <p className="tile-wide__since">{since(state.last_changed, props.language)}</p>;
  }
}

/** A plant's readings in the double-size card, the ones out of range marked. */
function PlantControls({ hass, state, t }: WideProps) {
  const readings = plantReadings(hass, state).slice(0, 4);
  if (readings.length === 0) return <p className="tile-wide__since">{t("plantNoReadings")}</p>;
  return <ul className="widget-list">{readings.map((reading) => <li key={reading.key}><button className={reading.problem ? "widget-list--alert" : undefined} tabIndex={-1} type="button"><span>{t(reading.label)}</span><small>{reading.value}</small></button></li>)}</ul>;
}

// Names lights use for "no effect"; when the list has one, it stands for "No effect" in the menu.
const NO_EFFECT = new Set(["none", "off", "no effect", "solid", "static", "normal"]);

/** The light's effects (Thanksgiving, Rainbow...), when it has any, always with "No effect" to go back.
 * Picking an effect turns the light on with it; "No effect" uses the light's own "none" entry when it
 * has one, or else sets its current color again, which ends the effect on most lights. (Sending an
 * effect the light doesn't list makes Home Assistant show an error.) */
export function LightEffect({ className = "device-select", hass, label, state, t }: { className?: string; hass: HomeAssistant; label: string; state: HassEntity; t: (key: TranslationKey) => string }) {
  const all = Array.isArray(state.attributes.effect_list) ? state.attributes.effect_list.map(String).filter(Boolean) : [];
  if (all.length === 0) return null;
  const plain = all.find((effect) => NO_EFFECT.has(effect.toLowerCase()));
  const effects = all.filter((effect) => effect !== plain);
  const raw = typeof state.attributes.effect === "string" && state.state === "on" ? state.attributes.effect : "";
  const current = raw && effects.includes(raw) ? raw : "";
  const turnOn = (data: Record<string, unknown>) => hass.callService("light", "turn_on", { entity_id: state.entity_id, ...data });
  const clear = () => {
    if (plain) return void turnOn({ effect: plain }).catch(() => undefined);
    const attrs = state.attributes;
    const color = attrs.color_mode === "color_temp" && typeof attrs.color_temp_kelvin === "number" ? { color_temp_kelvin: attrs.color_temp_kelvin }
      : Array.isArray(attrs.rgb_color) ? { rgb_color: attrs.rgb_color } : typeof attrs.brightness === "number" ? { brightness: attrs.brightness } : {};
    void turnOn(color).catch(() => undefined);
  };
  const options = [{ value: "", label: t("noEffect") }, ...effects.map((effect) => ({ value: effect, label: effect }))];
  return <HDSelect ariaLabel={label} className={className} onChange={(effect) => { if (effect === current) return; if (effect) void turnOn({ effect }).catch(() => undefined); else clear(); }} options={options} value={current} />;
}

function LightControls({ entity, hass, state, t, call }: WideProps & { call: Call }) {
  const on = state.state === "on";
  const modes = state.attributes.supported_color_modes ?? [];
  const brightness = num(state.attributes.brightness);
  const dimmable = brightness != null || modes.some((mode) => mode !== "onoff");
  const minK = num(state.attributes.min_color_temp_kelvin) ?? 2000;
  const maxK = num(state.attributes.max_color_temp_kelvin) ?? 6500;
  const temps = modes.includes("color_temp") ? COLOR_TEMPS.map(([kelvin, swatch]) => [Math.min(maxK, Math.max(minK, kelvin)), swatch] as const) : [];
  const colors = modes.some((mode) => COLOR_MODES.has(mode)) ? COLORS : [];
  const currentK = state.attributes.color_mode === "color_temp" ? num(state.attributes.color_temp_kelvin) : undefined;
  const currentRgb = state.attributes.color_mode !== "color_temp" ? state.attributes.rgb_color : undefined;
  return <div className="tile-wide__controls">
    {dimmable && <TileSlider label={`${t("brightness")}: ${entity.name}`} min={1} off={!on} onCommit={(value) => call("light", "turn_on", { brightness_pct: value })} value={on && brightness != null ? Math.max(1, Math.round((brightness / 255) * 100)) : 1} />}
    {(temps.length > 0 || colors.length > 0) && <div className="tile-swatches">
      {temps.map(([kelvin, swatch]) => <button aria-label={`${kelvin} K`} aria-pressed={on && currentK != null && Math.abs(currentK - kelvin) < 300} key={kelvin} onClick={() => call("light", "turn_on", { color_temp_kelvin: kelvin })} style={{ background: swatch }} type="button" />)}
      {colors.map((rgb) => <button aria-label={`RGB ${rgb.join(", ")}`} aria-pressed={on && Array.isArray(currentRgb) && currentRgb.every((value, index) => Math.abs(Number(value) - rgb[index]) < 40)} key={rgb.join()} onClick={() => call("light", "turn_on", { rgb_color: rgb })} style={{ background: `rgb(${rgb.join(",")})` }} type="button" />)}
    </div>}
    <LightEffect hass={hass} label={`${t("lightEffect")}: ${entity.name}`} state={state} t={t} />
  </div>;
}

/** Vertical drag for a 0–100 value (cover position): top is 100. Sends one call when released. */
function VerticalSlider({ disabled, label, onCommit, value }: { disabled: boolean; label: string; onCommit: (value: number) => void; value: number }) {
  const [draft, setDraft] = useState<number | null>(null);
  const track = useRef<HTMLDivElement>(null);
  const shown = draft ?? value;
  const at = (event: PointerEvent<HTMLDivElement>) => {
    const box = track.current!.getBoundingClientRect();
    return Math.round(Math.min(100, Math.max(0, ((box.bottom - event.clientY) / box.height) * 100)));
  };
  const commit = (next: number) => { setDraft(null); if (next !== value) onCommit(next); };
  const key = (event: KeyboardEvent<HTMLDivElement>) => {
    const delta = { ArrowUp: 10, ArrowRight: 10, ArrowDown: -10, ArrowLeft: -10, Home: 100 - value, End: -value }[event.key];
    if (delta == null || disabled) return;
    event.preventDefault();
    commit(Math.min(100, Math.max(0, value + delta)));
  };
  return <div
    aria-disabled={disabled}
    aria-label={label}
    aria-valuemax={100}
    aria-valuemin={0}
    aria-valuenow={shown}
    className="tile-vslider"
    onKeyDown={key}
    onPointerCancel={() => setDraft(null)}
    onPointerDown={(event) => { if (disabled) return; event.currentTarget.setPointerCapture(event.pointerId); setDraft(at(event)); }}
    onPointerMove={(event) => { if (draft != null) setDraft(at(event)); }}
    onPointerUp={(event) => { if (draft != null) commit(at(event)); }}
    ref={track}
    role="slider"
    style={{ "--value": `${shown}%` } as CSSProperties}
    tabIndex={disabled ? -1 : 0}
  ><b /><span>{shown}%</span></div>;
}

function CoverControls({ entity, state, t, call }: WideProps & { call: Call }) {
  const position = num(state.attributes.current_position);
  const canSet = position != null && Boolean(Number(state.attributes.supported_features) & COVER_SET_POSITION);
  return <div className="tile-wide__controls tile-cover">
    {position != null && <VerticalSlider disabled={!canSet} label={`${t("setPosition")}: ${entity.name}`} onCommit={(value) => call("cover", "set_cover_position", { position: value })} value={position} />}
    <div className="tile-buttons tile-buttons--vertical">
      <button aria-label={t("openCover")} onClick={() => call("cover", "open_cover")} type="button"><span className="rotate-up"><HDIcon name="chevron" size={18} /></span></button>
      <button aria-label={t("stopCover")} onClick={() => call("cover", "stop_cover")} type="button"><HDIcon name="stop" size={14} /></button>
      <button aria-label={t("closeCover")} onClick={() => call("cover", "close_cover")} type="button"><span className="rotate-down"><HDIcon name="chevron" size={18} /></span></button>
    </div>
  </div>;
}

/** Like the climate card of the main dashboard: target on a ring, modes and − / +. */
function ClimateControls({ language, state, t, call }: WideProps & { call: Call }) {
  const target = num(state.attributes.temperature);
  const min = num(state.attributes.min_temp) ?? 7;
  const max = num(state.attributes.max_temp) ?? 35;
  const step = num(state.attributes.target_temp_step) ?? 0.5;
  const available = (state.attributes.hvac_modes ?? []).map(String);
  const modes = [...CLIMATE_MODES.filter((mode) => available.includes(mode)).slice(0, 2), ...(available.includes("off") ? ["off"] : [])];
  const off = state.state === "off";
  const fraction = off || target == null ? 0 : Math.min(1, Math.max(0, (target - min) / (max - min || 1)));
  const set = (value: number) => call("climate", "set_temperature", { temperature: Math.min(max, Math.max(min, Math.round(value / step) * step)) });
  return <div className="tile-wide__controls tile-climate">
    <div className={`tile-ring tile-ring--${state.state}`}>
      <svg aria-hidden="true" viewBox="0 0 100 100">
        <circle className="tile-ring__track" cx="50" cy="50" r="42" strokeDasharray={`${RING_ARC} ${RING_CIRCLE}`} />
        <circle className="tile-ring__value" cx="50" cy="50" r="42" strokeDasharray={`${RING_ARC * fraction} ${RING_CIRCLE}`} />
      </svg>
      <strong>{off || target == null ? "—" : <>{target}<small>°</small></>}</strong>
    </div>
    {modes.length > 1 && <div aria-label={t("mode")} className="tile-seg" role="group">
      {modes.map((mode) => <button aria-pressed={state.state === mode} key={mode} onClick={() => call("climate", "set_hvac_mode", { hvac_mode: mode })} type="button">{mode === "off" ? t("climateOff") : hvacLabel(mode, language)}</button>)}
    </div>}
    {target != null && <div className="tile-step">
      <button aria-label={t("decreaseTemperature")} disabled={off || target <= min} onClick={() => set(target - step)} type="button"><HDIcon name="minus" size={18} /></button>
      <button aria-label={t("increaseTemperature")} disabled={off || target >= max} onClick={() => set(target + step)} type="button"><HDIcon name="plus" size={18} /></button>
    </div>}
  </div>;
}

function MediaControls({ state, t, call }: WideProps & { call: Call }) {
  const playing = state.state === "playing";
  const off = ["off", "standby", "unavailable"].includes(state.state);
  if (off) return <div className="tile-wide__controls"><div className="tile-buttons"><button onClick={() => call("media_player", "turn_on")} type="button"><HDIcon name="power" size={15} />{t("turnOn")}</button></div></div>;
  return <div className="tile-wide__controls">
    <div className="tile-buttons tile-buttons--media">
      <button aria-label={t("previous")} className="tile-buttons__icon" onClick={() => call("media_player", "media_previous_track")} type="button"><HDIcon name="prev" size={16} /></button>
      <button aria-label={playing ? t("pause") : t("play")} className="tile-buttons__icon tile-buttons__main" onClick={() => call("media_player", "media_play_pause")} type="button"><HDIcon name={playing ? "pause" : "play"} size={18} /></button>
      <button aria-label={t("next")} className="tile-buttons__icon" onClick={() => call("media_player", "media_next_track")} type="button"><HDIcon name="next" size={16} /></button>
    </div>
  </div>;
}

function FanControls({ entity, state, t, call }: WideProps & { call: Call }) {
  const percentage = num(state.attributes.percentage);
  const presets = (state.attributes.preset_modes ?? []).map(String);
  const oscillating = state.attributes.oscillating;
  return <div className="tile-wide__controls">
    {percentage != null && <TileSlider label={`${t("fanSpeed")}: ${entity.name}`} off={state.state !== "on"} onCommit={(value) => call("fan", "set_percentage", { percentage: value })} value={state.state === "on" ? percentage : 0} />}
    {(presets.length > 0 || typeof oscillating === "boolean") && <div className="tile-chips">
      {typeof oscillating === "boolean" && <button aria-pressed={oscillating} onClick={() => call("fan", "oscillate", { oscillating: !oscillating })} type="button">{t("oscillate")}</button>}
      {presets.map((mode) => <button aria-pressed={state.attributes.preset_mode === mode} key={mode} onClick={() => call("fan", "set_preset_mode", { preset_mode: mode })} type="button">{mode}</button>)}
    </div>}
  </div>;
}

/** Unlocking asks for a second tap, so a brushed card never opens a door. */
function LockControls({ state, t, call }: WideProps & { call: Call }) {
  const [confirm, setConfirm] = useState(false);
  const locked = state.state === "locked";
  useEffect(() => { if (!confirm) return; const timer = window.setTimeout(() => setConfirm(false), 4000); return () => window.clearTimeout(timer); }, [confirm]);
  return <div className="tile-wide__controls"><div className="tile-buttons">
    {locked
      ? <button className={confirm ? "tile-buttons__warn" : undefined} onClick={() => { if (confirm) { setConfirm(false); call("lock", "unlock"); } else setConfirm(true); }} type="button"><HDIcon name="lock" size={15} />{confirm ? t("confirmUnlock") : t("unlock")}</button>
      : <button onClick={() => call("lock", "lock")} type="button"><HDIcon name="lock" size={15} />{t("lock")}</button>}
  </div></div>;
}

/** Double-size vacuum: start or pause, stop and back to the dock, each with its label. */
function VacuumControls({ hass, state, t }: WideProps) {
  const actions = vacuumActions(hass, state, t);
  return <div className="tile-wide__controls"><div className="tile-buttons">
    {[actions.main, actions.stop, actions.dock].map((action) => <button key={action.label} onClick={() => void action.run()} type="button"><HDIcon name={action.icon} size={15} />{action.label}</button>)}
  </div></div>;
}

/** Double-size select: every option as a button, the current one marked, or a list when there are many. */
function SelectControls({ entity, hass, state, t }: WideProps) {
  const options = selectOptions(state);
  const choose = (option: string) => void selectOption(hass, entity.entity_id, option);
  if (options.length > 6 || !SELECTS.has(entity.domain)) return <div className="tile-wide__controls"><HDSelect ariaLabel={`${t("chooseOption")}: ${entity.name}`} className="device-select" onChange={choose} options={options.map((option) => ({ label: option, value: option }))} value={state.state} /></div>;
  return <div className="tile-wide__controls"><div className="tile-buttons tile-buttons--options">
    {options.map((option) => <button aria-pressed={state.state === option} key={option} onClick={() => choose(option)} type="button">{option}</button>)}
  </div></div>;
}

function since(value: unknown, language?: string): string {
  const time = typeof value === "string" ? Date.parse(value) : NaN;
  if (!Number.isFinite(time)) return "";
  const minutes = Math.round((time - Date.now()) / 60_000);
  const format = new Intl.RelativeTimeFormat(language, { numeric: "auto" });
  if (Math.abs(minutes) < 60) return format.format(minutes, "minute");
  if (Math.abs(minutes) < 60 * 24) return format.format(Math.round(minutes / 60), "hour");
  return format.format(Math.round(minutes / 1440), "day");
}
