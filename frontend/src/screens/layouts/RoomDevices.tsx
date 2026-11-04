import { useState } from "react";
import type { ReactNode } from "react";
import { EditableGrid } from "../../components/EditableGrid";
import { EntityPicker } from "../../components/EntityPicker";
import { RoomOptions } from "../../components/RoomOptions";
import { HOME_SCREEN, keyId, roomKey } from "../../layout";
import { usePlan } from "../../plan";
import type { DiscoveredEntity, Room } from "../../types/discovery";
import type { ScreenProps } from "../types";
import { orderedRooms, roomItems, subsetLayout } from "./shared";
import { arrange, getLayout } from "../../layout";

interface RoomDevicesProps {
  className: string;
  props: ScreenProps;
  render: (entity: DiscoveredEntity) => ReactNode;
  room: Room;
  sizable?: boolean;
}

/** A room's devices in any layout: drag, hide and add in edit mode, saved on the room's screen. */
export function RoomDevices({ className, props, render, room, sizable = false }: RoomDevicesProps) {
  const { allRooms, catalogRooms, config, editing, hass, language, onLayout, t } = props;
  const [picking, setPicking] = useState(false);
  const plan = usePlan();
  const { screen, layout, own, added, byKey, visible, hidden } = roomItems(config, room, allRooms);
  const setAdded = (ids: string[]) => onLayout(screen, { ...layout, added: ids });

  return <>
    {editing && <RoomOptions allRooms={allRooms} hass={hass} room={room} t={t} />}
    <EditableGrid
      addLabel={t("addDevices")}
      className={className}
      editing={editing}
      hiddenItems={hidden.map((key) => ({ key, label: byKey.get(key)?.name ?? keyId(key) }))}
      items={visible.map((key) => {
        const entity = byKey.get(key)!;
        return { key, label: entity.name, removal: own.has(entity.entity_id) ? "hide" : "remove", node: render(entity) };
      })}
      layout={layout}
      onAdd={() => setPicking(true)}
      onLayout={(next) => onLayout(screen, next)}
      onRemove={(key) => setAdded(added.filter((id) => id !== keyId(key)))}
      sections
      sizable={sizable}
      t={t}
    />
    {picking && <EntityPicker language={language} onClose={() => setPicking(false)} onToggle={(id) => { if (added.includes(id)) setAdded(added.filter((item) => item !== id)); else if (plan.allow(id)) setAdded([...added, id]); }} rooms={catalogRooms.filter((item) => item.id !== room.id)} selected={added} t={t} />}
  </>;
}

/** Rooms in any layout: drag and hide in edit mode, saved on Home without moving its other items. */
export function useRoomList(props: ScreenProps) {
  const { config, data, onLayout, t } = props;
  const layout = getLayout(config, HOME_SCREEN);
  const keys = data.rooms.map((room) => roomKey(room.id));
  const byKey = new Map(data.rooms.map((room) => [roomKey(room.id), room]));
  const hidden = arrange(keys, layout).hidden;
  const allKeys = [...new Set([...layout.order, ...keys])];
  return {
    rooms: orderedRooms(config, data.rooms),
    layout,
    hiddenItems: hidden.map((key) => ({ key, label: byKey.get(key)?.id === "__unassigned__" ? t("unassigned") : byKey.get(key)?.name ?? keyId(key) })),
    onLayout: subsetLayout(allKeys, layout, (next) => onLayout(HOME_SCREEN, next)),
  };
}
