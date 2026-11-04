import type { TranslationKey } from "../i18n";
import { isTemperatureSensor, useCustomize } from "../personalize";
import type { Room } from "../types/discovery";
import type { HomeAssistant } from "../types/home-assistant";
import { HA_ICON, HDIcon, ROOM_ICONS, RoomIcon, roomIcon } from "./HDIcon";
import { HDSelect } from "./HDSelect";

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
      <div className="room-options__icons" role="radiogroup" aria-label={t("roomIcon")}>
        <button aria-checked={chosen === ""} aria-label={t("iconAuto")} className="room-options__auto" onClick={() => pick("")} role="radio" type="button"><HDIcon name={roomIcon(room.name)} size={18} /><span>{t("iconAuto")}</span></button>
        {areaIcon && <button aria-checked={chosen === HA_ICON} aria-label={t("iconFromArea")} className="room-options__auto" onClick={() => pick(HA_ICON)} role="radio" type="button"><RoomIcon room={{ ...room, display_icon: HA_ICON }} size={18} /><span>{t("iconFromArea")}</span></button>}
        {ROOM_ICONS.map((icon) => <button aria-checked={chosen === icon} aria-label={icon} key={icon} onClick={() => pick(icon)} role="radio" type="button"><HDIcon name={icon} size={18} /></button>)}
      </div>
    </div>
    <label className="room-options__row">
      <span className="eyebrow">{t("roomTemperature")}</span>
      <HDSelect ariaLabel={t("roomTemperature")} className="room-options__select" onChange={(temperature) => customize.setRoom(room.id, { temperature })} options={options} value={room.temperature_entity ?? ""} />
    </label>
  </section>;
}
