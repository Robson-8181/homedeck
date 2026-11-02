import type { TranslationKey } from "../i18n";
import type { HomeDeckConfig, HomeDeckPageConfig } from "../types/config";
import { HDIcon, type IconName } from "./HDIcon";

export type HomeDeckPage = "home" | "rooms" | "scenes" | "media" | "security" | string;

function pageIcon(page: HomeDeckPageConfig): IconName {
  if (page.type === "favorites") return "star";
  if (page.type === "scenes") return "scene";
  return "grid";
}

export function NavigationDock({ active, config, hasMedia, hasScenes, hasSecurity, onNavigate, t }: { active: HomeDeckPage; config: HomeDeckConfig; hasMedia: boolean; hasScenes: boolean; hasSecurity: boolean; onNavigate: (page: HomeDeckPage) => void; t: (key: TranslationKey) => string }) {
  const item = (page: HomeDeckPage, icon: IconName, label: string) => <button aria-current={active === page ? "page" : undefined} aria-label={label} className={active === page ? "navigation-dock__active" : ""} key={page} onClick={() => onNavigate(page)} type="button"><HDIcon name={icon} size={19} /><span>{label}</span></button>;
  return <nav className="navigation-dock" aria-label={t("navigation")}>
    {item("home", "home", t("home"))}
    {config.navigation.rooms && item("rooms", "grid", t("roomsPage"))}
    {config.navigation.scenes && hasScenes && item("scenes", "scene", t("scenes"))}
    {config.navigation.media && hasMedia && item("media", "media", t("media"))}
    {config.navigation.security && hasSecurity && item("security", "shield", t("security"))}
    {config.pages.map((page) => item(page.id, pageIcon(page), page.title))}
  </nav>;
}
