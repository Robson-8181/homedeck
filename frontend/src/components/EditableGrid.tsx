import { createContext, Fragment, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent, ReactNode } from "react";
import type { TranslationKey } from "../i18n";
import type { ScreenLayout } from "../types/config";
import { HDIcon } from "./HDIcon";
import { usePlan } from "../plan";
import { isSectionKey, SECTION_PREFIX, showItem, withSections } from "../layout";

/** True inside a double-size tile, so cards can offer more controls there. */
const WideTile = createContext(false);
export const useWideTile = () => useContext(WideTile);
/** Sensors can also be small: half the height of a normal card. */
const canBeSmall = (key: string) => /^entity:(sensor|binary_sensor)\./.test(key);
type CardSize = "small" | "normal" | "double" | "large";
const SIZE_LABELS: Record<CardSize, TranslationKey> = { small: "sizeSmall", normal: "sizeNormal", double: "sizeDouble", large: "sizeLarge" };
const SIZE_MARKS: Record<CardSize, string> = { small: "½×", normal: "1×", double: "2×", large: "4×" };

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
  hiddenItems?: Array<{ key: string; label: string }>;
  items: GridItem[];
  layout: ScreenLayout;
  onAdd?: () => void;
  onLayout: (layout: ScreenLayout) => void;
  onRemove?: (key: string) => void;
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
  active: boolean;
  timer: number | null;
}

const HOLD_MS = 260;

export function EditableGrid({ addLabel, className, editing, hiddenItems = [], items: cards, layout, onAdd, onLayout, onRemove, sections = false, sizable = true, t }: EditableGridProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const plan = usePlan();
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
  useEffect(() => { if (!editing) setSizing(null); }, [editing]);
  const titles = sections ? layout.sections ?? {} : {};
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
    drag.current = { key, pointerId, grabX: event.clientX - rect.left, grabY: event.clientY - rect.top, x: event.clientX, y: event.clientY, active: false, timer: null };
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
    cancel();
    setOrder(null);
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
    const size: CardSize = small ? "small" : tall ? "large" : wide ? "double" : "normal";
    const without = (list?: string[]) => (list ?? []).filter((entry) => entry !== key);
    // The size badge opens a menu with every size (small only for sensors), the current one marked.
    // Largest at the top, so the stack grows up from the button.
    const sizes: CardSize[] = canBeSmall(key) ? ["large", "double", "normal", "small"] : ["large", "double", "normal"];
    const choose = (next: CardSize) => {
      setSizing(null);
      if (next === size) return;
      if (next !== "normal" && !plan.pro) { plan.upsell("feature"); return; }
      onLayout({
        ...layout,
        wide: next === "double" || next === "large" ? [...without(layout.wide), key] : without(layout.wide),
        tall: next === "large" ? [...without(layout.tall), key] : without(layout.tall),
        small: next === "small" ? [...without(layout.small), key] : without(layout.small),
      });
    };
    return <div
      className={`hd-item ${wide ? "hd-item--wide" : ""} ${tall ? "hd-item--tall" : ""} ${small ? "hd-item--small" : ""} ${sizing === key ? "hd-item--sizing" : ""} ${section ? "hd-item--section" : ""} ${dragKey === key ? "hd-item--dragging" : ""}`}
      data-hd-key={key}
      key={key}
      onPointerDown={start(key)}
      style={{ animationDelay: `${(index % 5) * -0.09}s` }}
    >
      <WideTile.Provider value={wide}><TallTile.Provider value={tall}>{item.node}</TallTile.Provider></WideTile.Provider>
      {editing && <>
        <button aria-label={`${item.removal === "remove" ? t("removeItem") : t("hideItem")}: ${item.label}`} className="hd-item__badge hd-item__badge--remove" onClick={() => hide(item)} type="button"><HDIcon name="minus" size={14} /></button>
        {sizable && !section && <button aria-expanded={sizing === key} aria-haspopup="menu" aria-label={`${t("sizeMenu")}: ${item.label} (${t(SIZE_LABELS[size])})`} className="hd-item__badge hd-item__badge--size" onClick={() => setSizing(sizing === key ? null : key)} type="button"><HDIcon name={size === "large" || size === "double" ? "shrink" : "expand"} size={14} /></button>}
        {sizable && !section && sizing === key && <div aria-label={t("sizeMenu")} className="hd-sizemenu" role="menu">
          {sizes.map((option) => <button aria-checked={option === size} aria-label={t(SIZE_LABELS[option])} className={`hd-sizemenu__option ${option === size ? "hd-sizemenu__option--on" : ""} ${option !== "normal" && !plan.pro ? "hd-sizemenu__option--locked" : ""}`} key={option} onClick={() => choose(option)} role="menuitemradio" title={t(SIZE_LABELS[option])} type="button">{SIZE_MARKS[option]}</button>)}
        </div>}
      </>}
    </div>;
  };
  const addTiles = <>
    {editing && onAdd && <button className="hd-add-tile" onClick={onAdd} type="button"><span><HDIcon name="plus" size={22} /></span>{addLabel ?? t("addItem")}</button>}
    {editing && sections && <button className="hd-add-tile hd-add-tile--section" onClick={addSection} type="button"><span><HDIcon name="minus" size={22} /></span>{t("addSection")}</button>}
  </>;
  const gridClass = `${className} hd-grid ${editing ? "hd-grid--editing" : ""}`;
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
      ? <div className={gridFor(shown)} {...pointer}>{shown.map(renderItem)}{addTiles}</div>
      : <div className={`hd-sections ${editing ? "hd-sections--editing" : ""}`} {...pointer}>
        {blocks.map((block, index) => <Fragment key={block.section ?? "start"}>
          {block.section && renderItem(block.section, 0)}
          {(block.keys.length > 0 || index === blocks.length - 1) && <div className={gridFor(block.keys)}>
            {block.keys.map(renderItem)}
            {index === blocks.length - 1 && addTiles}
          </div>}
        </Fragment>)}
      </div>}
    {editing && hiddenItems.length > 0 && <section className="hd-hidden-tray" aria-label={t("hiddenItems")}>
      <span className="eyebrow">{t("hiddenItems")}</span>
      <div>{hiddenItems.map((item) => <button key={item.key} onClick={() => onLayout(showItem(layout, item.key, keys))} type="button"><HDIcon name="plus" size={14} />{item.label}</button>)}</div>
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
