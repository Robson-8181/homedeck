// Keeps a wall screen on. On an Echo Show the Silk browser closes itself after a while unless some
// media is playing (the idea behind "Keep Silk Open"), so a silent sound made on the device itself
// loops in the background; and where the browser allows it, a screen wake lock keeps the display lit.
// Chosen per device: "auto" (only in Silk, the Echo Show browser), "on" or "off".

export type KeepAwakeMode = "auto" | "on" | "off";

export const isSilk = () => typeof navigator !== "undefined" && /silk/i.test(navigator.userAgent);

export function keepAwakeWanted(mode: KeepAwakeMode): boolean {
  return mode === "on" || (mode === "auto" && isSilk());
}

/** Pure digital silence (16-bit, every sample zero), so it never hisses. */
function silentWav(seconds = 8, rate = 22050): string {
  const samples = seconds * rate, bytes = samples * 2, buffer = new ArrayBuffer(44 + bytes), view = new DataView(buffer);
  const text = (offset: number, value: string) => { for (let index = 0; index < value.length; index++) view.setUint8(offset + index, value.charCodeAt(index)); };
  text(0, "RIFF"); view.setUint32(4, 36 + bytes, true); text(8, "WAVE"); text(12, "fmt ");
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
  view.setUint32(24, rate, true); view.setUint32(28, rate * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true);
  text(36, "data"); view.setUint32(40, bytes, true);
  return URL.createObjectURL(new Blob([buffer], { type: "audio/wav" }));
}

const UNLOCK_EVENTS = ["pointerdown", "touchstart", "keydown", "click"] as const;

/** Starts keeping the screen on; returns the function that stops it. */
export function startKeepAwake(): () => void {
  const audio = document.createElement("audio");
  audio.src = silentWav();
  audio.loop = true;
  audio.muted = true;
  audio.autoplay = true;
  audio.setAttribute("playsinline", "");
  audio.style.cssText = "position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;left:0;bottom:0";
  audio.addEventListener("ended", () => { audio.currentTime = 0; void audio.play().catch(() => undefined); });
  document.body.appendChild(audio);
  void audio.play().catch(() => undefined);

  // Browsers only play with sound after a touch; the sound is silence, at a low volume anyway.
  const unlock = () => {
    audio.muted = false;
    audio.volume = 0.05;
    void audio.play().then(() => UNLOCK_EVENTS.forEach((name) => window.removeEventListener(name, unlock, true))).catch(() => undefined);
  };
  UNLOCK_EVENTS.forEach((name) => window.addEventListener(name, unlock, true));

  // If the sound stops for any reason, it starts again.
  const guard = window.setInterval(() => { if (audio.paused) void audio.play().catch(() => undefined); }, 30_000);

  // The screen stays lit where the browser allows it (the lock is lost when the page is hidden).
  let lock: { release: () => Promise<void> } | null = null;
  const wake = async () => {
    try {
      const wakeLock = (navigator as Navigator & { wakeLock?: { request: (type: "screen") => Promise<{ release: () => Promise<void> }> } }).wakeLock;
      if (wakeLock && document.visibilityState === "visible") lock = await wakeLock.request("screen");
    } catch { /* not allowed here */ }
  };
  const onVisible = () => { if (document.visibilityState === "visible") { void wake(); if (audio.paused) void audio.play().catch(() => undefined); } };
  document.addEventListener("visibilitychange", onVisible);
  void wake();

  return () => {
    window.clearInterval(guard);
    document.removeEventListener("visibilitychange", onVisible);
    UNLOCK_EVENTS.forEach((name) => window.removeEventListener(name, unlock, true));
    try { audio.pause(); URL.revokeObjectURL(audio.src); audio.remove(); } catch { /* already gone */ }
    void lock?.release().catch(() => undefined);
    lock = null;
  };
}
