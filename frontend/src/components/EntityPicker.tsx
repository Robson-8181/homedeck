import { useEffect, useMemo, useState } from "react";
import { domainLabel, type TranslationKey } from "../i18n";
import type { DiscoveredEntity, Room } from "../types/discovery";
import { domainIcon, HDIcon } from "./HDIcon";

interface EntityPickerProps {
  domains?: string[];
  /** Extra rule on top of domains, e.g. only security-related binary sensors. */
  filter?: (entity: DiscoveredEntity) => boolean;
  language?: string;
  onClose: () => void;
  onToggle: (entityId: string) => void;
  rooms: Room[];
  selected: string[];
  t: (key: TranslationKey) => string;
  title?: string;
}

export function EntityPicker({ domains, filter, language, onClose, onToggle, rooms, selected, t, title }: EntityPickerProps) {
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLocaleLowerCase();
  const groups = useMemo(() => rooms.map((room) => ({
    room,
    entities: room.entities.filter((entity) => (!domains || domains.includes(entity.domain)) && (!filter || filter(entity))
      && (!normalized || `${entity.name} ${entity.entity_id} ${room.name}`.toLocaleLowerCase().includes(normalized))),
  })).filter((group) => group.entities.length > 0), [domains, filter, normalized, rooms]);

  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [onClose]);

  return <div aria-label={title ?? t("addDevices")} aria-modal="true" className="hd-sheet-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }} role="dialog">
    <section className="hd-sheet hd-picker">
      <header className="hd-sheet__header">
        <div><span className="eyebrow">{t("addItem")}</span><h2>{title ?? t("addDevices")}</h2></div>
        <button className="hd-sheet__close" onClick={onClose} type="button">{t("doneEditing")}</button>
      </header>
      <label className="hd-search"><HDIcon name="search" size={18} /><input autoFocus onChange={(event) => setQuery(event.target.value)} placeholder={t("searchDevices")} type="search" value={query} /></label>
      <div className="hd-picker__list">
        {groups.length === 0 && <p className="hd-picker__empty">{t("noResults")}</p>}
        {groups.map(({ room, entities }) => <section key={room.id}>
          <span className="eyebrow">{room.id === "__unassigned__" ? t("unassigned") : room.name}</span>
          {entities.map((entity) => {
            const on = selected.includes(entity.entity_id);
            return <button aria-pressed={on} className={on ? "hd-picker__row hd-picker__row--on" : "hd-picker__row"} key={entity.entity_id} onClick={() => onToggle(entity.entity_id)} type="button">
              <span className="hd-picker__icon"><HDIcon name={domainIcon(entity.domain)} size={18} /></span>
              <span className="hd-picker__copy"><strong>{entity.name}</strong><small>{domainLabel(entity.domain, language)}</small></span>
              <span className="hd-picker__check">{on && <HDIcon name="check" size={16} />}</span>
            </button>;
          })}
        </section>)}
      </div>
    </section>
  </div>;
}
