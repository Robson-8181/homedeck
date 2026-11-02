import { useEffect, useState } from "react";
import type { CSSProperties, KeyboardEvent } from "react";
import { domainLabel, hvacLabel, type TranslationKey } from "../i18n";
import type { DiscoveredEntity } from "../types/discovery";
import type { HomeAssistant } from "../types/home-assistant";
import { domainIcon, HDIcon } from "./HDIcon";
import { SpotifyPlayer } from "./SpotifyPlayer";
import { isSpotify } from "../spotify";
import { usePlan } from "../plan";

interface EntityModalProps {
  entity: DiscoveredEntity;
  hass: HomeAssistant;
  language?: string;
  onClose: () => void;
  roomName?: string;
  t: (key: TranslationKey) => string;
}

const LIGHT_SWATCHES = ["#ffd9a0", "#ffffff", "#9fd3ff", "#7aa8ff", "#8a7bff", "#ff9ac1", "#ff6b5e", "#ffb36b", "#7be0a0"];
const ACTIVE = new Set(["on", "open", "opening", "playing", "unlocked", "heat", "cool", "heat_cool", "auto", "dry", "fan_only"]);
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

  const call = async (domain: string, service: string, data: Record<string, unknown> = {}) => {
    if (busy || unavailable) return;
    setBusy(true);
    try { await hass.callService(domain, service, { entity_id: entity.entity_id, ...data }); } finally { setBusy(false); }
  };

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
    return null;
  })();

  const stepTarget = (delta: number) => {
    const step = num(attrs.target_temp_step, 0.5);
    const next = Math.min(num(attrs.max_temp, 35), Math.max(num(attrs.min_temp, 7), Math.round((target + delta * step) / step) * step));
    setTarget(next);
    void call("climate", "set_temperature", { temperature: next });
  };

  return <div aria-labelledby="hd-detail-title" aria-modal="true" className="hd-sheet-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }} role="dialog">
    <section className={`hd-sheet hd-detail ${busy ? "hd-detail--busy" : ""}`}>
      <header className="hd-detail__header">
        <span className={on ? "hd-detail__icon hd-detail__icon--on" : "hd-detail__icon"}><HDIcon name={domainIcon(domain)} size={24} /></span>
        <div><span className="eyebrow">{roomName ?? domainLabel(domain, language)}</span><h2 id="hd-detail-title">{entity.name}</h2><p>{status}</p></div>
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
          {attrs.media_artist != null && <p className="hd-detail__meta">{String(attrs.media_artist)}</p>}
          <div className="hd-transport">
            <button aria-label={t("previous")} onClick={() => void call("media_player", "media_previous_track")} type="button"><HDIcon name="arrow" size={22} /></button>
            <button aria-label={t("playPause")} className="hd-transport__play" onClick={() => void call("media_player", "media_play_pause")} type="button"><HDIcon name={state.state === "playing" ? "pause" : "media"} size={24} /></button>
            <button aria-label={t("next")} onClick={() => void call("media_player", "media_next_track")} type="button"><HDIcon name="chevron" size={22} /></button>
          </div>
          {typeof attrs.volume_level === "number" && <Slider label={t("volume")} onCommit={(value) => void call("media_player", "volume_set", { volume_level: value / 100 })} value={Math.round(num(attrs.volume_level, 0) * 100)} />}
        </>}

        {domain === "fan" && typeof attrs.percentage === "number" && <Slider label={t("fanSpeed")} off={state?.state !== "on"} onCommit={(value) => void call("fan", "set_percentage", { percentage: value })} value={num(attrs.percentage, 0)} />}

        {["sensor", "binary_sensor"].includes(domain) && <div className="hd-detail__reading"><strong>{status}</strong><small>{t("lastChanged")} {new Intl.DateTimeFormat(language, { hour: "2-digit", minute: "2-digit" }).format(new Date(state.last_changed))}</small></div>}
      </div>}

      {primary && <button className={on ? "hd-detail__primary" : "hd-detail__primary hd-detail__primary--off"} disabled={busy} onClick={() => void primary.run()} type="button"><HDIcon name={domain === "scene" ? "scene" : domain === "lock" ? "lock" : "power"} size={18} />{primary.label}</button>}
    </section>
  </div>;
}
