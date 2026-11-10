import { useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";

const LIVE_MS = 350;

/** Any color for a lamp: a round spectrum, hue around the circle and white at the center. Follows the
 * finger, sending the color a few times per second so the lamp changes while it moves. */
export function ColorWheel({ hs, label, onPick }: { hs: [number, number]; label: string; onPick: (hs: [number, number]) => void }) {
  const area = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState<[number, number] | null>(null);
  const sent = useRef(0);
  const last = useRef("");
  const [hue, saturation] = draft ?? hs;
  const at = (event: ReactPointerEvent<HTMLDivElement>): [number, number] => {
    const box = area.current!.getBoundingClientRect();
    const x = event.clientX - box.left - box.width / 2;
    const y = event.clientY - box.top - box.height / 2;
    const angle = (Math.atan2(x, -y) * 180) / Math.PI;
    return [Math.round((angle + 360) % 360), Math.round(Math.min(1, Math.hypot(x, y) / (box.width / 2)) * 100)];
  };
  const send = (value: [number, number]) => { if (value.join() === last.current) return; last.current = value.join(); sent.current = Date.now(); onPick(value); };
  const radians = (hue * Math.PI) / 180;
  const color = `hsl(${hue} 100% ${100 - saturation / 2}%)`;
  const thumb = { left: `${50 + (Math.sin(radians) * saturation) / 2}%`, top: `${50 - (Math.cos(radians) * saturation) / 2}%`, background: color } as CSSProperties;
  const nudge = (change: [number, number]) => send([(hue + change[0] + 360) % 360, Math.max(0, Math.min(100, saturation + change[1]))]);

  return <div
    aria-label={label}
    aria-valuetext={`${hue}°, ${saturation}%`}
    className="hd-wheel"
    onKeyDown={(event) => {
      const moves: Record<string, [number, number]> = { ArrowRight: [10, 0], ArrowLeft: [-10, 0], ArrowUp: [0, 10], ArrowDown: [0, -10] };
      if (moves[event.key]) { event.preventDefault(); nudge(moves[event.key]); }
    }}
    onPointerCancel={() => setDraft(null)}
    onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); const value = at(event); setDraft(value); send(value); }}
    onPointerMove={(event) => { if (draft == null) return; const value = at(event); setDraft(value); if (Date.now() - sent.current > LIVE_MS) send(value); }}
    onPointerUp={(event) => { if (draft == null) return; send(at(event)); setDraft(null); }}
    ref={area}
    role="slider"
    tabIndex={0}
  ><i style={thumb} /></div>;
}
