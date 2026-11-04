import { useEffect, useRef, useState } from "react";
import { openSidebar, sidebarHidden } from "../../sidebar";
import { AgendaButtons } from "../../components/Agenda";
import { EditableGrid } from "../../components/EditableGrid";
import { SceneStrip } from "../../components/SceneStrip";
import { displayState } from "../../components/EntityCard";
import { EntityModal } from "../../components/EntityModal";
import { HDIcon, RoomIcon, domainIcon } from "../../components/HDIcon";
import { weatherConditionLabel } from "../../i18n";
import { useWeather } from "../../weather";
import { roomKey } from "../../layout";
import type { DiscoveredEntity, Room } from "../../types/discovery";
import { pageId, usePageContent, type PageRef } from "../pages";
import { entityIndex, type ScreenProps } from "../types";
import { RoomDevices, useRoomList } from "./RoomDevices";
import { isOn, orderedEntities, roomLights, setRoomLights, tapEntity, useHold } from "./shared";

interface FocusLayoutProps extends ScreenProps {
  roomId: string | null;
  onRoomChange: (roomId: string | null) => void;
  /** Media, Security, Scenes or a custom page, shown as one focus page. */
  page: PageRef | null;
}

/** Immersive layout: one page for the house, then one page per room, swiped sideways. */
export function FocusLayout(props: FocusLayoutProps) {
  return props.page ? <FocusPage key={pageId(props.page)} page={props.page} props={props} /> : <FocusRooms {...props} />;
}

/** A device as a large chip: taps toggle, holding opens details. */
function useChip(props: ScreenProps, onDetails: (entity: DiscoveredEntity) => void) {
  const { hass, language, t } = props;
  const hold = useHold();
  return (entity: DiscoveredEntity) => {
    const active = isOn(hass, entity);
    return <button className={active ? "fc-chip fc-chip--on" : "fc-chip"} type="button" {...hold(() => tapEntity(hass, entity, onDetails), () => onDetails(entity))}>
      <span className="fc-chip__icon"><HDIcon name={domainIcon(entity.domain)} size={20} /></span>
      <span className="fc-chip__copy"><b>{entity.name}</b>{entity.domain !== "scene" && <small>{displayState(hass.states[entity.entity_id], entity, t, language)}</small>}</span>
    </button>;
  };
}

/** A dock page in the focus layout: its title large and its devices as chips. */
function FocusPage({ page, props }: { page: PageRef; props: ScreenProps }) {
  const { editing, hass, language, t } = props;
  const [modalEntity, setModalEntity] = useState<DiscoveredEntity | null>(null);
  const content = usePageContent(props, page);
  const chip = useChip(props, setModalEntity);
  return <main className={`screen fc-layout ${editing ? "screen--editing" : ""}`}>
    <div className="fc-tools">
      {sidebarHidden(props.hass) && <button aria-label={t("openMenu")} className="round-action" onClick={(event) => openSidebar(event.currentTarget)} type="button"><HDIcon name="menu" size={19} /></button>}
      <button aria-label={t("settings")} className="round-action" onClick={props.onSettings} type="button"><HDIcon name="settings" size={19} /></button>
    </div>
    <div className="fc-track">
      <section className="fc-page" aria-label={content.title}>
        <span className="eyebrow">{content.count} {t("entities")}</span>
        <div className="fc-hero"><div className="fc-hero__copy"><h1>{content.title}</h1></div></div>
        {editing && <p className="edit-hint">{t("editHintSimple")}</p>}
        {content.body({ className: "fc-chips", render: chip })}
      </section>
    </div>
    {modalEntity && <EntityModal entity={modalEntity} hass={hass} language={language} onClose={() => setModalEntity(null)} roomName={content.roomName(modalEntity)} t={t} />}
  </main>;
}

function FocusRooms(props: FocusLayoutProps) {
  const { allRooms, config, data, editing, hass, language, onRoomChange, roomId, t } = props;
  const [modalEntity, setModalEntity] = useState<DiscoveredEntity | null>(null);
  const [page, setPage] = useState(0);
  const [now, setNow] = useState(() => new Date());
  const track = useRef<HTMLDivElement>(null);
  const chip = useChip(props, setModalEntity);
  const roomList = useRoomList(props);
  const rooms = roomList.rooms;
  const { roomName } = entityIndex(allRooms);
  const total = rooms.length + 1;
  const name = (room: Room) => (room.id === "__unassigned__" ? t("unassigned") : room.name);

  useEffect(() => { const timer = window.setInterval(() => setNow(new Date()), 30_000); return () => window.clearInterval(timer); }, []);

  const go = (index: number, smooth = true) => {
    const el = track.current;
    if (!el) return;
    const target = Math.max(0, Math.min(total - 1, index));
    el.scrollTo({ left: target * el.clientWidth, behavior: smooth ? "smooth" : "auto" });
  };
  // Opening the rooms tab lands on that room's page.
  useEffect(() => {
    const index = roomId ? rooms.findIndex((room) => room.id === roomId) + 1 : 0;
    if (index !== page) go(index, false);
  }, [roomId]);

  const onScroll = () => {
    const el = track.current;
    if (!el) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    if (index !== page) {
      setPage(index);
      onRoomChange(index === 0 ? null : rooms[index - 1]?.id ?? null);
    }
  };

  const { now: weather } = useWeather(hass, config);
  const litTotal = data.rooms.flatMap((room) => room.entities).filter((entity) => entity.domain === "light" && hass.states[entity.entity_id]?.state === "on").length;

  return <main className={`screen fc-layout ${editing ? "screen--editing" : ""}`}>
    <div className="fc-tools">
      {sidebarHidden(props.hass) && <button aria-label={t("openMenu")} className="round-action" onClick={(event) => openSidebar(event.currentTarget)} type="button"><HDIcon name="menu" size={19} /></button>}
      <button aria-label={t("settings")} className="round-action" onClick={props.onSettings} type="button"><HDIcon name="settings" size={19} /></button>
    </div>
    <div className="fc-track" onScroll={onScroll} ref={track}>
      <section className="fc-page fc-page--home" aria-label={t("home")}>
        <span className="eyebrow">{new Intl.DateTimeFormat(language, { weekday: "long", day: "numeric", month: "long" }).format(now)}</span>
        <time className="fc-clock">{new Intl.DateTimeFormat(language, { hour: "2-digit", minute: "2-digit" }).format(now)}</time>
        <div className="fc-summary">
          {weather && <span>{weather.temperature != null ? `${Math.round(weather.temperature)}°` : ""}{weather.temperature != null && weather.condition ? " · " : ""}{weather.condition ? weatherConditionLabel(weather.condition, language) : ""}</span>}
          <span>{litTotal === 1 ? t("oneLightOn") : t("lightsOn").replace("{count}", String(litTotal))}</span>
          <AgendaButtons config={config} hass={hass} language={language} t={t} />
        </div>
        {editing && <p className="edit-hint">{t("editHintSimple")}</p>}
        {config.visibility.home_cards.scenes && <SceneStrip props={props} />}
        <EditableGrid
          className="fc-rooms"
          editing={editing}
          hiddenItems={roomList.hiddenItems}
          items={rooms.map((room, index) => {
            const { on } = roomLights(hass, room);
            return { key: roomKey(room.id), label: name(room), node: <button className={on.length > 0 ? "fc-room fc-room--lit" : "fc-room"} onClick={() => go(index + 1)} type="button"><RoomIcon room={room} size={18} /><span>{name(room)}</span>{on.length > 0 && <i>{on.length}</i>}</button> };
          })}
          layout={roomList.layout}
          onLayout={roomList.onLayout}
          sizable={false}
          t={t}
        />
      </section>
      {rooms.map((room, index) => {
        const { lights, on } = roomLights(hass, room);
        const lit = on.length > 0;
        const entities = orderedEntities(config, room, allRooms);
        return <section className={lit ? "fc-page fc-page--lit" : "fc-page"} key={room.id} aria-label={name(room)}>
          <span className="eyebrow">{t("roomsPage")} · {index + 1}/{rooms.length}</span>
          <div className="fc-hero">
            <div className="fc-hero__copy">
              <h1>{name(room)}</h1>
              <p>{lights.length === 0 ? `${entities.length} ${t("entities")}` : lit ? t("roomLitOf").replace("{on}", String(on.length)).replace("{total}", String(lights.length)) : t("roomLightsOff")}</p>
            </div>
            {lights.length > 0 && !editing && <button aria-label={`${name(room)}: ${lit ? t("turnAllOff") : t("turnAllOn")}`} aria-pressed={lit} className="fc-power" onClick={() => setRoomLights(hass, room, !lit)} type="button"><HDIcon name="power" size={40} /></button>}
          </div>
          {editing && <p className="edit-hint">{t("editHintSimple")}</p>}
          <RoomDevices className="fc-chips" props={props} render={chip} room={room} />
        </section>;
      })}
    </div>
    <div className="fc-pager">
      <button aria-label={t("previous")} disabled={page === 0} onClick={() => go(page - 1)} type="button"><HDIcon name="arrow" size={18} /></button>
      <span className="fc-dots">{Array.from({ length: total }, (_, index) => <i className={index === page ? "fc-dot--on" : ""} key={index} onClick={() => go(index)} />)}</span>
      <button aria-label={t("next")} disabled={page === total - 1} onClick={() => go(page + 1)} type="button"><HDIcon name="chevron" size={18} /></button>
    </div>
    {modalEntity && <EntityModal entity={modalEntity} hass={hass} language={language} onClose={() => setModalEntity(null)} roomName={roomName(modalEntity)} t={t} />}
  </main>;
}
