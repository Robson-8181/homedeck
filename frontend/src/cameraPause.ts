import { useSyncExternalStore } from "react";

// Live video on the cards stops while nobody is watching them: the screensaver is up, a camera is open
// in full, or HomeDeck itself is not the panel on screen. Each cause sets and clears its own reason.

const reasons = new Set<string>();
const listeners = new Set<() => void>();

export function pauseCameras(reason: string, paused: boolean): void {
  if (paused === reasons.has(reason)) return;
  if (paused) reasons.add(reason); else reasons.delete(reason);
  listeners.forEach((listener) => listener());
}

const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };

export const useCamerasPaused = () => useSyncExternalStore(subscribe, () => reasons.size > 0);

/** Given to an MJPEG image as it goes away, to close its connection (see MjpegImage). */
export const BLANK_IMAGE = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";
