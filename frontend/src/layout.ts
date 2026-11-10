import type { HomeDeckConfig, ScreenLayout } from "./types/config";
import type { DiscoveryResponse, Room } from "./types/discovery";

// Every screen keeps its own layout under config.layouts[screen]:
//   order  – item keys in the order the user arranged them (new items go last)
//   hidden – item keys hidden from that screen
//   wide   – item keys shown as double-width cards
export const HOME_SCREEN = "home";
export const roomScreen = (roomId: string) => `room:${roomId}`;
export const pageScreen = (pageId: string) => `page:${pageId}`;

export const roomKey = (roomId: string) => `room:${roomId}`;
export const entityKey = (entityId: string) => `entity:${entityId}`;
export const WIDGET_KEYS = ["widget:security", "widget:climate", "widget:media", "widget:today", "widget:weather", "widget:sun", "widget:energy", "widget:bins"] as const;
export type WidgetKey = (typeof WIDGET_KEYS)[number];

export const SECTION_PREFIX = "section:";
export const isSectionKey = (key: string) => key.startsWith(SECTION_PREFIX);

/** Puts each separator back before the item that followed it in the saved order (or at the end). */
export function withSections(keys: string[], layout: ScreenLayout): string[] {
  const sections = Object.keys(layout.sections ?? {});
  if (sections.length === 0) return keys;
  const result = [...keys];
  const shown = new Set(keys);
  const position = (key: string) => { const index = layout.order.indexOf(key); return index < 0 ? Number.MAX_SAFE_INTEGER : index; };
  for (const section of [...sections].sort((a, b) => position(a) - position(b))) {
    const index = layout.order.indexOf(section);
    const anchor = index < 0 ? undefined : layout.order.slice(index + 1).find((key) => shown.has(key));
    const at = anchor ? result.indexOf(anchor) : -1;
    if (at < 0) result.push(section);
    else result.splice(at, 0, section);
  }
  return result;
}

export function keyId(key: string): string {
  return key.slice(key.indexOf(":") + 1);
}

const EMPTY: ScreenLayout = { order: [], hidden: [], wide: [] };

export function getLayout(config: HomeDeckConfig, screen: string): ScreenLayout {
  return config.layouts?.[screen] ?? EMPTY;
}

export function withLayout(config: HomeDeckConfig, screen: string, layout: ScreenLayout): HomeDeckConfig {
  return { ...config, layouts: { ...config.layouts, [screen]: layout } };
}

/** Devices that only appear once added in Edit mode (from the hidden tray or the picker), so an
 * update never puts an alarm panel or a plant on a screen that was already arranged. */
export const OPT_IN_DOMAINS = new Set(["alarm_control_panel", "plant", "input_boolean"]);

function waitsForOptIn(key: string, layout: ScreenLayout): boolean {
  return key.startsWith("entity:") && OPT_IN_DOMAINS.has(keyId(key).split(".")[0])
    && !layout.order.includes(key) && !(layout.added ?? []).includes(keyId(key));
}

/** Saved order first, then any item the user has not placed yet, in its natural order. With `optIn`,
 * alarm panels and plants stay hidden until shown in Edit mode. */
export function arrange(keys: string[], layout: ScreenLayout, optIn = false): { visible: string[]; hidden: string[] } {
  const available = new Set(keys);
  const placed = layout.order.filter((key) => available.has(key));
  const placedSet = new Set(placed);
  const ordered = [...placed, ...keys.filter((key) => !placedSet.has(key))];
  const hidden = new Set([...layout.hidden, ...(optIn ? keys.filter((key) => waitsForOptIn(key, layout)) : [])]);
  return {
    visible: ordered.filter((key) => !hidden.has(key)),
    hidden: ordered.filter((key) => hidden.has(key)),
  };
}

/** The rooms offered by a room's "add devices": its own hidden devices first, then the other rooms. */
export function pickerRooms(room: Room, hiddenKeys: string[], others: Room[]): Room[] {
  const hidden = new Set(hiddenKeys.map(keyId));
  const own = { ...room, entities: room.entities.filter((entity) => hidden.has(entity.entity_id)) };
  return [...(own.entities.length > 0 ? [own] : []), ...others];
}

export function setHidden(layout: ScreenLayout, key: string, hidden: boolean): ScreenLayout {
  return { ...layout, hidden: hidden ? [...new Set([...layout.hidden, key])] : layout.hidden.filter((item) => item !== key) };
}

/** Shows a hidden item at the end of the screen; `shown` is the current order on screen. Placing it in
 * the order also confirms an opt-in device. */
export function showItem(layout: ScreenLayout, key: string, shown: string[]): ScreenLayout {
  const order = layout.order.includes(key) ? layout.order : [...shown.filter((item) => item !== key), key, ...layout.order.filter((item) => item !== key && !shown.includes(item))];
  return { ...layout, order, hidden: layout.hidden.filter((item) => item !== key) };
}

export function toggleWide(layout: ScreenLayout, key: string): ScreenLayout {
  return { ...layout, wide: layout.wide.includes(key) ? layout.wide.filter((item) => item !== key) : [...layout.wide, key] };
}

/**
 * Builds the per-screen layouts from the visibility options used up to 0.3.0.
 * Returns null when the config already has layouts.
 */
export function migrateLayouts(config: HomeDeckConfig, data: DiscoveryResponse): HomeDeckConfig | null {
  if (config.layouts?.[HOME_SCREEN]) return null;
  const visibility = config.visibility;
  const cards = visibility.home_cards;
  const priority = config.priority_cards;
  const homeHidden = new Set<string>();
  for (const room of data.rooms) {
    if (!cards.rooms || visibility.hidden_home_rooms.includes(room.id)) homeHidden.add(roomKey(room.id));
  }
  if (!cards.priority || !priority.security) homeHidden.add("widget:security");
  if (!cards.priority || !priority.climate) homeHidden.add("widget:climate");
  if (!cards.priority || !priority.media) homeHidden.add("widget:media");

  const layouts: Record<string, ScreenLayout> = { ...config.layouts };
  layouts[HOME_SCREEN] = {
    order: [],
    hidden: [...homeHidden],
    wide: config.layout.featured_room ? [roomKey(config.layout.featured_room)] : [],
  };
  const roomHidden = new Set(visibility.hidden_room_entities);
  for (const room of data.rooms) {
    const hidden = room.entities.filter((entity) => roomHidden.has(entity.entity_id)).map((entity) => entityKey(entity.entity_id));
    if (hidden.length > 0) layouts[roomScreen(room.id)] = { order: [], hidden, wide: [] };
  }
  const collectionHidden = visibility.hidden_home_entities.map(entityKey);
  if (collectionHidden.length > 0) {
    for (const screen of ["scenes", "media", "security"]) layouts[screen] = { order: [], hidden: collectionHidden, wide: [] };
  }
  const homeEntities = [...new Set([...visibility.visible_home_entities, ...priority.featured_entity_ids])];
  return {
    ...config,
    version: 9,
    layouts,
    visibility: { ...visibility, visible_home_entities: homeEntities },
    priority_cards: { ...priority, featured_entity_ids: [] },
    layout: { ...config.layout, featured_room: null },
  };
}
