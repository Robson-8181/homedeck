import { isRoomLight } from "../../personalize";
import { useRef } from "react";
import type { MouseEvent, PointerEvent } from "react";
import { arrange, entityKey, getLayout, HOME_SCREEN, keyId, roomKey, roomScreen } from "../../layout";
import { TOGGLES } from "../../components/EntityCard";
import { RUNNABLE, runEntity } from "../../devices";
import type { HomeDeckConfig, ScreenLayout } from "../../types/config";
import type { DiscoveredEntity, Room } from "../../types/discovery";
import type { HomeAssistant } from "../../types/home-assistant";

const DOMAIN_ORDER = ["light", "switch", "fan", "cover", "climate", "media_player", "vacuum", "select", "input_select", "script", "button", "input_button", "scene", "lock", "camera", "alarm_control_panel", "binary_sensor", "sensor", "plant"];
export const ACTIVE = new Set(["on", "open", "opening", "playing", "heat", "cool", "heat_cool", "auto", "dry", "fan_only", "unlocked", "cleaning", "returning"]);

/** Rooms in the order and visibility arranged on Home (edit mode applies to every layout). */
export function orderedRooms(config: HomeDeckConfig, rooms: Room[]): Room[] {
  const byId = new Map(rooms.map((room) => [room.id, room]));
  return arrange(rooms.map((room) => roomKey(room.id)), getLayout(config, HOME_SCREEN)).visible.map((key) => byId.get(keyId(key))!).filter(Boolean);
}

/** Devices of a room in the order arranged on its screen, including devices added from other rooms. */
export function orderedEntities(config: HomeDeckConfig, room: Room, allRooms: Room[]): DiscoveredEntity[] {
  const { byKey, visible } = roomItems(config, room, allRooms);
  return visible.map((key) => byKey.get(key)!);
}

export function roomLights(hass: HomeAssistant, room: Room) {
  const lights = room.entities.filter(isRoomLight);
  return { lights, on: lights.filter((entity) => hass.states[entity.entity_id]?.state === "on") };
}

export function isOn(hass: HomeAssistant, entity: DiscoveredEntity): boolean {
  return ACTIVE.has(hass.states[entity.entity_id]?.state ?? "");
}

/** Same tap rule as the cards: switch what is safe to switch, otherwise open the details. */
export function tapEntity(hass: HomeAssistant, entity: DiscoveredEntity, openDetails: (entity: DiscoveredEntity) => void): void {
  const state = hass.states[entity.entity_id]?.state;
  if (!state || ["unavailable", "unknown"].includes(state)) return;
  // A protected device never switches from a row or chip: it opens its details, where acting is deliberate.
  if (entity.confirm) { openDetails(entity); return; }
  if (TOGGLES.has(entity.domain)) void hass.callService("homeassistant", "toggle", { entity_id: entity.entity_id });
  else if (entity.domain === "scene") void hass.callService("scene", "turn_on", { entity_id: entity.entity_id });
  else if (RUNNABLE.has(entity.domain)) void runEntity(hass, entity.entity_id);
  else if (entity.domain === "cover") void hass.callService("cover", "toggle", { entity_id: entity.entity_id });
  else openDetails(entity);
}

export function setRoomLights(hass: HomeAssistant, room: Room, on: boolean): void {
  const ids = room.entities.filter(isRoomLight).map((entity) => entity.entity_id);
  if (ids.length > 0) void hass.callService("light", on ? "turn_on" : "turn_off", { entity_id: ids });
}

/**
 * Press-and-hold for rows and chips: tap acts, hold opens details. The gesture lives in a ref,
 * because the panel re-renders on every Home Assistant state update while a finger is down.
 */
export function useHold() {
  const gesture = useRef<{ timer: number | null; held: boolean; x: number; y: number }>({ timer: null, held: false, x: 0, y: 0 });
  return (onTap: () => void, onHold: () => void) => {
    const g = gesture.current;
    const cancel = () => { if (g.timer != null) window.clearTimeout(g.timer); g.timer = null; };
    const fromControl = (target: EventTarget) => Boolean((target as HTMLElement).closest("input, .no-hold"));
    return {
      onPointerDown: (event: PointerEvent<HTMLElement>) => {
        g.held = false;
        if (fromControl(event.target)) return;
        cancel();
        g.x = event.clientX; g.y = event.clientY;
        g.timer = window.setTimeout(() => { g.timer = null; g.held = true; onHold(); }, 520);
      },
      onPointerMove: (event: PointerEvent<HTMLElement>) => { if (g.timer != null && Math.hypot(event.clientX - g.x, event.clientY - g.y) > 10) cancel(); },
      onPointerUp: cancel,
      onPointerLeave: cancel,
      onPointerCancel: cancel,
      onClick: (event: MouseEvent<HTMLElement>) => { if (g.held) { g.held = false; return; } if (!fromControl(event.target)) onTap(); },
      onContextMenu: (event: MouseEvent<HTMLElement>) => { event.preventDefault(); cancel(); onHold(); },
    };
  };
}

/**
 * Saves a reorder of some items of a screen (only its rooms, say) without moving the others:
 * the reordered items take the same slots in the full order.
 */
export function subsetLayout(allKeys: string[], layout: ScreenLayout, save: (layout: ScreenLayout) => void) {
  return (next: ScreenLayout) => {
    if (next.order === layout.order) return save(next);
    // Every other item on the screen (cards, widgets, separators) keeps its place.
    const full = [...layout.order, ...allKeys.filter((key) => !layout.order.includes(key))];
    const moved = next.order.filter((key) => allKeys.includes(key));
    const movedSet = new Set(moved);
    let index = 0;
    save({ ...next, order: full.map((key) => (movedSet.has(key) ? moved[index++] : key)) });
  };
}

/** Everything a room's device list needs in edit mode: order, hidden devices and devices added from other rooms. */
export function roomItems(config: HomeDeckConfig, room: Room, allRooms: Room[]) {
  const screen = roomScreen(room.id);
  const layout = getLayout(config, screen);
  const everything = new Map(allRooms.flatMap((item) => item.entities).map((entity) => [entity.entity_id, entity]));
  const own = new Set(room.entities.map((entity) => entity.entity_id));
  const natural = [...room.entities].sort((a, b) => DOMAIN_ORDER.indexOf(a.domain) - DOMAIN_ORDER.indexOf(b.domain) || a.name.localeCompare(b.name));
  const added = (layout.added ?? []).filter((id) => !own.has(id) && everything.has(id));
  const byKey = new Map([...natural, ...added.map((id) => everything.get(id)!)].map((entity) => [entityKey(entity.entity_id), entity]));
  const { visible, hidden } = arrange([...byKey.keys()], layout, true);
  return { screen, layout, own, added, byKey, visible, hidden };
}
