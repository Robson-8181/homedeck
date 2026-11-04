/// <reference types="vite/client" />

import type { CSSProperties } from "react";

// Home Assistant's own icon element, used for an area's icon (mdi:…) inside the panel.
declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "ha-icon": { class?: string; icon?: string; style?: CSSProperties };
    }
  }
}
