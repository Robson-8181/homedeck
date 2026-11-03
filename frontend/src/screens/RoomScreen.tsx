import { useState } from "react";
import { ContextHeader } from "../components/ContextHeader";
import { EditableGrid } from "../components/EditableGrid";
import { EntityCard } from "../components/EntityCard";
import { EntityModal } from "../components/EntityModal";
import { EntityPicker } from "../components/EntityPicker";
import { HDIcon, roomIcon } from "../components/HDIcon";
import { arrange, entityKey, getLayout, keyId, roomScreen } from "../layout";
import type { DiscoveredEntity, Room } from "../types/discovery";
import { entityIndex, type ScreenProps } from "./types";
import { usePlan } from "../plan";

const DOMAIN_ORDER = ["light", "switch", "fan", "cover", "climate", "media_player", "vacuum", "select", "input_select", "script", "button", "input_button", "scene", "lock", "camera", "binary_sensor", "sensor"];

export function RoomScreen(props: ScreenProps & { onSelectRoom: (roomId: string) => void; room: Room }) {
  const { allRooms, config, data, editing, hass, language, onLayout, onSelectRoom, room, t } = props;
  const [busy, setBusy] = useState(false);
  const [modalEntity, setModalEntity] = useState<DiscoveredEntity | null>(null);
  const [picking, setPicking] = useState(false);
  const plan = usePlan();
  const screen = roomScreen(room.id);
  const layout = getLayout(config, screen);
  const roomName = room.id === "__unassigned__" ? t("unassigned") : room.name;
  const lights = room.entities.filter((entity) => entity.domain === "light");
  const activeLights = lights.filter((entity) => hass.states[entity.entity_id]?.state === "on");
  const natural = [...room.entities].sort((a, b) => DOMAIN_ORDER.indexOf(a.domain) - DOMAIN_ORDER.indexOf(b.domain) || a.name.localeCompare(b.name));
  const everywhere = entityIndex(allRooms);
  const own = new Set(room.entities.map((entity) => entity.entity_id));
  // Devices brought in from other rooms in edit mode.
  const added = (layout.added ?? []).filter((id) => !own.has(id) && everywhere.byId.has(id));
  const byId = new Map([...room.entities, ...added.map((id) => everywhere.byId.get(id)!)].map((entity) => [entity.entity_id, entity]));
  const { visible, hidden } = arrange([...natural.map((entity) => entityKey(entity.entity_id)), ...added.map(entityKey)], layout);
  const setAdded = (ids: string[]) => onLayout(screen, { ...layout, added: ids });

  const setRoomLights = async (service: "turn_on" | "turn_off") => {
    if (busy || lights.length === 0) return;
    setBusy(true);
    try { await hass.callService("light", service, { entity_id: lights.map((entity) => entity.entity_id) }); } finally { setBusy(false); }
  };

  return (
    <main className={`screen room-screen ${editing ? "screen--editing" : ""}`}>
      <ContextHeader config={config} hass={hass} language={language} onSettings={props.onSettings} t={t} />
      <div className="room-workspace">
        <aside className="room-selector" aria-label={t("roomsNavigation")}>
          <div className="room-selector__list" role="tablist">
            {data.rooms.map((item) => {
              const count = item.entities.filter((entity) => entity.domain === "light" && hass.states[entity.entity_id]?.state === "on").length;
              return <button aria-selected={item.id === room.id} key={item.id} onClick={() => onSelectRoom(item.id)} role="tab" type="button"><span className="room-selector__icon"><HDIcon name={roomIcon(item.name)} size={19} /></span><span>{item.id === "__unassigned__" ? t("unassigned") : item.name}</span>{count > 0 && <i>{count}</i>}</button>;
            })}
          </div>
        </aside>

        <section className="room-pane">
          <header className="room-operational-header">
            <div>
              <span className="eyebrow">{activeLights.length === 0 ? t("allOff") : (activeLights.length === 1 ? t("oneRoomLightOn") : t("roomLightsOn").replace("{count}", String(activeLights.length)))}</span>
              <h1>{roomName}</h1>
            </div>
            {lights.length > 0 && !editing && <div className="room-actions"><button disabled={busy} onClick={() => void setRoomLights("turn_on")} type="button"><HDIcon name="light" size={18} />{t("turnOn")}</button><button className="room-actions__primary" disabled={busy} onClick={() => void setRoomLights("turn_off")} type="button"><HDIcon name="power" size={18} />{t("turnOff")}</button></div>}
          </header>
          {editing && <p className="edit-hint">{t("editHint")}</p>}
          {visible.length === 0 && !editing
            ? <section className="empty-state"><p>{t("noVisibleEntities")}</p></section>
            : <EditableGrid
                className="device-grid"
                editing={editing}
                hiddenItems={hidden.map((key) => ({ key, label: byId.get(keyId(key))?.name ?? keyId(key) }))}
                items={visible.map((key) => {
                  const entity = byId.get(keyId(key))!;
                  return { key, label: entity.name, removal: own.has(entity.entity_id) ? "hide" : "remove", node: <EntityCard entity={entity} hass={hass} language={language} onLongPress={setModalEntity} t={t} /> };
                })}
                addLabel={t("addDevices")}
                layout={layout}
                onAdd={() => setPicking(true)}
                onLayout={(next) => onLayout(screen, next)}
                onRemove={(key) => setAdded(added.filter((id) => id !== keyId(key)))}
                t={t}
              />}
        </section>
      </div>
      {modalEntity && <EntityModal entity={modalEntity} hass={hass} language={language} onClose={() => setModalEntity(null)} roomName={everywhere.roomName(modalEntity) ?? roomName} t={t} />}
      {picking && <EntityPicker language={language} onClose={() => setPicking(false)} onToggle={(id) => { if (added.includes(id)) setAdded(added.filter((item) => item !== id)); else if (plan.allow(id)) setAdded([...added, id]); }} rooms={props.catalogRooms.filter((item) => item.id !== room.id)} selected={added} t={t} />}
    </main>
  );
}
