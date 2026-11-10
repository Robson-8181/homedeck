import { useCustomize } from "../personalize";
import { useMemo, useState } from "react";
import { arrange, entityKey, getLayout, keyId, setHidden } from "../layout";
import { usePlan } from "../plan";
import type { ScreenProps } from "../screens/types";
import { entityIndex } from "../screens/types";
import type { DiscoveredEntity } from "../types/discovery";
import { EditableGrid } from "./EditableGrid";
import { EntityPicker } from "./EntityPicker";
import { HDIcon } from "./HDIcon";

/** Where the strip keeps its order, hidden scenes and scenes added from other rooms. */
export const SCENES_STRIP = "home:scenes";
const UNASSIGNED = "__unassigned__";

/** Scenes of Home, above the devices in every layout: the scenes of the panel's rooms and the ones
 * without a room (Home Assistant often leaves scenes without an area). In edit mode they can be
 * dragged, hidden, or added from other rooms. */
export function SceneStrip({ props }: { props: ScreenProps }) {
  const { config, data, editing, hass, language, onLayout, t } = props;
  const [picking, setPicking] = useState(false);
  const plan = usePlan();
  const customize = useCustomize();
  const everywhere = useMemo(() => entityIndex(props.catalogRooms), [props.catalogRooms]);
  const layout = getLayout(config, SCENES_STRIP);

  const isScene = (entity: DiscoveredEntity) => entity.domain === "scene";
  const nativeIds = [...new Set([
    ...data.rooms.flatMap((room) => room.entities).filter(isScene).map((entity) => entity.entity_id),
    ...(props.catalogRooms.find((room) => room.id === UNASSIGNED)?.entities.filter(isScene).map((entity) => entity.entity_id) ?? []),
    // Scenes discovery did not list (no area and no device) still belong to Home.
    ...Object.keys(hass.states).filter((id) => id.startsWith("scene.") && !everywhere.byId.has(id) && !(customize?.restricted(`entity:${id}`) && !editing)),
  ])];
  const nativeSet = new Set(nativeIds);
  const added = (layout.added ?? []).filter((id) => !nativeSet.has(id) && everywhere.byId.has(id));
  const { visible, hidden } = arrange([...nativeIds, ...added].map(entityKey), layout);
  const shown = visible.map(keyId).filter((id) => hass.states[id]?.state !== "unavailable" || editing);

  // In the picker a check means "in the strip": native scenes are hidden or shown, others added or removed.
  const toggle = (id: string) => {
    const key = entityKey(id);
    if (nativeSet.has(id)) onLayout(SCENES_STRIP, setHidden(layout, key, shown.includes(id)));
    else if (added.includes(id)) onLayout(SCENES_STRIP, { ...layout, added: added.filter((item) => item !== id) });
    else if (plan.allow(id)) onLayout(SCENES_STRIP, { ...setHidden(layout, key, false), added: [...added, id] });
  };

  const nameOf = (id: string) => everywhere.byId.get(id)?.name ?? String(hass.states[id]?.attributes.friendly_name ?? id);

  if (shown.length === 0 && !editing) return null;
  return (
    <section className="scene-section" id="scene-strip">
      <div className="operational-heading"><span>{t("scenes")}</span><i>{shown.length}</i></div>
      <EditableGrid
        hass={hass}
        addLabel={t("addScenes")}
        className="scene-strip"
        editing={editing}
        hiddenItems={hidden.map((key) => ({ key, label: nameOf(keyId(key)) }))}
        items={shown.map((id) => {
          const name = nameOf(id);
          return {
            key: entityKey(id),
            label: name,
            removal: nativeSet.has(id) ? "hide" : "remove",
            node: <button onClick={() => void hass.callService("scene", "turn_on", { entity_id: id })} type="button"><HDIcon name="scene" size={18} /><span>{name}</span></button>,
          };
        })}
        layout={layout}
        onAdd={() => setPicking(true)}
        onLayout={(next) => onLayout(SCENES_STRIP, next)}
        onRemove={(key) => onLayout(SCENES_STRIP, { ...layout, added: added.filter((id) => id !== keyId(key)) })}
        sizable={false}
        t={t}
      />
      {picking && <EntityPicker domains={["scene"]} language={language} onClose={() => setPicking(false)} onToggle={toggle} rooms={props.catalogRooms} selected={shown} t={t} title={t("addScenes")} />}
    </section>
  );
}
