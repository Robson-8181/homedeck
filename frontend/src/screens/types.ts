import type { TranslationKey } from "../i18n";
import type { HomeDeckConfig, ScreenLayout } from "../types/config";
import type { DiscoveredEntity, DiscoveryResponse, Room } from "../types/discovery";
import type { HomeAssistant } from "../types/home-assistant";

/** What every operational screen receives from App. */
export interface ScreenProps {
  /** Every discovered room, including the ones not shown in the panel (free plan: only allowed devices). */
  allRooms: Room[];
  /** Every room and device, for the "Add" pickers (the free plan checks each pick). */
  catalogRooms: Room[];
  config: HomeDeckConfig;
  /** Rooms selected for the panel, in the user's order. */
  data: DiscoveryResponse;
  editing: boolean;
  hass: HomeAssistant;
  language?: string;
  /** Builds on the latest config, so successive edits never undo each other. */
  onConfig: (update: (config: HomeDeckConfig) => HomeDeckConfig) => void;
  onLayout: (screen: string, layout: ScreenLayout) => void;
  onSettings: () => void;
  /** Opens the layout picker (Grade, Lateral, Lista, Foco). */
  onToggleEdit: () => void;
  t: (key: TranslationKey) => string;
}

export function entityIndex(rooms: Room[]): { byId: Map<string, DiscoveredEntity>; roomName: (entity: DiscoveredEntity) => string | undefined } {
  const byId = new Map<string, DiscoveredEntity>();
  const names = new Map<string, string>();
  for (const room of rooms) {
    names.set(room.id, room.name);
    for (const entity of room.entities) if (!byId.has(entity.entity_id)) byId.set(entity.entity_id, entity);
  }
  return { byId, roomName: (entity) => names.get(entity.area_id) };
}
