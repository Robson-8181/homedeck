import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import type { TranslationKey } from "../i18n";
import type { Room } from "../types/discovery";
import type { HomeAssistant } from "../types/home-assistant";
import { HDIcon, roomIcon } from "./HDIcon";

const ACTIVE_STATES = new Set(["on", "open", "opening", "playing", "heat", "cool"]);
const ACCENTS = ["#fbf4df", "#cfe8ff", "#f1d8ff", "#ffd9c8", "#d8f3dc", "#fff1a8"];

interface RoomCardProps {
  featured?: boolean;
  hass: HomeAssistant;
  index: number;
  room: Room;
  t: (key: TranslationKey) => string;
  onOpen: () => void;
}

export function RoomCard({ featured = false, hass, index, room, t, onOpen }: RoomCardProps) {
  const [busy, setBusy] = useState(false);
  const activeCount = room.entities.filter((entity) => ACTIVE_STATES.has(hass.states[entity.entity_id]?.state)).length;
  const lights = room.entities.filter((entity) => entity.domain === "light");
  const activeLights = lights.filter((entity) => hass.states[entity.entity_id]?.state === "on");
  const unavailable = room.entities.length > 0 && room.entities.every((entity) => ["unavailable", "unknown"].includes(hass.states[entity.entity_id]?.state));
  const climate = room.entities.find((entity) => entity.domain === "climate");
  const temperature = climate ? hass.states[climate.entity_id]?.attributes.current_temperature : undefined;
  const active = activeLights.length > 0;
  const accentStyle = { "--room-accent": ACCENTS[index % ACCENTS.length] } as CSSProperties;
  const roomName = room.id === "__unassigned__" ? t("unassigned") : room.name;
  const lightIds = useMemo(() => lights.map((light) => light.entity_id), [lights]);

  const toggleLights = async () => {
    if (busy || lightIds.length === 0) return;
    setBusy(true);
    try {
      await hass.callService("light", activeLights.length > 0 ? "turn_off" : "turn_on", { entity_id: lightIds });
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className={`room-card ${active ? "room-card--active" : ""} ${featured ? "room-card--featured" : ""} ${unavailable ? "room-card--unavailable" : ""}`} style={accentStyle}>
      <button aria-label={`${t("openRoom")} ${roomName}`} className="room-card__open" onClick={onOpen} type="button"><span /></button>
      <div className="room-card__top">
        <span className="room-card__icon"><HDIcon name={roomIcon(room.name)} size={23} /></span>
        {lightIds.length > 0 ? (
          <button aria-label={`${roomName}: ${activeLights.length > 0 ? t("turnAllOff") : t("turnAllOn")}`} className="room-card__power" disabled={busy || unavailable} onClick={() => void toggleLights()} type="button">
            {busy ? <span className="mini-spinner" /> : <HDIcon name="power" size={18} />}
          </button>
        ) : <span className="room-card__arrow"><HDIcon name="chevron" size={17} /></span>}
      </div>
      <div className="room-card__content">
        <strong>{roomName}</strong>
        <span>{lights.length === 0 ? `${activeCount} ${t("active")}` : activeLights.length === 0 ? t("roomLightsOff") : t("roomLitOf").replace("{on}", String(activeLights.length)).replace("{total}", String(lights.length))}</span>
      </div>
      <div className="room-card__footer">
        <span className="light-pips" aria-hidden="true">
          {lights.slice(0, 6).map((light) => <i className={hass.states[light.entity_id]?.state === "on" ? "light-pip light-pip--active" : "light-pip"} key={light.entity_id} />)}
        </span>
        {typeof temperature === "number" && <span>{temperature}°</span>}
      </div>
    </article>
  );
}
