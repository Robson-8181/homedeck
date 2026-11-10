import { createContext, useContext } from "react";
import type { LicenseStatus } from "./api/license";
import type { HomeDeckBackgroundPreset, HomeDeckCardStyle, HomeDeckConfig, HomeDeckViewMode } from "./types/config";
import type { DiscoveredEntity, Room } from "./types/discovery";

export const FREE_BACKGROUNDS: HomeDeckBackgroundPreset[] = ["adaptive_ember", "fixed_night", "fixed_graphite"];
export const FREE_VIEW_MODES: HomeDeckViewMode[] = ["grid", "list"];
export const DEFAULT_ACCENT = "#f4edd9";
export const DEFAULT_HIGHLIGHT = "#ffc94d";
export const DEFAULT_CARDS: HomeDeckCardStyle = { corners: 100, frame: true, glass: 50, animations: false, sparklines: false, players: true };
export const SUPPORT_EMAIL = "suporte@homedeck.pro";
const CONTROLLABLE = new Set(["light", "switch", "fan", "cover", "climate", "media_player", "lock"]);

/** Why the Pro sheet was opened; shown as its first line. */
export type UpsellReason = "rooms" | "devices" | "feature" | "general";

export interface PlanState {
  pro: boolean;
  license: LicenseStatus | null;
  limits: { rooms: number; devices: number };
  /** Controllable devices allowed on the free plan (every device on Pro). */
  allowed: Set<string> | null;
  /** Free plan: makes room for a device if a slot is free; otherwise opens the Pro sheet. */
  allow: (entityId: string) => boolean;
  upsell: (reason?: UpsellReason) => void;
}

export const PlanContext = createContext<PlanState>({
  pro: true,
  license: null,
  limits: { rooms: 4, devices: 10 },
  allowed: null,
  allow: () => true,
  upsell: () => undefined,
});

export const usePlan = () => useContext(PlanContext);

export function isControllable(entity: Pick<DiscoveredEntity, "domain">): boolean {
  return CONTROLLABLE.has(entity.domain);
}

/** Rooms in the panel: the selection, or every room when nothing was chosen. */
export function selectedRoomIds(config: HomeDeckConfig, rooms: Room[]): string[] {
  const ids = rooms.map((room) => room.id);
  const chosen = config.selected_rooms.filter((id) => ids.includes(id));
  return chosen.length > 0 ? chosen : ids;
}

/** Free plan rooms: its own choice, kept in the selection order, or the selection itself. */
export function freeRoomIds(config: HomeDeckConfig, rooms: Room[]): string[] {
  const selected = selectedRoomIds(config, rooms);
  const chosen = config.free_rooms.filter((id) => rooms.some((room) => room.id === id));
  if (chosen.length === 0) return selected;
  return [...selected.filter((id) => chosen.includes(id)), ...chosen.filter((id) => !selected.includes(id))];
}

/** Rooms shown in the panel for the current plan. */
export function panelRoomIds(config: HomeDeckConfig, rooms: Room[], pro: boolean): string[] {
  return pro ? selectedRoomIds(config, rooms) : freeRoomIds(config, rooms);
}

/** Free plan: the explicit choice, or every controllable device of the free rooms. */
export function freeDevices(config: HomeDeckConfig, rooms: Room[]): string[] {
  if (config.free_devices.length > 0) return config.free_devices;
  const selected = new Set(freeRoomIds(config, rooms));
  return rooms.filter((room) => selected.has(room.id)).flatMap((room) => room.entities).filter(isControllable).map((entity) => entity.entity_id);
}

export function freeUsage(config: HomeDeckConfig, rooms: Room[]) {
  return { rooms: freeRoomIds(config, rooms).length, devices: new Set(freeDevices(config, rooms)).size };
}

export function overFreeLimits(config: HomeDeckConfig, rooms: Room[], limits: { rooms: number; devices: number }): boolean {
  const usage = freeUsage(config, rooms);
  return usage.rooms > limits.rooms || usage.devices > limits.devices;
}

/** Hides controllable devices outside the free choice; sensors and scenes stay. */
export function restrictRooms(rooms: Room[], allowed: Set<string> | null): Room[] {
  if (!allowed) return rooms;
  return rooms.map((room) => ({ ...room, entities: room.entities.filter((entity) => !isControllable(entity) || allowed.has(entity.entity_id)) }));
}

/** On the free plan Pro choices fall back to defaults when shown; the saved config keeps them. */
export function effectiveConfig(config: HomeDeckConfig, pro: boolean): HomeDeckConfig {
  if (pro) return config;
  return {
    ...config,
    accent_color: DEFAULT_ACCENT,
    highlight_color: DEFAULT_HIGHLIGHT,
    background: { ...config.background, preset: FREE_BACKGROUNDS.includes(config.background.preset) ? config.background.preset : "adaptive_ember" },
    view_mode: FREE_VIEW_MODES.includes(config.view_mode) ? config.view_mode : "grid",
    screensaver: { ...config.screensaver, enabled: false },
    cards: DEFAULT_CARDS,
    pages: [],
    layouts: Object.fromEntries(Object.entries(config.layouts).map(([screen, layout]) => [screen, { ...layout, wide: [], tall: [], small: [], cells: {} }])),
    widgets: { ...config.widgets, energy: false, bins: false },
    doorbell: { ...config.doorbell, enabled: false },
    seasons: config.seasons ? { ...config.seasons, enabled: false } : undefined,
  };
}

/** Pro prices as Stripe charges them: reais in Brazilian Portuguese (a Brazilian Stripe account
 * charges Brazilian cards only in BRL), dollars everywhere else. */
const PRICES = { BRL: { lifetime: 59.9, annual: 29.9 }, USD: { lifetime: 14.99, annual: 7.99 } };

export function proPrice(plan: "lifetime" | "annual", language?: string): string {
  const currency = language?.toLowerCase() === "pt-br" ? "BRL" : "USD";
  return new Intl.NumberFormat(language, { style: "currency", currency }).format(PRICES[currency][plan]);
}
