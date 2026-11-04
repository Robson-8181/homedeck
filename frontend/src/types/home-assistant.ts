export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown> & {
    friendly_name?: string;
    unit_of_measurement?: string;
    brightness?: number;
    color_mode?: string;
    supported_color_modes?: string[];
    rgb_color?: number[];
    hs_color?: number[];
    color_temp_kelvin?: number;
    min_color_temp_kelvin?: number;
    max_color_temp_kelvin?: number;
    effect?: string;
    effect_list?: string[];
    temperature?: number;
    current_temperature?: number;
    media_title?: string;
    media_artist?: string;
    entity_picture?: string;
    temperature_unit?: string;
    forecast?: Array<Record<string, unknown>>;
    hvac_action?: string;
    hvac_modes?: string[];
    min_temp?: number;
    max_temp?: number;
    target_temp_step?: number;
    target_temp_high?: number;
    target_temp_low?: number;
    fan_modes?: string[];
    fan_mode?: string;
    preset_modes?: string[];
    preset_mode?: string;
    volume_level?: number;
    percentage?: number;
    percentage_step?: number;
    current_position?: number;
    device_class?: string;
    supported_features?: number;
    apparent_temperature?: number;
    humidity?: number;
    pressure?: number;
    pressure_unit?: string;
    precipitation_unit?: string;
    wind_speed?: number;
    wind_speed_unit?: string;
    latitude?: number;
    longitude?: number;
  };
  last_changed: string;
  last_updated: string;
}

export interface HomeAssistant {
  states: Record<string, HassEntity>;
  /** Entity registry as the Home Assistant frontend keeps it (device of each entity). */
  entities?: Record<string, { entity_id: string; device_id?: string | null }>;
  /** How Home Assistant shows its sidebar on this device. */
  dockedSidebar?: "docked" | "always_hidden" | "auto";
  /** The home's location, used for Open-Meteo when no weather entity works. */
  config?: {
    latitude?: number;
    longitude?: number;
  };
  locale?: {
    language?: string;
  };
  language?: string;
  /** REST call through Home Assistant (calendar events). */
  callApi?<T>(method: "GET" | "POST", path: string): Promise<T>;
  connection: {
    sendMessagePromise<T>(message: Record<string, unknown>): Promise<T>;
    subscribeMessage?<T>(
      callback: (message: T) => void,
      message: Record<string, unknown>,
    ): Promise<() => void>;
  };
  callService(
    domain: string,
    service: string,
    data?: Record<string, unknown>,
  ): Promise<unknown>;
}

export interface HomeDeckPanelInfo {
  config?: {
    version?: string;
  };
}

