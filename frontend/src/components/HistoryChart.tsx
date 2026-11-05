import { useId, useMemo, useRef, useState } from "react";
import type { PointerEvent } from "react";
import type { TranslationKey } from "../i18n";
import { useHistory, type HistoryPoint } from "../history";
import type { HomeAssistant } from "../types/home-assistant";

const RANGES = [6, 24, 168] as const;
const WIDTH = 320;
const HEIGHT = 120;
const PAD = 6;

/** A sensor's history in its details: a line with its area, the range (6 h, 24 h, 7 days), the
 * lowest and highest value, and the value under the finger. */
export function HistoryChart({ entityId, hass, language, t, unit }: { entityId: string; hass: HomeAssistant; language?: string; t: (key: TranslationKey) => string; unit?: string }) {
  const [hours, setHours] = useState<number>(24);
  const points = useHistory(hass, entityId, hours);
  return <div className="hd-history">
    <div className="hd-history__head">
      <span className="eyebrow">{t("history")}</span>
      <div className="hd-history__ranges" role="group" aria-label={t("history")}>
        {RANGES.map((range) => <button aria-pressed={hours === range} key={range} onClick={() => setHours(range)} type="button">{range === 168 ? t("range7d") : `${range} h`}</button>)}
      </div>
    </div>
    {points == null ? <div className="hd-history__empty"><span className="mini-spinner" /></div>
      : points.length < 2 ? <p className="hd-history__empty">{t("noHistory")}</p>
        : <Sparkline hours={hours} language={language} points={points} unit={unit} />}
  </div>;
}

export function Sparkline({ compact = false, hours, language, points, unit }: { compact?: boolean; hours: number; language?: string; points: HistoryPoint[]; unit?: string }) {
  const gradient = useId();
  const svg = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<HistoryPoint | null>(null);
  const end = Date.now();
  const start = end - hours * 3_600_000;
  const { path, area, low, high, x, y } = useMemo(() => {
    const values = points.map((point) => point.v);
    let low = Math.min(...values);
    let high = Math.max(...values);
    if (high - low < 1e-9) { low -= 1; high += 1; }
    const x = (time: number) => PAD + ((Math.max(start, time) - start) / (end - start)) * (WIDTH - PAD * 2);
    const y = (value: number) => PAD + (1 - (value - low) / (high - low)) * (HEIGHT - PAD * 2);
    // Steps: a sensor keeps its value until the next change, and the last one lasts until now.
    let path = "";
    points.forEach((point, index) => {
      path += index === 0 ? `M${x(point.t).toFixed(1)},${y(point.v).toFixed(1)}` : `H${x(point.t).toFixed(1)}V${y(point.v).toFixed(1)}`;
    });
    path += `H${x(end).toFixed(1)}`;
    const area = `${path}V${HEIGHT}H${x(points[0].t).toFixed(1)}Z`;
    return { path, area, low: Math.min(...values), high: Math.max(...values), x, y };
  }, [points, hours]);
  const format = (value: number) => `${new Intl.NumberFormat(language, { maximumFractionDigits: Math.abs(value) >= 100 ? 0 : 2 }).format(value)}${unit ? ` ${unit}` : ""}`;
  const when = (time: number) => new Intl.DateTimeFormat(language, hours > 24 ? { weekday: "short", hour: "2-digit", minute: "2-digit" } : { hour: "2-digit", minute: "2-digit" }).format(time);
  const pick = (event: PointerEvent<SVGSVGElement>) => {
    const box = svg.current?.getBoundingClientRect();
    if (!box) return;
    const time = start + ((event.clientX - box.left) / box.width) * (end - start);
    let found = points[0];
    for (const point of points) { if (point.t <= time) found = point; else break; }
    setHover(found);
  };
  return <figure className={compact ? "hd-spark hd-spark--compact" : "hd-spark"}>
    <svg aria-hidden="true" onPointerDown={pick} onPointerLeave={() => setHover(null)} onPointerMove={pick} preserveAspectRatio="none" ref={svg} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
      <defs><linearGradient id={gradient} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="currentColor" stopOpacity=".32" /><stop offset="1" stopColor="currentColor" stopOpacity="0" /></linearGradient></defs>
      <path d={area} fill={`url(#${gradient})`} />
      <path d={path} fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      {hover && <><line stroke="currentColor" strokeOpacity=".4" vectorEffect="non-scaling-stroke" x1={x(hover.t)} x2={x(hover.t)} y1={0} y2={HEIGHT} /><circle cx={x(hover.t)} cy={y(hover.v)} fill="currentColor" r="3.5" /></>}
    </svg>
    {!compact && <figcaption>
      {hover ? <span className="hd-spark__hover"><b>{format(hover.v)}</b> · {when(hover.t)}</span>
        : <span><i>↓ {format(low)}</i><i>↑ {format(high)}</i></span>}
    </figcaption>}
  </figure>;
}
