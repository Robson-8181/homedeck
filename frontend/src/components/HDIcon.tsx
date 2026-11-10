import type { CSSProperties, ReactNode } from "react";

export type IconName =
  | "arrow"
  | "bed"
  | "chevron"
  | "climate"
  | "cloud"
  | "clock"
  | "close"
  | "bell"
  | "palette"
  | "tablet"
  | "cover"
  | "door"
  | "eye"
  | "fan"
  | "grid"
  | "home"
  | "kitchen"
  | "light"
  | "lock"
  | "media"
  | "moon"
  | "people"
  | "power"
  | "refresh"
  | "scene"
  | "sensor"
  | "settings"
  | "shield"
  | "sofa"
  | "star"
  | "stop"
  | "sun"
  | "switch"
  | "tv"
  | "monitor"
  | "wifi"
  | "router"
  | "plug"
  | "battery"
  | "flame"
  | "wind"
  | "leaf"
  | "flower"
  | "paw"
  | "mail"
  | "package"
  | "key"
  | "garage"
  | "window"
  | "blinds"
  | "lamp"
  | "coffee"
  | "fridge"
  | "shower"
  | "wrench"
  | "dumbbell"
  | "book"
  | "heart"
  | "bike"
  | "solar"
  | "gate"
  | "umbrella"
  | "robot"
  | "gift"
  | "volume"
  | "plus"
  | "minus"
  | "expand"
  | "shrink"
  | "pencil"
  | "trash"
  | "calendar"
  | "menu"
  | "rain"
  | "storm"
  | "snow"
  | "fog"
  | "partly"
  | "list"
  | "pin"
  | "search"
  | "check"
  | "bath"
  | "briefcase"
  | "child"
  | "car"
  | "tree"
  | "pause"
  | "play"
  | "prev"
  | "next"
  | "shuffle"
  | "repeat"
  | "repeat1"
  | "note"
  | "speaker"
  | "layout"
  | "grip"
  | "camera"
  | "vacuum"
  | "button"
  | "plant"
  | "alarm"
  | "laundry"
  | "dining"
  | "stairs"
  | "game"
  | "pool"
  | "drop"
  | "bolt";

const paths: Record<IconName, ReactNode> = {
  arrow: <path d="m15 18-6-6 6-6" />,
  plant: <><path d="M12 21v-9" /><path d="M12 12c0-4 2.5-7 7-7 0 4.5-3 7-7 7Z" /><path d="M12 15c0-3-2-5.5-6-5.5 0 3.5 2.5 5.5 6 5.5Z" /><path d="M7 21h10" /></>,
  alarm: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="M12 7v5" /><path d="M12 15.5h.01" /></>,
  laundry: <><rect x="4" y="2.5" width="16" height="19" rx="2.5" /><circle cx="12" cy="13.5" r="4.5" /><path d="M7.5 6h.01M10.5 6h.01" /></>,
  dining: <><path d="M5 3v7a2 2 0 0 0 4 0V3M7 10v11" /><path d="M17 21V3c-2.2 1.2-3 4-3 7h3" /></>,
  stairs: <path d="M3 20h5v-5h5v-5h5V5h3" />,
  game: <><rect x="2.5" y="7" width="19" height="11" rx="5.5" /><path d="M7 11v3M5.5 12.5h3M15.5 12h.01M18 14h.01" /></>,
  pool: <><path d="M2 18c2 1.3 4 1.3 6 0s4-1.3 6 0 4 1.3 6 0" /><path d="M8 15V5a2 2 0 0 1 4 0M16 15V5a2 2 0 0 0-4 0" /><path d="M8 8h8M8 12h8" /></>,
  bolt: <path d="M13 2 4.5 13.5H11L10 22l8.5-11.5H12L13 2Z" />,
  drop: <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z" />,
  bed: <><path d="M2 4v16M22 20v-8a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v8M2 16h20" /><path d="M6 10V7a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3" /></>,
  chevron: <path d="m9 18 6-6-6-6" />,
  climate: <><path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" /><path d="M12 9v7" /></>,
  cloud: <path d="M17.5 19H7a5 5 0 1 1 1.7-9.7A6 6 0 0 1 20 12a3.5 3.5 0 0 1-2.5 7Z" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  close: <><path d="m6 6 12 12" /><path d="m18 6-12 12" /></>,
  palette: <><path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.6-.8 1.6-1.6 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-.9.7-1.6 1.6-1.6H16a5 5 0 0 0 5-5c0-4-4-7.4-9-7.4Z" /><circle cx="7.5" cy="11" r="1.1" /><circle cx="10" cy="7" r="1.1" /><circle cx="14.5" cy="7" r="1.1" /><circle cx="17" cy="10.5" r="1.1" /></>,
  tablet: <><rect x="4.5" y="2.5" width="15" height="19" rx="2.5" /><path d="M11 18.5h2" /></>,
  bell: <><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15Z" /><path d="M10 20.5a2 2 0 0 0 4 0" /></>,
  rain: <><path d="M17.5 16H7a4.5 4.5 0 1 1 1.6-8.7A5.5 5.5 0 0 1 19 9.5a3.25 3.25 0 0 1-1.5 6.5Z" /><path d="M8 19.5 7 21.5M12 19.5l-1 2M16 19.5l-1 2" /></>,
  storm: <><path d="M17.5 16H7a4.5 4.5 0 1 1 1.6-8.7A5.5 5.5 0 0 1 19 9.5a3.25 3.25 0 0 1-1.5 6.5Z" /><path d="m12.5 17.5-2 3h3l-2 3" /></>,
  snow: <><path d="M17.5 16H7a4.5 4.5 0 1 1 1.6-8.7A5.5 5.5 0 0 1 19 9.5a3.25 3.25 0 0 1-1.5 6.5Z" /><path d="M8 20h.01M12 20h.01M16 20h.01M10 22.5h.01M14 22.5h.01" /></>,
  fog: <><path d="M17.5 14H7a4.5 4.5 0 1 1 1.6-8.7A5.5 5.5 0 0 1 19 7.5a3.25 3.25 0 0 1-1.5 6.5Z" /><path d="M5 18h14M7 21h10" /></>,
  partly: <><path d="M8 3v1.5M3.6 4.6l1 1M2 9h1.5M12.4 4.6l-1 1" /><path d="M5.6 11.8a3.5 3.5 0 1 1 5.9-3.4" /><path d="M18 20H9.5a3.8 3.8 0 1 1 1.3-7.4A4.6 4.6 0 0 1 19.5 14a3 3 0 0 1-1.5 6Z" /></>,
  menu: <><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>,
  calendar: <><rect x="3.5" y="5" width="17" height="15.5" rx="3" /><path d="M3.5 10h17" /><path d="M8 3v4" /><path d="M16 3v4" /></>,
  list: <><path d="M9 6.5h11" /><path d="M9 12h11" /><path d="M9 17.5h11" /><circle cx="4.5" cy="6.5" r="1.2" /><circle cx="4.5" cy="12" r="1.2" /><circle cx="4.5" cy="17.5" r="1.2" /></>,
  pin: <><path d="M12 21s-6.5-6.2-6.5-11.2a6.5 6.5 0 0 1 13 0C18.5 14.8 12 21 12 21Z" /><circle cx="12" cy="9.8" r="2.3" /></>,
  trash: <><path d="M4 7h16" /><path d="M9 7V4.5h6V7" /><path d="M6.5 7l.9 12.2a1.5 1.5 0 0 0 1.5 1.3h6.2a1.5 1.5 0 0 0 1.5-1.3L17.5 7" /><path d="M10 11v6" /><path d="M14 11v6" /></>,
  cover: <><path d="M4 4h16v16H4z" /><path d="M4 9h16M8 20V9m8 11V9" /></>,
  door: <><path d="M5 21h14M7 21V3h10v18" /><path d="M13 12h.01" /></>,
  eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
  fan: <><path d="M12 12a2 2 0 1 0 0 .01" /><path d="M12 10c-1-4 1-7 3-7 3 0 4 4 1 7-1 1-2 2-4 2M14 12c4-1 7 1 7 3 0 3-4 4-7 1-1-1-2-2-2-4M12 14c1 4-1 7-3 7-3 0-4-4-1-7 1-1 2-2 4-2M10 12c-4 1-7-1-7-3 0-3 4-4 7-1 1 1 2 2 2 4" /></>,
  home: <><path d="m3 11 9-8 9 8" /><path d="M5 10v10h14V10M9 20v-6h6v6" /></>,
  grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
  kitchen: <><path d="M4 3v18M9 3v6a5 5 0 0 1-5 5M15 3v18M15 3c4 2 5 6 5 10h-5" /></>,
  light: <><path d="M9 18h6M10 22h4" /><path d="M8.5 14.5A6 6 0 1 1 15.5 14.5C14.5 15.2 14 16 14 18h-4c0-2-.5-2.8-1.5-3.5Z" /></>,
  lock: <><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
  media: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m10 9 5 3-5 3V9Z" /></>,
  moon: <path d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z" />,
  people: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
  power: <><path d="M12 2v10" /><path d="M18.4 6.6a9 9 0 1 1-12.8 0" /></>,
  refresh: <><path d="M20 11a8 8 0 1 0-2.3 5.7" /><path d="M20 4v7h-7" /></>,
  scene: <><path d="M3 18h18" /><path d="m5 18 4-7 3 4 3-6 4 9M17 4h.01" /></>,
  sensor: <><path d="M4.9 19.1a10 10 0 0 1 0-14.2M8.5 15.5a5 5 0 0 1 0-7" /><circle cx="12" cy="12" r="1" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" /></>,
  shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></>,
  sofa: <><path d="M5 12V8a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v4" /><path d="M4 11a2 2 0 0 0-2 2v5h20v-5a2 2 0 0 0-4 0v2H6v-2a2 2 0 0 0-2-2ZM6 18v2M18 18v2" /></>,
  star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />,
  stop: <rect x="7" y="7" width="10" height="10" rx="1" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></>,
  tv: <><rect x="2" y="7" width="20" height="15" rx="2" /><path d="m17 2-5 5-5-5" /></>,
  monitor: <><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></>,
  wifi: <><path d="M2 8.8a15 15 0 0 1 20 0M5 12.9a10 10 0 0 1 14 0M8.5 16.4a5 5 0 0 1 7 0" /><path d="M12 20h.01" /></>,
  router: <><rect x="2" y="14" width="20" height="8" rx="2" /><path d="M6 18h.01M10 18h.01M15 10v4M17.84 7.17a4 4 0 0 0-5.66 0M20.66 4.34a8 8 0 0 0-11.31 0" /></>,
  plug: <path d="M12 22v-5M9 8V2M15 8V2M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z" />,
  battery: <><rect x="2" y="7" width="16" height="10" rx="2" /><path d="M22 11v2M6 11v2M10 11v2" /></>,
  flame: <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5Z" />,
  wind: <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2M9.6 4.6A2 2 0 1 1 11 8H2M12.6 19.4A2 2 0 1 0 14 16H2" />,
  leaf: <><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" /><path d="M2 21c0-3 1.85-5.36 5.08-6" /></>,
  flower: <><circle cx="12" cy="12" r="3" /><path d="M12 9a3 3 0 1 1 0-6 3 3 0 0 1 0 6ZM12 15a3 3 0 1 1 0 6 3 3 0 0 1 0-6ZM9 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM15 12a3 3 0 1 1 6 0 3 3 0 0 1-6 0Z" /></>,
  paw: <><circle cx="11" cy="4" r="2" /><circle cx="18" cy="8" r="2" /><circle cx="20" cy="16" r="2" /><path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.05Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z" /></>,
  mail: <><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" /></>,
  package: <><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5M12 22V12" /></>,
  key: <><circle cx="7.5" cy="15.5" r="5.5" /><path d="m11.4 11.6 9.6-9.6M16 7l3 3M18.5 4.5l2 2" /></>,
  garage: <><path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z" /><path d="M6 22V10h12v12M6 14h12M6 18h12" /></>,
  window: <><rect x="4" y="3" width="16" height="18" rx="1" /><path d="M12 3v18M4 12h16" /></>,
  blinds: <><path d="M3 3h18M20 7H8M20 11H8M10 19h10M8 15h12M4 3v14" /><circle cx="4" cy="19" r="2" /></>,
  lamp: <path d="M8 2h8l4 10H4L8 2ZM12 12v6M8 22v-2a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2H8Z" />,
  coffee: <path d="M17 8h1a4 4 0 1 1 0 8h-1M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4ZM6 2v2M10 2v2M14 2v2" />,
  fridge: <path d="M5 6a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2ZM5 10h14M9 14v3M9 5v2" />,
  shower: <path d="m4 4 2.5 2.5M13.5 6.5a4.95 4.95 0 0 0-7 7M15 5 5 15M14 17v.01M10 16v.01M13 13v.01M16 10v.01M11 20v.01M17 14v.01M20 11v.01" />,
  wrench: <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94Z" />,
  dumbbell: <path d="m6.5 6.5 11 11M21 21l-1-1M3 3l1 1M18 22l4-4M2 6l4-4M3 10l7-7M14 21l7-7" />,
  book: <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />,
  heart: <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />,
  bike: <><circle cx="18.5" cy="17.5" r="3.5" /><circle cx="5.5" cy="17.5" r="3.5" /><circle cx="15" cy="5" r="1" /><path d="M12 17.5V14l-3-3 4-3 2 3h2" /></>,
  solar: <><rect x="3" y="8" width="18" height="12" rx="1" /><path d="M3 14h18M9 8v12M15 8v12M12 2v3" /></>,
  gate: <path d="M4 3 2 5v15c0 .6.4 1 1 1h2c.6 0 1-.4 1-1V5ZM6 8h4M6 18h4M12 3l-2 2v15c0 .6.4 1 1 1h2c.6 0 1-.4 1-1V5ZM14 8h4M14 18h4M20 3l-2 2v15c0 .6.4 1 1 1h2c.6 0 1-.4 1-1V5Z" />,
  umbrella: <path d="M22 12a10 10 0 0 0-20 0ZM12 12v8a2 2 0 0 0 4 0M12 2v1" />,
  robot: <><path d="M12 8V4H8" /><rect x="4" y="8" width="16" height="12" rx="2" /><path d="M2 14h2M20 14h2M15 13v2M9 13v2" /></>,
  gift: <><rect x="3" y="8" width="18" height="4" rx="1" /><path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5" /></>,
  switch: <><rect x="3" y="7" width="18" height="10" rx="5" /><circle cx="9" cy="12" r="3" /></>,
  volume: <><path d="M11 5 6 9H2v6h4l5 4V5Z" /><path d="M15.5 8.5a5 5 0 0 1 0 7M18 6a9 9 0 0 1 0 12" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  expand: <><path d="M15 3h6v6M9 21H3v-6" /><path d="m21 3-7 7M3 21l7-7" /></>,
  shrink: <><path d="M4 14h6v6M20 10h-6V4" /><path d="m14 10 7-7M3 21l7-7" /></>,
  pencil: <><path d="M17 3a2.8 2.8 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></>,
  check: <path d="m5 12 5 5L20 7" />,
  bath: <><path d="M4 12h16v3a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-3Z" /><path d="M6 12V5a2 2 0 0 1 3.5-1.3M7 20l-1 2M17 20l1 2" /></>,
  briefcase: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18" /></>,
  child: <><circle cx="12" cy="9" r="5" /><path d="M10 9h.01M14 9h.01M10.5 11.5a2 2 0 0 0 3 0M7 21a5 5 0 0 1 10 0" /></>,
  car: <><path d="M5 17h14v-5l-2-5H7l-2 5v5Z" /><path d="M3 12h18M7 17v2M17 17v2M7.5 14h.01M16.5 14h.01" /></>,
  play: <path d="M7 4.5v15l12.5-7.5Z" fill="currentColor" />,
  prev: <><path d="M6 5v14" /><path d="M19 5 9 12l10 7Z" fill="currentColor" /></>,
  next: <><path d="M18 5v14" /><path d="m5 5 10 7-10 7Z" fill="currentColor" /></>,
  shuffle: <><path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5" /></>,
  repeat: <><path d="m17 2 4 4-4 4" /><path d="M3 11v-1a4 4 0 0 1 4-4h14M7 22l-4-4 4-4" /><path d="M21 13v1a4 4 0 0 1-4 4H3" /></>,
  repeat1: <><path d="m17 2 4 4-4 4" /><path d="M3 11v-1a4 4 0 0 1 4-4h14M7 22l-4-4 4-4" /><path d="M21 13v1a4 4 0 0 1-4 4H3M11 10h1v4" /></>,
  note: <><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></>,
  speaker: <><rect x="5" y="2" width="14" height="20" rx="2" /><circle cx="12" cy="14" r="4" /><path d="M12 6h.01" /></>,
  grip: <><circle cx="9" cy="6" r="1.2" /><circle cx="15" cy="6" r="1.2" /><circle cx="9" cy="12" r="1.2" /><circle cx="15" cy="12" r="1.2" /><circle cx="9" cy="18" r="1.2" /><circle cx="15" cy="18" r="1.2" /></>,
  layout: <><rect x="3" y="4" width="18" height="16" rx="3" /><path d="M9 4v16M13 9h4M13 13h4" /></>,
  pause: <><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></>,
  tree: <><path d="M12 22v-6" /><path d="M12 2 6 10h3l-4 6h14l-4-6h3Z" /></>,
  camera: <><path d="M3 8.5A2.5 2.5 0 0 1 5.5 6h2l1.5-2h6l1.5 2h2A2.5 2.5 0 0 1 21 8.5v9a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5Z" /><circle cx="12" cy="12.5" r="3.5" /></>,
  vacuum: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3" /><path d="M8 5.8a7 7 0 0 1 8 0" /></>,
  button: <><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="3.5" fill="currentColor" /></>,
};

export function HDIcon({ name, size = 22 }: { name: IconName; size?: number }) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
    >
      {paths[name]}
    </svg>
  );
}

/** Icons offered for a room in Edit mode, besides the automatic one and the area's icon in Home Assistant. */
const EXTRA_ICONS: IconName[] = ["tv", "monitor", "wifi", "router", "plug", "battery", "flame", "wind", "leaf", "flower", "paw", "mail", "package", "key", "garage", "window", "blinds", "lamp", "coffee", "fridge", "shower", "wrench", "dumbbell", "book", "heart", "bike", "solar", "gate", "umbrella", "robot", "gift"];

export const ROOM_ICONS: IconName[] = ["home", "sofa", "bed", "kitchen", "dining", "bath", "briefcase", "child", "laundry", "car", "tree", "pool", "game", "stairs", "door", "media", "plant", "star", ...EXTRA_ICONS];

/** "ha" in a room's icon: the icon of its area in Home Assistant. */
export const HA_ICON = "ha";

/** A room's icon: the one chosen in Edit mode, the area's icon in Home Assistant, or (by default) a
 * guess from the room's name. */
export function RoomIcon({ room, size }: { room: { name: string; icon?: string | null; display_icon?: string }; size: number }) {
  const choice = room.display_icon;
  if (choice === HA_ICON && room.icon?.includes(":") && typeof customElements !== "undefined" && customElements.get("ha-icon")) {
    return <ha-icon class="hd-ha-icon" icon={room.icon} style={{ "--mdc-icon-size": `${size}px`, width: size, height: size, display: "inline-flex" } as CSSProperties} />;
  }
  const own = choice && choice !== HA_ICON && (ROOM_ICONS as string[]).includes(choice) ? (choice as IconName) : roomIcon(room.name);
  return <HDIcon name={own} size={size} />;
}

export function roomIcon(name: string): IconName {
  const normalized = name.toLowerCase();
  if (/bath|banheir|lavabo|baño|toilet|wc/.test(normalized)) return "bath";
  if (/office|escrit|estudo|study|oficina|despacho/.test(normalized)) return "briefcase";
  if (/kid|child|criança|infantil|bebê|bebe|baby|niñ/.test(normalized)) return "child";
  if (/garage|garagem|garaje|carro/.test(normalized)) return "car";
  if (/garden|jardim|jardín|quintal|varanda|balcony|terra[cç]|patio|pátio|exterior|outdoor/.test(normalized)) return "tree";
  if (/bed|quarto|dorm|habitación|suite|suíte/.test(normalized)) return "bed";
  if (/kitchen|cozinha|cocina/.test(normalized)) return "kitchen";
  if (/living|sala|lounge|estar/.test(normalized)) return "sofa";
  return "home";
}

/** Icons offered for a device's tile, in its details. */
/** Icons a page can have on the dock: the usual ones first, then the rooms' and the devices'. */
export const pageIconChoices = (): IconName[] => [...new Set<IconName>(["grid", "star", "scene", "list", ...ROOM_ICONS, ...DEVICE_ICONS])];
export const isIconName = (name: string): name is IconName => Object.prototype.hasOwnProperty.call(paths, name);

export const DEVICE_ICONS: IconName[] = ["light", "fan", "switch", "power", "cover", "door", "lock", "climate", "media", "speaker", "camera", "vacuum", "laundry", "kitchen", "car", "plant", "alarm", "bell", "sun", "moon", "pool", "star", "button", "sensor", ...EXTRA_ICONS];

/** A device's tile icon: its chosen HomeDeck icon, Home Assistant's own icon ("ha", when it has one),
 * or the icon of its type, as before. */
export function EntityIcon({ entity, size = 23 }: { entity: { domain: string; icon?: string | null; display_icon?: string }; size?: number }) {
  const choice = entity.display_icon;
  if (choice === HA_ICON && entity.icon?.includes(":") && typeof customElements !== "undefined" && customElements.get("ha-icon")) {
    return <ha-icon class="hd-ha-icon" icon={entity.icon} style={{ "--mdc-icon-size": `${size}px`, width: size, height: size, display: "inline-flex" } as CSSProperties} />;
  }
  const own = choice && choice !== HA_ICON && Object.prototype.hasOwnProperty.call(paths, choice) ? (choice as IconName) : domainIcon(entity.domain);
  return <HDIcon name={own} size={size} />;
}

export function domainIcon(domain: string): IconName {
  const icons: Record<string, IconName> = {
    binary_sensor: "sensor",
    button: "button",
    camera: "camera",
    climate: "climate",
    cover: "cover",
    fan: "fan",
    input_button: "button",
    input_select: "list",
    light: "light",
    lock: "lock",
    media_player: "media",
    scene: "scene",
    script: "play",
    select: "list",
    sensor: "sensor",
    switch: "switch",
    input_boolean: "switch",
    vacuum: "vacuum",
    alarm_control_panel: "alarm",
    plant: "plant",
  };
  return icons[domain] ?? "sensor";
}
