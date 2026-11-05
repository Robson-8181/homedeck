export type HomeDeckTheme = "glass" | "minimal" | "dark";
export type HomeDeckDensity = "compact" | "comfortable";
export type HomeDeckBackgroundPreset =
  | "adaptive_ember"
  | "adaptive_aurora"
  | "adaptive_sunset"
  | "fixed_night"
  | "fixed_ocean"
  | "fixed_graphite"
  | "adaptive_forest"
  | "adaptive_lagoon"
  | "fixed_wine"
  | "fixed_plum";

export type HomeDeckViewMode = "grid" | "sidebar" | "list" | "focus";

export type HomeDeckPageType = "favorites" | "scenes" | "custom";

export interface HomeDeckPageConfig {
  id: string;
  title: string;
  type: HomeDeckPageType;
  icon: string;
  entity_ids: string[];
}

export interface ScreenLayout {
  order: string[];
  hidden: string[];
  wide: string[];
  /** Item keys shown large (two columns and two rows); always also in `wide`. */
  tall?: string[];
  /** Entities from other rooms shown on this screen (room screens only). */
  added?: string[];
  /** Separators placed in the order, by key ("section:<id>") with their title. */
  sections?: Record<string, string>;
}

export interface HomeDeckConfig {
  version: number;
  onboarding_complete: boolean;
  theme: HomeDeckTheme;
  /** Cream surface of lit cards. */
  accent_color: string;
  /** Vivid color for lit icons, light dots, sliders and counters. */
  highlight_color: string;
  locale: string;
  selected_rooms: string[];
  /** Per room (area id): its name in HomeDeck, and the icon and temperature sensor chosen in Edit mode. */
  rooms: Record<string, HomeDeckRoomOptions>;
  /** Nicknames given in HomeDeck, by entity id; Home Assistant keeps its own names. */
  names?: Record<string, string>;
  dashboard: Record<string, unknown>;
  favorites: string[];
  /** Free plan: the controllable devices chosen to appear (empty = all of the selected rooms, when they fit). */
  free_devices: string[];
  /** Free plan: the rooms chosen to appear (empty = the selection, when it fits). The full selection stays for Pro. */
  free_rooms: string[];
  /** How Home and rooms are laid out. */
  view_mode: HomeDeckViewMode;
  preferences: {
    temperature_unit: string;
    clock: string;
  };
  home: {
    show_clock: boolean;
    show_weather: boolean;
    show_presence: boolean;
  };
  global_actions: {
    lights_on: boolean;
    lights_off: boolean;
  };
  navigation: {
    rooms: boolean;
    scenes: boolean;
    media: boolean;
    security: boolean;
    /** Tab ids of the bottom bar in the order arranged in Edit mode (Home always comes first). */
    order?: string[];
  };
  layout: {
    density: HomeDeckDensity;
    featured_room: string | null;
  };
  background: {
    preset: HomeDeckBackgroundPreset;
    animated: boolean;
    include_devices: boolean;
  };
  visibility: {
    hidden_home_rooms: string[];
    hidden_home_entities: string[];
    visible_home_entities: string[];
    hidden_room_entities: string[];
    home_cards: {
      status: boolean;
      priority: boolean;
      rooms: boolean;
      shortcuts: boolean;
      scenes: boolean;
    };
  };
  priority_cards: {
    security: boolean;
    climate: boolean;
    media: boolean;
    featured_entity_ids: string[];
  };
  weather: {
    entity_id: string;
    forecast_type: "daily" | "hourly";
  };
  pages: HomeDeckPageConfig[];
  layouts: Record<string, ScreenLayout>;
  /** Calendar and to-do buttons beside the clock. Empty calendars: all; empty todo_entity: the first list. */
  agenda: {
    show_calendar: boolean;
    calendars: string[];
    show_todo: boolean;
    todo_entity: string;
    todo_no_date: boolean;
    /** A Today card on Home with the day's events and the reminders due. */
    today_card: boolean;
  };
  screensaver: {
    enabled: boolean;
    delay: number;
    /** Under the clock: today's events and the reminders due (same calendars and list as the agenda). */
    show_events?: boolean;
    show_todo?: boolean;
  };
  /** Optional cards on Home: the bigger weather card, the sun and (Pro) energy. All off by default. */
  widgets: {
    weather: boolean;
    sun: boolean;
    energy: boolean;
  };
  /** Sensors of the energy card; empty fields are left out. */
  energy: HomeDeckEnergy;
  /** Camera cards play their live video while on screen (on by default); off shows a still every 10 s. */
  live_cameras: boolean;
  /** Pro: when the trigger (a doorbell event, or a sensor turning on) fires, the camera pops up. */
  doorbell: {
    enabled: boolean;
    trigger: string;
    camera: string;
    seconds: number;
  };
  /** Pro: how cards look. corners 0-150 (% of the default roundness), glass 0 (solid) to 100 (see-through). */
  cards: HomeDeckCardStyle;
}

export interface HomeDeckRoomOptions {
  /** Name shown in HomeDeck (Settings → Rooms); the area keeps its name in Home Assistant. */
  name?: string;
  icon?: string;
  temperature?: string;
}

export interface HomeDeckCardStyle {
  corners: number;
  frame: boolean;
  glass: number;
  /** Lit fans spin, lights glow and washing machines shake while they run. */
  animations?: boolean;
  /** Double and large sensor cards show a small chart of the last 24 hours. */
  sparklines?: boolean;
}

export interface HomeDeckEnergy {
  /** Power the home is using now (W or kW). */
  consumption: string;
  /** Power drawn from the grid; when there is no export sensor, negative means exporting. */
  grid_import: string;
  grid_export: string;
  /** Power the solar panels (inverter) produce now. */
  solar: string;
  /** Home battery charge (%). */
  battery: string;
  /** Energy produced today (kWh). */
  solar_today: string;
}

