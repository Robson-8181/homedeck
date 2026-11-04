import { createContext, useContext } from "react";
import type { HomeDeckConfig, HomeDeckRoomOptions } from "./types/config";
import type { DiscoveredEntity, DiscoveryResponse } from "./types/discovery";
import type { HassEntity, HomeAssistant } from "./types/home-assistant";

// What the user changes inside HomeDeck without touching Home Assistant: device nicknames and, per
// room, its name, icon and temperature sensor. Nothing set means everything looks as it always did.

export const MAX_NAME = 60;

/** Discovery with the nicknames and room options applied, so every screen and layout shows them. */
export function personalize(data: DiscoveryResponse, names: HomeDeckConfig["names"], rooms: HomeDeckConfig["rooms"] | undefined): DiscoveryResponse {
  const nicknames = names ?? {};
  const options = rooms ?? {};
  if (Object.keys(nicknames).length === 0 && Object.keys(options).length === 0) return data;
  return {
    ...data,
    rooms: data.rooms.map((room) => {
      const own = options[room.id] ?? {};
      const name = typeof own.name === "string" && own.name.trim() ? own.name.trim() : null;
      return {
        ...room,
        ...(name ? { name, original_name: room.name } : {}),
        display_icon: typeof own.icon === "string" && own.icon ? own.icon : undefined,
        temperature_entity: typeof own.temperature === "string" && own.temperature ? own.temperature : undefined,
        entities: room.entities.map((entity) => {
          const nickname = nicknames[entity.entity_id];
          return nickname ? { ...entity, name: nickname, original_name: entity.name } : entity;
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
} | null>(null);
export const useCustomize = () => useContext(CustomizeContext);
