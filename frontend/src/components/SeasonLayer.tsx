import { createContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { SeasonDecor } from "./SeasonDecor";
import type { Occasion, SeasonEffect } from "../seasons";

/** The occasion shown now (for the badge by the clock and the screensaver greeting), or null. */
export const OccasionContext = createContext<Occasion | null>(null);

// The special-date animation, behind the cards and never in the way of a tap: snow, hearts, confetti,
// leaves, Halloween, Easter eggs, sparkles or June-festival bunting, and fireworks on New Year's first
// minutes. It sleeps while the panel is hidden, and stays still for people who ask for less motion.

interface Particle { x: number; y: number; vx: number; vy: number; size: number; spin: number; angle: number; glyph?: string; color: string; life: number; sway: number }

const CONFETTI = ["#ffc94d", "#ff7a8a", "#4fb3ff", "#5fd68a", "#a78bfa", "#ff9d4d"];
// Drawn shapes (no emoji), each with its palette.
const GLYPHS: Partial<Record<SeasonEffect, string[]>> = {
  hearts: ["heart"],
  leaves: ["leaf"],
  halloween: ["bat", "bat", "pumpkin"],
  eggs: ["egg"],
};
const SHAPE_COLORS: Record<string, string[]> = {
  heart: ["#ff6b8b", "#ff8fab", "#e8436a", "#ffb3c6"],
  leaf: ["#e8833a", "#c9542b", "#d9a23a", "#a8462a"],
  bat: ["#1c1424", "#2a1f36"],
  pumpkin: ["#f28c28", "#e8771a"],
  egg: ["#ffd6e0", "#cdeccf", "#cfe3ff", "#fff1b8", "#e6d4ff"],
};

function spawn(effect: SeasonEffect, width: number, height: number, anywhere: boolean): Particle {
  const glyphs = GLYPHS[effect];
  const rising = effect === "hearts";
  const base: Particle = {
    x: Math.random() * width,
    y: anywhere ? Math.random() * height : rising ? height + 20 : -20,
    vx: (Math.random() - 0.5) * 0.3,
    vy: rising ? -(0.3 + Math.random() * 0.5) : 0.3 + Math.random() * 0.8,
    size: 3 + Math.random() * 4,
    spin: (Math.random() - 0.5) * 0.06,
    angle: Math.random() * Math.PI * 2,
    color: "#ffffff",
    life: 1,
    sway: Math.random() * Math.PI * 2,
  };
  if (glyphs) {
    const glyph = glyphs[Math.floor(Math.random() * glyphs.length)];
    const colors = SHAPE_COLORS[glyph];
    return { ...base, glyph, color: colors[Math.floor(Math.random() * colors.length)], size: 9 + Math.random() * 8, vy: rising ? base.vy : 0.25 + Math.random() * 0.5 };
  }
  if (effect === "confetti") return { ...base, color: CONFETTI[Math.floor(Math.random() * CONFETTI.length)], size: 5 + Math.random() * 5, vy: 0.8 + Math.random() * 1.2, spin: (Math.random() - 0.5) * 0.2 };
  if (effect === "sparkle") return { ...base, color: Math.random() > 0.5 ? "#ffd86b" : "#ffffff", vy: 0.05 + Math.random() * 0.15, size: 1.5 + Math.random() * 2.5 };
  return { ...base, color: "rgba(255,255,255,.85)", size: 1.5 + Math.random() * 3.5 };
}

function draw(context: CanvasRenderingContext2D, effect: SeasonEffect, particle: Particle, time: number): void {
  context.save();
  context.translate(particle.x, particle.y);
  if (particle.glyph) {
    context.globalAlpha = 0.8;
    context.rotate(Math.sin(time / 900 + particle.sway) * 0.3 + (particle.glyph === "leaf" ? particle.angle : 0));
    shape(context, particle.glyph, particle.size, particle.color, time + particle.sway * 1000);
  } else if (effect === "confetti") {
    context.rotate(particle.angle);
    context.fillStyle = particle.color;
    context.globalAlpha = 0.85;
    context.fillRect(-particle.size / 2, -particle.size / 4, particle.size, particle.size / 2);
  } else if (effect === "sparkle") {
    context.globalAlpha = 0.35 + 0.65 * Math.abs(Math.sin(time / 500 + particle.sway));
    context.fillStyle = particle.color;
    context.beginPath();
    for (let point = 0; point < 8; point++) {
      const radius = point % 2 === 0 ? particle.size * 2 : particle.size * 0.6;
      const angle = (point * Math.PI) / 4;
      context.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
    }
    context.fill();
  } else {
    context.globalAlpha = 0.8;
    context.fillStyle = particle.color;
    context.beginPath();
    context.arc(0, 0, particle.size, 0, Math.PI * 2);
    context.fill();
  }
  context.restore();
}

/** Hearts, leaves, bats, pumpkins and eggs, drawn around (0, 0) with a size of about 2 × s. */
function shape(context: CanvasRenderingContext2D, kind: string, s: number, color: string, time: number): void {
  context.fillStyle = color;
  context.beginPath();
  if (kind === "heart") {
    context.moveTo(0, s * 0.9);
    context.bezierCurveTo(-s * 1.6, -s * 0.1, -s * 0.7, -s * 1.3, 0, -s * 0.45);
    context.bezierCurveTo(s * 0.7, -s * 1.3, s * 1.6, -s * 0.1, 0, s * 0.9);
    context.fill();
  } else if (kind === "leaf") {
    context.moveTo(0, -s);
    context.quadraticCurveTo(s * 0.9, 0, 0, s);
    context.quadraticCurveTo(-s * 0.9, 0, 0, -s);
    context.fill();
    context.strokeStyle = "rgba(0,0,0,.25)";
    context.lineWidth = 1;
    context.beginPath(); context.moveTo(0, -s * 0.8); context.lineTo(0, s * 1.2); context.stroke();
  } else if (kind === "bat") {
    const flap = Math.sin(time / 120) * 0.35;
    context.ellipse(0, 0, s * 0.28, s * 0.42, 0, 0, Math.PI * 2);
    for (const side of [-1, 1]) {
      context.moveTo(side * s * 0.2, -s * 0.1);
      context.quadraticCurveTo(side * s * 0.9, -s * (0.9 + flap), side * s * 1.5, -s * (0.2 + flap));
      context.quadraticCurveTo(side * s * 1.1, -s * 0.05, side * s * 1.05, s * 0.25);
      context.quadraticCurveTo(side * s * 0.75, 0, side * s * 0.6, s * 0.3);
      context.quadraticCurveTo(side * s * 0.4, s * 0.05, side * s * 0.2, s * 0.15);
    }
    context.fill();
  } else if (kind === "pumpkin") {
    for (const dx of [-0.45, 0.45, 0]) { context.moveTo(s * dx + s * 0.6, 0); context.ellipse(s * dx, 0, s * 0.6, s * 0.75, 0, 0, Math.PI * 2); }
    context.fill();
    context.fillStyle = "#3f6b2a";
    context.fillRect(-s * 0.1, -s * 1.05, s * 0.2, s * 0.35);
  } else if (kind === "egg") {
    context.ellipse(0, 0, s * 0.62, s * 0.85, 0, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = "rgba(255,255,255,.75)";
    context.lineWidth = Math.max(1.5, s * 0.14);
    context.beginPath(); context.moveTo(-s * 0.55, s * 0.05); context.quadraticCurveTo(0, s * 0.3, s * 0.55, s * 0.05); context.stroke();
  }
}

interface Spark { x: number; y: number; vx: number; vy: number; life: number; color: string }

export function SeasonLayer({ effect, fireworks = false, intensity = 1 }: { effect: SeasonEffect | null; fireworks?: boolean; intensity?: number }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const element = canvas.current;
    const context = element?.getContext("2d");
    if (!element || !context || (!effect && !fireworks) || effect === "bunting" && !fireworks) return;
    if (typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let width = 0, height = 0, frame = 0, running = true;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      width = element.clientWidth; height = element.clientHeight;
      element.width = width * ratio; element.height = height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);
    const kind = effect && effect !== "bunting" ? effect : null;
    const glyphs = kind ? Boolean(GLYPHS[kind]) : false;
    const count = kind ? Math.round(Math.min(90, (width * height) / (glyphs ? 60_000 : 16_000)) * intensity) : 0;
    const particles: Particle[] = Array.from({ length: count }, () => spawn(kind!, width, height, true));
    const sparks: Spark[] = [];
    let nextRocket = 0;
    const tick = (time: number) => {
      if (!running) return;
      frame = requestAnimationFrame(tick);
      if (document.visibilityState !== "visible") return;
      context.clearRect(0, 0, width, height);
      for (const particle of particles) {
        particle.x += particle.vx + Math.sin(time / 1400 + particle.sway) * 0.25;
        particle.y += particle.vy;
        particle.angle += particle.spin;
        if (particle.y > height + 30 || particle.y < -40 || particle.x < -40 || particle.x > width + 40) Object.assign(particle, spawn(kind!, width, height, false));
        draw(context, kind!, particle, time);
      }
      if (fireworks) {
        if (time > nextRocket) {
          nextRocket = time + 350 + Math.random() * 700;
          const x = width * (0.15 + Math.random() * 0.7), y = height * (0.15 + Math.random() * 0.35);
          const color = CONFETTI[Math.floor(Math.random() * CONFETTI.length)];
          for (let index = 0; index < 80; index++) {
            const angle = (index / 80) * Math.PI * 2, speed = 2 + Math.random() * 3;
            sparks.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 1, color });
          }
        }
        for (let index = sparks.length - 1; index >= 0; index--) {
          const spark = sparks[index];
          spark.x += spark.vx; spark.y += spark.vy; spark.vy += 0.03; spark.vx *= 0.985; spark.life -= 0.012;
          if (spark.life <= 0) { sparks.splice(index, 1); continue; }
          context.globalAlpha = spark.life;
          context.fillStyle = spark.color;
          context.beginPath(); context.arc(spark.x, spark.y, 2.2, 0, Math.PI * 2); context.fill();
        }
        context.globalAlpha = 1;
      }
    };
    frame = requestAnimationFrame(tick);
    return () => { running = false; cancelAnimationFrame(frame); window.removeEventListener("resize", resize); };
  }, [effect, fireworks, intensity]);
  return <div aria-hidden="true" className="hd-season-layer">
    {effect === "bunting" && <svg className="hd-season-bunting" preserveAspectRatio="none" viewBox="0 0 1000 60">
      <path d="M0 6 Q250 30 500 6 T1000 6" fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="1.5" />
      {Array.from({ length: 24 }, (_, index) => {
        const x = index * 42 + 8;
        const y = 6 + Math.sin(((x % 500) / 500) * Math.PI) * 24 * (x < 500 ? 1 : 1);
        return <path d={`M${x} ${y} L${x + 30} ${y} L${x + 15} ${y + 26} Z`} fill={CONFETTI[index % CONFETTI.length]} key={index} opacity=".9" />;
      })}
    </svg>}
    <canvas ref={canvas} />
  </div>;
}

/** Settings: a 10-second preview of an occasion's animation over the whole panel, with its greeting. */
export function SeasonPreview({ effect, fireworks = false, id, label, onClose, closeLabel }: { effect: SeasonEffect | null; fireworks?: boolean; id: string; label: string; onClose: () => void; closeLabel: string }) {
  const anchor = useRef<HTMLSpanElement>(null);
  const [shell, setShell] = useState<Element | null>(null);
  useEffect(() => { setShell(anchor.current?.closest(".app-shell") ?? null); }, []);
  useEffect(() => { const timer = window.setTimeout(onClose, 10_000); return () => window.clearTimeout(timer); }, [onClose]);
  if (!shell) return <span hidden ref={anchor} />;
  return createPortal(<div className="hd-season-preview">
    <SeasonLayer effect={effect} fireworks={fireworks} />
    <SeasonDecor id={id} preview />
    <button className="hd-season-preview__chip" onClick={onClose} type="button"><span className="hd-season-badge hd-season-badge--day">{label}</span><span>{closeLabel}</span></button>
  </div>, shell);
}
