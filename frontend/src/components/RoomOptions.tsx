import { useState, type ReactNode } from "react";
import type { TranslationKey } from "../i18n";
import { isTemperatureSensor, useCustomize } from "../personalize";
import type { Room } from "../types/discovery";
import type { HomeAssistant } from "../types/home-assistant";
import { HA_ICON, HDIcon, isIconName, pageIconChoices, ROOM_ICONS, RoomIcon, roomIcon, type IconName } from "./HDIcon";
import { HDSelect } from "./HDSelect";
import { AudienceEditor } from "./CardLinks";

/** The row of icons for a page, shown in Edit mode on the page and in Settings → Navigation. */
export function PageIconPicker({ onPick, t, value }: { onPick: (icon: string) => void; t: (key: TranslationKey) => string; value: string }) {
  return <div className="room-options__icons" role="radiogroup" aria-label={t("pageIconLabel")}>
    {pageIconChoices().map((icon) => <button aria-checked={value === icon} aria-label={icon} key={icon} onClick={() => onPick(icon)} role="radio" type="button"><HDIcon name={icon} size={18} /></button>)}
  </div>;
}

/** One button with the page's icon; the choices only open when it is tapped. */
export function PageIconButton({ fallback, onPick, t, value }: { fallback: IconName; onPick: (icon: string) => void; t: (key: TranslationKey) => string; value?: string }) {
  const [open, setOpen] = useState(false);
  const current = value && isIconName(value) ? value : fallback;
  return <>
    <div className="room-options__icons"><button aria-expanded={open} aria-label={t("pageIconLabel")} onClick={() => setOpen((was) => !was)} type="button"><HDIcon name={current} size={18} /></button></div>
    {open && <PageIconPicker onPick={(icon) => { onPick(icon); setOpen(false); }} t={t} value={current} />}
  </>;
}

/** An icon choice that stays closed: one button with the current icon, and the choices only after a tap. */
export function IconChooser({ action, children, current, label }: { action: string; children: ReactNode; current: ReactNode; label: string }) {
  const [open, setOpen] = useState(false);
  return <>
    <div className="room-options__icons"><button aria-expanded={open} aria-label={`${label}: ${action}`} className="room-options__auto" onClick={() => setOpen((was) => !was)} type="button">{current}<span>{action}</span></button></div>
    {open && <div aria-label={label} className="room-options__icons" onClick={(event) => { if ((event.target as HTMLElement).closest("button")) setOpen(false); }} role="radiogroup">{children}</div>}
  </>;
}

/** Edit mode, on a room: its icon and the sensor that gives its temperature. "Automatic" keeps the
 * icon guessed from the name and the temperature of the climate device, as before. */
export function RoomOptions({ allRooms, hass, room, t }: { allRooms: Room[]; hass: HomeAssistant; room: Room; t: (key: TranslationKey) => string }) {
  const customize = useCustomize();
  if (!customize || room.id === "__unassigned__") return null;
  const chosen = room.display_icon ?? "";
  const areaIcon = room.icon && room.icon.includes(":") && typeof customElements !== "undefined" && customElements.get("ha-icon") ? room.icon : null;
  // The room's own temperature sensors first, then the others with their room's name.
  const own = new Set(room.entities.map((entity) => entity.entity_id));
  const sensors = allRooms.flatMap((item) => item.entities.map((entity) => ({ entity, room: item })))
    .filter(({ entity }) => isTemperatureSensor(hass.states[entity.entity_id]))
    .sort((a, b) => Number(own.has(b.entity.entity_id)) - Number(own.has(a.entity.entity_id)) || a.entity.name.localeCompare(b.entity.name));
  const options = [
    { label: t("temperatureAuto"), value: "" },
    ...sensors.map(({ entity, room: item }) => ({ label: own.has(entity.entity_id) ? entity.name : `${entity.name} · ${item.name}`, value: entity.entity_id })),
  ];
  const pick = (icon: string) => customize.setRoom(room.id, { icon });

  return <section className="room-options" aria-label={t("roomOptions")}>
    <div className="room-options__row">
      <span className="eyebrow">{t("roomIcon")}</span>
      <IconChooser current={chosen === HA_ICON && areaIcon ? <RoomIcon room={{ ...room, display_icon: HA_ICON }} size={18} /> : <HDIcon name={chosen && chosen !== HA_ICON && isIconName(chosen) ? chosen : roomIcon(room.name)} size={18} />} action={t("changeIcon")} label={t("roomIcon")}>
        <button aria-checked={chosen === ""} aria-label={t("iconAuto")} className="room-options__auto" onClick={() => pick("")} role="radio" type="button"><HDIcon name={roomIcon(room.name)} size={18} /><span>{t("iconAuto")}</span></button>
        {areaIcon && <button aria-checked={chosen === HA_ICON} aria-label={t("iconFromArea")} className="room-options__auto" onClick={() => pick(HA_ICON)} role="radio" type="button"><RoomIcon room={{ ...room, display_icon: HA_ICON }} size={18} /><span>{t("iconFromArea")}</span></button>}
        {ROOM_ICONS.map((icon) => <button aria-checked={chosen === icon} aria-label={icon} key={icon} onClick={() => pick(icon)} role="radio" type="button"><HDIcon name={icon} size={18} /></button>)}
      </IconChooser>
    </div>
    <label className="room-options__row">
      <span className="eyebrow">{t("roomTemperature")}</span>
      <HDSelect ariaLabel={t("roomTemperature")} className="room-options__select" onChange={(temperature) => customize.setRoom(room.id, { temperature })} options={options} value={room.temperature_entity ?? ""} />
    </label>
    <AudienceEditor hass={hass} itemKey={`room:${room.id}`} t={t} />
  </section>;
}
