import { PageIconButton } from "../components/RoomOptions";
import { useMemo, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { CameraCard } from "../components/CameraCard";
import { EditableGrid } from "../components/EditableGrid";
import { EntityPicker } from "../components/EntityPicker";
import { HDIcon } from "../components/HDIcon";
import type { TranslationKey } from "../i18n";
import { arrange, entityKey, getLayout, keyId, pageScreen, setHidden, showItem } from "../layout";
import { usePlan } from "../plan";
import { isSecurityEntity } from "../security";
import type { HomeDeckPageConfig } from "../types/config";
import type { DiscoveredEntity } from "../types/discovery";
import { entityIndex, type ScreenProps } from "./types";

// The dock's other screens (Media, Security, Scenes and custom pages) as content any layout can show:
// a title, a count and an editable set of devices drawn by the layout's own cards or rows.

export type CollectionPage = "scenes" | "media" | "security" | "cameras";

export type PageRef = { kind: "collection"; id: CollectionPage } | { kind: "custom"; page: HomeDeckPageConfig };

const PAGE_DOMAINS: Record<CollectionPage, string[]> = {
  scenes: ["scene"],
  media: ["media_player"],
  security: ["alarm_control_panel", "camera", "lock", "binary_sensor"],
  cameras: ["camera"],
};
const ADD_LABELS: Record<CollectionPage, TranslationKey> = { scenes: "addScenes", media: "addMedia", security: "addSecurity", cameras: "addCameras" };

/** The frame that gives a camera page its 16:9 cells, for the columns chosen. */
function cameraFrame(grid: ReactNode, columns: number) {
  return <div className="camera-page" style={{ "--cols-set": columns, "--cols-phone": Math.min(columns, 2) } as CSSProperties}>{grid}</div>;
}

function CameraColumns({ columns, onPick, t }: { columns: number; onPick: (value: number) => void; t: (key: TranslationKey) => string }) {
  return <div className="room-options__row"><span className="eyebrow">{t("cameraColumns")}</span><div className="room-options__icons" role="radiogroup" aria-label={t("cameraColumns")}>{[1, 2, 3, 4].map((value) => <button aria-checked={columns === value} key={value} onClick={() => onPick(value)} role="radio" type="button">{value}</button>)}</div></div>;
}

export interface PageBodyOptions {
  className: string;
  render: (entity: DiscoveredEntity) => ReactNode;
  /** Opens a device's details (camera pages draw their own cards in every layout). */
  open?: (entity: DiscoveredEntity) => void;
  /** Cards can be made double size (grids of cards, not rows or chips). */
  sizable?: boolean;
}

export interface PageContent {
  id: string;
  title: string;
  count: number;
  /** The devices (or the empty state) and the picker to add more. */
  body: (options: PageBodyOptions) => ReactNode;
  roomName: (entity: DiscoveredEntity) => string | undefined;
}

export function pageId(ref: PageRef): string {
  return ref.kind === "collection" ? ref.id : ref.page.id;
}

export function usePageContent(props: ScreenProps, ref: PageRef): PageContent {
  return ref.kind === "collection" ? useCollection(props, ref.id) : useCustomPage(props, ref.page);
}

function useCollection(props: ScreenProps, page: CollectionPage): PageContent {
  const { config, data, editing, hass, language, onConfig, onLayout, t } = props;
  const [picking, setPicking] = useState(false);
  const isCameras = page === "cameras";
  const columns = config.camera_columns ?? 2;
  const everywhere = useMemo(() => entityIndex(props.catalogRooms), [props.catalogRooms]);
  const plan = usePlan();
  const layout = getLayout(config, page);
  // Only entities of this screen's kind, both in the list and in the picker.
  const belongs = (entity: DiscoveredEntity) => PAGE_DOMAINS[page].includes(entity.domain) && (page !== "security" || entity.domain === "alarm_control_panel" || isSecurityEntity(entity, hass.states[entity.entity_id]));
  const native = entityIndex(data.rooms);
  const nativeIds = [...native.byId.values()].filter(belongs).map((entity) => entity.entity_id);
  const nativeSet = new Set(nativeIds);
  // Added from rooms that are not in the panel (or from no room at all).
  const added = (layout.added ?? []).filter((id) => !nativeSet.has(id) && everywhere.byId.has(id) && belongs(everywhere.byId.get(id)!));
  const { visible, hidden } = arrange([...nativeIds, ...added].map(entityKey), layout, true);
  const shown = visible.map(keyId);

  const withFrame = (grid: ReactNode) => isCameras ? cameraFrame(grid, columns) : grid;

  // In the picker a check means "on this screen": native items are hidden or shown, others added or removed.
  const toggle = (id: string) => {
    const key = entityKey(id);
    if (nativeSet.has(id)) onLayout(page, shown.includes(id) ? setHidden(layout, key, true) : showItem(layout, key, visible));
    else if (added.includes(id)) onLayout(page, { ...layout, added: added.filter((item) => item !== id) });
    else if (plan.allow(id)) onLayout(page, { ...setHidden(layout, key, false), added: [...added, id] });
  };

  return {
    id: page,
    title: page === "cameras" ? t("camerasTitle") : t(page),
    count: visible.length,
    roomName: everywhere.roomName,
    body: ({ className, open, render, sizable = false }) => <>
      {isCameras && editing && <section className="room-options" aria-label={t("cameraColumns")}><CameraColumns columns={columns} onPick={(camera_columns) => onConfig((current) => ({ ...current, camera_columns }))} t={t} /></section>}
      {visible.length === 0 && !editing
        ? <section className="empty-state"><p>{t("noVisibleEntities")}</p><button className="hd-pill" onClick={() => { props.onToggleEdit(); setPicking(true); }} type="button"><HDIcon name="plus" size={16} />{t(ADD_LABELS[page])}</button></section>
        : withFrame(<EditableGrid
            hass={props.hass}
            sections
            addLabel={t(ADD_LABELS[page])}
            cameraGrid={isCameras ? columns : undefined}
            className={isCameras ? "camera-grid" : className}
            editing={editing}
            hiddenItems={hidden.map((key) => ({ key, label: everywhere.byId.get(keyId(key))?.name ?? keyId(key) }))}
            items={visible.map((key) => {
              const entity = everywhere.byId.get(keyId(key))!;
              return { key, label: entity.name, removal: nativeSet.has(entity.entity_id) ? "hide" : "remove", node: isCameras && open ? <CameraCard entity={entity} hass={hass} onOpen={open} t={t} whole /> : render(entity) };
            })}
            layout={layout}
            onAdd={() => setPicking(true)}
            onLayout={(next) => onLayout(page, next)}
            onRemove={(key) => onLayout(page, { ...layout, added: added.filter((id) => id !== keyId(key)) })}
            sizable={sizable || isCameras}
            t={t}
          />)}
      {picking && <EntityPicker domains={PAGE_DOMAINS[page]} filter={belongs} language={language} onClose={() => setPicking(false)} onToggle={toggle} rooms={props.catalogRooms} selected={shown} t={t} title={t(ADD_LABELS[page])} />}
    </>,
  };
}

function useCustomPage(props: ScreenProps, page: HomeDeckPageConfig): PageContent {
  const { allRooms, config, editing, language, onConfig, onLayout, t } = props;
  const [picking, setPicking] = useState(false);
  const { byId, roomName } = useMemo(() => entityIndex(allRooms), [allRooms]);
  const screen = pageScreen(page.id);
  const layout = getLayout(config, screen);
  // A scenes page without a selection shows every scene; items there can only be hidden.
  const isCameras = page.type === "cameras";
  const columns = page.columns ?? 2;
  const automatic = (page.type === "scenes" || isCameras) && page.entity_ids.length === 0;
  const ids = automatic ? [...byId.values()].filter((entity) => entity.domain === (isCameras ? "camera" : "scene")).map((entity) => entity.entity_id) : page.entity_ids.filter((id) => byId.has(id));
  const { visible, hidden } = arrange(ids.map(entityKey), layout);
  const framed = (grid: ReactNode) => isCameras ? cameraFrame(grid, columns) : grid;
  const setColumns = (value: number) => onConfig((current) => ({ ...current, pages: current.pages.map((item) => item.id === page.id ? { ...item, columns: value } : item) }));
  const setIds = (entityIds: string[]) => onConfig((current) => ({ ...current, pages: current.pages.map((item) => item.id === page.id ? { ...item, entity_ids: entityIds } : item) }));

  return {
    id: page.id,
    title: page.title,
    count: visible.length,
    roomName,
    body: ({ className, open, render, sizable = false }) => <>
      {editing && <section className="room-options" aria-label={t("pageIconLabel")}><div className="room-options__row"><span className="eyebrow">{t("pageIconLabel")}</span><PageIconButton fallback={isCameras ? "camera" : page.type === "scenes" ? "scene" : page.type === "favorites" ? "star" : "grid"} onPick={(icon) => onConfig((current) => ({ ...current, pages: current.pages.map((item) => item.id === page.id ? { ...item, icon } : item) }))} t={t} value={page.icon} /></div>
        {isCameras && <CameraColumns columns={columns} onPick={setColumns} t={t} />}
      </section>}
      {visible.length === 0 && !editing
        ? <section className="empty-state"><button className="hd-pill" onClick={() => { props.onToggleEdit(); setPicking(true); }} type="button"><HDIcon name="plus" size={16} />{t("addDevices")}</button></section>
        : framed(<EditableGrid
            hass={props.hass}
            sections
            addLabel={t("addDevices")}
            cameraGrid={isCameras ? columns : undefined}
            className={isCameras ? "camera-grid" : className}
            editing={editing}
            trayDevices={automatic}
            hiddenItems={hidden.map((key) => ({ key, label: byId.get(keyId(key))?.name ?? keyId(key) }))}
            items={visible.map((key) => {
              const entity = byId.get(keyId(key))!;
              return { key, label: entity.name, removal: automatic ? "hide" : "remove", node: isCameras && open ? <CameraCard entity={entity} hass={props.hass} onOpen={open} t={t} whole /> : render(entity) };
            })}
            layout={layout}
            onAdd={() => setPicking(true)}
            onLayout={(next) => onLayout(screen, next)}
            onRemove={(key) => setIds(page.entity_ids.filter((id) => id !== keyId(key)))}
            sizable={sizable || isCameras}
            t={t}
          />)}
      {picking && <EntityPicker domains={page.type === "scenes" ? ["scene"] : isCameras ? ["camera"] : undefined} language={language} onClose={() => setPicking(false)} onToggle={(id) => { if (page.entity_ids.includes(id)) setIds(page.entity_ids.filter((item) => item !== id)); else setIds([...page.entity_ids, id]); }} rooms={props.catalogRooms} selected={page.entity_ids} t={t} />}
    </>,
  };
}
