import type { TranslationKey } from "../i18n";
import { formatTime, mediaSeconds, usePlaybackClock } from "../spotify";
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

/** Home card for Spotify; tapping it opens the full player. Only the double-size card shows the artwork. */
export function SpotifyCard({ entity, hass, onOpen, t }: SpotifyCardProps) {
  const wide = useWideTile();
  const state = hass.states[entity.entity_id];
  const attrs = state?.attributes ?? {};
  const playing = state?.state === "playing";
  const idle = !attrs.media_title || !["playing", "paused"].includes(state?.state ?? "");
  const picture = typeof attrs.entity_picture === "string" ? attrs.entity_picture : "";
  const volume = typeof attrs.volume_level === "number" ? Math.round(attrs.volume_level * 100) : null;
  const [position, duration] = mediaSeconds(state);
  usePlaybackClock(playing);
  const call = (service: string, data: Record<string, unknown> = {}) => void hass.callService("media_player", service, { entity_id: entity.entity_id, ...data });

  const repeat = typeof attrs.repeat === "string" ? attrs.repeat : null;

  return <div className={`widget-card spotify-card ${wide ? "spotify-card--wide" : ""} ${playing ? "spotify-card--playing" : ""}`} onClick={(event) => { if (!(event.target as HTMLElement).closest("button")) onOpen(entity); }} role="button" tabIndex={0}>
    {wide && <button aria-label={t("openPlayer")} className={picture && !idle ? "spotify-card__cover" : "spotify-card__cover spotify-card__cover--empty"} onClick={() => onOpen(entity)} style={picture && !idle ? { backgroundImage: `url("${picture.replaceAll('"', "%22")}")` } : undefined} type="button">{(!picture || idle) && <HDIcon name="note" size={26} />}</button>}
    <div className="spotify-card__meta">
      <span className="spotify-card__source"><HDIcon name="note" size={13} />Spotify</span>
      <span className="spotify-card__copy"><strong>{idle ? t("nothingPlaying") : String(attrs.media_title)}</strong><small>{idle ? t("tapPlayToResume") : String(attrs.media_artist ?? "")}</small></span>
      {!idle && duration > 0 && <span className="spotify-card__progress">
        {wide && <small>{formatTime(position)}</small>}
        <span className="spotify-card__bar"><b style={{ width: `${(position / duration) * 100}%` }} /></span>
        {wide && <small>{formatTime(duration)}</small>}
      </span>}
      <span className="spotify-card__controls">
        {wide && typeof attrs.shuffle === "boolean" && <button aria-label={t("shuffle")} aria-pressed={attrs.shuffle} className={attrs.shuffle ? "spotify-card__toggle spotify-card__toggle--on" : "spotify-card__toggle"} onClick={() => call("shuffle_set", { shuffle: !attrs.shuffle })} type="button"><HDIcon name="shuffle" size={16} /></button>}
        <button aria-label={t("previous")} onClick={() => call("media_previous_track")} type="button"><HDIcon name="prev" size={18} /></button>
        <button aria-label={playing ? t("pause") : t("play")} className="spotify-card__pp" onClick={() => call("media_play_pause")} type="button"><HDIcon name={playing ? "pause" : "play"} size={18} /></button>
        <button aria-label={t("next")} onClick={() => call("media_next_track")} type="button"><HDIcon name="next" size={18} /></button>
        {wide && repeat && <button aria-label={t("repeat")} aria-pressed={repeat !== "off"} className={repeat !== "off" ? "spotify-card__toggle spotify-card__toggle--on" : "spotify-card__toggle"} onClick={() => call("repeat_set", { repeat: REPEAT_NEXT[repeat] ?? "off" })} type="button"><HDIcon name={repeat === "one" ? "repeat1" : "repeat"} size={16} /></button>}
        {volume != null && <span className="spotify-card__volume">
          <button aria-label={t("volumeDown")} onClick={() => call("volume_set", { volume_level: Math.max(0, volume - 5) / 100 })} type="button"><HDIcon name="minus" size={14} /></button>
          <button aria-label={t("volumeUp")} onClick={() => call("volume_set", { volume_level: Math.min(100, volume + 5) / 100 })} type="button"><HDIcon name="plus" size={14} /></button>
        </span>}
      </span>
    </div>
  </div>;
}
