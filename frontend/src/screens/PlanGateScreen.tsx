import { useMemo, useState } from "react";
import { HDIcon, domainIcon, roomIcon } from "../components/HDIcon";
import { domainLabel, type TranslationKey } from "../i18n";
import { freeDevices, freeRoomIds, isControllable, proPrice, usePlan } from "../plan";
import type { HomeDeckConfig } from "../types/config";
import type { Room } from "../types/discovery";

const PRIORITY = ["light", "climate", "switch", "cover", "fan", "media_player", "lock"];

interface PlanGateProps {
  config: HomeDeckConfig;
  language?: string;
  onSave: (config: HomeDeckConfig) => Promise<void>;
  rooms: Room[];
  t: (key: TranslationKey) => string;
}

/** Free plan over its limits: go Pro, or pick the rooms and devices that stay. */
export function PlanGateScreen({ config, language, onSave, rooms, t }: PlanGateProps) {
  const { limits, upsell } = usePlan();
  const [chosenRooms, setChosenRooms] = useState(() => freeRoomIds(config, rooms).slice(0, limits.rooms));
  const [devices, setDevices] = useState(() => {
    const inRooms = new Set(rooms.filter((room) => freeRoomIds(config, rooms).slice(0, limits.rooms).includes(room.id)).flatMap((room) => room.entities).map((entity) => entity.entity_id));
    return freeDevices(config, rooms).filter((id) => inRooms.has(id)).slice(0, limits.devices);
  });
  const [saving, setSaving] = useState(false);
  const candidates = useMemo(() => rooms.filter((room) => chosenRooms.includes(room.id)).map((room) => ({
    room,
    entities: room.entities.filter(isControllable).sort((a, b) => PRIORITY.indexOf(a.domain) - PRIORITY.indexOf(b.domain) || a.name.localeCompare(b.name)),
  })).filter((group) => group.entities.length > 0), [chosenRooms, rooms]);
  const available = new Set(candidates.flatMap((group) => group.entities.map((entity) => entity.entity_id)));
  const kept = devices.filter((id) => available.has(id));
  const roomsFull = chosenRooms.length >= limits.rooms;
  const devicesFull = kept.length >= limits.devices;

  const toggleRoom = (id: string) => {
    if (chosenRooms.includes(id)) setChosenRooms(chosenRooms.filter((item) => item !== id));
    else if (roomsFull) upsell("rooms");
    else setChosenRooms([...chosenRooms, id]);
  };
  const toggleDevice = (id: string) => {
    if (kept.includes(id)) setDevices(kept.filter((item) => item !== id));
    else if (devicesFull) upsell("devices");
    else setDevices([...kept, id]);
  };
  const save = async () => {
    setSaving(true);
    try { await onSave({ ...config, free_rooms: chosenRooms, free_devices: kept }); } finally { setSaving(false); }
  };

  return <main className="screen settings-v2 plan-gate">
    <header className="st-header">
      <div><span className="eyebrow">{t("freePlan")}</span><h1>{t("gateTitle")}</h1><p>{t("gateDescription").replace("{rooms}", String(limits.rooms)).replace("{devices}", String(limits.devices))}</p></div>
    </header>

    <section className="st-panel plan-gate__pro">
      <span className="hd-pro__mark"><HDIcon name="star" size={22} /></span>
      <div><h2>HomeDeck Pro</h2><p>{t("gateProDescription").replace("{lifetime}", proPrice("lifetime", language)).replace("{annual}", proPrice("annual", language))}</p></div>
      <button className="hd-pill hd-pill--solid" onClick={() => upsell("general")} type="button"><HDIcon name="star" size={16} />{t("proSeePro")}</button>
    </section>

    <div className="plan-gate__columns">
      <section className="st-panel">
        <h2>{t("sectionRooms")} <span className="plan-gate__count">{chosenRooms.length} {t("of")} {limits.rooms}</span></h2>
        <div className="st-list">{rooms.map((room) => {
          const on = chosenRooms.includes(room.id);
          return <button aria-pressed={on} className={`st-item st-item__main ${on ? "st-item--on" : ""} ${!on && roomsFull ? "st-item--locked" : ""}`} key={room.id} onClick={() => toggleRoom(room.id)} type="button">
            <span className="st-check">{on ? <HDIcon name="check" size={14} /> : !on && roomsFull ? <HDIcon name="lock" size={12} /> : null}</span>
            <HDIcon name={roomIcon(room.name)} size={18} /><b>{room.id === "__unassigned__" ? t("unassigned") : room.name}</b>
          </button>;
        })}</div>
      </section>
      <section className="st-panel">
        <h2>{t("gateDevices")} <span className="plan-gate__count">{kept.length} {t("of")} {limits.devices}</span></h2>
        <p>{t("gateDevicesHint")}</p>
        <div className="st-list">{candidates.map(({ room, entities }) => <div className="plan-gate__group" key={room.id}>
          <span className="eyebrow">{room.id === "__unassigned__" ? t("unassigned") : room.name}</span>
          {entities.map((entity) => {
            const on = kept.includes(entity.entity_id);
            return <button aria-pressed={on} className={`st-item st-item__main ${on ? "st-item--on" : ""} ${!on && devicesFull ? "st-item--locked" : ""}`} key={entity.entity_id} onClick={() => toggleDevice(entity.entity_id)} type="button">
              <span className="st-check">{on ? <HDIcon name="check" size={14} /> : devicesFull ? <HDIcon name="lock" size={12} /> : null}</span>
              <HDIcon name={domainIcon(entity.domain)} size={18} /><b>{entity.name}</b><small>{domainLabel(entity.domain, language)}</small>
            </button>;
          })}
        </div>)}</div>
      </section>
    </div>

    <div className="plan-gate__actions">
      <button className="hd-pill hd-pill--solid" disabled={saving || chosenRooms.length === 0} onClick={() => void save()} type="button"><HDIcon name="check" size={16} />{saving ? t("saving") : t("gateContinueFree")}</button>
    </div>
  </main>;
}
