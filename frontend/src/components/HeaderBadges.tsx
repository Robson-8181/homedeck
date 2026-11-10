import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { TranslationKey } from "../i18n";
import { conditionMet, useCustomize, useMinute } from "../personalize";
import { usePlan } from "../plan";
import type { HomeDeckCondition } from "../types/config";
import type { DiscoveredEntity } from "../types/discovery";
import type { HassEntity, HomeAssistant } from "../types/home-assistant";
import { EntityModal } from "./EntityModal";
import { HDIcon, domainIcon, type IconName } from "./HDIcon";

// Notices beside the presence avatars: entities chosen in Settings → Home (a mailbox, the garage
// door, the doorbell...) show up as small chips only while there is something to notice, so the
// header stays clean the rest of the time. A tap opens HomeDeck's own details.

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

export function HeaderBadges({ hass, ids, language, rules, styles, t, texts }: { hass: HomeAssistant; ids: string[]; language?: string; rules?: Record<string, HomeDeckCondition>; styles?: Record<string, "icon" | "text">; t: (key: TranslationKey) => string; texts?: Record<string, string> }) {
  const now = useMinute();
  const customize = useCustomize();
  const [opened, setOpened] = useState<{ id: string; shell: Element } | null>(null);
  const { pro } = usePlan();
  const notices = ids.filter((id) => !pro || conditionMet(rules?.[id], hass.states, new Date(now))).map((id) => noticeFor(hass.states[id], now, t)).filter((notice): notice is Notice => Boolean(notice));
  // Over the whole panel, and it stays open if the notice goes away while it is being looked at.
  const details = opened && createPortal(<EntityModal entity={entityFor(opened.id, hass, customize?.lookup(opened.id))} hass={hass} language={language} onClose={() => setOpened(null)} t={t} />, opened.shell);
  if (notices.length === 0) return details || null;
  return <div className="hd-notices" role="status">
    {notices.map((notice) => {
      const label = texts?.[notice.id] || notice.name;
      const style = styles?.[notice.id];
      const full = notice.detail ? `${label}: ${notice.detail}` : label;
      return <button aria-label={full} className={`hd-notice ${style ? `hd-notice--${style}` : ""}`} key={notice.id} onClick={(event) => { const shell = event.currentTarget.closest(".app-shell"); if (shell) setOpened({ id: notice.id, shell }); }} title={full} type="button">
        {style !== "text" && <NoticeIcon hass={hass} state={notice.state} />}
        {style !== "icon" && <span className="hd-notice__name">{label}</span>}
        {style !== "icon" && notice.detail && <small>{notice.detail}</small>}
      </button>;
    })}
    {details}
  </div>;
}

/** The device as HomeDeck knows it, or a plain description for entities outside the panel's rooms. */
function entityFor(id: string, hass: HomeAssistant, known?: DiscoveredEntity): DiscoveredEntity {
  if (known) return known;
  const attributes = hass.states[id]?.attributes ?? {};
  return { entity_id: id, domain: id.split(".")[0], name: String(attributes.friendly_name ?? id), area_id: "", device_id: null, device_class: typeof attributes.device_class === "string" ? attributes.device_class : null, icon: null };
}
