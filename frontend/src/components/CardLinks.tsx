import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { TranslationKey } from "../i18n";
import { RUNNABLE, SELECTS, runEntity, selectOption, selectOptions } from "../devices";
import { useCustomize } from "../personalize";
import { usePlan } from "../plan";
import type { DiscoveredEntity } from "../types/discovery";
import type { HomeAssistant } from "../types/home-assistant";
import { ConditionFields } from "./ConditionFields";
import { EntityPicker } from "./EntityPicker";
import { displayState } from "./EntityCard";
import { HDIcon, RoomIcon } from "./HDIcon";
import { HDSelect } from "./HDSelect";

// Double and large cards can carry 1 or 2 more devices in their free space: a room with its curtains,
// a washing machine's program with the script that starts it. Chosen in Edit mode, a tap on the card.

export const MAX_CARD_LINKS = 2;
const LINK_DOMAINS = ["cover", "light", "switch", "fan", "input_boolean", "lock", "select", "input_select", "script", "button", "input_button", "scene", "sensor", "binary_sensor"];
const SWITCHES = new Set(["light", "switch", "fan", "input_boolean"]);
const CONFIRM_MS = 3000;

function LinkedDevice({ entity, hass, label, language, t }: { entity: DiscoveredEntity; hass: HomeAssistant; label: string; language?: string; t: (key: TranslationKey) => string }) {
  const state = hass.states[entity.entity_id];
  const [asking, setAsking] = useState(false);
  useEffect(() => {
    if (!asking) return;
    const timer = window.setTimeout(() => setAsking(false), CONFIRM_MS);
    return () => window.clearTimeout(timer);
  }, [asking]);
  const off = !state || state.state === "unavailable";
  const domain = entity.domain;
  /** A protected device asks for a second tap here too. */
  const guarded = (action: () => void) => {
    if (entity.confirm && !asking) { setAsking(true); return; }
    setAsking(false);
    action();
  };
  const call = (service: string, service_domain = domain) => void hass.callService(service_domain, service, { entity_id: entity.entity_id }).catch(() => undefined);
  const name = <span className="hd-link__name">{asking ? t("confirmTapAgain") : label}</span>;

  if (domain === "cover") {
    return <div className="hd-link">{name}<span className="hd-link__buttons">
      <button aria-label={`${t("openCover")}: ${label}`} disabled={off} onClick={() => guarded(() => call("open_cover"))} type="button"><span className="rotate-up"><HDIcon name="chevron" size={16} /></span></button>
      <button aria-label={`${t("stopCover")}: ${label}`} disabled={off} onClick={() => guarded(() => call("stop_cover"))} type="button"><HDIcon name="stop" size={13} /></button>
      <button aria-label={`${t("closeCover")}: ${label}`} disabled={off} onClick={() => guarded(() => call("close_cover"))} type="button"><span className="rotate-down"><HDIcon name="chevron" size={16} /></span></button>
    </span></div>;
  }
  if (SWITCHES.has(domain)) {
    const on = state?.state === "on";
    return <div className="hd-link">{name}<button aria-label={`${label}: ${on ? t("turnOff") : t("turnOn")}`} aria-pressed={on} className={on ? "ls-switch ls-switch--on" : "ls-switch"} disabled={off} onClick={() => guarded(() => call("toggle", "homeassistant"))} type="button"><i /></button></div>;
  }
  if (domain === "lock") {
    const locked = state?.state === "locked";
    return <div className="hd-link">{name}<span className="hd-link__buttons"><button aria-label={`${label}: ${locked ? t("unlock") : t("lock")}`} disabled={off} onClick={() => guarded(() => call(locked ? "unlock" : "lock"))} type="button"><HDIcon name="lock" size={15} /></button></span></div>;
  }
  if (SELECTS.has(domain)) {
    return <div className="hd-link hd-link--select">{name}<HDSelect ariaLabel={`${t("chooseOption")}: ${label}`} className="device-select" onChange={(option) => void selectOption(hass, entity.entity_id, option).catch(() => undefined)} options={selectOptions(state).map((option) => ({ label: option, value: option }))} value={state?.state ?? ""} /></div>;
  }
  if (RUNNABLE.has(domain) || domain === "scene") {
    const run = () => guarded(() => { if (domain === "scene") call("turn_on"); else void runEntity(hass, entity.entity_id).catch(() => undefined); });
    return <button className="hd-link__run" disabled={off} onClick={run} type="button"><HDIcon name="play" size={14} /><span>{asking ? t("confirmTapAgain") : label}</span></button>;
  }
  return <div className="hd-link">{name}<b className="hd-link__value">{displayState(state, entity, t, language)}</b></div>;
}

/** The extra devices of a double or large card, each with the control its kind needs. */
export function CardLinks({ hass, itemKey, language, t }: { hass: HomeAssistant; itemKey: string; language?: string; t: (key: TranslationKey) => string }) {
  const customize = useCustomize();
  const linked = (customize?.linksFor(itemKey) ?? []).map((id) => customize?.lookup(id)).filter((entity): entity is DiscoveredEntity => Boolean(entity));
  if (linked.length === 0) return null;
  return <div className="hd-links">{linked.map((entity) => <LinkedDevice entity={entity} hass={hass} key={entity.entity_id} label={customize?.linkName(itemKey, entity.entity_id) || entity.name} language={language} t={t} />)}</div>;
}

/** The name shown inside the card: free to change, empty means the device's own. Saved when leaving the field. */
function LinkNameField({ deviceName, name, onName, t }: { deviceName: string; name: string; onName: (name: string) => void; t: (key: TranslationKey) => string }) {
  const [draft, setDraft] = useState(name);
  useEffect(() => setDraft(name), [name]);
  const commit = () => { if (draft.trim() !== name) onName(draft); };
  return <input aria-label={`${t("cardLinkName")}: ${deviceName}`} maxLength={40} onBlur={commit} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); }} placeholder={deviceName} type="text" value={draft} />;
}

/** Edit mode: choosing the extra devices of a card. */
export function CardLinksEditor({ itemKey, language, ownId, t }: { itemKey: string; language?: string; ownId?: string; t: (key: TranslationKey) => string }) {
  const customize = useCustomize();
  const [picking, setPicking] = useState(false);
  const row = useRef<HTMLDivElement>(null);
  if (!customize) return null;
  const ids = customize.linksFor(itemKey);
  const toggle = (id: string) => {
    if (ids.includes(id)) customize.setLinkName(itemKey, id, "");
    customize.setLinks(itemKey, ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id].slice(-MAX_CARD_LINKS));
  };
  // Over the whole panel: inside the sheet it would be cut to the sheet's size.
  const shell = row.current?.closest(".app-shell");
  return <div className="room-options__row hd-links-editor" ref={row}>
    <span className="eyebrow">{t("cardLinks")}</span>
    <small>{t("cardLinksHint")}</small>
    {ids.map((id) => <div className="hd-links-editor__item" key={id}><LinkNameField deviceName={customize.lookup(id)?.name ?? id} name={customize.linkName(itemKey, id)} onName={(name) => customize.setLinkName(itemKey, id, name)} t={t} /><button aria-label={`${t("removeItem")}: ${customize.lookup(id)?.name ?? id}`} onClick={() => toggle(id)} type="button"><HDIcon name="minus" size={14} /></button></div>)}
    {ids.length < MAX_CARD_LINKS && <button className="hd-pill" onClick={() => setPicking(true)} type="button"><HDIcon name="plus" size={16} />{t("cardLinksAdd")}</button>}
    {picking && shell && createPortal(<EntityPicker domains={LINK_DOMAINS} filter={(entity) => entity.entity_id !== ownId} language={language} onClose={() => setPicking(false)} onToggle={toggle} rooms={customize.rooms()} selected={ids} t={t} title={t("cardLinksAdd")} />, shell)}
  </div>;
}

/** Edit mode: the rules for when this card shows (a device on or off, a time window, weekdays). */
export function ConditionEditor({ entity, hass, t }: { entity: DiscoveredEntity; hass: HomeAssistant; t: (key: TranslationKey) => string }) {
  const customize = useCustomize();
  if (!customize) return null;
  return <div className="room-options__row hd-links-editor">
    <span className="eyebrow">{t("showWhen")}</span>
    <small>{t("showWhenHint")}</small>
    <ConditionFields exclude={entity.entity_id} hass={hass} onChange={(visible_when) => customize.setEntity(entity.entity_id, { visible_when })} t={t} value={entity.visible_when} />
  </div>;
}

/** Edit mode, for administrators: which people see this card or room. Everyone by default. */
export function AudienceEditor({ hass, itemKey, t }: { hass: HomeAssistant; itemKey: string; t: (key: TranslationKey) => string }) {
  const customize = useCustomize();
  const plan = usePlan();
  if (!customize || !hass.user?.is_admin) return null;
  const people = Object.values(hass.states).filter((state) => state.entity_id.startsWith("person.") && typeof state.attributes.user_id === "string");
  if (people.length === 0) return null;
  const hidden = customize.hiddenFor(itemKey);
  return <div className="room-options__row hd-links-editor">
    <span className="eyebrow">{t("whoCanSee")}</span>
    <div className="hd-audience" role="group" aria-label={t("whoCanSee")}>
      {people.map((person) => {
        const id = String(person.attributes.user_id);
        const can = !hidden.includes(id);
        return <button aria-pressed={can} key={id} onClick={() => (plan.pro ? customize.setHiddenFor(itemKey, id, can) : plan.upsell("feature"))} type="button">{!plan.pro && <HDIcon name="lock" size={12} />}{String(person.attributes.friendly_name ?? person.entity_id)}</button>;
      })}
    </div>
    <small>{t("whoCanSeeHint")}</small>
  </div>;
}

/** Edit mode, a tap on a room card: who can see it and, at double or large size, its extra devices. */
export function RoomCardSheet({ hass, linkable, onClose, roomId, t }: { hass: HomeAssistant; linkable: boolean; onClose: () => void; roomId: string; t: (key: TranslationKey) => string }) {
  const customize = useCustomize();
  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [onClose]);
  const room = customize?.rooms().find((item) => item.id === roomId);
  if (!room) return null;
  return <div aria-label={room.name} aria-modal="true" className="hd-sheet-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }} role="dialog">
    <section className="hd-sheet hd-detail">
      <header className="hd-detail__header">
        <span className="hd-detail__icon"><RoomIcon room={room} size={24} /></span>
        <div><span className="eyebrow">{t("deviceOptions")}</span><h2>{room.id === "__unassigned__" ? t("unassigned") : room.name}</h2></div>
        <button aria-label={t("close")} className="hd-close" onClick={onClose} type="button"><HDIcon name="close" size={20} /></button>
      </header>
      <section className="room-options hd-detail__options">{linkable && <CardLinksEditor itemKey={`room:${roomId}`} t={t} />}<AudienceEditor hass={hass} itemKey={`room:${roomId}`} t={t} /></section>
    </section>
  </div>;
}
