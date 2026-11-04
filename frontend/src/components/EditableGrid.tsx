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
    if (!editing || (event.target as HTMLElement).closest(".hd-item__badge, .hd-add-tile, .hd-hidden-tray, .hd-section__input")) return;
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
    return <div
      className={`hd-item ${wide ? "hd-item--wide" : ""} ${section ? "hd-item--section" : ""} ${dragKey === key ? "hd-item--dragging" : ""}`}
      data-hd-key={key}
      key={key}
      onPointerDown={start(key)}
      style={{ animationDelay: `${(index % 5) * -0.09}s` }}
    >
      <WideTile.Provider value={wide}>{item.node}</WideTile.Provider>
      {editing && <>
        <button aria-label={`${item.removal === "remove" ? t("removeItem") : t("hideItem")}: ${item.label}`} className="hd-item__badge hd-item__badge--remove" onClick={() => hide(item)} type="button"><HDIcon name="minus" size={14} /></button>
        {sizable && !section && <button aria-label={`${wide ? t("normalSize") : t("doubleSize")}: ${item.label}`} aria-pressed={wide} className="hd-item__badge hd-item__badge--size" onClick={() => (plan.pro ? onLayout({ ...layout, wide: wide ? layout.wide.filter((entry) => entry !== key) : [...layout.wide, key] }) : plan.upsell("feature"))} type="button"><HDIcon name={!plan.pro ? "lock" : wide ? "shrink" : "expand"} size={14} /></button>}
      </>}
    </div>;
  };
  const addTiles = <>
    {editing && onAdd && <button className="hd-add-tile" onClick={onAdd} type="button"><span><HDIcon name="plus" size={22} /></span>{addLabel ?? t("addItem")}</button>}
    {editing && sections && <button className="hd-add-tile hd-add-tile--section" onClick={addSection} type="button"><span><HDIcon name="minus" size={22} /></span>{t("addSection")}</button>}
  </>;
  const gridClass = `${className} hd-grid ${editing ? "hd-grid--editing" : ""}`;
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
      ? <div className={gridClass} {...pointer}>{shown.map(renderItem)}{addTiles}</div>
      : <div className={`hd-sections ${editing ? "hd-sections--editing" : ""}`} {...pointer}>
        {blocks.map((block, index) => <Fragment key={block.section ?? "start"}>
          {block.section && renderItem(block.section, 0)}
          {(block.keys.length > 0 || index === blocks.length - 1) && <div className={gridClass}>
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
