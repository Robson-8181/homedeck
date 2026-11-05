import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { TranslationKey } from "../i18n";
import type { HomeDeckConfig } from "../types/config";
import type { DiscoveredEntity } from "../types/discovery";
import type { HassEntity, HomeAssistant } from "../types/home-assistant";
import { CameraLive } from "./EntityModal";
import { HDIcon } from "./HDIcon";

// The doorbell pop-up (Pro, off by default): when the chosen doorbell rings, the camera's live view
// covers the panel, above the screensaver, and closes by itself after a while.

const DOORBELL_NAME = /door ?bell|ding|ring|visitor|chime|campainha|timbre|klingel|dzwonek|interfone|intercom/i;

/** Entities that can say "someone rang": doorbell events first, then sensors named like a doorbell. */
export function doorbellCandidates(hass: HomeAssistant): HassEntity[] {
  const score = (state: HassEntity) => {
    const domain = state.entity_id.split(".")[0];
    const named = DOORBELL_NAME.test(`${state.entity_id} ${String(state.attributes.friendly_name ?? "")}`);
    if (domain === "event" && state.attributes.device_class === "doorbell") return 0;
    if (named && (domain === "event" || domain === "binary_sensor")) return 1;
    if (domain === "event") return 2;
    if (domain === "binary_sensor" && ["occupancy", "motion", "sound"].includes(String(state.attributes.device_class))) return 3;
    if (named && domain === "input_boolean") return 3;
    return 9;
  };
  return Object.values(hass.states)
    .map((state) => ({ state, rank: score(state) }))
    .filter(({ rank }) => rank < 9)
    .sort((a, b) => a.rank - b.rank || a.state.entity_id.localeCompare(b.state.entity_id))
    .map(({ state }) => state)
    .slice(0, 150);
}

export function cameraIds(hass: HomeAssistant): string[] {
  return Object.keys(hass.states).filter((id) => id.startsWith("camera.")).sort();
}

/** The camera that belongs to the doorbell: the same device, else the first camera with a doorbell name. */
export function guessDoorbellCamera(hass: HomeAssistant, trigger: string): string {
  const device = hass.entities?.[trigger]?.device_id;
  const cameras = cameraIds(hass);
  return (device ? cameras.find((id) => hass.entities?.[id]?.device_id === device) : undefined)
    ?? cameras.find((id) => DOORBELL_NAME.test(`${id} ${String(hass.states[id]?.attributes.friendly_name ?? "")}`))
    ?? cameras[0] ?? "";
}

/** Calls `onRing` each time the doorbell rings: a new event, or a sensor turning on. Not on load. */
export function useDoorbell(hass: HomeAssistant, doorbell: HomeDeckConfig["doorbell"] | undefined, onRing: () => void): void {
  const trigger = doorbell?.enabled ? doorbell.trigger : "";
  const state = trigger ? hass.states[trigger]?.state : undefined;
  const previous = useRef<{ trigger: string; state: string | undefined } | null>(null);
  useEffect(() => {
    const before = previous.current;
    previous.current = { trigger, state };
    if (!trigger || !before || before.trigger !== trigger || state === before.state) return;
    if (state == null || ["unavailable", "unknown"].includes(state)) return;
    const rang = trigger.startsWith("event.") ? before.state != null && !["unavailable", "unknown"].includes(before.state) : state === "on";
    if (rang) onRing();
  }, [trigger, state]);
}

export function DoorbellPopup({ camera, hass, onClose, seconds, t }: { camera: string; hass: HomeAssistant; onClose: () => void; seconds: number; t: (key: TranslationKey) => string }) {
  useEffect(() => {
    const timer = window.setTimeout(onClose, Math.max(10, seconds) * 1000);
    const key = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", key);
    return () => { window.clearTimeout(timer); window.removeEventListener("keydown", key); };
  }, [seconds, onClose]);
  // Drawn at the panel's root: a parent with a blur or a transform (a settings panel, a card) would
  // otherwise hold a fixed element inside itself instead of the whole screen.
  const anchor = useRef<HTMLSpanElement>(null);
  const [shell, setShell] = useState<Element | null>(null);
  useEffect(() => { setShell(anchor.current?.closest(".app-shell") ?? null); }, []);
  const state = hass.states[camera];
  const entity: DiscoveredEntity = { entity_id: camera, domain: "camera", name: String(state?.attributes.friendly_name ?? camera), area_id: "", device_id: null, device_class: null, icon: null };
  if (!shell) return <span hidden ref={anchor} />;
  return createPortal(<div aria-label={t("doorbellRinging")} aria-modal="true" className="hd-doorbell" onClick={onClose} role="dialog">
    <div className="hd-doorbell__panel" onClick={(event) => event.stopPropagation()}>
      <header>
        <span className="hd-doorbell__icon"><HDIcon name="bell" size={22} /></span>
        <div><strong>{t("doorbellRinging")}</strong>{state && <small>{entity.name}</small>}</div>
        <button aria-label={t("close")} onClick={onClose} type="button"><HDIcon name="close" size={20} /></button>
      </header>
      {state ? <CameraLive entity={entity} hass={hass} t={t} /> : <p className="hd-doorbell__none">{t("doorbellNoCamera")}</p>}
    </div>
  </div>, shell);
}
