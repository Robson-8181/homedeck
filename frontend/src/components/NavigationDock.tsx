import { useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import type { TranslationKey } from "../i18n";
import type { HomeDeckConfig, HomeDeckPageConfig } from "../types/config";
import { HDIcon, type IconName } from "./HDIcon";

export type HomeDeckPage = "home" | "rooms" | "scenes" | "media" | "security" | string;

interface Tab { id: string; icon: IconName; label: string }

function pageIcon(page: HomeDeckPageConfig): IconName {
  if (page.type === "favorites") return "star";
  if (page.type === "scenes") return "scene";
  return "grid";
}

/** Tabs in the order arranged in Edit mode; tabs never placed keep their natural order after the placed ones. */
export function orderTabs<T extends { id: string }>(tabs: T[], order: string[] = []): T[] {
  const at = (id: string) => { const index = order.indexOf(id); return index < 0 ? order.length : index; };
  return tabs.map((tab, index) => ({ tab, index })).sort((a, b) => at(a.tab.id) - at(b.tab.id) || a.index - b.index).map(({ tab }) => tab);
}

/** The bottom bar. Home stays first; in Edit mode the other tabs are dragged sideways to reorder them. */
export function NavigationDock({ active, config, editing, hasMedia, hasScenes, hasSecurity, onNavigate, onOrder, t }: { active: HomeDeckPage; config: HomeDeckConfig; editing: boolean; hasMedia: boolean; hasScenes: boolean; hasSecurity: boolean; onNavigate: (page: HomeDeckPage) => void; onOrder: (order: string[]) => void; t: (key: TranslationKey) => string }) {
  const tabs = orderTabs<Tab>([
    ...(config.navigation.rooms ? [{ id: "rooms", icon: "grid" as const, label: t("roomsPage") }] : []),
    ...(config.navigation.scenes && hasScenes ? [{ id: "scenes", icon: "scene" as const, label: t("scenes") }] : []),
    ...(config.navigation.media && hasMedia ? [{ id: "media", icon: "media" as const, label: t("media") }] : []),
    ...(config.navigation.security && hasSecurity ? [{ id: "security", icon: "shield" as const, label: t("security") }] : []),
    ...config.pages.map((page) => ({ id: page.id, icon: pageIcon(page), label: page.title })),
  ], config.navigation.order);
  const nav = useRef<HTMLElement>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [live, setLive] = useState<string[] | null>(null);
  // Pointer up and the lost capture both end a drag: the ref makes sure the order is saved once.
  const order = useRef<string[] | null>(null);
  const shown = live ? live.map((id) => tabs.find((tab) => tab.id === id)!).filter(Boolean) : tabs;

  // The pointer is captured by the bar itself: the dragged tab moves in the DOM and would lose it.
  const start = (event: ReactPointerEvent, id: string) => {
    if (!editing) return;
    event.preventDefault();
    nav.current?.setPointerCapture(event.pointerId);
    order.current = tabs.map((tab) => tab.id);
    setDragging(id);
    setLive(order.current);
  };
  const move = (event: ReactPointerEvent) => {
    const current = order.current;
    if (!dragging || !current || !nav.current) return;
    // A bar wider than the screen scrolls while a tab is held near its edges.
    const bar = nav.current.getBoundingClientRect();
    const edge = Math.min(48, bar.width / 6);
    if (event.clientX < bar.left + edge) nav.current.scrollLeft -= 10;
    else if (event.clientX > bar.right - edge) nav.current.scrollLeft += 10;
    const over = [...nav.current.querySelectorAll<HTMLElement>("[data-tab]")].find((button) => {
      const box = button.getBoundingClientRect();
      return event.clientX >= box.left && event.clientX <= box.right;
    })?.dataset.tab;
    if (!over || over === dragging) return;
    const next = current.filter((id) => id !== dragging);
    next.splice(current.indexOf(over), 0, dragging);
    order.current = next;
    setLive(next);
  };
  const end = () => {
    const next = order.current;
    order.current = null;
    if (next && next.join() !== tabs.map((tab) => tab.id).join()) onOrder(next);
    setDragging(null);
    setLive(null);
  };

  const item = (tab: Tab, movable: boolean) => <button
    aria-current={active === tab.id ? "page" : undefined}
    aria-label={editing && movable ? `${tab.label}: ${t("dragToReorder")}` : tab.label}
    className={[active === tab.id && "navigation-dock__active", dragging === tab.id && "navigation-dock__dragging"].filter(Boolean).join(" ")}
    data-tab={movable ? tab.id : undefined}
    key={tab.id}
    onClick={() => { if (!editing) onNavigate(tab.id); }}
    onPointerDown={movable ? (event) => start(event, tab.id) : undefined}
    type="button"
  ><HDIcon name={editing && movable ? "grip" : tab.icon} size={19} /><span>{tab.label}</span></button>;

  return <nav aria-label={t("navigation")} className={editing ? "navigation-dock navigation-dock--editing" : "navigation-dock"} onLostPointerCapture={end} onPointerMove={move} onPointerUp={end} ref={nav}>
    {item({ id: "home", icon: "home", label: t("home") }, false)}
    {shown.map((tab) => item(tab, true))}
  </nav>;
}
