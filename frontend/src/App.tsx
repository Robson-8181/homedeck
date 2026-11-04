import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { getConfig, saveConfig as persistConfig } from "./api/config";
import { discoverRooms } from "./api/discovery";
import { activateLicense, claimCheckout, getLicense, type LicenseStatus } from "./api/license";
import { HDIcon } from "./components/HDIcon";
import { DynamicShell } from "./components/DynamicShell";
import { NavigationDock, orderTabs, type HomeDeckPage } from "./components/NavigationDock";
import { ProSheet } from "./components/ProSheet";
import { FocusLayout } from "./screens/layouts/FocusLayout";
import { ListLayout } from "./screens/layouts/ListLayout";
import { SidebarLayout, type NavLink } from "./screens/layouts/SidebarLayout";
import { Screensaver } from "./components/Screensaver";
import { createTranslator } from "./i18n";
import { migrateLayouts, withLayout } from "./layout";
import { effectiveConfig, freeDevices, isControllable, overFreeLimits, panelRoomIds, PlanContext, restrictRooms, type PlanState, type UpsellReason } from "./plan";
import { availableSections } from "./security";
import { PageScreen } from "./screens/PageScreen";
import { pageId, type PageRef } from "./screens/pages";
import { HomeScreen } from "./screens/HomeScreen";
import { OnboardingScreen } from "./screens/OnboardingScreen";
import { PlanGateScreen } from "./screens/PlanGateScreen";
import { RoomScreen } from "./screens/RoomScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import type { ScreenProps } from "./screens/types";
import type { HomeDeckConfig, ScreenLayout } from "./types/config";
import type { DiscoveryResponse } from "./types/discovery";
import type { HomeAssistant } from "./types/home-assistant";

const DEFAULT_LIMITS = { rooms: 4, devices: 10 };

export function App({ hass, version }: { hass: HomeAssistant; version?: string }) {
  const [data, setData] = useState<DiscoveryResponse | null>(null);
  const [config, setConfig] = useState<HomeDeckConfig | null>(null);
  const [license, setLicense] = useState<LicenseStatus | null>(null);
  // An integration that predates licenses (not restarted after an update) has no license command.
  const [legacyBackend, setLegacyBackend] = useState(false);
  const [upsellReason, setUpsellReason] = useState<UpsellReason | null>(null);
  const [error, setError] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [draft, setDraft] = useState<HomeDeckConfig | null>(null);
  const [editing, setEditing] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [activePage, setActivePage] = useState<HomeDeckPage>("home");
  const saveQueue = useRef(Promise.resolve());
  const configRef = useRef<HomeDeckConfig | null>(null);
  const lastActivity = useRef(Date.now());
  const [saverOn, setSaverOn] = useState(false);
  const language = hass.locale?.language ?? hass.language;
  const t = useMemo(() => createTranslator(language), [language]);
  configRef.current = config;

  const load = useCallback(async () => {
    setError(false);
    try {
      const [discovery, savedConfig] = await Promise.all([discoverRooms(hass), getConfig(hass)]);
      setData(discovery);
      setConfig(savedConfig);
    } catch {
      setError(true);
    }
    try {
      const status = await getLicense(hass);
      setLicense(status);
      setLegacyBackend(false);
      // A purchase paid while the panel was closed activates on the next load.
      if (status.pending) setLicense(await claimCheckout(hass));
    } catch (err) {
      setLegacyBackend((err as { code?: string })?.code === "unknown_command");
    }
  }, [hass.connection]);

  useEffect(() => { void load(); }, [load]);

  // Areas, devices and entities added or moved in Home Assistant show up without a manual refresh.
  useEffect(() => {
    const { connection } = hass;
    if (!connection.subscribeMessage) return;
    let cancelled = false;
    let timer: number | undefined;
    const unsubscribers: Array<() => void> = [];
    const rediscover = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        void discoverRooms(hass).then((discovery) => { if (!cancelled) setData(discovery); }).catch(() => undefined);
      }, 1500);
    };
    for (const eventType of ["area_registry_updated", "device_registry_updated", "entity_registry_updated"]) {
      void connection.subscribeMessage(rediscover, { type: "subscribe_events", event_type: eventType })
        .then((unsubscribe) => { if (cancelled) unsubscribe(); else unsubscribers.push(unsubscribe); })
        .catch(() => undefined);
    }
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [hass.connection]);

  // Changes apply on screen at once and build on the latest config, so quick successive edits
  // never undo each other; saves run in order. A save refused by the free plan reloads the config.
  const updateConfig = useCallback((update: (current: HomeDeckConfig) => HomeDeckConfig) => {
    const current = configRef.current;
    if (!current) return Promise.resolve();
    const next = update(current);
    configRef.current = next;
    setConfig(next);
    const run = saveQueue.current.then(async () => { await persistConfig(hass, next); });
    saveQueue.current = run.catch(async (err) => {
      if ((err as { code?: string })?.code !== "pro_required") return;
      const saved = await getConfig(hass);
      configRef.current = saved;
      setConfig(saved);
      setUpsellReason("devices");
    });
    return run;
  }, [hass.connection]);
  const saveConfig = useCallback((next: HomeDeckConfig) => updateConfig(() => next), [updateConfig]);

  // One-time move from the 0.3 visibility options to per-screen layouts.
  useEffect(() => {
    if (!config || !data || !config.onboarding_complete) return;
    const migrated = migrateLayouts(config, data);
    if (migrated) void saveConfig(migrated);
  }, [config, data, saveConfig]);

  const pro = license?.plan === "pro" || legacyBackend;
  const limits = license?.limits ?? DEFAULT_LIMITS;
  const allowed = useMemo(() => (pro || !config || !data ? null : new Set(freeDevices(config, data.rooms))), [pro, config, data]);
  const view = useMemo(() => (config ? effectiveConfig(config, pro) : null), [config, pro]);

  const plan = useMemo<PlanState>(() => ({
    pro,
    license,
    limits,
    allowed,
    upsell: (reason = "general") => setUpsellReason(reason),
    allow: (entityId) => {
      if (!allowed || !data) return true;
      const entity = data.rooms.flatMap((room) => room.entities).find((item) => item.entity_id === entityId);
      if (!entity || !isControllable(entity) || allowed.has(entityId)) return true;
      if (allowed.size >= limits.devices) { setUpsellReason("devices"); return false; }
      void updateConfig((current) => ({ ...current, free_devices: [...freeDevices(current, data.rooms), entityId] }));
      return true;
    },
  }), [pro, license, limits, allowed, data, updateConfig]);

  // Screensaver: any touch, click, scroll or key counts as activity.
  const saver = view?.screensaver;
  useEffect(() => {
    const touch = () => { lastActivity.current = Date.now(); };
    const events = ["pointerdown", "keydown", "wheel", "touchstart"] as const;
    events.forEach((name) => window.addEventListener(name, touch, { capture: true, passive: true }));
    return () => events.forEach((name) => window.removeEventListener(name, touch, { capture: true }));
  }, []);
  useEffect(() => {
    if (!saver?.enabled || editing || settingsOpen) { setSaverOn(false); return; }
    lastActivity.current = Date.now();
    const timer = window.setInterval(() => {
      if (Date.now() - lastActivity.current >= saver.delay * 1000) setSaverOn(true);
    }, 2_000);
    return () => window.clearInterval(timer);
  }, [saver?.enabled, saver?.delay, editing, settingsOpen]);
  const dismissSaver = useCallback(() => { lastActivity.current = Date.now(); setSaverOn(false); }, []);

  useEffect(() => {
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "auto" }));
  }, [activePage, settingsOpen, selectedRoomId]);

  const visibleData = useMemo<DiscoveryResponse | null>(() => {
    if (!data || !view) return null;
    const byId = new Map(data.rooms.map((room) => [room.id, room]));
    const selected = panelRoomIds(view, data.rooms, pro).map((roomId) => byId.get(roomId)).filter((room): room is DiscoveryResponse["rooms"][number] => Boolean(room));
    const rooms = restrictRooms(selected, allowed);
    return {
      ...data,
      rooms,
      counts: {
        rooms: rooms.filter((room) => room.id !== "__unassigned__").length,
        devices: rooms.reduce((total, room) => total + room.device_count, 0),
        entities: rooms.reduce((total, room) => total + room.entities.length, 0),
      },
    };
  }, [view, data, allowed, pro]);

  const navigate = useCallback((page: HomeDeckPage) => {
    if (page === "rooms") {
      setSelectedRoomId((current) => current ?? visibleData?.rooms[0]?.id ?? null);
    } else {
      setSelectedRoomId(null);
    }
    setActivePage(page);
  }, [visibleData]);

  const activate = async (key: string) => {
    setLicense(await activateLicense(hass, key));
    setUpsellReason(null);
  };
  const withPlan = (node: ReactNode) => <PlanContext.Provider value={plan}>
    {node}
    {upsellReason && <div className="app-shell app-shell--overlay" style={{ "--hd-accent": "#f4edd9" } as CSSProperties}><ProSheet hass={hass} language={language} license={license} onActivate={activate} onClose={() => setUpsellReason(null)} onLicense={setLicense} reason={upsellReason} t={t} /></div>}
  </PlanContext.Provider>;

  if (error) {
    return (
      <main className="screen center-state">
        <span className="center-state__icon"><HDIcon name="close" size={28} /></span>
        <h1>{t("appName")}</h1>
        <p>{t("errorDescription")}</p>
        <button className="primary-button" onClick={() => void load()} type="button"><HDIcon name="refresh" size={18} />{t("refresh")}</button>
      </main>
    );
  }

  if (!data || !config || !view || !visibleData) {
    return (
      <main className="screen center-state">
        <span className="loader-mark"><HDIcon name="home" size={26} /></span>
        <p>{t("loading")}</p>
      </main>
    );
  }

  if (!config.onboarding_complete) {
    return withPlan(<OnboardingScreen config={config} data={data} hass={hass} onComplete={async (next) => { await saveConfig(next); }} t={t} />);
  }

  // Free plan over its limits (after setup, an update or a removed license): pick what stays, or go Pro.
  if (!pro && overFreeLimits(config, data.rooms, limits)) {
    return withPlan(<DynamicShell config={view} data={visibleData} hass={hass}>
      <PlanGateScreen config={config} language={language} onSave={async (next) => { await saveConfig(next); }} rooms={data.rooms} t={t} />
    </DynamicShell>);
  }

  if (settingsOpen) {
    // The settings preview the real panel background, lit by the same lights as Home.
    const shellConfig = effectiveConfig(draft ?? config, pro);
    const previewRooms = panelRoomIds(draft ?? config, data.rooms, pro).map((id) => data.rooms.find((room) => room.id === id)).filter((room): room is DiscoveryResponse["rooms"][number] => Boolean(room));
    return withPlan(
      <DynamicShell config={shellConfig} data={draft ? { ...data, rooms: restrictRooms(previewRooms, allowed) } : visibleData} hass={hass}>
        <SettingsScreen
          config={config}
          hass={hass}
          language={language}
          onClose={() => { setSettingsOpen(false); setDraft(null); }}
          onDraft={setDraft}
          onLicense={setLicense}
          onReload={() => void load()}
          onSave={async (next) => { await saveConfig(next); setSettingsOpen(false); setDraft(null); }}
          rooms={data.rooms}
          t={t}
          version={version}
        />
      </DynamicShell>,
    );
  }

  const screenProps: ScreenProps = {
    allRooms: restrictRooms(data.rooms, allowed),
    catalogRooms: data.rooms,
    config: view,
    data: visibleData,
    editing,
    hass,
    language,
    onConfig: (update) => void updateConfig(update),
    onLayout: (screen: string, layout: ScreenLayout) => void updateConfig((current) => withLayout(current, screen, pro ? layout : { ...layout, wide: current.layouts[screen]?.wide ?? [] })),
    onSettings: () => { setEditing(false); setSettingsOpen(true); },
    onToggleEdit: () => setEditing((current) => !current),
    t,
  };

  const selectedRoom = activePage === "rooms" ? (visibleData.rooms.find((room) => room.id === selectedRoomId) ?? visibleData.rooms[0]) : undefined;
  const customPage = view.pages.find((page) => page.id === activePage);
  const { hasMedia, hasScenes, hasSecurity } = availableSections(visibleData.rooms.flatMap((room) => room.entities));

  // Every screen follows the chosen layout: Home, rooms, Media, Security, Scenes and custom pages.
  const mode = view.view_mode;
  const pageRef: PageRef | null = selectedRoom ? null
    : activePage === "scenes" || activePage === "media" || activePage === "security" ? { kind: "collection", id: activePage }
    : customPage ? { kind: "custom", page: customPage } : null;
  const links: NavLink[] = orderTabs([
    ...(view.navigation.scenes && hasScenes ? [{ id: "scenes", label: t("scenes"), icon: "scene" as const }] : []),
    ...(view.navigation.media && hasMedia ? [{ id: "media", label: t("media"), icon: "media" as const }] : []),
    ...(view.navigation.security && hasSecurity ? [{ id: "security", label: t("security"), icon: "shield" as const }] : []),
    ...view.pages.map((page) => ({ id: page.id, label: page.title, icon: (page.type === "favorites" ? "star" : page.type === "scenes" ? "scene" : "grid") as NavLink["icon"] })),
  ], view.navigation.order);
  const openRoom = (roomId: string | null) => { setSelectedRoomId(roomId); setActivePage(roomId ? "rooms" : "home"); };

  let screen;
  if (mode === "sidebar") screen = <SidebarLayout {...screenProps} links={links} onNavigate={navigate} onSelectRoom={openRoom} page={pageRef} roomId={selectedRoom?.id ?? null} />;
  else if (mode === "list") screen = <ListLayout {...screenProps} onSelectRoom={(roomId) => openRoom(roomId)} page={pageRef} roomId={selectedRoom?.id ?? null} />;
  else if (mode === "focus") screen = <FocusLayout {...screenProps} onRoomChange={(roomId) => { setSelectedRoomId(roomId); setActivePage(roomId ? "rooms" : "home"); }} page={pageRef} roomId={selectedRoom?.id ?? null} />;
  else if (selectedRoom) screen = <RoomScreen {...screenProps} onSelectRoom={setSelectedRoomId} room={selectedRoom} />;
  else if (pageRef) screen = <PageScreen key={pageId(pageRef)} {...screenProps} page={pageRef} />;
  else screen = <HomeScreen {...screenProps} onOpenRoom={(roomId) => { setSelectedRoomId(roomId); setActivePage("rooms"); }} />;

  const active = selectedRoom ? "rooms" : customPage || ["scenes", "media", "security"].includes(activePage) ? activePage : "home";

  return withPlan(
    <DynamicShell config={view} data={visibleData} hass={hass} mode={mode}>
      {screen}
      {mode !== "sidebar" && <NavigationDock active={active} config={view} editing={editing} hasMedia={hasMedia} hasScenes={hasScenes} hasSecurity={hasSecurity} onNavigate={navigate} onOrder={(order) => void updateConfig((current) => ({ ...current, navigation: { ...current.navigation, order } }))} t={t} />}
      <button aria-label={editing ? t("doneEditing") : t("editScreen")} aria-pressed={editing} className={editing ? "edit-fab edit-fab--on" : "edit-fab"} onClick={() => setEditing((current) => !current)} type="button">
        <HDIcon name={editing ? "check" : "pencil"} size={20} />
      </button>
      {saverOn && <Screensaver config={view} hass={hass} language={language} onDismiss={dismissSaver} t={t} />}
    </DynamicShell>,
  );
}
