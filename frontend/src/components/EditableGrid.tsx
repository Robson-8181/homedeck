import { createContext, Fragment, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { PointerEvent as ReactPointerEvent, ReactNode } from "react";
import type { TranslationKey } from "../i18n";
import type { ScreenLayout } from "../types/config";
import { HDIcon } from "./HDIcon";
import { usePlan } from "../plan";
import { conditionMet, useCustomize, useMinute } from "../personalize";
import { EntityEditSheet } from "./EntityModal";
import { RoomCardSheet } from "./CardLinks";
import type { HomeAssistant } from "../types/home-assistant";
import { isSectionKey, SECTION_PREFIX, showItem, withSections } from "../layout";

/** True inside a double-size tile, so cards can offer more controls there. */
const WideTile = createContext(false);
export const useWideTile = () => useContext(WideTile);
/** Sensors can also be small: half the height of a normal card. */
const canBeSmall = (key: string) => /^entity:(sensor|binary_sensor)\./.test(key);
type CardSize = "small" | "normal" | "double" | "large" | "x6" | "x8" | "c4" | "c9" | "c16";
const SIZE_LABELS: Partial<Record<CardSize, TranslationKey>> = { small: "sizeSmall", normal: "sizeNormal", double: "sizeDouble", large: "sizeLarge" };
const SIZE_MARKS: Record<CardSize, string> = { small: "½×", normal: "1×", double: "2×", large: "4×", x6: "6×", x8: "8×", c4: "4×", c9: "9×", c16: "16×" };
const CELLS: Partial<Record<CardSize, number>> = { x6: 6, x8: 8, c4: 4, c9: 9, c16: 16 };
const isCamera = (key: string) => key.startsWith("entity:camera.");

/** True inside a large tile (two columns and two rows). */
const TallTile = createContext(false);
export const useTallTile = () => useContext(TallTile);

export interface GridItem {
  key: string;
  node: ReactNode;
  label: string;
  /** "hide" keeps the item available in the hidden tray; "remove" takes it off the screen. */
  removal?: "hide" | "remove";
}

interface EditableGridProps {
  addLabel?: string;
  className: string;
  editing: boolean;
  /** Lets a tap on a device, in Edit mode, open its name, icon and options. */
  hass?: HomeAssistant;
  hiddenItems?: Array<{ key: string; label: string }>;
  items: GridItem[];
  layout: ScreenLayout;
  onAdd?: () => void;
  onLayout: (layout: ScreenLayout) => void;
  onRemove?: (key: string) => void;
  /** A camera page: how many columns it has. Sizes there keep the 16:9 shape (1×, 4×, 9×, 16× cells). */
  cameraGrid?: number;
  /** Keeps hidden devices in the tray, for a screen whose "add" list can't bring them back. */
  trayDevices?: boolean;
  /** Offers the double-size badge (cards); rows and chips keep one size. */
  sizable?: boolean;
  /** Allows separators with a title between the items (device and card screens). */
  sections?: boolean;
  t: (key: TranslationKey) => string;
}

interface Drag {
  key: string;
  pointerId: number;
  grabX: number;
  grabY: number;
  x: number;
  y: number;
  startX: number;
  startY: number;
  active: boolean;
  timer: number | null;
}

const HOLD_MS = 260;

/** The height of a stretched row ("1fr") in the first grid, or null when the rows don't stretch. */
function stretchedRow(root: HTMLElement | null): string | null {
  const grid = root?.classList.contains("hd-grid") ? root : root?.querySelector<HTMLElement>(".hd-grid");
  if (!grid) return null;
  const style = getComputedStyle(grid);
  if (!style.gridAutoRows.includes("fr")) return null;
  const first = style.gridTemplateRows.split(" ")[0];
  return /^\d+(\.\d+)?px$/.test(first) ? first : null;
}

export function EditableGrid({ addLabel, cameraGrid, className, editing, hass, hiddenItems = [], items: allCards, layout, onAdd, onLayout, onRemove, sections = false, sizable = true, t, trayDevices = false }: EditableGridProps) {
  // A hidden device simply leaves the screen and goes back to the "add" list; rooms and widgets stay in the tray.
  const tray = hiddenItems.filter((item) => trayDevices || !item.key.startsWith("entity:"));
  const rootRef = useRef<HTMLDivElement>(null);
  // Grids whose rows stretch to fill the screen (Home) keep the row height they had outside Edit
  // mode, so the cards look the same while editing even with the hint and the add tiles. It is read
  // from the page as it is right before Edit mode is drawn.
  const rowLock = useRef<string | null>(null);
  const wasEditing = useRef(editing);
  if (editing !== wasEditing.current) {
    wasEditing.current = editing;
    rowLock.current = editing ? stretchedRow(rootRef.current) : null;
  }
  const [, redraw] = useState(0);
  useEffect(() => {
    if (!editing) return;
    // Turning the device or resizing the window while editing: let the rows follow again.
    const release = () => { if (rowLock.current) { rowLock.current = null; redraw((count) => count + 1); } };
    window.addEventListener("resize", release);
    return () => window.removeEventListener("resize", release);
  }, [editing]);
  const plan = usePlan();
  const customize = useCustomize();
  const drag = useRef<Drag | null>(null);
  const [order, setOrder] = useState<string[] | null>(null);
  const [dragKey, setDragKey] = useState<string | null>(null);
  // The card whose size menu is open; a tap elsewhere or Escape closes it.
  const [sizing, setSizing] = useState<string | null>(null);
  useEffect(() => {
    if (!sizing) return;
    const outside = (event: PointerEvent) => { if (!event.composedPath().some((node) => node instanceof HTMLElement && (node.classList.contains("hd-sizemenu") || node.classList.contains("hd-item__badge--size")))) setSizing(null); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setSizing(null); };
    window.addEventListener("pointerdown", outside, true);
    window.addEventListener("keydown", escape);
    return () => { window.removeEventListener("pointerdown", outside, true); window.removeEventListener("keydown", escape); };
  }, [sizing]);
  // The device opened with a tap in Edit mode.
  const [editingEntity, setEditingEntity] = useState<string | null>(null);
  const [editingRoom, setEditingRoom] = useState<string | null>(null);
  useEffect(() => { if (!editing) { setSizing(null); setEditingEntity(null); setEditingRoom(null); } }, [editing]);
  const titles = sections ? layout.sections ?? {} : {};
  // A card with rules only leaves the screen outside Edit mode, where it can still be changed.
  const checksRules = !editing && Boolean(hass) && plan.pro;
  const rulesOf = (item: GridItem) => item.key.startsWith("entity:") ? customize?.lookup(item.key.slice("entity:".length))?.visible_when : undefined;
  const now = useMinute(checksRules && allCards.some((item) => { const rule = rulesOf(item); return Boolean(rule?.from || rule?.days?.length); }));
  const cards = checksRules ? allCards.filter((item) => conditionMet(rulesOf(item), hass!.states, new Date(now))) : allCards;
  const keys = withSections(cards.map((item) => item.key), sections ? layout : { ...layout, sections: {} });
  const setTitle = (key: string, title: string) => onLayout({ ...layout, sections: { ...titles, [key]: title.trim().slice(0, 60) || t("newSection") } });
  const items: GridItem[] = [...cards, ...Object.keys(titles).map((key): GridItem => ({
    key,
    label: titles[key],
    removal: "remove",
    node: editing ? <SectionTitle onTitle={(title) => setTitle(key, title)} t={t} title={titles[key]} /> : <h2 className="hd-section"><span>{titles[key]}</span></h2>,
  }))];
  const shown = order ?? keys;
  const byKey = new Map(items.map((item) => [item.key, item]));

  const sectioned = shown.some(isSectionKey);
  // While an item is being dragged on a touch screen, the page must not scroll.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const block = (event: TouchEvent) => { if (drag.current?.active) event.preventDefault(); };
    root.addEventListener("touchmove", block, { passive: false });
    return () => root.removeEventListener("touchmove", block);
  }, [sectioned]);

  useEffect(() => { if (!editing) cancel(); }, [editing]);

  // Keep the dragged card under the finger after each reorder.
  useLayoutEffect(() => { if (drag.current?.active) follow(); });
  // 6× and 8× cameras ask for 3 and 4 columns; a grid with fewer would add a narrow extra column and
  // squeeze every card. Each such grid gets the number of columns it really has, and the CSS fits the
  // big cards in it.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const grids = (root.classList.contains("hd-grid") ? [root] : [...root.querySelectorAll<HTMLElement>(".hd-grid")]).filter((grid) => grid.querySelector(":scope > .hd-item--x6, :scope > .hd-item--x8"));
    if (grids.length === 0) return;
    const measure = () => {
      for (const grid of grids) {
        // The real columns are all the same width; one added for a too-wide card comes last and differs.
        const tracks = getComputedStyle(grid).gridTemplateColumns.split(" ").map(parseFloat).filter((width) => !Number.isNaN(width));
        const columns = String(tracks.filter((width) => Math.abs(width - tracks[0]) < 1.5).length);
        if (grid.dataset.cols !== columns) grid.dataset.cols = columns;
      }
    };
    measure();
    const observer = new ResizeObserver(measure);
    for (const grid of grids) observer.observe(grid);
    window.addEventListener("resize", measure);
    return () => { observer.disconnect(); window.removeEventListener("resize", measure); };
  });

  const element = (key: string) => rootRef.current?.querySelector<HTMLElement>(`[data-hd-key="${CSS.escape(key)}"]`);

  const follow = () => {
    const current = drag.current;
    const el = current && element(current.key);
    if (!current || !el) return;
    el.style.transform = "none";
    const rect = el.getBoundingClientRect();
    el.style.transform = `translate(${current.x - current.grabX - rect.left}px, ${current.y - current.grabY - rect.top}px) scale(1.04)`;
  };

  const cancel = () => {
    const current = drag.current;
    if (current?.timer != null) window.clearTimeout(current.timer);
    if (current) {
      const el = element(current.key);
      if (el) el.style.transform = "";
    }
    drag.current = null;
    setDragKey(null);
  };

  const start = (key: string) => (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!editing || (event.target as HTMLElement).closest(".hd-item__badge, .hd-sizemenu, .hd-add-tile, .hd-hidden-tray, .hd-section__input")) return;
    // Grids can be nested (rows inside a section): the innermost one takes the drag.
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    const target = event.currentTarget;
    const pointerId = event.pointerId;
    const activate = () => {
      if (!drag.current) return;
      drag.current.active = true;
      drag.current.timer = null;
      try { target.setPointerCapture(pointerId); } catch { /* pointer already released */ }
      setDragKey(key);
      setOrder(keys);
      follow();
    };
    drag.current = { key, pointerId, grabX: event.clientX - rect.left, grabY: event.clientY - rect.top, x: event.clientX, y: event.clientY, startX: event.clientX, startY: event.clientY, active: false, timer: null };
    if (event.pointerType === "mouse") activate();
    else drag.current.timer = window.setTimeout(activate, HOLD_MS);
  };

  const move = (event: ReactPointerEvent<HTMLDivElement>) => {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    if (!current.active) {
      // Moving before the hold completes is a scroll, not a drag.
      if (Math.hypot(event.clientX - current.x, event.clientY - current.y) > 8) cancel();
      return;
    }
    current.x = event.clientX;
    current.y = event.clientY;
    const root = rootRef.current?.getRootNode() as Document | ShadowRoot | undefined;
    const el = element(current.key);
    if (el) el.style.visibility = "hidden";
    let under = root?.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>("[data-hd-key]") ?? null;
    if (el) el.style.visibility = "";
    // Skip items of a nested grid until reaching one of this grid.
    while (under && !keys.includes(under.dataset.hdKey ?? "")) under = under.parentElement?.closest<HTMLElement>("[data-hd-key]") ?? null;
    const overKey = under?.dataset.hdKey;
    if (overKey && overKey !== current.key) {
      setOrder((list) => {
        const next = [...(list ?? keys)].filter((item) => item !== current.key);
        next.splice(next.indexOf(overKey) + (indexOf(list, current.key) < indexOf(list, overKey) ? 1 : 0), 0, current.key);
        return next;
      });
    }
    follow();
  };

  const addSection = () => {
    const key = `${SECTION_PREFIX}${Date.now().toString(36)}`;
    onLayout({ ...layout, sections: { ...titles, [key]: t("newSection") }, order: [...keys, key, ...layout.hidden.filter((item) => !keys.includes(item))] });
  };

  const end = (event: ReactPointerEvent<HTMLDivElement>) => {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    const moved = current.active && order != null && order.join("|") !== keys.join("|");
    const finalOrder = order;
    // Released where it was pressed: a tap, which opens the device's options.
    const tapped = !moved && Math.hypot(event.clientX - current.startX, event.clientY - current.startY) < 8;
    const tappedKey = current.key;
    cancel();
    setOrder(null);
    if (tapped && hass && tappedKey.startsWith("entity:")) setEditingEntity(tappedKey.slice("entity:".length));
    // Room cards: who can see them and, at double or large size, their extra devices.
    if (tapped && hass && sizable && tappedKey.startsWith("room:")) setEditingRoom(tappedKey.slice("room:".length));
    if (moved && finalOrder) onLayout({ ...layout, order: [...finalOrder, ...layout.hidden.filter((key) => !finalOrder.includes(key))] });
  };

  const hide = (item: GridItem) => {
    if (isSectionKey(item.key)) {
      const { [item.key]: _removed, ...rest } = titles;
      onLayout({ ...layout, sections: rest, order: layout.order.filter((key) => key !== item.key) });
    } else if (item.removal === "remove") onRemove?.(item.key);
    else onLayout({ ...layout, hidden: [...new Set([...layout.hidden, item.key])] });
  };

  const renderItem = (key: string, index: number) => {
    const item = byKey.get(key);
    if (!item) return null;
    const section = isSectionKey(key);
    const wide = !section && layout.wide.includes(key);
    const tall = wide && (layout.tall ?? []).includes(key);
    const small = !section && !wide && canBeSmall(key) && (layout.small ?? []).includes(key);
    const cells = !section ? layout.cells?.[key] : undefined;
    // On a camera page a size can't be larger than the columns the page has now.
    const pageCells = cameraGrid && cells ? Math.min(cells, cameraGrid * cameraGrid) : undefined;
    const size: CardSize = cameraGrid
      ? pageCells === 16 ? "c16" : pageCells === 9 ? "c9" : pageCells === 4 ? "c4" : "normal"
      : wide && isCamera(key) && cells === 8 ? "x8" : wide && isCamera(key) && cells === 6 ? "x6" : small ? "small" : tall ? "large" : wide ? "double" : "normal";
    const without = (list?: string[]) => (list ?? []).filter((entry) => entry !== key);
    // The size badge opens a menu with every size (small only for sensors), the current one marked.
    // Largest at the top, so the stack grows up from the button.
    const sizes: CardSize[] = cameraGrid
      ? [...(cameraGrid >= 4 ? ["c16" as const] : []), ...(cameraGrid >= 3 ? ["c9" as const] : []), ...(cameraGrid >= 2 ? ["c4" as const] : []), "normal"]
      : isCamera(key) ? ["x8", "x6", "large", "double", "normal"]
      : canBeSmall(key) ? ["large", "double", "normal", "small"] : ["large", "double", "normal"];
    const choose = (next: CardSize) => {
      setSizing(null);
      if (next === size) return;
      if (next !== "normal" && !plan.pro) { plan.upsell("feature"); return; }
      const big = next === "large" || next === "x6" || next === "x8";
      const { [key]: _old, ...otherCells } = layout.cells ?? {};
      onLayout({
        ...layout,
        cells: CELLS[next] ? { ...otherCells, [key]: CELLS[next]! } : otherCells,
        wide: !cameraGrid && (next === "double" || big) ? [...without(layout.wide), key] : without(layout.wide),
        tall: !cameraGrid && big ? [...without(layout.tall), key] : without(layout.tall),
        small: next === "small" ? [...without(layout.small), key] : without(layout.small),
      });
    };
    return <div
      className={`hd-item ${wide ? "hd-item--wide" : ""} ${tall ? "hd-item--tall" : ""} ${small ? "hd-item--small" : ""} ${sizing === key ? "hd-item--sizing" : ""} ${customize?.restricted(key) ? "hd-item--restricted" : ""} ${size === "x6" || size === "x8" ? `hd-item--${size}` : ""} ${pageCells ? `hd-item--c${pageCells}` : ""} ${section ? "hd-item--section" : ""} ${dragKey === key ? "hd-item--dragging" : ""}`}
      data-hd-key={key}
      key={key}
      onPointerDown={start(key)}
      style={{ animationDelay: `${(index % 5) * -0.09}s` }}
    >
      <WideTile.Provider value={wide}><TallTile.Provider value={tall}>{item.node}</TallTile.Provider></WideTile.Provider>
      {editing && <>
        <button aria-label={`${item.removal === "remove" ? t("removeItem") : t("hideItem")}: ${item.label}`} className="hd-item__badge hd-item__badge--remove" onClick={() => hide(item)} type="button"><HDIcon name="minus" size={14} /></button>
        {sizable && !section && <button aria-expanded={sizing === key} aria-haspopup="menu" aria-label={`${t("sizeMenu")}: ${item.label} (${SIZE_LABELS[size] ? t(SIZE_LABELS[size]!) : SIZE_MARKS[size]})`} className="hd-item__badge hd-item__badge--size" onClick={() => setSizing(sizing === key ? null : key)} type="button"><HDIcon name={size === "normal" || size === "small" ? "expand" : "shrink"} size={14} /></button>}
        {sizable && !section && sizing === key && <div aria-label={t("sizeMenu")} className="hd-sizemenu" role="menu">
          {sizes.map((option) => <button aria-checked={option === size} aria-label={SIZE_LABELS[option] ? t(SIZE_LABELS[option]!) : SIZE_MARKS[option]} className={`hd-sizemenu__option ${option === size ? "hd-sizemenu__option--on" : ""} ${option !== "normal" && !plan.pro ? "hd-sizemenu__option--locked" : ""}`} key={option} onClick={() => choose(option)} role="menuitemradio" title={SIZE_LABELS[option] ? t(SIZE_LABELS[option]!) : SIZE_MARKS[option]} type="button">{SIZE_MARKS[option]}</button>)}
        </div>}
      </>}
    </div>;
  };
  const addTiles = <>
    {editing && onAdd && <button className="hd-add-tile" onClick={onAdd} type="button"><span><HDIcon name="plus" size={22} /></span>{addLabel ?? t("addItem")}</button>}
    {editing && sections && <button className="hd-add-tile hd-add-tile--section" onClick={addSection} type="button"><span><HDIcon name="minus" size={22} /></span>{t("addSection")}</button>}
  </>;
  const gridClass = `${className} hd-grid ${editing ? "hd-grid--editing" : ""}`;
  const gridStyle = editing && rowLock.current ? { gridAutoRows: rowLock.current } : undefined;
  // A grid with small cards switches to half-height rows (a normal card spans two of them).
  const smallKeys = new Set((layout.small ?? []).filter((key) => canBeSmall(key) && !layout.wide.includes(key)));
  const gridFor = (list: string[]) => list.some((key) => smallKeys.has(key)) ? `${gridClass} hd-grid--halves` : gridClass;
  // Move and release are handled on the root: a card dragged across a separator changes block and
  // loses its pointer capture, so later events can come from anywhere inside.
  const pointer = { onPointerCancel: cancel, onPointerMove: move, onPointerUp: end, ref: rootRef };
  // With separators the items are split into blocks, each its own grid, with the titles between them.
  const blocks: Array<{ section?: string; keys: string[] }> = [{ keys: [] }];
  for (const key of shown) {
    if (isSectionKey(key) && byKey.has(key)) blocks.push({ section: key, keys: [] });
    else blocks[blocks.length - 1].keys.push(key);
  }

  return <>
    {!sectioned
      ? <div className={gridFor(shown)} style={gridStyle} {...pointer}>{shown.map(renderItem)}{addTiles}</div>
      : <div className={`hd-sections ${editing ? "hd-sections--editing" : ""}`} {...pointer}>
        {blocks.map((block, index) => <Fragment key={block.section ?? "start"}>
          {block.section && renderItem(block.section, 0)}
          {(block.keys.length > 0 || index === blocks.length - 1) && <div className={gridFor(block.keys)} style={gridStyle}>
            {block.keys.map(renderItem)}
            {index === blocks.length - 1 && addTiles}
          </div>}
        </Fragment>)}
      </div>}
    {editingEntity && hass && rootRef.current?.closest(".app-shell") && createPortal(<EntityEditSheet entityId={editingEntity} hass={hass} linkable={sizable && layout.wide.includes(`entity:${editingEntity}`)} onClose={() => setEditingEntity(null)} t={t} />, rootRef.current.closest(".app-shell")!)}
    {editingRoom && rootRef.current?.closest(".app-shell") && hass && createPortal(<RoomCardSheet hass={hass} linkable={layout.wide.includes(`room:${editingRoom}`)} onClose={() => setEditingRoom(null)} roomId={editingRoom} t={t} />, rootRef.current.closest(".app-shell")!)}
    {editing && tray.length > 0 && <section className="hd-hidden-tray" aria-label={t("hiddenItems")}>
      <span className="eyebrow">{t("hiddenItems")}</span>
      <div>{tray.map((item) => <button key={item.key} onClick={() => onLayout(showItem(layout, item.key, keys))} type="button"><HDIcon name="plus" size={14} />{item.label}</button>)}</div>
    </section>}
  </>;
}

/** A separator's title in edit mode: typed freely, saved when the field is left or Enter is pressed. */
function SectionTitle({ onTitle, t, title }: { onTitle: (title: string) => void; t: (key: TranslationKey) => string; title: string }) {
  const [draft, setDraft] = useState(title);
  useEffect(() => setDraft(title), [title]);
  const commit = () => { if (draft.trim() !== title) onTitle(draft); };
  return <div className="hd-section hd-section--editing">
    <HDIcon name="grip" size={16} />
    <input aria-label={t("sectionTitle")} className="hd-section__input" maxLength={60} onBlur={commit} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); }} placeholder={t("newSection")} value={draft} />
  </div>;
}

function indexOf(list: string[] | null, key: string): number {
  return list ? list.indexOf(key) : -1;
}
