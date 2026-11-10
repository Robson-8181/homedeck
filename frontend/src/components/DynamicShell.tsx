import { useEffect, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { HomeDeckCardStyle, HomeDeckConfig } from "../types/config";
import type { DiscoveryResponse } from "../types/discovery";
import type { HomeAssistant } from "../types/home-assistant";
import { SparklinesContext } from "../history";
import { PlayersContext } from "../spotify";
import { CameraWholeContext, LiveCamerasContext } from "./CameraCard";
import { OccasionContext, SeasonLayer } from "./SeasonLayer";
import { SeasonDecor } from "./SeasonDecor";
import type { Occasion } from "../seasons";

type Palette = [string, string, string, string];
type Stop = [number, Palette];

const ADAPTIVE: Record<string, Stop[]> = {
  adaptive_ember: [
    [0, ["#263d68", "#111b38", "#536b9b", "#090f20"]],
    [0.2, ["#4b3b70", "#251b48", "#846393", "#130d27"]],
    [0.5, ["#a54942", "#5c282d", "#d28155", "#2a1519"]],
    [1, ["#df8b3d", "#963f22", "#f3c66f", "#3b1c0f"]],
  ],
  adaptive_aurora: [
    [0, ["#173a53", "#0a1d33", "#315d78", "#06101d"]],
    [0.22, ["#245d69", "#173552", "#4a8f91", "#0b1e2a"]],
    [0.55, ["#5867a4", "#47326f", "#86a58e", "#17152e"]],
    [1, ["#d59c50", "#7f4b3b", "#e8d28a", "#332117"]],
  ],
  adaptive_sunset: [
    [0, ["#273554", "#161d35", "#465978", "#0c1020"]],
    [0.18, ["#5e477d", "#33264e", "#956b91", "#1a1028"]],
    [0.5, ["#b4526f", "#6b3154", "#e38d7e", "#321728"]],
    [1, ["#ef9a62", "#a84b43", "#ffd09a", "#432018"]],
  ],
  adaptive_forest: [
    [0, ["#1d3b33", "#0f2420", "#3d6355", "#08130f"]],
    [0.25, ["#2f5a46", "#1a3a32", "#5f8a62", "#0c1c17"]],
    [0.6, ["#7a7a3e", "#3f4a2a", "#b3a45a", "#1c1e10"]],
    [1, ["#d8a24a", "#8a5a2a", "#f2d27a", "#2e1d0c"]],
  ],
  adaptive_lagoon: [
    [0, ["#14324f", "#0a1b33", "#2b5f86", "#050e1c"]],
    [0.25, ["#1f5f73", "#123a52", "#3f9aa3", "#081d29"]],
    [0.6, ["#c06b6b", "#5e3550", "#e59a86", "#2a1424"]],
    [1, ["#f09a7a", "#a84b5a", "#ffd0a8", "#40181f"]],
  ],
  adaptive_orchid: [
    [0, ["#2e2352", "#171130", "#4d3f7d", "#0c0920"]],
    [0.25, ["#5a2f7e", "#2f1a4c", "#8a54a8", "#170c28"]],
    [0.55, ["#a83f8f", "#5c2153", "#d873b8", "#2a0f29"]],
    [1, ["#ee6fa8", "#9a3468", "#ffb0cf", "#471a32"]],
  ],
  adaptive_reef: [
    [0, ["#123a5a", "#0a2038", "#2a5f86", "#06121f"]],
    [0.25, ["#106f86", "#0a3d57", "#2fa0a8", "#06212e"]],
    [0.55, ["#1fa58f", "#0f5f5a", "#5fd3a8", "#08312e"]],
    [1, ["#f0b24a", "#b0662a", "#ffdb86", "#4f2a12"]],
  ],
  adaptive_berry: [
    [0, ["#3a1c40", "#1f0f24", "#5e3166", "#100712"]],
    [0.25, ["#7a2450", "#3f122c", "#a8447a", "#1f0916"]],
    [0.55, ["#c22f4f", "#6b1730", "#e8637a", "#330b18"]],
    [1, ["#ff7a45", "#b03f22", "#ffb06f", "#521d10"]],
  ],
  adaptive_glacier: [
    [0, ["#1f3553", "#101e36", "#3b587d", "#080f1f"]],
    [0.25, ["#2b6a9c", "#153b60", "#5a9ccc", "#0a1f36"]],
    [0.55, ["#4fa6d6", "#22658f", "#8fd0ee", "#0f3450"]],
    [1, ["#a8e4f0", "#4f9fbc", "#e0f7fa", "#1f5670"]],
  ],
  adaptive_citrus: [
    [0, ["#2a3a24", "#151f12", "#4a5f3d", "#0b1108"]],
    [0.25, ["#5f7a1f", "#324312", "#8fab3f", "#192208"]],
    [0.55, ["#c0a21f", "#6d5a10", "#e6cc5a", "#362c08"]],
    [1, ["#ff9f1c", "#b3620f", "#ffd166", "#512c07"]],
  ],
};

const FIXED: Record<string, Palette> = {
  fixed_night: ["#263d68", "#111b38", "#536b9b", "#090f20"],
  fixed_ocean: ["#17677a", "#0a334d", "#48a5b1", "#051d2b"],
  fixed_graphite: ["#3c414d", "#1d2027", "#686e7a", "#0c0e12"],
  fixed_wine: ["#5a1f2e", "#2e0f18", "#8a3a4a", "#14060a"],
  fixed_plum: ["#3d2a55", "#1e1430", "#6a4a86", "#0d0816"],
  fixed_cobalt: ["#1f4fd8", "#12307f", "#4f86ff", "#0a1a4a"],
  fixed_violet: ["#6a2fd6", "#3d1a86", "#a06bff", "#1f0d4a"],
  fixed_magenta: ["#c42a7e", "#7a1650", "#f0609f", "#3f0a2a"],
  fixed_coral: ["#e2533f", "#94302a", "#ff8a62", "#4a1512"],
  fixed_emerald: ["#0f9a6e", "#0a5e48", "#3fd0a0", "#053026"],
  fixed_teal: ["#0a93b5", "#075a78", "#3fc7dd", "#042f42"],
  fixed_indigo: ["#3b3fd1", "#23257f", "#6f74ff", "#101240"],
  fixed_rose: ["#e0447a", "#8f2650", "#ff7da6", "#470f28"],
  fixed_amber: ["#d98a14", "#8a540a", "#ffba47", "#452904"],
  fixed_lime: ["#5f9e1e", "#3a6412", "#92cf3f", "#1c3307"],
};

function hexToRgb(hex: string): [number, number, number] {
  return [1, 3, 5].map((index) => Number.parseInt(hex.slice(index, index + 2), 16)) as [number, number, number];
}

function contrastColor(hex: string): string {
  const [red, green, blue] = hexToRgb(hex);
  return (red * 299 + green * 587 + blue * 114) / 1000 > 150 ? "#201d22" : "#ffffff";
}

function mixColor(from: string, to: string, amount: number): string {
  const a = hexToRgb(from);
  const b = hexToRgb(to);
  return `#${a.map((value, index) => Math.round(value + (b[index] - value) * amount).toString(16).padStart(2, "0")).join("")}`;
}

/** The card glass: 50 is the classic frosted look, lower blends toward a solid card in the background's
 * tone, higher lets more of the background through. */
function glassColor(glass: number, tint: number, solid: string): string {
  if (glass >= 50) return `rgba(255,255,255,${(tint - ((glass - 50) / 50) * (tint / 2)).toFixed(3)})`;
  const amount = (50 - glass) / 50;
  const alpha = tint + (0.94 - tint) * amount;
  const rgb = hexToRgb(solid).map((value) => Math.round((255 * tint * (1 - amount) + value * 0.94 * amount) / alpha));
  return `rgba(${rgb.join(",")},${alpha.toFixed(3)})`;
}

/** Kept across mounts: Settings, setup and the panel reopening all see the same size. */
const stableViewport = { width: 0, height: 0 };

/** Whether a text field has the focus (an on-screen keyboard may be up), looking inside shadow roots. */
function typing(): boolean {
  let element: Element | null = document.activeElement;
  while (element?.shadowRoot?.activeElement) element = element.shadowRoot.activeElement;
  return Boolean(element && (element.tagName === "INPUT" || element.tagName === "TEXTAREA" || (element as HTMLElement).isContentEditable));
}

/**
 * The panel's scale follows the screen height, but the height a page gets also moves with things
 * that come and go: browser and app toolbars, the on-screen keyboard. Following those would resize
 * every card while the panel is in use (for example on entering Edit mode). So the height only
 * changes with the width (turning the device, resizing the window) or by a lot (a fifth or more,
 * and never down while a text field is focused).
 */
function useStableViewport(): string | null {
  const [unit, setUnit] = useState<string | null>(null);
  useEffect(() => {
    const update = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const kept = stableViewport;
      if (!kept.height || Math.abs(width - kept.width) > 40) { kept.width = width; kept.height = height; }
      else if (Math.abs(height - kept.height) >= kept.height * 0.2 && !(height < kept.height && typing())) kept.height = height;
      setUnit(`${kept.height / 100}px`);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return unit;
}

function cardVars(cards: HomeDeckCardStyle, palette: Palette): Record<string, string> {
  const glass = Math.max(0, Math.min(100, cards.glass));
  const solid = mixColor(palette[1], "#26252b", 0.45);
  const corners = Math.max(0, Math.min(150, cards.corners)) / 100;
  // Pills and circles are already as round as they get; below the default they square off with the rest.
  const round: Record<string, string> = corners >= 1 ? {} : { "--hd-pill": `calc(var(--u)*${(2.6 * corners).toFixed(2)})`, "--hd-round": `${(50 * corners).toFixed(1)}%` };
  return {
    "--hd-r": corners.toFixed(2),
    ...round,
    "--hd-blur": `${(glass < 50 ? (22 * glass) / 50 : 22 + (glass - 50) * 0.36).toFixed(1)}px`,
    "--glass": glassColor(glass, 0.14, solid),
    "--glass-strong": glassColor(glass, 0.18, solid),
    ...(cards.frame ? {} : { "--hd-frame": "transparent" }),
  };
}

function paletteAt(stops: Stop[], level: number): Palette {
  let index = 0;
  while (index < stops.length - 2 && level > stops[index + 1][0]) index += 1;
  const [startAt, start] = stops[index];
  const [endAt, end] = stops[index + 1];
  const amount = Math.max(0, Math.min(1, (level - startAt) / Math.max(0.001, endAt - startAt)));
  return start.map((color, colorIndex) => mixColor(color, end[colorIndex], amount)) as Palette;
}

function activityLevel(config: HomeDeckConfig, data: DiscoveryResponse, hass: HomeAssistant): number {
  const byId = new Map(data.rooms.flatMap((room) => room.entities).map((entity) => [entity.entity_id, entity]));
  const domains = config.background.include_devices
    ? new Set(["light", "switch", "fan", "media_player", "climate"])
    : new Set(["light"]);
  const eligible = Array.from(byId.values()).filter((entity) => domains.has(entity.domain) && !["unavailable", "unknown"].includes(hass.states[entity.entity_id]?.state));
  if (eligible.length === 0) return 0;
  const total = eligible.reduce((sum, entity) => {
    const state = hass.states[entity.entity_id];
    if (!state) return sum;
    if (entity.domain === "light") {
      if (state.state !== "on") return sum;
      return sum + (typeof state.attributes.brightness === "number" ? Math.max(0.12, state.attributes.brightness / 255) : 1);
    }
    if (entity.domain === "media_player") return sum + (["playing", "on", "paused"].includes(state.state) ? 1 : 0);
    if (entity.domain === "climate") return sum + (!["off", "idle"].includes(state.state) ? 1 : 0);
    return sum + (state.state === "on" ? 1 : 0);
  }, 0);
  return Math.max(0, Math.min(1, total / eligible.length));
}

export function DynamicShell({ children, config, data, hass, mode = "grid", season }: { children: ReactNode; config: HomeDeckConfig; data: DiscoveryResponse; hass: HomeAssistant; mode?: string; season?: { occasion: Occasion | null; fireworks: boolean } }) {
  const viewportUnit = useStableViewport();
  const level = activityLevel(config, data, hass);
  const highlight = /^#[0-9a-f]{6}$/i.test(config.highlight_color ?? "") ? config.highlight_color : "#ffc94d";
  const palette = FIXED[config.background.preset] ?? paletteAt(ADAPTIVE[config.background.preset] ?? ADAPTIVE.adaptive_ember, level);
  const style = {
    "--ambient-1": palette[0],
    "--ambient-2": palette[1],
    "--ambient-3": palette[2],
    "--ambient-4": palette[3],
    "--ambient-level": level.toFixed(3),
    "--hd-accent": config.accent_color,
    "--hd-accent-contrast": contrastColor(config.accent_color),
    "--on": highlight,
    "--on-deep": mixColor(highlight, "#000000", 0.12),
    "--on-ink": contrastColor(highlight) === "#ffffff" ? "#ffffff" : "#2a2110",
    ...cardVars(config.cards, palette),
    ...(viewportUnit ? { "--hd-vh": viewportUnit } : {}),
  } as CSSProperties;
  return (
    <div className={`app-shell theme-${config.theme} view-${mode} ${config.background.animated ? "ambient-animated" : "ambient-still"} ${config.cards?.animations ? "hd-anim" : ""}`} data-activity={level.toFixed(2)} style={style}>
      <div aria-hidden="true" className="ambient-background"><i /><i /><i /></div>
      {season && (season.occasion?.effect || season.fireworks) && <SeasonLayer effect={season.occasion?.effect ?? null} fireworks={season.fireworks} intensity={season.occasion?.phase === "lead" ? 0.45 : 1} />}
      {season?.occasion && (season.occasion.phase === "day" || season.occasion.id === "christmas") && <SeasonDecor id={season.occasion.id} />}
      <OccasionContext.Provider value={season?.occasion ?? null}><SparklinesContext.Provider value={Boolean(config.cards?.sparklines)}><LiveCamerasContext.Provider value={config.live_cameras !== false}><PlayersContext.Provider value={config.cards?.players !== false}><CameraWholeContext.Provider value={Boolean(config.camera_whole)}>{children}</CameraWholeContext.Provider></PlayersContext.Provider></LiveCamerasContext.Provider></SparklinesContext.Provider></OccasionContext.Provider>
    </div>
  );
}
