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
  | "adaptive_orchid"
  | "adaptive_reef"
  | "adaptive_berry"
  | "adaptive_glacier"
  | "adaptive_citrus"
  | "fixed_wine"
  | "fixed_plum"
  | "fixed_cobalt"
  | "fixed_violet"
  | "fixed_magenta"
  | "fixed_coral"
  | "fixed_emerald"
  | "fixed_teal"
  | "fixed_indigo"
  | "fixed_rose"
  | "fixed_amber"
  | "fixed_lime";

export type HomeDeckViewMode = "grid" | "sidebar" | "list" | "focus";

export type HomeDeckPageType = "favorites" | "scenes" | "custom" | "cameras";

export interface HomeDeckPageConfig {
  id: string;
  title: string;
  type: HomeDeckPageType;
  icon: string;
  entity_ids: string[];
  /** Camera pages: how many cameras fit side by side (1 to 4). */
  columns?: number;
}

export interface ScreenLayout {
  order: string[];
  hidden: string[];
  wide: string[];
  /** Item keys shown large (two columns and two rows); always also in `wide`. */
  tall?: string[];
  /** Bigger sizes by item: 6 or 8 for camera cards, 4, 9 or 16 cells on a camera page. */
  cells?: Record<string, number>;
  /** Sensor keys shown small (half the height of a normal card). */
  small?: string[];
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
  /** Tiles show the entity's own icon from Home Assistant when it has one (off by default). */
  ha_icons?: boolean;
  /** Rooms use the icon of their area in Home Assistant, when it has one. */
  ha_room_icons?: boolean;
  /** Per device, set in its details: its icon ("ha" or a HomeDeck icon) and whether a tap asks to confirm. */
  entity_options?: Record<string, HomeDeckEntityOptions>;
  /** Extra devices shown inside double and large cards, by card key ("entity:…", "room:…"). */
  card_links?: Record<string, string[]>;
  /** The name each of those devices shows inside that card; none means its own name. */
  card_link_names?: Record<string, Record<string, string>>;
  /** Who a card or room is not shown to: card key to Home Assistant user ids. */
  hidden_for?: Record<string, string[]>;
  /** The waste collection card: a sensor, a name and a color for each bin. */
  bins?: HomeDeckBin[];
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
    /** Entities shown as small notices beside the presence avatars, only when there is something to notice. */
    badges?: string[];
    /** How each notice looks; icon and text when not set. */
    badge_styles?: Record<string, "icon" | "text">;
    /** The text to show instead of the entity's name, per entity. */
    badge_texts?: Record<string, string>;
    /** When each notice can show, per entity (Pro). */
    badge_rules?: Record<string, HomeDeckCondition>;
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
    cameras?: boolean;
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
    bins?: boolean;
  };
  /** Sensors of the energy card; empty fields are left out. */
  energy: HomeDeckEnergy;
  /** Pro: special dates (holidays by the home's country, birthdays from the calendar, own dates). */
  seasons?: { enabled: boolean; off: string[]; custom: Array<{ name: string; date: string; effect: string }> };
  /** Camera cards play their live video while on screen (on by default); off shows a still every 10 s. */
  live_cameras: boolean;
  /** Camera cards show the whole picture instead of filling the card. */
  camera_whole?: boolean;
  camera_columns?: number;
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

export interface HomeDeckEntityOptions {
  icon?: string;
  confirm?: boolean;
  /** While on, the card's highlight takes the color of the light. */
  light_accent?: boolean;
  /** Outside Edit mode, the card only shows while these rules are met. */
  visible_when?: HomeDeckCondition;
}

/** One check on an entity: on or off, equal or not to a state, above or below a number. */
export interface HomeDeckEntityRule {
  entity: string;
  is: "on" | "off" | "eq" | "neq" | "above" | "below";
  value?: string;
}

/** When a card or notice shows. Every kind of rule that is set must be met. */
export interface HomeDeckCondition {
  /** Checks on entities; with "any", one of them is enough. */
  rules?: HomeDeckEntityRule[];
  match?: "all" | "any";
  /** Someone home, or nobody home (from the people in Home Assistant). */
  people?: "home" | "away";
  /** The first version: one entity on or off. Still read, written as a rule from now on. */
  entity?: string;
  state?: "on" | "off";
  /** A time window as "HH:MM"; when it ends before it starts, it runs overnight. */
  from?: string;
  to?: string;
  /** Weekdays, 0 is Sunday; none means every day. An overnight window belongs to the day it started. */
  days?: number[];
}

export interface HomeDeckCardStyle {
  corners: number;
  frame: boolean;
  glass: number;
  /** Lit fans spin, lights glow and washing machines shake while they run. */
  animations?: boolean;
  /** Double and large sensor cards show a small chart of the last 24 hours. */
  sparklines?: boolean;
  /** Every media player (not just Spotify) uses the player card and the full-screen player. On by default. */
  players?: boolean;
}

export type HomeDeckBinColor = "black" | "brown" | "green" | "blue" | "yellow" | "grey" | "red";

export interface HomeDeckBin {
  entity: string;
  name: string;
  color: HomeDeckBinColor;
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

