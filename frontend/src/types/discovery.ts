export interface DiscoveredEntity {
  entity_id: string;
  domain: string;
  name: string;
  area_id: string;
  device_id: string | null;
  device_class: string | null;
  icon: string | null;
  platform?: string | null;
}

export interface Room {
  id: string;
  name: string;
  icon: string | null;
  aliases: string[];
  floor_id: string | null;
  device_count: number;
  entities: DiscoveredEntity[];
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

