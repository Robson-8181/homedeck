import { createContext, useContext, useEffect, useState } from "react";
import type { HomeDeckCondition, HomeDeckConfig, HomeDeckEntityRule, HomeDeckEntityOptions, HomeDeckRoomOptions } from "./types/config";
import type { DiscoveredEntity, DiscoveryResponse, Room } from "./types/discovery";
import type { HassEntity, HomeAssistant } from "./types/home-assistant";

// What the user changes inside HomeDeck without touching Home Assistant: device nicknames and, per
// room, its name, icon and temperature sensor. Nothing set means everything looks as it always did.

export const MAX_NAME = 60;

/** Discovery with the nicknames and room options applied, so every screen and layout shows them. */
/**
 * Takes out what this user was left out of ("Who can see"), so it is gone from screens, counts and
 * lists alike. In Edit mode an administrator still gets it, marked, to be able to undo the choice.
 */
export function applyAudience(data: DiscoveryResponse, hiddenFor: HomeDeckConfig["hidden_for"], user: { id: string; is_admin?: boolean } | undefined, editing: boolean): DiscoveryResponse {
  if (!user || !hiddenFor || Object.keys(hiddenFor).length === 0) return data;
  const denied = (key: string) => (hiddenFor[key] ?? []).includes(user.id);
  if (user.is_admin && editing) return data;
  return { ...data, rooms: data.rooms.filter((room) => !denied(`room:${room.id}`)).map((room) => ({ ...room, entities: room.entities.filter((entity) => !denied(`entity:${entity.entity_id}`)) })) };
}

/** A light the room shows (not hidden from it in Edit mode): the ones counted and switched together. */
export const isRoomLight = (entity: DiscoveredEntity) => entity.domain === "light" && !entity.hidden;

export function personalize(data: DiscoveryResponse, names: HomeDeckConfig["names"], rooms: HomeDeckConfig["rooms"] | undefined, entityOptions?: HomeDeckConfig["entity_options"], haIcons = false, layouts?: HomeDeckConfig["layouts"], haRoomIcons = false): DiscoveryResponse {
  const nicknames = names ?? {};
  const options = rooms ?? {};
  const perEntity = entityOptions ?? {};
  const hiddenIn = (roomId: string) => new Set(layouts?.[`room:${roomId}`]?.hidden ?? []);
  const anyHidden = data.rooms.some((room) => hiddenIn(room.id).size > 0);
  if (Object.keys(nicknames).length === 0 && Object.keys(options).length === 0 && Object.keys(perEntity).length === 0 && !haIcons && !haRoomIcons && !anyHidden) return data;
  return {
    ...data,
    rooms: data.rooms.map((room) => {
      const own = options[room.id] ?? {};
      const name = typeof own.name === "string" && own.name.trim() ? own.name.trim() : null;
      const hidden = hiddenIn(room.id);
      return {
        ...room,
        ...(name ? { name, original_name: room.name } : {}),
        display_icon: typeof own.icon === "string" && own.icon ? own.icon : haRoomIcons && room.icon?.includes(":") ? "ha" : undefined,
        temperature_entity: typeof own.temperature === "string" && own.temperature ? own.temperature : undefined,
        entities: room.entities.map((entity) => {
          const nickname = nicknames[entity.entity_id];
          const own = perEntity[entity.entity_id] ?? {};
          // The tile's icon: the one chosen for this device, else Home Assistant's when that option is on.
          const icon = own.icon || (haIcons && entity.icon?.includes(":") ? "ha" : undefined);
          const off = hidden.has(`entity:${entity.entity_id}`);
          if (!nickname && !icon && !own.confirm && !own.light_accent && !own.visible_when && !off) return entity;
          return { ...entity, ...(nickname ? { name: nickname, original_name: entity.name } : {}), ...(icon ? { display_icon: icon } : {}), ...(own.confirm ? { confirm: true } : {}), ...(own.light_accent ? { light_accent: true } : {}), ...(own.visible_when ? { visible_when: own.visible_when } : {}), ...(off ? { hidden: true } : {}) };
        }),
      };
    }),
  };
}

const INACTIVE_STATES = new Set(["off", "closed", "locked", "unavailable", "unknown", "not_home", "standby", "disarmed", "docked", "below_horizon", "none", ""]);
const minutesOf = (time?: string) => (time && /^\d{2}:\d{2}$/.test(time) ? Number(time.slice(0, 2)) * 60 + Number(time.slice(3)) : null);

/** The entity checks of a condition, the first version (one entity on or off) included. */
export function entityRules(condition: HomeDeckCondition | undefined): HomeDeckEntityRule[] {
  if (!condition) return [];
  if (condition.rules?.length) return condition.rules;
  return condition.entity ? [{ entity: condition.entity, is: condition.state === "off" ? "off" : "on" }] : [];
}

/** One entity check; an entity that no longer exists never hides anything. */
function ruleMet(rule: HomeDeckEntityRule, states: Record<string, { state: string } | undefined>): boolean {
  const current = states[rule.entity];
  if (!current) return true;
  const state = String(current.state);
  const active = !INACTIVE_STATES.has(state.toLowerCase());
  const number = Number(state);
  const target = Number(rule.value);
  switch (rule.is) {
    case "off": return !active;
    case "eq": return state.toLowerCase() === String(rule.value ?? "").trim().toLowerCase();
    case "neq": return state.toLowerCase() !== String(rule.value ?? "").trim().toLowerCase();
    case "above": return state !== "" && Number.isFinite(number) && Number.isFinite(target) && number > target;
    case "below": return state !== "" && Number.isFinite(number) && Number.isFinite(target) && number < target;
    default: return active;
  }
}

/** Whether a card or notice should show. Every kind of rule set must be met; a device that no longer exists never hides it. */
export function conditionMet(condition: HomeDeckCondition | undefined, states: Record<string, { state: string } | undefined>, now: Date): boolean {
  if (!condition) return true;
  const rules = entityRules(condition);
  if (rules.length > 0) {
    const results = rules.map((rule) => ruleMet(rule, states));
    if (condition.match === "any" ? !results.some(Boolean) : !results.every(Boolean)) return false;
  }
  if (condition.people) {
    const people = Object.keys(states).filter((id) => id.startsWith("person."));
    const home = people.some((id) => states[id]?.state === "home");
    if (people.length > 0 && (condition.people === "home") !== home) return false;
  }
  let day = now.getDay();
  const start = minutesOf(condition.from);
  const end = minutesOf(condition.to);
  if (start != null && end != null && start !== end) {
    const minutes = now.getHours() * 60 + now.getMinutes();
    const overnight = start > end;
    if (overnight ? minutes < start && minutes >= end : minutes < start || minutes >= end) return false;
    // After midnight, an overnight window still belongs to the day it started.
    if (overnight && minutes < end) day = (day + 6) % 7;
  }
  return !condition.days?.length || condition.days.includes(day);
}

/** Re-renders every minute while active, so time rules and "5 min ago" keep up. */
export function useMinute(active = true): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, [active]);
  return now;
}

export function withNickname(config: HomeDeckConfig, entityId: string, name: string, original: string): HomeDeckConfig {
  const { [entityId]: _previous, ...names } = config.names ?? {};
  const clean = name.trim().slice(0, MAX_NAME);
  return { ...config, names: clean && clean !== original ? { ...names, [entityId]: clean } : names };
}

export function withEntityOptions(config: HomeDeckConfig, entityId: string, change: HomeDeckEntityOptions): HomeDeckConfig {
  const next = { ...(config.entity_options?.[entityId] ?? {}), ...change };
  const clean = Object.fromEntries(Object.entries(next).filter(([, value]) => value === true || (typeof value === "string" && value) || (typeof value === "object" && value)));
  const { [entityId]: _previous, ...rest } = config.entity_options ?? {};
  return { ...config, entity_options: Object.keys(clean).length > 0 ? { ...rest, [entityId]: clean } : rest };
}

export function withRoomOptions(config: HomeDeckConfig, roomId: string, change: HomeDeckRoomOptions): HomeDeckConfig {
  const next = { ...(config.rooms?.[roomId] ?? {}), ...change };
  const clean = Object.fromEntries(Object.entries(next).filter(([, value]) => typeof value === "string" && value));
  const { [roomId]: _previous, ...rooms } = config.rooms ?? {};
  return { ...config, rooms: Object.keys(clean).length > 0 ? { ...rooms, [roomId]: clean } : rooms };
}

/** The room's temperature: the chosen sensor, or the current temperature of its climate device. */
export function roomTemperature(hass: HomeAssistant, room: { temperature_entity?: string; entities: Array<{ entity_id: string; domain: string }> }): string | null {
  if (room.temperature_entity) {
    const state = hass.states[room.temperature_entity];
    const value = state ? Number.parseFloat(state.state) : Number.NaN;
    return Number.isFinite(value) ? `${Math.round(value * 10) / 10}°` : null;
  }
  const climate = room.entities.find((entity) => entity.domain === "climate");
  const current = climate ? hass.states[climate.entity_id]?.attributes.current_temperature : undefined;
  return typeof current === "number" ? `${current}°` : null;
}

export function isTemperatureSensor(state?: HassEntity): boolean {
  return Boolean(state && state.entity_id.startsWith("sensor.") && state.attributes.device_class === "temperature");
}

/** Lets details sheets and room headers save a nickname or a room option (absent outside the panel). */
export const CustomizeContext = createContext<{
  /** The device as discovered now, with its current nickname (a details sheet may outlive a rename). */
  lookup: (entityId: string) => DiscoveredEntity | undefined;
  rename: (entityId: string, name: string, original: string) => void;
  setRoom: (roomId: string, change: HomeDeckRoomOptions) => void;
  /** A device's own options: its tile icon and tap confirmation. */
  setEntity: (entityId: string, change: HomeDeckEntityOptions) => void;
  /** Every room, for choosing a card's extra devices. */
  rooms: () => Room[];
  /** This user was left out of the card (shown only to an administrator in Edit mode). */
  restricted: (itemKey: string) => boolean;
  /** Who was left out of a card, and changing it. */
  hiddenFor: (itemKey: string) => string[];
  setHiddenFor: (itemKey: string, userId: string, hidden: boolean) => void;
  linksFor: (itemKey: string) => string[];
  setLinks: (itemKey: string, ids: string[]) => void;
  /** The name a linked device shows inside this card ("" when it uses its own). */
  linkName: (itemKey: string, entityId: string) => string;
  setLinkName: (itemKey: string, entityId: string, name: string) => void;
} | null>(null);
export const useCustomize = () => useContext(CustomizeContext);
