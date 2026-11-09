import { createContext, useContext } from "react";
import type { HomeDeckConfig, HomeDeckEntityOptions, HomeDeckRoomOptions } from "./types/config";
import type { DiscoveredEntity, DiscoveryResponse } from "./types/discovery";
import type { HassEntity, HomeAssistant } from "./types/home-assistant";

// What the user changes inside HomeDeck without touching Home Assistant: device nicknames and, per
// room, its name, icon and temperature sensor. Nothing set means everything looks as it always did.

export const MAX_NAME = 60;

/** Discovery with the nicknames and room options applied, so every screen and layout shows them. */
/** A light the room shows (not hidden from it in Edit mode): the ones counted and switched together. */
export const isRoomLight = (entity: DiscoveredEntity) => entity.domain === "light" && !entity.hidden;

export function personalize(data: DiscoveryResponse, names: HomeDeckConfig["names"], rooms: HomeDeckConfig["rooms"] | undefined, entityOptions?: HomeDeckConfig["entity_options"], haIcons = false, layouts?: HomeDeckConfig["layouts"]): DiscoveryResponse {
  const nicknames = names ?? {};
  const options = rooms ?? {};
  const perEntity = entityOptions ?? {};
  const hiddenIn = (roomId: string) => new Set(layouts?.[`room:${roomId}`]?.hidden ?? []);
  const anyHidden = data.rooms.some((room) => hiddenIn(room.id).size > 0);
  if (Object.keys(nicknames).length === 0 && Object.keys(options).length === 0 && Object.keys(perEntity).length === 0 && !haIcons && !anyHidden) return data;
  return {
    ...data,
    rooms: data.rooms.map((room) => {
      const own = options[room.id] ?? {};
      const name = typeof own.name === "string" && own.name.trim() ? own.name.trim() : null;
      const hidden = hiddenIn(room.id);
      return {
        ...room,
        ...(name ? { name, original_name: room.name } : {}),
        display_icon: typeof own.icon === "string" && own.icon ? own.icon : undefined,
        temperature_entity: typeof own.temperature === "string" && own.temperature ? own.temperature : undefined,
        entities: room.entities.map((entity) => {
          const nickname = nicknames[entity.entity_id];
          const own = perEntity[entity.entity_id] ?? {};
          // The tile's icon: the one chosen for this device, else Home Assistant's when that option is on.
          const icon = own.icon || (haIcons && entity.icon?.includes(":") ? "ha" : undefined);
          const off = hidden.has(`entity:${entity.entity_id}`);
          if (!nickname && !icon && !own.confirm && !off) return entity;
          return { ...entity, ...(nickname ? { name: nickname, original_name: entity.name } : {}), ...(icon ? { display_icon: icon } : {}), ...(own.confirm ? { confirm: true } : {}), ...(off ? { hidden: true } : {}) };
        }),
      };
    }),
  };
}

export function withNickname(config: HomeDeckConfig, entityId: string, name: string, original: string): HomeDeckConfig {
  const { [entityId]: _previous, ...names } = config.names ?? {};
  const clean = name.trim().slice(0, MAX_NAME);
  return { ...config, names: clean && clean !== original ? { ...names, [entityId]: clean } : names };
}

export function withEntityOptions(config: HomeDeckConfig, entityId: string, change: HomeDeckEntityOptions): HomeDeckConfig {
  const next = { ...(config.entity_options?.[entityId] ?? {}), ...change };
  const clean = Object.fromEntries(Object.entries(next).filter(([, value]) => value === true || (typeof value === "string" && value)));
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
} | null>(null);
export const useCustomize = () => useContext(CustomizeContext);
