import type { TranslationKey } from "../i18n";
import { spotifyPlayPause } from "../devicePrefs";
import { MEDIA, formatTime, isSpotify, mediaActive, mediaCan, mediaSeconds, playerLabel, usePlaybackClock } from "../spotify";
import type { DiscoveredEntity } from "../types/discovery";
import type { HomeAssistant } from "../types/home-assistant";
import { mediaSources } from "../devices";
import { useWideTile } from "./EditableGrid";
import { HDSelect } from "./HDSelect";
import { HDIcon } from "./HDIcon";

const REPEAT_NEXT: Record<string, string> = { off: "all", all: "one", one: "off" };

interface SpotifyCardProps {
  entity: DiscoveredEntity;
  hass: HomeAssistant;
  onOpen: (entity: DiscoveredEntity) => void;
  t: (key: TranslationKey) => string;
}

/** A TV (or a player without play) that is on with nothing playing: power, volume and, on bigger cards, the sources. */
function MediaOnCard({ entity, hass, onOpen, t }: { entity: DiscoveredEntity; hass: HomeAssistant; onOpen: (entity: DiscoveredEntity) => void; t: (key: TranslationKey) => string }) {
  const wide = useWideTile();
  const state = hass.states[entity.entity_id];
  const attrs = state?.attributes ?? {};
  const call = (service: string, data: Record<string, unknown> = {}) => void hass.callService("media_player", service, { entity_id: entity.entity_id, ...data });
  const level = typeof attrs.volume_level === "number" ? Math.round(attrs.volume_level * 100) : null;
  const volume = level != null || ((mediaCan(state, MEDIA.VOLUME_STEP) || mediaCan(state, MEDIA.VOLUME_SET)) && Number(attrs.supported_features) > 0);
  const step = (up: boolean) => level != null ? call("volume_set", { volume_level: Math.max(0, Math.min(100, level + (up ? 5 : -5))) / 100 }) : call(up ? "volume_up" : "volume_down");
  const sources = mediaSources(state);
  const current = typeof attrs.source === "string" ? attrs.source : "";
  const title = typeof attrs.media_title === "string" ? attrs.media_title : "";
  const picture = typeof attrs.entity_picture === "string" ? attrs.entity_picture : "";
  const art = picture ? { backgroundImage: `url("${picture.replaceAll('"', "%22")}")` } : undefined;
  const picker = wide && sources.length > 1;
  const options = [...(current && sources.includes(current) ? [] : [{ value: "", label: current || t("mediaSources") }]), ...sources.map((source) => ({ value: source, label: source }))];
  return <div className={`widget-card spotify-card spotify-card--on ${wide ? "spotify-card--wide" : ""}`} onClick={(event) => { if (!(event.target as HTMLElement).closest("button, [role='option'], [role='listbox'], .hdx-select__backdrop")) onOpen(entity); }} role="button" tabIndex={0}>
    {wide && art && <button aria-label={t("openPlayer")} className="spotify-card__cover" onClick={() => onOpen(entity)} style={art} type="button" />}
    <div className="spotify-card__meta">
      <span className="spotify-card__source spotify-card__source--other"><HDIcon name="tv" size={13} /><span>{playerLabel(entity, state)}</span></span>
      {(title || !picker) && <span className="spotify-card__line">{!wide && art && <i className="spotify-card__thumb" style={art} />}<span className="spotify-card__copy"><strong>{title || current || t("stateOn")}</strong>{title && <small>{String(attrs.media_artist ?? attrs.media_series_title ?? current)}</small>}</span></span>}
      {picker && <HDSelect ariaLabel={t("mediaSources")} className="device-select" onChange={(source) => { if (source) call("select_source", { source }); }} options={options} value={current && sources.includes(current) ? current : ""} />}
      <span className="spotify-card__controls">
        {volume && <button aria-label={t("volumeDown")} onClick={() => step(false)} type="button"><HDIcon name="minus" size={18} /></button>}
        {mediaCan(state, MEDIA.TURN_OFF) && <button aria-label={t("turnOff")} className="spotify-card__pp" onClick={() => call("turn_off")} type="button"><HDIcon name="power" size={18} /></button>}
        {volume && <button aria-label={t("volumeUp")} onClick={() => step(true)} type="button"><HDIcon name="plus" size={18} /></button>}
      </span>
    </div>
  </div>;
}

/** A media player with nothing on: its name and one centered button, to turn it on or start playing. */
export function MediaIdle({ entity, hass, onOpen, t }: { entity: DiscoveredEntity; hass: HomeAssistant; onOpen: (entity: DiscoveredEntity) => void; t: (key: TranslationKey) => string }) {
  const state = hass.states[entity.entity_id];
  const call = (service: string) => void hass.callService("media_player", service, { entity_id: entity.entity_id });
  const unavailable = !state || state.state === "unavailable";
  const off = ["off", "standby"].includes(state?.state ?? "");
  const spotify = isSpotify(entity);
  // A TV has nothing to "play" by itself, so its button is the power one, like anything that is off.
  const power = off || entity.device_class === "tv" || (!spotify && !mediaCan(state, MEDIA.PLAY) && mediaCan(state, MEDIA.TURN_OFF));
  if (power && !off && !unavailable) return <MediaOnCard entity={entity} hass={hass} onOpen={onOpen} t={t} />;
  const press = () => {
    if (off) { if (mediaCan(state, MEDIA.TURN_ON)) call("turn_on"); else onOpen(entity); }
    else if (power) call("turn_off");
    else if (spotify) { if (!spotifyPlayPause(hass, entity.entity_id, state)) onOpen(entity); }
    else call("media_play");
  };
  return <div className="widget-card spotify-card spotify-card--idle" onClick={(event) => { if (!(event.target as HTMLElement).closest("button")) onOpen(entity); }} role="button" tabIndex={0}>
    <button aria-label={`${entity.name}: ${power ? (off ? t("turnOn") : t("turnOff")) : t("play")}`} className="spotify-card__start" disabled={unavailable} onClick={press} type="button"><HDIcon name={power ? "power" : "play"} size={24} /></button>
    <strong>{entity.name}</strong>
  </div>;
}

/** The player card, for Spotify and (on Pro, unless turned off) every media player; tapping it opens
 * the full player (with the volume). Only the double-size card shows the artwork. Buttons follow what
 * the player says it supports, and a player that is off gets a power button. */
export function SpotifyCard(props: SpotifyCardProps) {
  return mediaActive(props.hass.states[props.entity.entity_id]) ? <PlayingCard {...props} /> : <MediaIdle {...props} />;
}

function PlayingCard({ entity, hass, onOpen, t }: SpotifyCardProps) {
  const wide = useWideTile();
  const state = hass.states[entity.entity_id];
  const attrs = state?.attributes ?? {};
  const playing = state?.state === "playing";
  const idle = !attrs.media_title || !["playing", "paused"].includes(state?.state ?? "");
  const picture = typeof attrs.entity_picture === "string" ? attrs.entity_picture : "";
  const [position, duration] = mediaSeconds(state);
  usePlaybackClock(playing);
  const call = (service: string, data: Record<string, unknown> = {}) => void hass.callService("media_player", service, { entity_id: entity.entity_id, ...data });

  const repeat = typeof attrs.repeat === "string" && mediaCan(state, MEDIA.REPEAT) ? attrs.repeat : null;
  const off = ["off", "standby"].includes(state?.state ?? "");
  const powerOn = off && mediaCan(state, MEDIA.TURN_ON);
  const playPause = () => { if (powerOn) call("turn_on"); else if (isSpotify(entity)) spotifyPlayPause(hass, entity.entity_id, state); else call("media_play_pause"); };
  const label = playerLabel(entity, state);

  return <div className={`widget-card spotify-card ${wide ? "spotify-card--wide" : ""} ${playing ? "spotify-card--playing" : ""}`} onClick={(event) => { if (!(event.target as HTMLElement).closest("button")) onOpen(entity); }} role="button" tabIndex={0}>
    {wide && <button aria-label={t("openPlayer")} className={picture && !idle ? "spotify-card__cover" : "spotify-card__cover spotify-card__cover--empty"} onClick={() => onOpen(entity)} style={picture && !idle ? { backgroundImage: `url("${picture.replaceAll('"', "%22")}")` } : undefined} type="button">{(!picture || idle) && <HDIcon name="note" size={26} />}</button>}
    <div className="spotify-card__meta">
      <span className={isSpotify(entity) ? "spotify-card__source" : "spotify-card__source spotify-card__source--other"}><HDIcon name="note" size={13} /><span>{label}</span></span>
      <span className="spotify-card__line">{!wide && !idle && picture && !isSpotify(entity) && <i className="spotify-card__thumb" style={{ backgroundImage: `url("${picture.replaceAll('"', "%22")}")` }} />}<span className="spotify-card__copy"><strong>{idle ? t("nothingPlaying") : String(attrs.media_title)}</strong><small>{idle ? (powerOn ? t("tapToTurnOn") : t("tapPlayToResume")) : String(attrs.media_artist ?? attrs.media_series_title ?? "")}</small></span></span>
      {!idle && duration > 0 && <span className="spotify-card__progress">
        {wide && <small>{formatTime(position)}</small>}
        <span className="spotify-card__bar"><b style={{ width: `${(position / duration) * 100}%` }} /></span>
        {wide && <small>{formatTime(duration)}</small>}
      </span>}
      <span className="spotify-card__controls">
        {wide && typeof attrs.shuffle === "boolean" && mediaCan(state, MEDIA.SHUFFLE) && <button aria-label={t("shuffle")} aria-pressed={attrs.shuffle} className={attrs.shuffle ? "spotify-card__toggle spotify-card__toggle--on" : "spotify-card__toggle"} onClick={() => call("shuffle_set", { shuffle: !attrs.shuffle })} type="button"><HDIcon name="shuffle" size={16} /></button>}
        {!powerOn && mediaCan(state, MEDIA.PREVIOUS) && <button aria-label={t("previous")} onClick={() => call("media_previous_track")} type="button"><HDIcon name="prev" size={18} /></button>}
        <button aria-label={powerOn ? t("turnOn") : playing ? t("pause") : t("play")} className="spotify-card__pp" onClick={playPause} type="button"><HDIcon name={powerOn ? "power" : playing ? "pause" : "play"} size={18} /></button>
        {!powerOn && mediaCan(state, MEDIA.NEXT) && <button aria-label={t("next")} onClick={() => call("media_next_track")} type="button"><HDIcon name="next" size={18} /></button>}
        {wide && repeat && <button aria-label={t("repeat")} aria-pressed={repeat !== "off"} className={repeat !== "off" ? "spotify-card__toggle spotify-card__toggle--on" : "spotify-card__toggle"} onClick={() => call("repeat_set", { repeat: REPEAT_NEXT[repeat] ?? "off" })} type="button"><HDIcon name={repeat === "one" ? "repeat1" : "repeat"} size={16} /></button>}
      </span>
    </div>
  </div>;
}
