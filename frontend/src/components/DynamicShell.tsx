import type { CSSProperties, ReactNode } from "react";
import type { HomeDeckCardStyle, HomeDeckConfig } from "../types/config";
import type { DiscoveryResponse } from "../types/discovery";
import type { HomeAssistant } from "../types/home-assistant";

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
};

const FIXED: Record<string, Palette> = {
  fixed_night: ["#263d68", "#111b38", "#536b9b", "#090f20"],
  fixed_ocean: ["#17677a", "#0a334d", "#48a5b1", "#051d2b"],
  fixed_graphite: ["#3c414d", "#1d2027", "#686e7a", "#0c0e12"],
  fixed_wine: ["#5a1f2e", "#2e0f18", "#8a3a4a", "#14060a"],
  fixed_plum: ["#3d2a55", "#1e1430", "#6a4a86", "#0d0816"],
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

export function DynamicShell({ children, config, data, hass, mode = "grid" }: { children: ReactNode; config: HomeDeckConfig; data: DiscoveryResponse; hass: HomeAssistant; mode?: string }) {
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
  } as CSSProperties;
  return (
    <div className={`app-shell theme-${config.theme} view-${mode} ${config.background.animated ? "ambient-animated" : "ambient-still"}`} data-activity={level.toFixed(2)} style={style}>
      <div aria-hidden="true" className="ambient-background"><i /><i /><i /></div>
      {children}
    </div>
  );
}
