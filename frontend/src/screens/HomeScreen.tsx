import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { ContextHeader } from "../components/ContextHeader";
import { EditableGrid, type GridItem } from "../components/EditableGrid";
import { EntityCard } from "../components/EntityCard";
import { EntityModal } from "../components/EntityModal";
import { EntityPicker } from "../components/EntityPicker";
import { HDIcon } from "../components/HDIcon";
import { HomeStatus } from "../components/HomeStatus";
import { todayCardAvailable } from "../components/Agenda";
import { extraWidgets } from "../components/ExtraWidgets";
import { HomeWidget, WIDGET_LABELS, availableWidgets } from "../components/HomeWidget";
import { RoomCard } from "../components/RoomCard";
import { SceneStrip } from "../components/SceneStrip";
import { HOME_SCREEN, arrange, entityKey, getLayout, keyId, roomKey, type WidgetKey } from "../layout";
import type { DiscoveredEntity } from "../types/discovery";
import { entityIndex, type ScreenProps } from "./types";
import { usePlan } from "../plan";

export function HomeScreen(props: ScreenProps & { onOpenRoom: (roomId: string) => void }) {
  const { config, data, editing, hass, language, t } = props;
  const empty = data.rooms.length === 0 && config.visibility.visible_home_entities.length === 0 && availableWidgets(data, todayCardAvailable(config, hass), extraWidgets(config, hass)).length === 0;

  const screen = useRef<HTMLElement>(null);
  useFitToScreen(screen);

  return (
    <main className={`screen home-screen ${editing ? "screen--editing" : ""}`} ref={screen}>
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

/** The size unit of every screen (theme.ts); Home scales it down a little when that makes it fit. */
const UNIT = "clamp(4.4px, min(1vw, 1.05vh), 13px)";
const MIN_SCALE = 0.85;

/** When Home is only a little taller than the screen (a separator, one more row of text), everything on
 * it shrinks by up to 15% so it fits without a small scroll. Bigger homes still scroll, and phones are
 * left alone. */
function useFitToScreen(screen: { current: HTMLElement | null }) {
  useLayoutEffect(() => {
    const element = screen.current;
    if (!element) return;
    let busy = false;
    const fit = () => {
      if (busy) return;
      busy = true;
      element.style.removeProperty("--u");
      const target = window.innerHeight;
      let height = element.getBoundingClientRect().height;
      if (window.innerWidth > 720 && height > target + 0.5 && height * MIN_SCALE <= target) {
        // Not every size follows the unit, so a few rounds get it right.
        let scale = 1;
        for (let round = 0; round < 4 && height > target + 0.5; round++) {
          scale = Math.max(MIN_SCALE, scale * (target / height) - 0.002);
          element.style.setProperty("--u", `calc(${UNIT} * ${scale.toFixed(4)})`);
          height = element.getBoundingClientRect().height;
          if (scale === MIN_SCALE) break;
        }
        if (height > target + 0.5) element.style.removeProperty("--u");
      }
      busy = false;
    };
    fit();
    const observer = new ResizeObserver(() => fit());
    observer.observe(element);
    window.addEventListener("resize", fit);
    return () => { observer.disconnect(); window.removeEventListener("resize", fit); };
  }, []);
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
  const keys = [...data.rooms.map((room) => roomKey(room.id)), ...availableWidgets(data, todayCardAvailable(config, hass), extraWidgets(config, hass)), ...homeEntities.map(entityKey)];
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
