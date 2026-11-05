/// <reference types="vite/client" />

import type { CSSProperties, Ref } from "react";

// Home Assistant's own elements: the icon (an area's mdi:… icon) and the camera player (WebRTC / HLS).
declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "ha-icon": { class?: string; icon?: string; style?: CSSProperties };
      "ha-camera-stream": { class?: string; ref?: Ref<HTMLElement & Record<string, unknown>> };
    }
  }
}
