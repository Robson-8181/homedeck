export interface DiscoveredEntity {
  entity_id: string;
  domain: string;
  name: string;
  area_id: string;
  device_id: string | null;
  device_class: string | null;
  icon: string | null;
  platform?: string | null;
  /** HomeDeck's options for it: the icon on its tile ("ha" or a HomeDeck icon) and tap confirmation. */
  display_icon?: string;
  confirm?: boolean;
  /** Name in Home Assistant, when a nickname was given in HomeDeck. */
  original_name?: string;
  /** Hidden from its room in Edit mode: left out of the light counts and of "turn all on/off". */
  hidden?: boolean;
}

export interface Room {
  id: string;
  name: string;
  icon: string | null;
  aliases: string[];
  floor_id: string | null;
  device_count: number;
  entities: DiscoveredEntity[];
  /** Name in Home Assistant, when the room was renamed in HomeDeck. */
  original_name?: string;
  /** Icon chosen in Edit mode: an HomeDeck icon name, "ha" (the area's icon) or none (from the name). */
  display_icon?: string;
  /** Sensor chosen for the room's temperature; none: the climate device, as before. */
  temperature_entity?: string;
}

export interface DiscoveryResponse {
  version: string;
  rooms: Room[];
  counts: {
    rooms: number;
    devices: number;
    entities: number;
  };
}

