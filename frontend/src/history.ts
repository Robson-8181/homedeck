import { useEffect, useState } from "react";
import type { HomeAssistant } from "./types/home-assistant";

// A sensor's recent values from Home Assistant's recorder, for the charts in the details and the
// energy card. Only numeric states count; the series is thinned to a few hundred points.

export type HistoryPoint = { t: number; v: number };

const MAX_POINTS = 240;

interface Compressed { s?: string; lu?: number; lc?: number }

export async function loadHistory(hass: HomeAssistant, entityId: string, hours: number): Promise<HistoryPoint[]> {
  const start = new Date(Date.now() - hours * 3_600_000).toISOString();
  const result = await hass.connection.sendMessagePromise<Record<string, Compressed[]>>({
    type: "history/history_during_period",
    start_time: start,
    entity_ids: [entityId],
    minimal_response: true,
    no_attributes: true,
    significant_changes_only: false,
  });
  const points: HistoryPoint[] = [];
  for (const item of result?.[entityId] ?? []) {
    const value = Number.parseFloat(String(item.s));
    const time = (item.lu ?? item.lc ?? 0) * 1000;
    if (Number.isFinite(value) && time > 0) points.push({ t: time, v: value });
  }
  return thin(points);
}

/** Keeps the shape of a long series: the minimum and maximum of each bucket. */
function thin(points: HistoryPoint[]): HistoryPoint[] {
  if (points.length <= MAX_POINTS) return points;
  const size = Math.ceil(points.length / (MAX_POINTS / 2));
  const result: HistoryPoint[] = [];
  for (let index = 0; index < points.length; index += size) {
    const bucket = points.slice(index, index + size);
    const low = bucket.reduce((a, b) => (b.v < a.v ? b : a));
    const high = bucket.reduce((a, b) => (b.v > a.v ? b : a));
    result.push(...(low.t <= high.t ? [low, high] : [high, low]));
  }
  return result;
}

/** The series for a sensor, reloaded when the range changes and every 5 minutes. null while loading. */
export function useHistory(hass: HomeAssistant, entityId: string | undefined, hours: number): HistoryPoint[] | null {
  const [points, setPoints] = useState<HistoryPoint[] | null>(null);
  useEffect(() => {
    if (!entityId) { setPoints([]); return; }
    let cancelled = false;
    setPoints(null);
    const load = () => void loadHistory(hass, entityId, hours).then((data) => { if (!cancelled) setPoints(data); }).catch(() => { if (!cancelled) setPoints([]); });
    load();
    const timer = window.setInterval(load, 5 * 60_000);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, [entityId, hours, hass.connection]);
  return points;
}

export function isNumericState(state?: { state: string }): boolean {
  return Boolean(state && Number.isFinite(Number.parseFloat(state.state)) && !/^\d{4}-\d{2}-\d{2}/.test(state.state));
}
