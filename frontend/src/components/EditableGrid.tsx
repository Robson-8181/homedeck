import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent, ReactNode } from "react";
import type { TranslationKey } from "../i18n";
import type { ScreenLayout } from "../types/config";
import { HDIcon } from "./HDIcon";
import { usePlan } from "../plan";

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

export function EditableGrid({ addLabel, className, editing, hiddenItems = [], items, layout, onAdd, onLayout, onRemove, sizable = true, t }: EditableGridProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const plan = usePlan();
  const drag = useRef<Drag | null>(null);
  const [order, setOrder] = useState<string[] | null>(null);
  const [dragKey, setDragKey] = useState<string | null>(null);
  const keys = items.map((item) => item.key);
  const shown = order ?? keys;
  const byKey = new Map(items.map((item) => [item.key, item]));

  // While an item is being dragged on a touch screen, the page must not scroll.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const block = (event: TouchEvent) => { if (drag.current?.active) event.preventDefault(); };
    root.addEventListener("touchmove", block, { passive: false });
    return () => root.removeEventListener("touchmove", block);
  }, []);

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
    if (!editing || (event.target as HTMLElement).closest(".hd-item__badge, .hd-add-tile, .hd-hidden-tray")) return;
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
    if (item.removal === "remove") onRemove?.(item.key);
    else onLayout({ ...layout, hidden: [...new Set([...layout.hidden, item.key])] });
  };

  return <>
    <div className={`${className} hd-grid ${editing ? "hd-grid--editing" : ""}`} ref={rootRef}>
      {shown.map((key, index) => {
        const item = byKey.get(key);
        if (!item) return null;
        const wide = layout.wide.includes(key);
        return <div
          className={`hd-item ${wide ? "hd-item--wide" : ""} ${dragKey === key ? "hd-item--dragging" : ""}`}
          data-hd-key={key}
          key={key}
          onPointerCancel={cancel}
          onPointerDown={start(key)}
          onPointerMove={move}
          onPointerUp={end}
          style={{ animationDelay: `${(index % 5) * -0.09}s` }}
        >
          <WideTile.Provider value={wide}>{item.node}</WideTile.Provider>
          {editing && <>
            <button aria-label={`${item.removal === "remove" ? t("removeItem") : t("hideItem")}: ${item.label}`} className="hd-item__badge hd-item__badge--remove" onClick={() => hide(item)} type="button"><HDIcon name="minus" size={14} /></button>
            {sizable && <button aria-label={`${wide ? t("normalSize") : t("doubleSize")}: ${item.label}`} aria-pressed={wide} className="hd-item__badge hd-item__badge--size" onClick={() => (plan.pro ? onLayout({ ...layout, wide: wide ? layout.wide.filter((entry) => entry !== key) : [...layout.wide, key] }) : plan.upsell("feature"))} type="button"><HDIcon name={!plan.pro ? "lock" : wide ? "shrink" : "expand"} size={14} /></button>}
          </>}
        </div>;
      })}
      {editing && onAdd && <button className="hd-add-tile" onClick={onAdd} type="button"><span><HDIcon name="plus" size={22} /></span>{addLabel ?? t("addItem")}</button>}
    </div>
    {editing && hiddenItems.length > 0 && <section className="hd-hidden-tray" aria-label={t("hiddenItems")}>
      <span className="eyebrow">{t("hiddenItems")}</span>
      <div>{hiddenItems.map((item) => <button key={item.key} onClick={() => onLayout({ ...layout, hidden: layout.hidden.filter((key) => key !== item.key) })} type="button"><HDIcon name="plus" size={14} />{item.label}</button>)}</div>
    </section>}
  </>;
}

function indexOf(list: string[] | null, key: string): number {
  return list ? list.indexOf(key) : -1;
}
