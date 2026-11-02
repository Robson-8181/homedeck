import { useEffect, useState } from "react";
import type { DiscoveredEntity } from "./types/discovery";
import type { HassEntity } from "./types/home-assistant";

export function isSpotify(entity: DiscoveredEntity): boolean {
  return entity.domain === "media_player" && (entity.platform === "spotify" || entity.entity_id.includes("spotify"));
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
