import { useEffect, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import type { TranslationKey } from "../i18n";
import { formatTime, mediaSeconds, usePlaybackClock } from "../spotify";
import type { DiscoveredEntity } from "../types/discovery";
import type { HomeAssistant } from "../types/home-assistant";
import { HDIcon } from "./HDIcon";

interface SpotifyPlayerProps {
  entity: DiscoveredEntity;
  hass: HomeAssistant;
  onClose: () => void;
  t: (key: TranslationKey) => string;
}

const REPEAT_NEXT: Record<string, string> = { off: "all", all: "one", one: "off" };

/** Full-screen player: blurred cover behind, large artwork, seek bar, transport, volume and devices. */
export function SpotifyPlayer({ entity, hass, onClose, t }: SpotifyPlayerProps) {
  const state = hass.states[entity.entity_id];
  const attrs = state?.attributes ?? {};
  const playing = state?.state === "playing";
  const idle = !attrs.media_title || !["playing", "paused"].includes(state?.state ?? "");
  const picture = !idle && typeof attrs.entity_picture === "string" ? attrs.entity_picture : "";
  const [position, duration] = mediaSeconds(state);
  const [seek, setSeek] = useState<number | null>(null);
  const bar = useRef<HTMLDivElement>(null);
  const volume = typeof attrs.volume_level === "number" ? Math.round(attrs.volume_level * 100) : null;
  const repeat = typeof attrs.repeat === "string" ? attrs.repeat : null;
  const sources = Array.isArray(attrs.source_list) ? attrs.source_list.map(String).slice(0, 8) : [];
  usePlaybackClock(playing && seek == null);

  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [onClose]);

  const call = (service: string, data: Record<string, unknown> = {}) => void hass.callService("media_player", service, { entity_id: entity.entity_id, ...data });
  const fraction = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rect = bar.current!.getBoundingClientRect();
    return Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
  };
  const shown = seek != null ? seek * duration : position;
  const art = picture ? { backgroundImage: `url("${picture.replaceAll('"', "%22")}")` } : undefined;

  return <div aria-labelledby="hd-player-title" aria-modal="true" className="hd-player" role="dialog">
    <div className="hd-player__bg"><i style={art} /></div>
    <button aria-label={t("close")} className="hd-close hd-player__close" onClick={onClose} type="button"><HDIcon name="close" size={20} /></button>
    <div className="hd-player__scroll"><div className="hd-player__wrap">
      <div className={playing ? "hd-player__art" : "hd-player__art hd-player__art--paused"} style={art}>{!picture && <HDIcon name="note" size={56} />}</div>
      <div className="hd-player__head">
        <div className="hd-player__source"><HDIcon name="note" size={15} /><span>{attrs.source ? `Spotify · ${String(attrs.source)}` : "Spotify"}</span></div>
        <div className="hd-player__title" id="hd-player-title">{idle ? t("nothingPlaying") : String(attrs.media_title)}</div>
        <div className="hd-player__artist">{idle ? t("tapPlayToResume") : [attrs.media_artist, attrs.media_album_name].filter(Boolean).join(" · ")}</div>
      </div>
      {!idle && duration > 0 && <div className="hd-player__track">
        <div aria-label={t("trackPosition")} aria-valuemax={Math.round(duration)} aria-valuemin={0} aria-valuenow={Math.round(shown)} className={seek != null ? "hd-player__bar hd-player__bar--drag" : "hd-player__bar"}
          onKeyDown={(event) => { if (event.key === "ArrowRight" || event.key === "ArrowLeft") call("media_seek", { seek_position: Math.round(Math.max(0, Math.min(duration, position + (event.key === "ArrowRight" ? 10 : -10)))) }); }}
          onPointerCancel={() => setSeek(null)}
          onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); setSeek(fraction(event)); }}
          onPointerMove={(event) => { if (seek != null) setSeek(fraction(event)); }}
          onPointerUp={(event) => { if (seek == null) return; const value = fraction(event); setSeek(null); call("media_seek", { seek_position: Math.round(value * duration) }); }}
          ref={bar} role="slider" tabIndex={0}>
          <b style={{ width: `${(shown / duration) * 100}%` } as CSSProperties} />
        </div>
        <div className="hd-player__times"><span>{formatTime(shown)}</span><span>−{formatTime(duration - shown)}</span></div>
      </div>}
      <div className="hd-player__controls">
        <div className="hd-player__side">
          {typeof attrs.shuffle === "boolean" && <button aria-label={t("shuffle")} aria-pressed={attrs.shuffle} className={attrs.shuffle ? "hd-player__small hd-player__small--on" : "hd-player__small"} onClick={() => call("shuffle_set", { shuffle: !attrs.shuffle })} type="button"><HDIcon name="shuffle" size={20} /></button>}
          {repeat && <button aria-label={`${t("repeat")}: ${t(`repeat_${repeat}`)}`} className={repeat !== "off" ? "hd-player__small hd-player__small--on" : "hd-player__small"} onClick={() => call("repeat_set", { repeat: REPEAT_NEXT[repeat] ?? "off" })} type="button"><HDIcon name={repeat === "one" ? "repeat1" : "repeat"} size={20} /></button>}
        </div>
        <div className="hd-player__main">
          <button aria-label={t("previous")} onClick={() => call("media_previous_track")} type="button"><HDIcon name="prev" size={26} /></button>
          <button aria-label={playing ? t("pause") : t("play")} className="hd-player__pp" onClick={() => call("media_play_pause")} type="button"><HDIcon name={playing ? "pause" : "play"} size={30} /></button>
          <button aria-label={t("next")} onClick={() => call("media_next_track")} type="button"><HDIcon name="next" size={26} /></button>
        </div>
        <div className="hd-player__side hd-player__side--end">
          {volume != null && <div aria-label={t("volume")} className="hd-player__volume" role="group">
            <button aria-label={t("volumeDown")} onClick={() => call("volume_set", { volume_level: Math.max(0, volume - 5) / 100 })} type="button"><HDIcon name="minus" size={18} /></button>
            <span>{volume}%</span>
            <button aria-label={t("volumeUp")} onClick={() => call("volume_set", { volume_level: Math.min(100, volume + 5) / 100 })} type="button"><HDIcon name="plus" size={18} /></button>
          </div>}
        </div>
      </div>
      {sources.length > 1 && <div aria-label={t("playOn")} className="hd-player__devices" role="group">
        {sources.map((source) => <button aria-pressed={source === attrs.source} key={source} onClick={() => call("select_source", { source })} type="button"><HDIcon name="speaker" size={17} /><span>{source}</span></button>)}
      </div>}
    </div></div>
  </div>;
}
