import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

// Special dates, part two: decorations that live on the cards and in the empty spaces. Presents and
// string lights at Christmas; webs, a dangling spider and a ghost at Halloween;
// a bunny peeking over a card at Easter; balloons on birthdays... All drawn here (no emoji), above the
// cards but never taking a tap, still for people who ask for less motion.

type Box = { x: number; y: number; w: number; h: number; r: number };

const CARDS = ".device-tile, .room-card, .widget-card, .spotify-card, .ls-group, .fc-chip, .sb-side, .st-panel";

/** The cards on screen, refreshed on scroll, resize and every couple of seconds. */
function useCardBoxes(anchor: React.RefObject<HTMLDivElement | null>): Box[] {
  const [boxes, setBoxes] = useState<Box[]>([]);
  useEffect(() => {
    const shell = anchor.current?.closest(".app-shell");
    if (!shell) return;
    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const height = window.innerHeight, width = window.innerWidth;
        const next: Box[] = [];
        for (const element of shell.querySelectorAll(CARDS)) {
          if (element.closest(".hd-season-preview, .hd-sheet, .hd-saver")) continue;
          const rect = element.getBoundingClientRect();
          if (rect.width < 60 || rect.height < 40 || rect.bottom < 0 || rect.top > height || rect.right < 0 || rect.left > width) continue;
          const radius = Number.parseFloat(getComputedStyle(element).borderTopLeftRadius) || 0;
          next.push({ x: Math.round(rect.left), y: Math.round(rect.top), w: Math.round(rect.width), h: Math.round(rect.height), r: Math.min(Math.round(radius), Math.round(rect.width / 2), Math.round(rect.height / 2)) });
          if (next.length >= 40) break;
        }
        setBoxes((current) => (JSON.stringify(current) === JSON.stringify(next) ? current : next));
      });
    };
    measure();
    const timer = window.setInterval(measure, 2000);
    window.addEventListener("scroll", measure, { capture: true, passive: true });
    window.addEventListener("resize", measure);
    return () => { cancelAnimationFrame(frame); window.clearInterval(timer); window.removeEventListener("scroll", measure, { capture: true }); window.removeEventListener("resize", measure); };
  }, [anchor]);
  return boxes;
}

/** A card picked for a while (the bunny's hiding place, the spider's card), changing every `ms`. */
function useRotating(count: number, ms: number): number {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (count === 0) return;
    const timer = window.setInterval(() => setIndex((current) => (current + 1 + Math.floor(Math.random() * Math.max(1, count - 1))) % count), ms);
    return () => window.clearInterval(timer);
  }, [count, ms]);
  return count === 0 ? -1 : index % count;
}

// ---------- drawings ----------


const Web = ({ flip = false }: { flip?: boolean }) => (
  <svg className="hd-decor__web" height="64" style={flip ? { transform: "scaleX(-1)" } : undefined} viewBox="0 0 64 64" width="64">
    <g fill="none" stroke="rgba(255,255,255,.55)" strokeWidth=".9">
      {[0, 22, 45, 68, 90].map((angle) => <line key={angle} x1="0" x2={64 * Math.cos((angle * Math.PI) / 180)} y1="0" y2={64 * Math.sin((angle * Math.PI) / 180)} />)}
      {[14, 28, 42, 56].map((radius) => <path d={[0, 22, 45, 68, 90].map((angle, index) => `${index ? "Q" + (radius * 0.86 * Math.cos(((angle - 11) * Math.PI) / 180)).toFixed(1) + " " + (radius * 0.86 * Math.sin(((angle - 11) * Math.PI) / 180)).toFixed(1) + " " : "M"}${(radius * Math.cos((angle * Math.PI) / 180)).toFixed(1)} ${(radius * Math.sin((angle * Math.PI) / 180)).toFixed(1)}`).join(" ")} key={radius} />)}
    </g>
  </svg>
);

const Spider = ({ drop }: { drop: number }) => (
  <svg className="hd-decor__spider" height={drop + 30} viewBox={`0 0 30 ${drop + 30}`} width="30">
    <line stroke="rgba(255,255,255,.6)" strokeWidth="1" x1="15" x2="15" y1="0" y2={drop + 8} />
    <g transform={`translate(15 ${drop + 14})`}>
      {[-1, 1].map((side) => [[-6, -8], [-3, -10], [2, -10], [6, -7]].map(([y, reach], index) => <path d={`M0 ${y / 3} Q${side * 7} ${y - 3} ${side * Math.abs(reach)} ${y + 6}`} fill="none" key={`${side}${index}`} stroke="#14101a" strokeLinecap="round" strokeWidth="1.6" />))}
      <ellipse cx="0" cy="2" fill="#14101a" rx="6" ry="7" />
      <circle cx="0" cy="-6" fill="#14101a" r="4" />
      <circle cx="-1.6" cy="-6.5" fill="#ff5a5a" r="1.1" /><circle cx="1.6" cy="-6.5" fill="#ff5a5a" r="1.1" />
    </g>
  </svg>
);

const Ghost = () => (
  <svg className="hd-decor__ghost-body" height="74" viewBox="0 0 60 74" width="60">
    <path d="M6 40 C6 14 22 4 30 4 C38 4 54 14 54 40 L54 66 L47 60 L40 68 L33 60 L26 68 L19 60 L12 68 L6 62 Z" fill="rgba(255,255,255,.92)" />
    <ellipse cx="22" cy="32" fill="#2a2140" rx="4" ry="5.5" /><ellipse cx="38" cy="32" fill="#2a2140" rx="4" ry="5.5" />
    <ellipse cx="30" cy="45" fill="#2a2140" rx="4" ry="3" opacity=".8" />
  </svg>
);

const Bunny = () => (
  <svg className="hd-decor__bunny-body" height="70" viewBox="0 0 64 70" width="64">
    <g fill="#f7f3ee" stroke="rgba(0,0,0,.12)" strokeWidth="1">
      <ellipse cx="22" cy="20" rx="7" ry="20" transform="rotate(-10 22 20)" /><ellipse cx="42" cy="20" rx="7" ry="20" transform="rotate(10 42 20)" />
      <ellipse cx="32" cy="54" rx="22" ry="18" />
    </g>
    <ellipse cx="22" cy="20" fill="#ffc4d2" rx="3.4" ry="14" transform="rotate(-10 22 20)" /><ellipse cx="42" cy="20" fill="#ffc4d2" rx="3.4" ry="14" transform="rotate(10 42 20)" />
    <circle cx="24" cy="50" fill="#2b2230" r="2.6" /><circle cx="40" cy="50" fill="#2b2230" r="2.6" />
    <circle cx="25" cy="49" fill="#fff" r=".9" /><circle cx="41" cy="49" fill="#fff" r=".9" />
    <ellipse cx="32" cy="57" fill="#ff9fb4" rx="3" ry="2.2" />
    <ellipse cx="20" cy="59" fill="#ffd0dc" opacity=".7" rx="4" ry="2.4" /><ellipse cx="44" cy="59" fill="#ffd0dc" opacity=".7" rx="4" ry="2.4" />
  </svg>
);

/** A wrapped present: box, ribbon and bow, in a few color pairs and sizes. */
const Gift = ({ box, ribbon, size }: { box: string; ribbon: string; size: number }) => (
  <svg height={size * 1.15} viewBox="0 0 30 34" width={size}>
    <rect fill={box} height="20" rx="2" width="26" x="2" y="14" />
    <rect fill={box} height="6" rx="1.5" opacity=".85" width="30" x="0" y="10" style={{ filter: "brightness(1.12)" }} />
    <rect fill={ribbon} height="24" width="4" x="13" y="10" />
    <rect fill={ribbon} height="3" width="30" x="0" y="11.5" />
    <path d="M15 10 Q8 2 6 6 Q5 10 15 10 Z M15 10 Q22 2 24 6 Q25 10 15 10 Z" fill={ribbon} />
  </svg>
);

const Egg = ({ color, stripe }: { color: string; stripe: string }) => (
  <svg height="20" viewBox="0 0 16 20" width="16"><ellipse cx="8" cy="11" fill={color} rx="7" ry="9" /><path d="M1.5 10 Q8 14 14.5 10" fill="none" stroke={stripe} strokeWidth="2" /></svg>
);

const Leaf = ({ color, angle }: { color: string; angle: number }) => (
  <svg height="20" style={{ transform: `rotate(${angle}deg)` }} viewBox="0 0 20 20" width="20"><path d="M10 1 Q19 10 10 19 Q1 10 10 1 Z" fill={color} /><path d="M10 3 L10 19" stroke="rgba(0,0,0,.25)" strokeWidth="1" /></svg>
);

const Heart = ({ color, size = 18 }: { color: string; size?: number }) => (
  <svg height={size} viewBox="0 0 20 18" width={size}><path d="M10 17 C-4 8 2 -2 10 4 C18 -2 24 8 10 17 Z" fill={color} /></svg>
);

const Streamer = ({ color, length }: { color: string; length: number }) => (
  <svg height={length} viewBox={`0 0 16 ${length}`} width="16"><path d={`M8 0 ${Array.from({ length: Math.floor(length / 10) }, (_, index) => `Q${index % 2 ? 0 : 16} ${index * 10 + 5} 8 ${index * 10 + 10}`).join(" ")}`} fill="none" stroke={color} strokeLinecap="round" strokeWidth="2.6" /></svg>
);

const Balloon = ({ color }: { color: string }) => (
  <svg height="96" viewBox="0 0 40 96" width="40">
    <path d="M20 52 Q16 66 22 78 Q26 88 20 96" fill="none" stroke="rgba(255,255,255,.6)" strokeWidth="1" />
    <ellipse cx="20" cy="26" fill={color} rx="17" ry="22" /><path d="M16 47 L24 47 L20 52 Z" fill={color} />
    <ellipse cx="13" cy="17" fill="rgba(255,255,255,.45)" rx="4" ry="7" transform="rotate(-20 13 17)" />
  </svg>
);

const Lights = () => (
  <svg className="hd-decor__lights" preserveAspectRatio="none" viewBox="0 0 1000 40">
    <path d="M0 4 Q125 26 250 4 T500 4 T750 4 T1000 4" fill="none" stroke="rgba(20,40,20,.8)" strokeWidth="1.6" />
    {Array.from({ length: 28 }, (_, index) => {
      const x = 18 + index * 35.5, phase = (x % 250) / 250;
      const y = 4 + Math.sin(phase * Math.PI) * 22;
      const colors = ["#ff4d4d", "#ffd23f", "#3fd17a", "#4fa8ff", "#ff8a3d"];
      return <g key={index}><rect fill="#2c3a2c" height="4" width="4" x={x - 2} y={y} /><ellipse className="hd-decor__bulb" cx={x} cy={y + 9} fill={colors[index % colors.length]} rx="4.2" ry="6" style={{ animationDelay: `${(index % 5) * 0.4}s` }} /></g>;
    })}
  </svg>
);



const CONFETTI = ["#ffc94d", "#ff7a8a", "#4fb3ff", "#5fd68a", "#a78bfa", "#ff9d4d"];


/** Decorations for the occasion shown now (by id), over the cards. `preview` keeps the moving
 * characters on screen right away (the "See" button in Settings). */
export function SeasonDecor({ id, preview = false }: { id: string; preview?: boolean }) {
  const anchor = useRef<HTMLDivElement>(null);
  const boxes = useCardBoxes(anchor);
  const still = typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const featured = useRotating(boxes.length, preview ? 4000 : 18_000);
  const kind = id.startsWith("custom:") ? "custom" : id;
  const pick = (index: number) => boxes[index];
  let content: ReactNode = null;

  if (kind === "christmas") {
    const gifts = [["#d93636", "#ffd23f"], ["#2f9e5a", "#ffffff"], ["#3b6fd9", "#ffd23f"], ["#f2c94c", "#d93636"], ["#8e5bd9", "#5fd68a"], ["#ffffff", "#d93636"]];
    content = <>
      <Lights />
      {boxes.map((box, index) => {
        // A few presents on some cards, in a spot and a number that differ from card to card.
        if ((index * 7) % 5 > 2) return null;
        const count = 1 + ((index * 3) % 2);
        return <div className="hd-decor__at hd-decor__row" key={index} style={{ left: box.x + Math.max(box.r, 14) + ((index * 41) % Math.max(10, box.w - 2 * Math.max(box.r, 14) - 70)), top: box.y - 29 }}>{Array.from({ length: count }, (_, gift) => { const [color, ribbon] = gifts[(index * 2 + gift) % gifts.length]; return <Gift box={color} key={gift} ribbon={ribbon} size={gift ? 21 : 27} />; })}</div>;
      })}
    </>;
  } else if (kind === "halloween") {
    const spider = pick(featured);
    content = <>
      {boxes.map((box, index) => index % 3 === 0 ? <div className="hd-decor__at hd-decor__webclip" key={index} style={{ left: index % 2 ? box.x + box.w - 64 : box.x, top: box.y, clipPath: index % 2 ? `inset(0 round 0 ${box.r}px 0 0)` : `inset(0 round ${box.r}px 0 0 0)` }}><Web flip={index % 2 === 1} /></div> : null)}
      {spider && <div className="hd-decor__at hd-decor__dangle" key={`spider-${featured}`} style={{ left: spider.x + spider.w * 0.7 - 15, top: spider.y + spider.h - 4 }}><Spider drop={46} /></div>}
      {!still && <div className={preview ? "hd-decor__ghost hd-decor__ghost--now" : "hd-decor__ghost"}><Ghost /></div>}
    </>;
  } else if (kind === "easter") {
    const hideout = pick(featured);
    const eggs = [["#ffd6e0", "#ff9fb4"], ["#cdeccf", "#7cc98a"], ["#cfe3ff", "#7fb0f0"], ["#fff1b8", "#f0c84a"], ["#e6d4ff", "#b48cf0"]];
    content = <>
      {boxes.map((box, index) => index % 2 === 0 ? <div className="hd-decor__at hd-decor__row" key={index} style={{ left: box.x + box.w - 70, top: box.y - 16 }}>{[0, 1, 2].map((egg) => <Egg color={eggs[(index + egg) % eggs.length][0]} key={egg} stripe={eggs[(index + egg) % eggs.length][1]} />)}</div> : null)}
      {hideout && <div className="hd-decor__at hd-decor__peek" key={`bunny-${featured}`} style={{ left: hideout.x + Math.min(hideout.w - 80, 20 + (featured * 37) % Math.max(20, hideout.w - 100)), top: hideout.y - 58, height: 58 }}><Bunny /></div>}
    </>;
  } else if (kind === "thanksgiving") {
    const colors = ["#e8833a", "#c9542b", "#d9a23a", "#a8462a"];
    content = <>{boxes.map((box, index) => <div className="hd-decor__at hd-decor__row" key={index} style={{ left: box.x + 14 + (index * 23) % Math.max(10, box.w - 70), top: box.y - 10 }}><Leaf angle={-30 + (index * 17) % 60} color={colors[index % 4]} /><Leaf angle={20 + (index * 11) % 50} color={colors[(index + 2) % 4]} /></div>)}</>;
  } else if (kind === "valentines") {
    content = <>{boxes.map((box, index) => index % 2 === 0 ? <div className="hd-decor__at hd-decor__tag" key={index} style={{ left: box.x + box.w * 0.5 - 11, top: box.y - 6, animationDelay: `${(index % 4) * 0.5}s` }}><span className="hd-decor__string" /><Heart color={["#ff6b8b", "#e8436a", "#ff8fab"][index % 3]} size={22} /></div> : null)}</>;
  } else if (kind === "carnival") {
    content = <>{boxes.map((box, index) => index % 2 === 0 ? <div className="hd-decor__at hd-decor__row" key={index} style={{ left: box.x + box.w * 0.42 + (index * 13) % 18, top: box.y - 6 }}><Streamer color={CONFETTI[index % 6]} length={34} /><Streamer color={CONFETTI[(index + 3) % 6]} length={24} /></div> : null)}</>;
  } else if (kind === "birthdays" || kind === "newyear") {
    content = <>
      {kind === "birthdays" && !still && <div className="hd-decor__balloons">{["#ff6b8b", "#4fb3ff", "#ffc94d", "#5fd68a"].map((color, index) => <div className="hd-decor__balloon" key={color} style={{ left: `${8 + index * 24}%`, animationDelay: `${index * (preview ? 0.6 : 3.5)}s` }}><Balloon color={color} /></div>)}</div>}
    </>;
  }
  return <div aria-hidden="true" className="hd-decor" ref={anchor}>{content}</div>;
}
