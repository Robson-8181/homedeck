import { useState } from "react";
import { ContextHeader } from "../../components/ContextHeader";
import { SceneStrip } from "../../components/SceneStrip";
import { EditableGrid } from "../../components/EditableGrid";
import { displayState, TOGGLES } from "../../components/EntityCard";
import { EntityModal } from "../../components/EntityModal";
import { EntityIcon, HDIcon, RoomIcon } from "../../components/HDIcon";
import { HomeStatus } from "../../components/HomeStatus";
import { roomKey } from "../../layout";
import type { DiscoveredEntity, Room } from "../../types/discovery";
import { pageId, usePageContent, type PageRef } from "../pages";
import { entityIndex, type ScreenProps } from "../types";
import { RoomDevices, useRoomList } from "./RoomDevices";
import { isOn, orderedEntities, roomLights, setRoomLights, tapEntity, useHold } from "./shared";

interface ListLayoutProps extends ScreenProps {
  /** Rooms tab: only this room, with a strip to switch rooms. */
  roomId: string | null;
  onSelectRoom: (roomId: string) => void;
  /** Media, Security, Scenes or a custom page, shown as one section of rows. */
  page: PageRef | null;
}

/** Grouped rows like iOS Settings: one section per room, a switch on every row that can switch. */
export function ListLayout(props: ListLayoutProps) {
  return props.page ? <ListPage key={pageId(props.page)} page={props.page} props={props} /> : <ListRooms {...props} />;
}

/** One row: icon, name and state, with a switch for what can switch. Taps toggle; holding opens details. */
function useRow(props: ScreenProps, onDetails: (entity: DiscoveredEntity) => void) {
  const { editing, hass, language, t } = props;
  const hold = useHold();
  return (entity: DiscoveredEntity) => {
    const on = isOn(hass, entity);
    const state = hass.states[entity.entity_id];
    const switchable = TOGGLES.has(entity.domain);
    return <div className={`ls-row ${on ? "ls-row--on" : ""} ${!state || state.state === "unavailable" ? "ls-row--off" : ""}`} key={entity.entity_id} role="button" tabIndex={0} {...hold(() => tapEntity(hass, entity, onDetails), () => onDetails(entity))}>
      <span className="ls-row__icon"><EntityIcon entity={entity} size={18} /></span>
      <span className="ls-row__copy"><b>{entity.name}</b>{entity.domain !== "scene" && <small>{displayState(state, entity, t, language)}</small>}</span>
      {editing
        ? <span className="ls-row__grip"><HDIcon name="grip" size={18} /></span>
        : switchable
          ? <span className={on ? "ls-switch ls-switch--on" : "ls-switch"} aria-hidden="true"><i /></span>
          : <span className="ls-row__more"><HDIcon name="chevron" size={16} /></span>}
    </div>;
  };
}

/** A dock page in the list layout: one section with its rows. */
function ListPage({ page, props }: { page: PageRef; props: ScreenProps }) {
  const { config, editing, hass, language, t } = props;
  const [modalEntity, setModalEntity] = useState<DiscoveredEntity | null>(null);
  const content = usePageContent(props, page);
  const row = useRow(props, setModalEntity);
  return <main className={`screen ls-layout ${editing ? "screen--editing" : ""}`}>
    <ContextHeader config={config} hass={hass} language={language} onSettings={props.onSettings} t={t} />
    <header className="collection-header"><div><span className="eyebrow">{content.count} {t("entities")}</span><h1>{content.title}</h1></div></header>
    {editing && <p className="edit-hint">{t("editHintSimple")}</p>}
    <div className="ls-groups ls-groups--single">
      <section className="ls-group">
        {content.body({ className: "ls-rows", open: setModalEntity, render: row })}
      </section>
    </div>
    {modalEntity && <EntityModal entity={modalEntity} hass={hass} language={language} onClose={() => setModalEntity(null)} roomName={content.roomName(modalEntity)} t={t} />}
  </main>;
}

function ListRooms(props: ListLayoutProps) {
  const { allRooms, config, data, editing, hass, language, onSelectRoom, roomId, t } = props;
  const [modalEntity, setModalEntity] = useState<DiscoveredEntity | null>(null);
  const [collapsed, setCollapsed] = useState<string[]>([]);
  const roomList = useRoomList(props);
  const rooms = roomList.rooms;
  const { byId, roomName } = entityIndex(allRooms);
  const shown = roomId ? rooms.filter((room) => room.id === roomId) : rooms;
  // Devices added to Home (in any layout) show as a group of their own; in Edit mode each one can be taken off Home.
  const favorites = roomId ? [] : config.visibility.visible_home_entities.map((id) => byId.get(id)).filter((entity): entity is DiscoveredEntity => Boolean(entity));
  const removeFavorite = (id: string) => props.onConfig((current) => ({ ...current, visibility: { ...current.visibility, visible_home_entities: current.visibility.visible_home_entities.filter((item) => item !== id) } }));
  const name = (room: Room) => (room.id === "__unassigned__" ? t("unassigned") : room.name);

  const row = useRow(props, setModalEntity);

  const section = (room: Room) => {
    const { lights, on } = roomLights(hass, room);
    const open = editing || !collapsed.includes(room.id);
    const count = orderedEntities(config, room, allRooms).length;
    return <section className={`ls-group ${on.length > 0 ? "ls-group--lit" : ""}`}>
      <header className="ls-group__head">
        <button aria-expanded={open} className="ls-group__toggle" disabled={editing} onClick={() => setCollapsed(open ? [...collapsed, room.id] : collapsed.filter((id) => id !== room.id))} type="button">
          <span className="ls-group__icon"><RoomIcon room={room} size={18} /></span>
          <span className="ls-group__copy"><b>{name(room)}</b><small>{lights.length === 0 ? `${count} ${t("entities")}` : on.length === 0 ? t("roomLightsOff") : t("roomLitOf").replace("{on}", String(on.length)).replace("{total}", String(lights.length))}</small></span>
          {!editing && <span className={open ? "ls-chevron ls-chevron--open" : "ls-chevron"}><HDIcon name="chevron" size={16} /></span>}
        </button>
        {editing
          ? <span className="ls-group__grip"><HDIcon name="grip" size={18} /></span>
          : lights.length > 0 && <button aria-label={`${name(room)}: ${on.length > 0 ? t("turnAllOff") : t("turnAllOn")}`} aria-pressed={on.length > 0} className={on.length > 0 ? "ls-switch ls-switch--on" : "ls-switch"} onClick={() => setRoomLights(hass, room, on.length === 0)} type="button"><i /></button>}
      </header>
      {open && (count === 0 && !editing ? <p className="ls-empty">{t("noVisibleEntities")}</p> : <RoomDevices className="ls-rows" props={props} render={row} room={room} />)}
    </section>;
  };

  return <main className={`screen ls-layout ${editing ? "screen--editing" : ""}`}>
    <ContextHeader config={config} hass={hass} language={language} onSettings={props.onSettings} t={t} />
    {editing && <p className="edit-hint">{t("editHintSimple")}</p>}
    {!roomId && !editing && config.visibility.home_cards.status && <HomeStatus config={config} data={data} hass={hass} t={t} />}
    {roomId && <div className="ls-strip" role="tablist">{rooms.map((room) => <button aria-selected={room.id === roomId} key={room.id} onClick={() => onSelectRoom(room.id)} role="tab" type="button"><RoomIcon room={room} size={16} />{name(room)}</button>)}</div>}

    {!roomId && config.visibility.home_cards.scenes && <SceneStrip props={props} />}
    {favorites.length > 0 && <div className="ls-groups ls-groups--favorites">
      <section className="ls-group">
        <header className="ls-group__head"><span className="ls-group__icon"><HDIcon name="star" size={18} /></span><span className="ls-group__copy"><b>{t("shortcuts")}</b><small>{favorites.length} {t("entities")}</small></span></header>
        <div className="ls-rows">{editing
          ? favorites.map((entity) => <div className="ls-row ls-row--editing" key={entity.entity_id}>
            <span className="ls-row__icon"><EntityIcon entity={entity} size={18} /></span>
            <span className="ls-row__copy"><b>{entity.name}</b><small>{roomName(entity)}</small></span>
            <button aria-label={`${t("removeItem")}: ${entity.name}`} className="ls-row__remove" onClick={() => removeFavorite(entity.entity_id)} type="button"><HDIcon name="minus" size={14} /></button>
          </div>)
          : favorites.map(row)}</div>
      </section>
    </div>}
    <EditableGrid
      className="ls-groups"
      editing={editing && !roomId}
      hiddenItems={roomList.hiddenItems}
      items={shown.map((room) => ({ key: roomKey(room.id), label: name(room), node: section(room) }))}
      layout={roomList.layout}
      onLayout={roomList.onLayout}
      sizable={false}
      t={t}
    />
    {modalEntity && <EntityModal entity={modalEntity} hass={hass} language={language} onClose={() => setModalEntity(null)} roomName={roomName(modalEntity)} t={t} />}
  </main>;
}
