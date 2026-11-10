import { createContext, useContext, useEffect, useState } from "react";
import type { DiscoveredEntity } from "./types/discovery";
import type { HassEntity } from "./types/home-assistant";

export function isSpotify(entity: DiscoveredEntity): boolean {
  return entity.domain === "media_player" && (entity.platform === "spotify" || entity.entity_id.includes("spotify"));
}

/** Every media player (Apple TV, Sonos, Chromecast…) uses the Spotify-style player card on Pro;
 * Settings → Appearance can keep it to Spotify only. */
export const PlayersContext = createContext(true);
export const usePlayers = () => useContext(PlayersContext);

/** Whether this entity shows as the player card and opens the full-screen player. */
export function showsPlayer(entity: DiscoveredEntity, pro: boolean, everyPlayer: boolean): boolean {
  return pro && entity.domain === "media_player" && (isSpotify(entity) || everyPlayer);
}

// MediaPlayerEntityFeature bits.
export const MEDIA = { PAUSE: 1, SEEK: 2, VOLUME_SET: 4, PREVIOUS: 16, NEXT: 32, TURN_ON: 128, TURN_OFF: 256, VOLUME_STEP: 1024, SELECT_SOURCE: 2048, PLAY: 16384, SHUFFLE: 32768, REPEAT: 262144 } as const;

/** Whether a player says it can do this; a player that lists no features gets every button. */
export function mediaCan(state: HassEntity | undefined, feature: number): boolean {
  const features = Number(state?.attributes.supported_features) || 0;
  return features === 0 || (features & feature) !== 0;
}

/** Whether a player has something on: playing or paused, with a title. */
export function mediaActive(state: HassEntity | undefined): boolean {
  return Boolean(state?.attributes.media_title) && ["playing", "paused"].includes(state?.state ?? "");
}

/** The name on the card: Spotify, the app playing (Music on an Apple TV), or the player itself. */
export function playerLabel(entity: DiscoveredEntity, state: HassEntity | undefined): string {
  if (isSpotify(entity)) return "Spotify";
  const app = state?.attributes.app_name;
  return typeof app === "string" && app.trim() ? app : entity.name;
}

/** Current position and duration in seconds; while playing, the position advances from its last update. */
export function mediaSeconds(state?: HassEntity): [number, number] {
  if (!state) return [0, 0];
  const attrs = state.attributes;
  const duration = typeof attrs.media_duration === "number" ? attrs.media_duration : 0;
  let position = typeof attrs.media_position === "number" ? attrs.media_position : 0;
  const updated = typeof attrs.media_position_updated_at === "string" ? Date.parse(attrs.media_position_updated_at) : Number.NaN;
  if (state.state === "playing" && Number.isFinite(updated)) position += (Date.now() - updated) / 1000;
  return [Math.max(0, Math.min(duration || position, position)), duration];
}

export function formatTime(seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(total / 60);
  return `${minutes}:${String(total % 60).padStart(2, "0")}`;
}

/** Re-renders every second while something plays, so progress bars move. */
export function usePlaybackClock(playing: boolean): void {
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setTick((tick) => tick + 1), 1000);
    return () => window.clearInterval(timer);
  }, [playing]);
}
