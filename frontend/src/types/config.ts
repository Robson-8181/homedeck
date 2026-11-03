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
  /** Entities from other rooms shown on this screen (room screens only). */
  added?: string[];
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
  rooms: Record<string, Record<string, unknown>>;
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
  };
  screensaver: {
    enabled: boolean;
    delay: number;
  };
  /** Pro: how cards look. corners 0-150 (% of the default roundness), glass 0 (solid) to 100 (see-through). */
  cards: HomeDeckCardStyle;
}

export interface HomeDeckCardStyle {
  corners: number;
  frame: boolean;
  glass: number;
}

