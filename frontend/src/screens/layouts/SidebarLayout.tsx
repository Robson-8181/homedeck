import { useState } from "react";
import { ContextHeader } from "../../components/ContextHeader";
import { EditableGrid } from "../../components/EditableGrid";
import { EntityCard } from "../../components/EntityCard";
import { EntityModal } from "../../components/EntityModal";
import { HDIcon, RoomIcon, type IconName } from "../../components/HDIcon";
import { HomeStatus } from "../../components/HomeStatus";
import { roomKey } from "../../layout";
import type { DiscoveredEntity } from "../../types/discovery";
import { HomeGrid } from "../HomeScreen";
import { SceneStrip } from "../../components/SceneStrip";
import { pageId, usePageContent, type PageRef } from "../pages";
import { entityIndex, type ScreenProps } from "../types";
import { RoomDevices, useRoomList } from "./RoomDevices";
import { roomLights, setRoomLights } from "./shared";

export interface NavLink { id: string; label: string; icon: IconName }

interface SidebarLayoutProps extends ScreenProps {
  links: NavLink[];
  onNavigate: (page: string) => void;
  onSelectRoom: (roomId: string | null) => void;
  /** Media, Security, Scenes or a custom page, shown on the right like a room. */
  page: PageRef | null;
  roomId: string | null;
}

/** Control-center layout: a fixed column with context and navigation, content on the right. */
export function SidebarLayout(props: SidebarLayoutProps) {
  const { allRooms, config, data, editing, hass, language, links, onNavigate, onSelectRoom, page, roomId, t } = props;
  const [modalEntity, setModalEntity] = useState<DiscoveredEntity | null>(null);
  const roomList = useRoomList(props);
  const room = roomList.rooms.find((item) => item.id === roomId);
  const { roomName } = entityIndex(allRooms);
  const name = (id: string, fallback: string) => (id === "__unassigned__" ? t("unassigned") : fallback);

  return <main className={`screen sb-layout ${editing ? "screen--editing" : ""}`}>
    <ContextHeader config={config} hass={hass} language={language} onSettings={props.onSettings} part="status" t={t} />
    <aside className="sb-side">
      <ContextHeader config={config} hass={hass} language={language} onSettings={props.onSettings} part="clock" t={t} />
      {config.visibility.home_cards.status && !editing && <HomeStatus config={config} data={data} hass={hass} t={t} />}
      <nav className="sb-nav" aria-label={t("navigation")}>
        <button aria-current={!room && !page ? "page" : undefined} onClick={() => onSelectRoom(null)} type="button"><span className="sb-nav__icon"><HDIcon name="home" size={18} /></span><span>{t("overview")}</span></button>
        <EditableGrid
          className="sb-nav__rooms"
          editing={editing}
          hiddenItems={roomList.hiddenItems}
          items={roomList.rooms.map((item) => {
            const { on } = roomLights(hass, item);
            return { key: roomKey(item.id), label: name(item.id, item.name), node: <button aria-current={room?.id === item.id ? "page" : undefined} onClick={() => onSelectRoom(item.id)} type="button">
              <span className="sb-nav__icon"><RoomIcon room={item} size={18} /></span><span>{name(item.id, item.name)}</span>{on.length > 0 && <i>{on.length}</i>}
            </button> };
          })}
          layout={roomList.layout}
          onLayout={roomList.onLayout}
          sizable={false}
          t={t}
        />
      </nav>
      {links.length > 0 && !editing && <nav className="sb-links" aria-label={t("pages")}>
        {links.map((link) => <button aria-current={page && pageId(page) === link.id ? "page" : undefined} key={link.id} onClick={() => onNavigate(link.id)} type="button"><HDIcon name={link.icon} size={16} /><span>{link.label}</span></button>)}
      </nav>}
    </aside>

    <section className="sb-main">
      {page ? <SidebarPage key={pageId(page)} onLongPress={setModalEntity} page={page} props={props} /> : room ? <>
        <header className="sb-main__header">
          <div><span className="eyebrow">{(() => { const { lights, on } = roomLights(hass, room); return lights.length === 0 ? t("roomsPage") : on.length === 0 ? t("allOff") : t("roomLitOf").replace("{on}", String(on.length)).replace("{total}", String(lights.length)); })()}</span><h1>{name(room.id, room.name)}</h1></div>
          {roomLights(hass, room).lights.length > 0 && !editing && <div className="room-actions"><button onClick={() => setRoomLights(hass, room, true)} type="button"><HDIcon name="light" size={18} />{t("turnOn")}</button><button className="room-actions__primary" onClick={() => setRoomLights(hass, room, false)} type="button"><HDIcon name="power" size={18} />{t("turnOff")}</button></div>}
        </header>
        {editing && <p className="edit-hint">{t("editHint")}</p>}
        <RoomDevices className="sb-grid" key={room.id} props={props} render={(entity) => <EntityCard entity={entity} hass={hass} language={language} onLongPress={setModalEntity} t={t} />} room={room} sizable />
      </> : <>
        <header className="sb-main__header"><div><span className="eyebrow">{t("appName")}</span><h1>{t("overview")}</h1></div></header>
        {editing && <p className="edit-hint">{t("editHint")}</p>}
        {config.visibility.home_cards.scenes && <SceneStrip props={props} />}
        <HomeGrid {...props} className="sb-grid sb-home" onOpenRoom={(id) => onSelectRoom(id)} />
      </>}
    </section>
    {modalEntity && <EntityModal entity={modalEntity} hass={hass} language={language} onClose={() => setModalEntity(null)} roomName={roomName(modalEntity)} t={t} />}
  </main>;
}

/** A dock page in the sidebar layout: its title and devices on the right, like a room. */
function SidebarPage({ onLongPress, page, props }: { onLongPress: (entity: DiscoveredEntity) => void; page: PageRef; props: ScreenProps }) {
  const { editing, hass, language, t } = props;
  const content = usePageContent(props, page);
  return <>
    <header className="sb-main__header"><div><span className="eyebrow">{content.count} {t("entities")}</span><h1>{content.title}</h1></div></header>
    {editing && <p className="edit-hint">{t("editHint")}</p>}
    {content.body({ className: "sb-grid", open: onLongPress, render: (entity) => <EntityCard entity={entity} hass={hass} language={language} onLongPress={onLongPress} t={t} />, sizable: true })}
  </>;
}
