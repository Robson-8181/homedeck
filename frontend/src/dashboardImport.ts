import { entityKey, getLayout, roomScreen, SECTION_PREFIX, setHidden, withLayout } from "./layout";
import { isIconName } from "./components/HDIcon";
import type { HomeDeckConfig, HomeDeckPageConfig, ScreenLayout } from "./types/config";
import type { Room } from "./types/discovery";
import type { HomeAssistant } from "./types/home-assistant";

// Brings a Home Assistant dashboard the user already has into HomeDeck: each view becomes a page with
// the same devices in the same order (section titles become separators), and optionally the rooms
// show only what that dashboard shows. Nothing in Home Assistant is changed.

export interface DashboardInfo { url_path: string | null; title: string }
export interface ImportedGroup { title?: string; ids: string[] }
export interface ImportedView { title: string; icon?: string; groups: ImportedGroup[] }
export interface ImportedDashboard { title: string; views: ImportedView[]; skipped: number }
export type ImportResult = { kind: "ok"; dashboard: ImportedDashboard } | { kind: "auto" } | { kind: "strategy" } | { kind: "failed" };

type Card = Record<string, unknown>;
const isCard = (value: unknown): value is Card => typeof value === "object" && value !== null && !Array.isArray(value);
const LAYOUT_ONLY = new Set(["heading", "spacer", "vertical-stack", "horizontal-stack", "grid", "conditional"]);

/** The user's dashboards; the default one first. Non-admins only get the default. */
export async function listDashboards(hass: HomeAssistant, overview: string): Promise<DashboardInfo[]> {
  const result: DashboardInfo[] = [{ url_path: null, title: overview }];
  try {
    const list = await hass.connection.sendMessagePromise<{ url_path: string; title?: string; mode?: string }[]>({ type: "lovelace/dashboards/list" });
    for (const item of list ?? []) if (item.url_path) result.push({ url_path: item.url_path, title: item.title || item.url_path });
  } catch { /* the default dashboard is still there */ }
  return result;
}

/** Loads the custom cards and strategies Home Assistant would load for its dashboards. */
async function loadResources(hass: HomeAssistant) {
  try {
    const resources = await hass.connection.sendMessagePromise<{ url: string; type: string }[]>({ type: "lovelace/resources" });
    await Promise.allSettled((resources ?? []).filter((item) => item.type === "module").map((item) => import(/* @vite-ignore */ item.url)));
  } catch { /* nothing more to load */ }
}

/** A dashboard or view made by a strategy is generated on the fly: run the strategy to get its cards. */
async function generate(kind: "dashboard" | "view", strategy: Card, hass: HomeAssistant, extra?: Record<string, unknown>): Promise<Card | null> {
  const type = typeof strategy.type === "string" ? strategy.type : "";
  if (!type.startsWith("custom:")) return null;
  const tag = `ll-strategy-${kind}-${type.slice("custom:".length)}`;
  if (!customElements.get(tag)) {
    await loadResources(hass);
    await Promise.race([customElements.whenDefined(tag), new Promise((resolve) => setTimeout(resolve, 4000))]);
  }
  const element = customElements.get(tag) as unknown as { generate?: (config: Card, hass: HomeAssistant, extra?: unknown) => Promise<Card> } | undefined;
  if (!element?.generate) return null;
  try { return await element.generate(strategy, hass, extra); } catch { return null; }
}

export async function readDashboard(hass: HomeAssistant, dashboard: DashboardInfo): Promise<ImportResult> {
  let config: Card;
  try {
    config = await hass.connection.sendMessagePromise<Card>({ type: "lovelace/config", url_path: dashboard.url_path, force: false });
  } catch (error) {
    // The default dashboard, never edited, is built by Home Assistant from the areas.
    return (error as { code?: string })?.code === "config_not_found" ? { kind: "auto" } : { kind: "failed" };
  }
  if (isCard(config.strategy)) {
    const generated = await generate("dashboard", config.strategy, hass);
    if (!generated) return { kind: "strategy" };
    config = generated;
  }
  const views: ImportedView[] = [];
  let skipped = 0;
  const rawViews = Array.isArray(config.views) ? config.views.filter(isCard) : [];
  for (const [index, raw] of rawViews.entries()) {
    let view = raw;
    if (isCard(view.strategy)) view = { ...view, ...((await generate("view", view.strategy, hass, { views: rawViews })) ?? {}) };
    const read = readView(view, hass);
    skipped += read.skipped;
    const title = typeof view.title === "string" && view.title.trim() ? view.title.trim() : `${dashboard.title} ${index + 1}`;
    if (read.groups.length > 0) views.push({ title, icon: typeof view.icon === "string" ? view.icon : undefined, groups: read.groups });
  }
  return { kind: "ok", dashboard: { title: dashboard.title, views, skipped } };
}

/** The devices of one view, in order, grouped under its headings. */
function readView(view: Card, hass: HomeAssistant): { groups: ImportedGroup[]; skipped: number } {
  const groups: ImportedGroup[] = [];
  const seen = new Set<string>();
  let skipped = 0;
  let current: ImportedGroup = { ids: [] };
  const start = (title?: string) => {
    if (current.ids.length > 0 || current.title) groups.push(current);
    current = { title: title?.trim() || undefined, ids: [] };
  };
  const add = (id: unknown) => {
    if (typeof id !== "string" || !hass.states[id] || seen.has(id)) return;
    seen.add(id);
    current.ids.push(id);
  };
  const walk = (card: Card, top: boolean) => {
    if (card.type === "heading") { start(typeof card.heading === "string" ? card.heading : undefined); return; }
    if (top && typeof card.title === "string" && card.title.trim()) start(card.title);
    // Cards that point at a device are not "left out" even when the device no longer exists.
    const points = card.entity != null || card.camera_image != null || Array.isArray(card.entities);
    add(card.entity);
    add(card.camera_image);
    if (Array.isArray(card.entities)) for (const item of card.entities) add(isCard(item) ? item.entity : item);
    const children = [...(Array.isArray(card.cards) ? card.cards : []), ...(isCard(card.card) ? [card.card] : []), ...(Array.isArray(card.elements) ? card.elements : [])].filter(isCard);
    for (const child of children) walk(child, false);
    if (!points && children.length === 0 && !LAYOUT_ONLY.has(String(card.type ?? ""))) skipped += 1;
  };
  if (Array.isArray(view.sections)) {
    for (const section of view.sections.filter(isCard)) {
      start(typeof section.title === "string" ? section.title : undefined);
      for (const card of (Array.isArray(section.cards) ? section.cards : []).filter(isCard)) walk(card, false);
    }
  }
  for (const card of (Array.isArray(view.cards) ? view.cards : []).filter(isCard)) walk(card, true);
  start();
  // Titles with nothing under them are dropped; a group with no title joins the one before it.
  const merged: ImportedGroup[] = [];
  for (const group of groups.filter((item) => item.ids.length > 0)) {
    const last = merged[merged.length - 1];
    if (last && !group.title) last.ids.push(...group.ids);
    else merged.push({ ...group, ids: [...group.ids] });
  }
  return { groups: merged, skipped };
}

const MDI_ICONS: Record<string, string> = {
  home: "home", "home-outline": "home", "home-assistant": "home", lightbulb: "light", "lightbulb-group": "light", "lightbulb-outline": "light", "ceiling-light": "light",
  cctv: "camera", camera: "camera", video: "camera", shield: "shield", "shield-home": "shield", security: "shield", lock: "lock", "door": "door",
  television: "tv", "television-classic": "tv", music: "media", speaker: "media", "play-circle": "media", thermometer: "climate", "home-thermometer": "climate", "air-conditioner": "climate",
  sofa: "sofa", bed: "bed", "bed-king": "bed", "silverware-fork-knife": "kitchen", "chef-hat": "kitchen", fridge: "kitchen", flash: "bolt", "lightning-bolt": "bolt", "solar-power": "bolt", star: "star",
};

export function iconFor(mdi?: string): string {
  const name = MDI_ICONS[(mdi ?? "").replace(/^mdi:/, "")];
  return name && isIconName(name) ? name : "grid";
}

export const importedIds = (dashboard: ImportedDashboard) => new Set(dashboard.views.flatMap((view) => view.groups.flatMap((group) => group.ids)));

export interface ImportOptions { pages: boolean; onlyThese: boolean; rooms: Room[]; maxRooms?: number; selectRooms?: boolean }

/** The rooms that hold at least one imported device, in their order. */
export function roomsWith(dashboard: ImportedDashboard, rooms: Room[], maxRooms?: number): string[] {
  const ids = importedIds(dashboard);
  const chosen = rooms.filter((room) => room.entities.some((entity) => ids.has(entity.entity_id))).map((room) => room.id);
  return maxRooms != null ? chosen.slice(0, maxRooms) : chosen;
}

export function applyImport(config: HomeDeckConfig, dashboard: ImportedDashboard, options: ImportOptions): HomeDeckConfig {
  let next = config;
  if (options.pages) {
    const stamp = Date.now().toString(36);
    const pages: HomeDeckPageConfig[] = [];
    dashboard.views.forEach((view, index) => {
      const id = `page-import-${stamp}-${index}`;
      const sections: Record<string, string> = {};
      const order: string[] = [];
      view.groups.forEach((group, groupIndex) => {
        if (group.title) {
          const key = `${SECTION_PREFIX}${stamp}${index}x${groupIndex}`;
          sections[key] = group.title.slice(0, 60);
          order.push(key);
        }
        order.push(...group.ids.map(entityKey));
      });
      pages.push({ id, title: view.title.slice(0, 80), type: "custom", icon: iconFor(view.icon), entity_ids: view.groups.flatMap((group) => group.ids) });
      const layout: ScreenLayout = { order, hidden: [], wide: [], ...(Object.keys(sections).length > 0 ? { sections } : {}) };
      next = withLayout(next, `page:${id}`, layout);
    });
    next = { ...next, pages: [...next.pages, ...pages] };
  }
  if (options.onlyThese) {
    const ids = importedIds(dashboard);
    for (const room of options.rooms) {
      let layout = getLayout(next, roomScreen(room.id));
      for (const entity of room.entities) if (!ids.has(entity.entity_id)) layout = setHidden(layout, entityKey(entity.entity_id), true);
      next = withLayout(next, roomScreen(room.id), layout);
    }
    if (options.selectRooms !== false) {
      const chosen = roomsWith(dashboard, options.rooms, options.maxRooms);
      if (chosen.length > 0) next = { ...next, selected_rooms: chosen };
    }
  }
  return next;
}
