import type { TranslationKey } from "../i18n";
import { spotifyPlayPause } from "../devicePrefs";
import { MEDIA, formatTime, isSpotify, mediaCan, mediaSeconds, playerLabel, usePlaybackClock } from "../spotify";
import type { DiscoveredEntity } from "../types/discovery";
import type { HomeAssistant } from "../types/home-assistant";
import { useWideTile } from "./EditableGrid";
import { HDIcon } from "./HDIcon";

const REPEAT_NEXT: Record<string, string> = { off: "all", all: "one", one: "off" };

interface SpotifyCardProps {
  entity: DiscoveredEntity;
  hass: HomeAssistant;
  onOpen: (entity: DiscoveredEntity) => void;
  t: (key: TranslationKey) => string;
}

/** The player card, for Spotify and (on Pro, unless turned off) every media player; tapping it opens
 * the full player (with the volume). Only the double-size card shows the artwork. Buttons follow what
 * the player says it supports, and a player that is off gets a power button. */
export function SpotifyCard({ entity, hass, onOpen, t }: SpotifyCardProps) {
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
      <span className="spotify-card__copy"><strong>{idle ? t("nothingPlaying") : String(attrs.media_title)}</strong><small>{idle ? (powerOn ? t("tapToTurnOn") : t("tapPlayToResume")) : String(attrs.media_artist ?? attrs.media_series_title ?? "")}</small></span>
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
