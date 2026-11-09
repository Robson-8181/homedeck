import { useEffect, useRef, useState } from "react";
import type { TranslationKey } from "../i18n";
import type { HassEntity, HomeAssistant } from "../types/home-assistant";
import { HDIcon, domainIcon, type IconName } from "./HDIcon";

// Notices beside the presence avatars: entities chosen in Settings → Home (a mailbox, the garage
// door, the doorbell...) show up as small chips only while there is something to notice, so the
// header stays clean the rest of the time. A tap opens Home Assistant's own details.

/** How long an event (a doorbell ring, a button press) stays as a notice. */
const RECENT_MS = 30 * 60 * 1000;
const QUIET = new Set(["off", "closed", "locked", "idle", "standby", "unavailable", "unknown", "none", "false", "0", "", "not_home", "disarmed", "docked", "clear", "ok"]);

export interface Notice { id: string; name: string; detail: string; state: HassEntity }

/** When a timestamp-like state is recent, the minutes since it; null when it isn't a time. */
function minutesAgo(value: string, now: number): number | null {
  if (!/^\d{4}-\d{2}-\d{2}T/.test(value)) return null;
  const at = Date.parse(value);
  return Number.isFinite(at) ? Math.max(0, Math.round((now - at) / 60000)) : null;
}

/** The notice for one entity, or null while it has nothing to say. */
export function noticeFor(state: HassEntity | undefined, now: number, t: (key: TranslationKey) => string): Notice | null {
  if (!state) return null;
  const domain = state.entity_id.split(".")[0];
  const name = String(state.attributes.friendly_name ?? state.entity_id.split(".")[1].replaceAll("_", " "));
  const value = String(state.state ?? "").trim();
  const ago = minutesAgo(value, now);
  // Events (doorbells, buttons) and timestamp sensors: only for a while after they happen.
  if (ago != null || domain === "event") {
    if (ago == null || ago * 60000 > RECENT_MS) return null;
    return { id: state.entity_id, name, detail: ago < 1 ? t("justNow") : t("minutesAgo").replace("{minutes}", String(ago)), state };
  }
  if (QUIET.has(value.toLowerCase())) return null;
  const number = Number(value);
  if (value !== "" && Number.isFinite(number)) {
    if (number <= 0) return null;
    const unit = typeof state.attributes.unit_of_measurement === "string" ? ` ${state.attributes.unit_of_measurement}` : "";
    return { id: state.entity_id, name, detail: `${value}${unit}`, state };
  }
  // On, open, detected, unlocked, playing... the name says it; other texts are shown as they are.
  const plain = ["on", "open", "opening", "unlocked", "detected", "home", "playing", "triggered", "true"].includes(value.toLowerCase());
  return { id: state.entity_id, name, detail: plain ? "" : value, state };
}

function fallbackIcon(state: HassEntity): IconName {
  const domain = state.entity_id.split(".")[0];
  const deviceClass = String(state.attributes.device_class ?? "");
  if (domain === "event" || deviceClass === "doorbell") return "bell";
  if (["door", "garage_door", "opening", "window"].includes(deviceClass)) return "door";
  if (["motion", "occupancy", "presence"].includes(deviceClass)) return "people";
  if (["moisture"].includes(deviceClass)) return "drop";
  return domainIcon(domain);
}

/** Home Assistant's own icon for the entity (mailbox, garage...), or HomeDeck's when it isn't there. */
function NoticeIcon({ hass, state }: { hass: HomeAssistant; state: HassEntity }) {
  const ref = useRef<HTMLElement & { hass?: unknown; stateObj?: unknown }>(null);
  const native = typeof customElements !== "undefined" && Boolean(customElements.get("ha-state-icon"));
  useEffect(() => {
    if (!ref.current) return;
    ref.current.hass = hass;
    ref.current.stateObj = state;
  });
  return native ? <ha-state-icon class="hd-notice__icon" ref={ref} /> : <span className="hd-notice__icon"><HDIcon name={fallbackIcon(state)} size={16} /></span>;
}

/** Re-renders every minute, so "5 min ago" moves and old events go away. */
function useMinute(): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  return now;
}

export function HeaderBadges({ hass, ids, t }: { hass: HomeAssistant; ids: string[]; t: (key: TranslationKey) => string }) {
  const now = useMinute();
  const notices = ids.map((id) => noticeFor(hass.states[id], now, t)).filter((notice): notice is Notice => Boolean(notice));
  if (notices.length === 0) return null;
  const open = (element: HTMLElement, entityId: string) => element.dispatchEvent(new CustomEvent("hass-more-info", { bubbles: true, composed: true, detail: { entityId } }));
  return <div className="hd-notices" role="status">
    {notices.map((notice) => <button className="hd-notice" key={notice.id} onClick={(event) => open(event.currentTarget, notice.id)} title={notice.detail ? `${notice.name}: ${notice.detail}` : notice.name} type="button">
      <NoticeIcon hass={hass} state={notice.state} />
      <span className="hd-notice__name">{notice.name}</span>
      {notice.detail && <small>{notice.detail}</small>}
    </button>)}
  </div>;
}
