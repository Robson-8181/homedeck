import { useMemo, useState } from "react";
import { ContextHeader } from "../components/ContextHeader";
import { EditableGrid, type GridItem } from "../components/EditableGrid";
import { EntityCard } from "../components/EntityCard";
import { EntityModal } from "../components/EntityModal";
import { EntityPicker } from "../components/EntityPicker";
import { HDIcon } from "../components/HDIcon";
import { HomeStatus } from "../components/HomeStatus";
import { todayCardAvailable } from "../components/Agenda";
import { HomeWidget, WIDGET_LABELS, availableWidgets } from "../components/HomeWidget";
import { RoomCard } from "../components/RoomCard";
import { SceneStrip } from "../components/SceneStrip";
import { HOME_SCREEN, arrange, entityKey, getLayout, keyId, roomKey, type WidgetKey } from "../layout";
import type { DiscoveredEntity } from "../types/discovery";
import { entityIndex, type ScreenProps } from "./types";
import { usePlan } from "../plan";

export function HomeScreen(props: ScreenProps & { onOpenRoom: (roomId: string) => void }) {
  const { config, data, editing, hass, language, t } = props;
  const empty = data.rooms.length === 0 && config.visibility.visible_home_entities.length === 0 && availableWidgets(data, todayCardAvailable(config, hass)).length === 0;

  return (
    <main className={`screen home-screen ${editing ? "screen--editing" : ""}`}>
      <ContextHeader config={config} hass={hass} language={language} onSettings={props.onSettings} t={t} />
      {editing && <p className="edit-hint">{t("editHint")}</p>}
      {config.visibility.home_cards.status && <HomeStatus config={config} data={data} hass={hass} t={t} />}
      {config.visibility.home_cards.scenes && <SceneStrip props={props} />}
      {empty
        ? <section className="empty-state"><span className="empty-state__icon"><HDIcon name="home" size={30} /></span><h2>{t("noRooms")}</h2><p>{t("noRoomsDescription")}</p></section>
        : <HomeGrid {...props} className="home-grid" />}
    </main>
  );
}

/** Rooms, widgets and shortcuts of Home in their arranged order, editable in place. */
export function HomeGrid(props: ScreenProps & { className: string; onOpenRoom: (roomId: string) => void }) {
  const { allRooms, config, data, editing, hass, language, onConfig, onLayout, onOpenRoom, t } = props;
  const [modalEntity, setModalEntity] = useState<DiscoveredEntity | null>(null);
  const [picking, setPicking] = useState(false);
  const plan = usePlan();
  const layout = getLayout(config, HOME_SCREEN);
  const { byId, roomName } = useMemo(() => entityIndex(allRooms), [allRooms]);
  const rooms = new Map(data.rooms.map((room) => [room.id, room]));
  const homeEntities = config.visibility.visible_home_entities.filter((id) => byId.has(id));
  const keys = [...data.rooms.map((room) => roomKey(room.id)), ...availableWidgets(data, todayCardAvailable(config, hass)), ...homeEntities.map(entityKey)];
  const { visible, hidden } = arrange(keys, layout);

  const label = (key: string): string => {
    if (key.startsWith("widget:")) return t(WIDGET_LABELS[key as WidgetKey]);
    if (key.startsWith("entity:")) return byId.get(keyId(key))?.name ?? keyId(key);
    const room = rooms.get(keyId(key));
    return room?.id === "__unassigned__" ? t("unassigned") : room?.name ?? keyId(key);
  };

  const setHomeEntities = (ids: string[]) => onConfig((current) => ({ ...current, visibility: { ...current.visibility, visible_home_entities: ids } }));

  const items: GridItem[] = visible.map((key, index) => {
    if (key.startsWith("widget:")) {
      return { key, label: label(key), node: <HomeWidget config={config} data={data} hass={hass} kind={key as WidgetKey} language={language} onOpen={setModalEntity} t={t} /> };
    }
    if (key.startsWith("entity:")) {
      const entity = byId.get(keyId(key)) as DiscoveredEntity;
      return { key, label: entity.name, removal: "remove", node: <EntityCard entity={entity} hass={hass} language={language} onLongPress={setModalEntity} t={t} /> };
    }
    const room = rooms.get(keyId(key))!;
    return { key, label: label(key), node: <RoomCard hass={hass} index={index} onOpen={() => onOpenRoom(room.id)} room={room} t={t} /> };
  });

  return <>
    <EditableGrid
      addLabel={t("addDevices")}
      className={props.className}
      editing={editing}
      hiddenItems={hidden.map((key) => ({ key, label: label(key) }))}
      items={items}
      layout={layout}
      onAdd={() => setPicking(true)}
      onLayout={(next) => onLayout(HOME_SCREEN, next)}
      onRemove={(key) => setHomeEntities(homeEntities.filter((id) => id !== keyId(key)))}
      sections
      t={t}
    />
    {modalEntity && <EntityModal entity={modalEntity} hass={hass} language={language} onClose={() => setModalEntity(null)} roomName={roomName(modalEntity)} t={t} />}
    {picking && <EntityPicker language={language} onClose={() => setPicking(false)} onToggle={(id) => { if (homeEntities.includes(id)) setHomeEntities(homeEntities.filter((item) => item !== id)); else if (plan.allow(id)) setHomeEntities([...homeEntities, id]); }} rooms={props.catalogRooms} selected={homeEntities} t={t} />}
  </>;
}
