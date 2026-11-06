import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent, ReactNode } from "react";
import { HDIcon, RoomIcon, type IconName } from "../components/HDIcon";
import { HDSegmented, HDSelect } from "../components/HDSelect";
import type { TranslationKey } from "../i18n";
import type { HomeDeckBackgroundPreset, HomeDeckCardStyle, HomeDeckConfig, HomeDeckPageType } from "../types/config";
import { withRoomOptions } from "../personalize";
import { energyCandidates } from "../components/ExtraWidgets";
import { cameraIds, DoorbellPopup, doorbellCandidates, guessDoorbellCamera } from "../components/Doorbell";
import { occasionsFor, RULES, SEASON_EFFECTS, type SeasonEffect } from "../seasons";
import { SeasonPreview } from "../components/SeasonLayer";
import type { Room } from "../types/discovery";
import type { HomeAssistant } from "../types/home-assistant";
import { hideSidebarPreferred, setHideSidebarPreferred } from "../sidebar";
import { editingLocked, keepAwakeMode, setEditingLocked, setKeepAwakeMode, setSpotifySpeaker, spotifySpeaker, useDevicePref } from "../devicePrefs";
import { isSilk } from "../keepAwake";
import { deactivateLicense, getLicense, openPortal, type LicenseStatus } from "../api/license";
import { LICENSE_ERRORS } from "../components/ProSheet";
import { getDefaultPanel, setSystemDefault, setUserDefault, type DefaultPanelState } from "../api/defaultPanel";
import { EntityPicker } from "../components/EntityPicker";
import { FeedbackSheet } from "../components/FeedbackSheet";
import { LayoutPicker } from "../components/LayoutPicker";
import { OPEN_METEO } from "../weather";
import { DEFAULT_ACCENT, DEFAULT_CARDS, DEFAULT_HIGHLIGHT, FREE_BACKGROUNDS, FREE_VIEW_MODES, freeDevices, freeRoomIds, freeUsage, isControllable, panelRoomIds, SUPPORT_EMAIL, usePlan } from "../plan";
import { availableSections } from "../security";

type Section = "layout" | "appearance" | "home" | "weather" | "agenda" | "cameras" | "screensaver" | "rooms" | "navigation" | "device" | "plan" | "system";

const SECTIONS: Array<[Section, IconName, TranslationKey]> = [
  ["layout", "layout", "sectionLayout"],
  ["appearance", "palette", "sectionAppearance"],
  ["home", "home", "sectionHome"],
  ["weather", "cloud", "sectionWeather"],
  ["agenda", "calendar", "sectionAgenda"],
  ["cameras", "camera", "camerasTitle"],
  ["screensaver", "clock", "screensaver"],
  ["rooms", "grid", "sectionRooms"],
  ["navigation", "chevron", "sectionNavigation"],
  ["device", "tablet", "sectionDevice"],
  ["plan", "star", "sectionPlan"],
  ["system", "settings", "sectionSystem"],
];
const ACCENTS = ["#f4edd9", "#e8dcc6", "#d9d1bd", "#cad7dc", "#bdccd4", "#c9c2d2", "#d4c3c4", "#c8d2c2", "#b8c1b5", "#b8a99b", "#aeb7c2", "#c2b7a3", "#b8b4c4", "#aebfbb"];
const HIGHLIGHTS = ["#ffc94d", "#f5a524", "#ff9d4d", "#ff7a59", "#ff7a8a", "#f472b6", "#a78bfa", "#7c8cff", "#4fb3ff", "#2fd1b5", "#5fd68a", "#a3e635"];
// The vivid highlight that sits best on each card color.
const SUGGESTED: Record<string, string> = {
  "#f4edd9": "#ffc94d", "#e8dcc6": "#f5a524", "#d9d1bd": "#ffc94d", "#cad7dc": "#4fb3ff", "#bdccd4": "#4fb3ff", "#c9c2d2": "#a78bfa", "#d4c3c4": "#ff7a8a",
  "#c8d2c2": "#5fd68a", "#b8c1b5": "#5fd68a", "#b8a99b": "#ff9d4d", "#aeb7c2": "#7c8cff", "#c2b7a3": "#f5a524", "#b8b4c4": "#a78bfa", "#aebfbb": "#2fd1b5",
};
const BACKGROUNDS: Array<[HomeDeckBackgroundPreset, TranslationKey, string]> = [
  ["adaptive_ember", "backgroundEmber", "linear-gradient(135deg,#263d68,#5e477d 48%,#df8b3d)"],
  ["adaptive_aurora", "backgroundAurora", "linear-gradient(135deg,#173a53,#245d69 48%,#d59c50)"],
  ["adaptive_sunset", "backgroundSunset", "linear-gradient(135deg,#273554,#b4526f 55%,#ef9a62)"],
  ["adaptive_forest", "backgroundForest", "linear-gradient(135deg,#1d3b33,#5f8a62 50%,#d8a24a)"],
  ["adaptive_lagoon", "backgroundLagoon", "linear-gradient(135deg,#14324f,#3f9aa3 50%,#f09a7a)"],
  ["fixed_night", "backgroundNight", "linear-gradient(135deg,#263d68,#111b38,#090f20)"],
  ["fixed_ocean", "backgroundOcean", "linear-gradient(135deg,#17677a,#0a334d,#051d2b)"],
  ["fixed_graphite", "backgroundGraphite", "linear-gradient(135deg,#3c414d,#1d2027,#0c0e12)"],
  ["fixed_wine", "backgroundWine", "linear-gradient(135deg,#5a1f2e,#2e0f18,#14060a)"],
  ["fixed_plum", "backgroundPlum", "linear-gradient(135deg,#3d2a55,#1e1430,#0d0816)"],
];
const SAVER_DELAYS = [30, 60, 120, 180, 300, 600, 900, 1800];
const PAGE_ICONS: Record<HomeDeckPageType, IconName> = { favorites: "star", scenes: "scene", custom: "grid" };

interface SettingsScreenProps {
  config: HomeDeckConfig;
  hass: HomeAssistant;
  onClose: () => void;
  /** Live preview of appearance changes on the real panel background. */
  onDraft: (config: HomeDeckConfig | null) => void;
  onReload: () => void;
  language?: string;
  onLicense: (license: LicenseStatus) => void;
  onSave: (config: HomeDeckConfig) => Promise<void>;
  rooms: Room[];
  t: (key: TranslationKey) => string;
  version?: string;
}

function Row({ children, description, label }: { children: ReactNode; description?: string; label: string }) {
  return <div className="st-row"><span><b>{label}</b>{description && <small>{description}</small>}</span>{children}</div>;
}

function Switch({ checked, label, onChange }: { checked: boolean; label: string; onChange: (checked: boolean) => void }) {
  return <input aria-label={label} checked={checked} className="st-switch" onChange={(event) => onChange(event.target.checked)} type="checkbox" />;
}

export function SettingsScreen({ config, hass, language, onClose, onDraft, onLicense, onReload, onSave, rooms, t, version }: SettingsScreenProps) {
  const plan = usePlan();
  const [managing, setManaging] = useState(false);
  const [feedback, setFeedback] = useState(false);
  const [hideHaSidebar, setHideHaSidebar] = useState(hideSidebarPreferred);
  // Pro-only options stay visible with a lock; choosing one opens the Pro sheet.
  const locked = (condition: boolean) => !plan.pro && condition;
  const Lock = () => <span className="st-lock" aria-hidden="true"><HDIcon name="lock" size={11} /></span>;
  const [section, setSection] = useState<Section>("layout");
  // On a phone the menu is a sideways strip: keep the chosen section in view.
  const sectionList = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const list = sectionList.current;
    const active = list?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (list && active && list.scrollWidth > list.clientWidth) list.scrollTo({ left: active.offsetLeft - (list.clientWidth - active.offsetWidth) / 2, behavior: "smooth" });
  }, [section]);
  // An empty room list means "every room"; spell it out so the list can be edited, without counting as a change.
  const [initial] = useState<HomeDeckConfig>(() => ({
    ...config,
    selected_rooms: config.selected_rooms.length > 0 ? config.selected_rooms.filter((id) => rooms.some((room) => room.id === id)) : rooms.map((room) => room.id),
  }));
  const [draft, setDraft] = useState<HomeDeckConfig>(initial);
  const [saving, setSaving] = useState(false);
  const dirty = JSON.stringify(draft) !== JSON.stringify(initial);
  // Every weather service, including those that are down, so a broken one can be seen and replaced.
  const weatherEntities = useMemo(() => Object.values(hass.states).filter((state) => state.entity_id.startsWith("weather.")), [hass.states]);

  useEffect(() => { onDraft(draft); }, [draft]);
  useEffect(() => () => onDraft(null), []);
  // Opening the plan shows renewals, cancellations and refunds right away, not after the weekly check.
  useEffect(() => { if (section === "plan" && plan.license?.manage) void getLicense(hass, true).then(onLicense).catch(() => undefined); }, [section]);

  const update = (patch: Partial<HomeDeckConfig>) => setDraft((current) => ({ ...current, ...patch }));
  // The highlight follows the card color while it is still the suggested pairing.
  const setCardColor = (color: string) => setDraft((current) => ({
    ...current,
    accent_color: color,
    highlight_color: current.highlight_color === (SUGGESTED[current.accent_color] ?? "#ffc94d") ? (SUGGESTED[color] ?? current.highlight_color) : current.highlight_color,
  }));
  const save = async (next = draft) => {
    if (next.selected_rooms.length === 0) return;
    setSaving(true);
    try { await onSave({ ...next, pages: next.pages.map((page) => page.title.trim() ? page : { ...page, title: t("newPage") }) }); } finally { setSaving(false); }
  };

  // On the free plan the list edits the free choice; the full selection stays for Pro.
  const selected = plan.pro ? draft.selected_rooms : freeRoomIds(draft, rooms);
  const toggleRoom = (id: string, on: boolean) => {
    const field = plan.pro ? "selected_rooms" : "free_rooms";
    if (on) update({ [field]: selected.filter((item) => item !== id) });
    else if (locked(selected.length >= plan.limits.rooms)) plan.upsell("rooms");
    else update({ [field]: [...selected, id], ...(plan.pro ? {} : { selected_rooms: draft.selected_rooms.includes(id) ? draft.selected_rooms : [...draft.selected_rooms, id] }) });
  };
  const orderedRooms = () => [...shownSelected.map((id) => rooms.find((room) => room.id === id)).filter((room): room is Room => Boolean(room)), ...rooms.filter((room) => !selected.includes(room.id))];
  // Drag to reorder: the held room follows the finger and the others make room for it.
  const [renamingRoom, setRenamingRoom] = useState<string | null>(null);
  const [drag, setDrag] = useState<{ id: string; from: number; to: number; startY: number; dy: number; pitch: number } | null>(null);
  const shownSelected = drag ? moveItem(selected, drag.from, drag.to) : selected;
  const startDrag = (event: ReactPointerEvent<HTMLElement>, id: string) => {
    const row = event.currentTarget.closest<HTMLElement>(".st-item");
    const next = row?.nextElementSibling as HTMLElement | null;
    if (!row) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const pitch = next ? next.getBoundingClientRect().top - row.getBoundingClientRect().top : row.offsetHeight;
    const from = selected.indexOf(id);
    setDrag({ id, from, to: from, startY: event.clientY, dy: 0, pitch });
  };
  const moveDrag = (event: ReactPointerEvent<HTMLElement>) => {
    if (!drag) return;
    const dy = event.clientY - drag.startY;
    const to = Math.max(0, Math.min(selected.length - 1, drag.from + Math.round(dy / drag.pitch)));
    setDrag({ ...drag, dy, to });
  };
  const endDrag = () => {
    if (!drag) return;
    if (drag.to !== drag.from) {
      // The shown rooms take the same slots in the full selection, so the free choice never replaces it.
      const order = moveItem(selected, drag.from, drag.to);
      const full = draft.selected_rooms.length > 0 ? [...draft.selected_rooms] : rooms.map((room) => room.id);
      const slots = full.map((id, index) => (order.includes(id) ? index : -1)).filter((index) => index >= 0);
      slots.forEach((slot, index) => { full[slot] = order[index]; });
      update({ selected_rooms: full });
    }
    setDrag(null);
  };
  const addPage = (type: HomeDeckPageType) => {
    const title = type === "favorites" ? t("favorites") : type === "scenes" ? t("scenes") : t("newPage");
    update({ pages: [...draft.pages, { id: `page-${type}-${Date.now().toString(36)}`, title, type, icon: PAGE_ICONS[type], entity_ids: [] }] });
  };

  return <main className="screen settings-v2">
    <header className="st-header">
      <div><span className="eyebrow">{t("appName")}</span><h1>{t("settings")}</h1><p>{t("settingsDescription")}</p></div>
      <div className="st-header__actions">
        {dirty && <span className="st-dirty">{t("unsavedChanges")}</span>}
        <button className="hd-pill hd-pill--solid" disabled={!dirty || saving || selected.length === 0} onClick={() => void save()} type="button"><HDIcon name="check" size={16} />{saving ? t("saving") : t("save")}</button>
        <button aria-label={t("close")} className="hd-close" onClick={onClose} type="button"><HDIcon name="close" size={20} /></button>
      </div>
    </header>

    <div className="room-workspace">
      <aside className="room-selector st-nav" aria-label={t("settings")}>
        <div className="room-selector__list" ref={sectionList} role="tablist">
          {SECTIONS.filter(([id]) => id !== "cameras" || Object.keys(hass.states).some((entity) => entity.startsWith("camera."))).map(([id, icon, label]) => <button aria-selected={section === id} key={id} onClick={() => setSection(id)} role="tab" type="button"><span className="room-selector__icon"><HDIcon name={icon} size={18} /></span><span>{t(label)}</span></button>)}
        </div>
      </aside>

      <section className="st-content">
        {section === "layout" && <section className="st-panel">
          <h2>{t("viewMode")}</h2><p>{t("viewModeHint")}</p>
          <LayoutPicker onChange={(view_mode) => update({ view_mode })} t={t} value={plan.pro || FREE_VIEW_MODES.includes(draft.view_mode) ? draft.view_mode : "grid"} />
        </section>}

        {section === "appearance" && <>
          <section className="st-panel st-colors">
            <div className="st-colors__preview" aria-hidden="true" style={{ "--hd-accent": draft.accent_color } as CSSProperties}>
              <span className="st-colors__card"><i><HDIcon name="light" size={18} /></i><b>{t("previewLight")}</b><small>75%</small><em><span /></em></span>
              <span className="st-colors__badge">2</span>
            </div>
            <div className="st-colors__group">
              <h2>{t("cardColor")}</h2><p>{t("cardColorDescription")}</p>
              <div className="st-swatches">{ACCENTS.map((color) => <button aria-label={`${t("cardColor")} ${color}`} aria-pressed={draft.accent_color === color} key={color} onClick={() => (locked(color !== DEFAULT_ACCENT) ? plan.upsell("feature") : setCardColor(color))} style={{ background: color }} type="button">{draft.accent_color === color ? <HDIcon name="check" size={16} /> : locked(color !== DEFAULT_ACCENT) && <Lock />}</button>)}</div>
            </div>
            <div className="st-colors__group">
              <h2>{t("highlightColor")}</h2><p>{t("highlightColorDescription")}</p>
              <div className="st-swatches st-swatches--vivid">{HIGHLIGHTS.map((color) => <button aria-label={`${t("highlightColor")} ${color}`} aria-pressed={draft.highlight_color === color} key={color} onClick={() => (locked(color !== DEFAULT_HIGHLIGHT) ? plan.upsell("feature") : update({ highlight_color: color }))} style={{ background: color }} type="button">{draft.highlight_color === color ? <HDIcon name="check" size={16} /> : locked(color !== DEFAULT_HIGHLIGHT) && <Lock />}</button>)}</div>
            </div>
          </section>
          <section className="st-panel">
            <h2>{t("iconsTitle")}</h2>
            <Row description={t("haIconsDescription")} label={t("haIcons")}><Switch checked={Boolean(draft.ha_icons)} label={t("haIcons")} onChange={(ha_icons) => update({ ha_icons })} /></Row>
          </section>
          <CardStylePanel cards={draft.cards} locked={!plan.pro} onChange={(cards) => update({ cards })} onUpsell={() => plan.upsell("feature")} t={t} />
          <section className="st-panel">
            <h2>{t("background")}</h2><p>{t("lightsOnly")}</p>
            <div className="st-backgrounds">{BACKGROUNDS.map(([preset, label, preview]) => <button aria-pressed={draft.background.preset === preset} key={preset} onClick={() => (locked(!FREE_BACKGROUNDS.includes(preset)) ? plan.upsell("feature") : update({ background: { ...draft.background, preset } }))} type="button"><i style={{ background: preview }}>{locked(!FREE_BACKGROUNDS.includes(preset)) && <Lock />}</i><b>{t(label)}</b><small>{locked(!FREE_BACKGROUNDS.includes(preset)) ? "Pro" : preset.startsWith("adaptive_") ? t("automatic") : t("fixedBackground")}</small></button>)}</div>
            <Row label={t("animateBackground")}><Switch checked={draft.background.animated} label={t("animateBackground")} onChange={(animated) => update({ background: { ...draft.background, animated } })} /></Row>
          </section>

        </>}

        {section === "screensaver" && <section className="st-panel">
            <h2>{t("screensaver")}</h2><p>{t("screensaverDescription")}</p>
            <Row label={t("screensaverEnable")}>{plan.pro ? <Switch checked={draft.screensaver.enabled} label={t("screensaverEnable")} onChange={(enabled) => update({ screensaver: { ...draft.screensaver, enabled } })} /> : <button className="hd-pill" onClick={() => plan.upsell("feature")} type="button"><HDIcon name="lock" size={14} />Pro</button>}</Row>
            <Row label={t("screensaverDelay")}><HDSelect ariaLabel={t("screensaverDelay")} disabled={!draft.screensaver.enabled} onChange={(value) => update({ screensaver: { ...draft.screensaver, delay: Number(value) } })} options={SAVER_DELAYS.map((seconds) => ({ value: String(seconds), label: seconds < 60 ? `${seconds} s` : `${seconds / 60} min` }))} value={String(draft.screensaver.delay)} /></Row>
            {plan.pro && draft.screensaver.enabled && Object.keys(hass.states).some((id) => id.startsWith("calendar.")) && <Row description={t("saverAgendaDescription")} label={t("saverEvents")}><Switch checked={Boolean(draft.screensaver.show_events)} label={t("saverEvents")} onChange={(show_events) => update({ screensaver: { ...draft.screensaver, show_events } })} /></Row>}
            {plan.pro && draft.screensaver.enabled && Object.keys(hass.states).some((id) => id.startsWith("todo.")) && <Row description={t("saverAgendaDescription")} label={t("saverTodo")}><Switch checked={Boolean(draft.screensaver.show_todo)} label={t("saverTodo")} onChange={(show_todo) => update({ screensaver: { ...draft.screensaver, show_todo } })} /></Row>}
          </section>}

        {section === "home" && <>
          <section className="st-panel">
            <h2>{t("headerInfo")}</h2>
            <Row label={t("showClock")}><Switch checked={draft.home.show_clock} label={t("showClock")} onChange={(show_clock) => update({ home: { ...draft.home, show_clock } })} /></Row>
            <Row label={t("showWeather")}><Switch checked={draft.home.show_weather} label={t("showWeather")} onChange={(show_weather) => update({ home: { ...draft.home, show_weather } })} /></Row>
            <Row label={t("showPresence")}><Switch checked={draft.home.show_presence} label={t("showPresence")} onChange={(show_presence) => update({ home: { ...draft.home, show_presence } })} /></Row>
          </section>
          <section className="st-panel">
            <h2>{t("homeActions")}</h2>
            <Row label={t("showStatus")}><Switch checked={draft.visibility.home_cards.status} label={t("showStatus")} onChange={(status) => update({ visibility: { ...draft.visibility, home_cards: { ...draft.visibility.home_cards, status } } })} /></Row>
            <Row label={t("turnAllOn")}><Switch checked={draft.global_actions.lights_on} label={t("turnAllOn")} onChange={(lights_on) => update({ global_actions: { ...draft.global_actions, lights_on } })} /></Row>
            <Row label={t("turnAllOff")}><Switch checked={draft.global_actions.lights_off} label={t("turnAllOff")} onChange={(lights_off) => update({ global_actions: { ...draft.global_actions, lights_off } })} /></Row>
            <Row label={t("showScenesStrip")}><Switch checked={draft.visibility.home_cards.scenes} label={t("showScenesStrip")} onChange={(scenes) => update({ visibility: { ...draft.visibility, home_cards: { ...draft.visibility.home_cards, scenes } } })} /></Row>
          </section>

          <ExtraCardsPanel draft={draft} hass={hass} onUpsell={() => plan.upsell("feature")} pro={plan.pro} t={t} update={update} />
        </>}

        {section === "weather" && <section className="st-panel">
            <h2>{t("weatherForecast")}</h2><p>{t("weatherSourceDescription")}</p>
            <Row label={t("weatherSource")}><HDSelect ariaLabel={t("weatherSource")} onChange={(entity_id) => update({ weather: { ...draft.weather, entity_id } })} options={[{ value: "auto", label: t("automatic") }, { value: OPEN_METEO, label: t("openMeteoSource") }, ...weatherEntities.map((entity) => ({ value: entity.entity_id, label: `${String(entity.attributes.friendly_name ?? entity.entity_id)}${["unknown", "unavailable"].includes(entity.state) ? ` · ${t("unavailable")}` : ""}` }))]} value={draft.weather.entity_id === OPEN_METEO || weatherEntities.some((entity) => entity.entity_id === draft.weather.entity_id) ? draft.weather.entity_id : "auto"} /></Row>
          </section>}

        {section === "agenda" && <>
          <AgendaPanel draft={draft} hass={hass} t={t} update={update} />
          <SeasonsPanel draft={draft} hass={hass} onUpsell={() => plan.upsell("feature")} pro={plan.pro} t={t} update={update} />
        </>}

        {section === "cameras" && <>
          <section className="st-panel">
            <h2>{t("camerasTitle")}</h2>
            <Row description={t("liveCamerasDescription")} label={t("liveCameras")}><Switch checked={draft.live_cameras !== false} label={t("liveCameras")} onChange={(live_cameras) => update({ live_cameras })} /></Row>
          </section>
          <DoorbellPanel draft={draft} hass={hass} onUpsell={() => plan.upsell("feature")} pro={plan.pro} t={t} update={update} />
        </>}

        {section === "rooms" && <section className="st-panel">
          <h2>{t("sectionRooms")}</h2><p>{t("roomsOrderDescription")}</p>
          <div className="st-list">{orderedRooms().map((room) => {
            const on = selected.includes(room.id);
            const held = drag?.id === room.id;
            // The name in Home Assistant, and the one typed here (saved with the other settings).
            const original = room.original_name ?? room.name;
            const typed = draft.rooms?.[room.id]?.name;
            const name = room.id === "__unassigned__" ? t("unassigned") : typed ?? original;
            const renaming = renamingRoom === room.id;
            return <div className={`st-item ${on ? "st-item--on" : ""} ${held ? "st-item--held" : ""}`} key={room.id} style={held ? { transform: `translateY(${drag.dy - (drag.to - drag.from) * drag.pitch}px)` } : undefined}>
              {renaming
                ? <div className="st-item__main"><span className="st-check">{on && <HDIcon name="check" size={14} />}</span><RoomIcon room={{ ...room, name }} size={18} /><input aria-label={`${t("renameRoom")}: ${original}`} autoFocus className="st-input st-input--framed" maxLength={60} onBlur={() => setRenamingRoom(null)} onChange={(event) => update({ rooms: withRoomOptions(draft, room.id, { name: event.target.value.trim() === original ? "" : event.target.value }).rooms })} onFocus={(event) => event.currentTarget.select()} onKeyDown={(event) => { if (event.key === "Enter" || event.key === "Escape") event.currentTarget.blur(); }} placeholder={original} value={typed ?? original} /></div>
                : <button aria-pressed={on} className="st-item__main" disabled={on && selected.length === 1} onClick={() => toggleRoom(room.id, on)} type="button">
                  <span className="st-check">{on && <HDIcon name="check" size={14} />}</span><RoomIcon room={{ ...room, name }} size={18} /><b>{name}</b>{typed && <small className="st-item__was">{original}</small>}
                </button>}
              {room.id !== "__unassigned__" && !renaming && <button aria-label={`${t("renameRoom")}: ${name}`} className="st-icon-button st-icon-button--small" onClick={() => setRenamingRoom(room.id)} type="button"><HDIcon name="pencil" size={15} /></button>}
              {on && selected.length > 1 && <span aria-label={`${t("dragToReorder")}: ${name}`} className="st-grip" onPointerCancel={endDrag} onPointerDown={(event) => startDrag(event, room.id)} onPointerMove={moveDrag} onPointerUp={endDrag} role="img"><HDIcon name="grip" size={18} /></span>}
            </div>;
          })}</div>
        </section>}

        {section === "navigation" && (() => {
          // A tab only shows when the panel's rooms have something for it: say so under a switch that is on.
          const panelIds = new Set(panelRoomIds(draft, rooms, plan.pro));
          const found = availableSections(rooms.filter((room) => panelIds.has(room.id)).flatMap((room) => room.entities));
          const missing = (on: boolean, has: boolean, key: TranslationKey) => (on && !has ? t(key) : undefined);
          return <>
          <section className="st-panel">
            <h2>{t("builtInNavigation")}</h2><p>{t("navigationDescription")}</p>
            <Row label={t("roomsPage")}><Switch checked={draft.navigation.rooms} label={t("roomsPage")} onChange={(rooms) => update({ navigation: { ...draft.navigation, rooms } })} /></Row>
            <Row description={missing(draft.navigation.scenes, found.hasScenes, "navNoScenes")} label={t("scenes")}><Switch checked={draft.navigation.scenes} label={t("scenes")} onChange={(scenes) => update({ navigation: { ...draft.navigation, scenes } })} /></Row>
            <Row description={missing(draft.navigation.media, found.hasMedia, "navNoMedia")} label={t("media")}><Switch checked={draft.navigation.media} label={t("media")} onChange={(media) => update({ navigation: { ...draft.navigation, media } })} /></Row>
            <Row description={missing(draft.navigation.security, found.hasSecurity, "navNoSecurity")} label={t("security")}><Switch checked={draft.navigation.security} label={t("security")} onChange={(security) => update({ navigation: { ...draft.navigation, security } })} /></Row>
          </section>
          <section className="st-panel">
            <h2>{t("yourPages")}</h2><p>{t("pagesHint")}</p>
            {!plan.pro ? <div className="st-actions"><button className="hd-pill" onClick={() => plan.upsell("feature")} type="button"><HDIcon name="lock" size={14} />{t("proPagesLocked")}</button></div> : <>
            {draft.pages.length > 0 && <div className="st-list">{draft.pages.map((page) => <div className="st-page" key={page.id}>
              <div className="st-item st-item--on">
                <span className="st-item__icon"><HDIcon name={PAGE_ICONS[page.type]} size={18} /></span>
                <input aria-label={t("pageName")} className="st-input" onChange={(event) => update({ pages: draft.pages.map((item) => item.id === page.id ? { ...item, title: event.target.value } : item) })} value={page.title} />
              </div>
              <button aria-label={`${t("deletePage")}: ${page.title}`} className="st-icon-button st-icon-button--danger" onClick={() => update({ pages: draft.pages.filter((item) => item.id !== page.id) })} type="button"><HDIcon name="trash" size={18} /></button>
            </div>)}</div>}
            <div className="st-actions">
              <button className="hd-pill" onClick={() => addPage("favorites")} type="button"><HDIcon name="star" size={16} />{t("favorites")}</button>
              <button className="hd-pill" onClick={() => addPage("scenes")} type="button"><HDIcon name="scene" size={16} />{t("scenes")}</button>
              <button className="hd-pill" onClick={() => addPage("custom")} type="button"><HDIcon name="plus" size={16} />{t("newPage")}</button>
            </div></>}
          </section>
        </>;
        })()}

        {section === "plan" && <section className="st-panel st-plan">
          {plan.pro ? <>
            <div className="st-plan__head"><span className="hd-pro__mark"><HDIcon name="star" size={20} /></span><div><h2>{t("proActive")}</h2><p>{plan.license?.kind === "annual" ? t("proAnnual") : t("proLifetime")}{plan.license?.email ? ` · ${plan.license.email}` : ""}</p></div></div>
            {plan.license?.expires_at && <Row label={plan.license.cancels ? t("proEnds") : t("proRenews")}><span className="st-value">{new Intl.DateTimeFormat(language, { dateStyle: "medium" }).format(new Date(plan.license.expires_at * 1000))}</span></Row>}
            {plan.license?.manage && <Row description={t("proManageDescription")} label={t("proManage")}><button className="hd-pill" onClick={() => void openPortal(hass, window.location.href).then(({ url }) => window.open(url, "_blank", "noopener")).catch(() => undefined)} type="button">{t("proManageAction")}</button></Row>}
            <Row description={t("proRemoveDescription")} label={t("proRemove")}><button className="hd-pill" onClick={() => void deactivateLicense(hass).then(onLicense)} type="button">{t("proRemoveAction")}</button></Row>
          </> : <>
            <div className="st-plan__head"><span className="hd-pro__mark hd-pro__mark--free"><HDIcon name="home" size={20} /></span><div><h2>{t("freePlan")}</h2><p>{t("freePlanDescription").replace("{rooms}", String(plan.limits.rooms)).replace("{devices}", String(plan.limits.devices))}</p></div></div>
            {plan.license && LICENSE_ERRORS[plan.license.status] && <p className="st-plan__ended"><HDIcon name="shield" size={16} />{t(LICENSE_ERRORS[plan.license.status])}</p>}
            <div className="st-meters">
              <Meter label={t("sectionRooms")} used={freeUsage(draft, rooms).rooms} limit={plan.limits.rooms} />
              <Meter label={t("gateDevices")} used={freeUsage(draft, rooms).devices} limit={plan.limits.devices} />
            </div>
            <Row description={t("manageDevicesDescription")} label={t("gateDevices")}><button className="hd-pill" onClick={() => setManaging(true)} type="button">{t("manageDevices")}</button></Row>
            <div className="st-actions"><button className="hd-pill hd-pill--solid" onClick={() => plan.upsell("general")} type="button"><HDIcon name="star" size={16} />{t("proSeePro")}</button></div>
          </>}
          <Row description={t("feedbackDescription")} label={t("feedback")}>{plan.pro ? <button className="hd-pill hd-pill--solid" onClick={() => setFeedback(true)} type="button"><HDIcon name="check" size={16} />{t("feedbackOpen")}</button> : <button className="hd-pill" onClick={() => plan.upsell("feature")} type="button"><HDIcon name="lock" size={14} />Pro</button>}</Row>
          <Row description={t("supportDescription")} label={t("support")}><a className="hd-pill" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a></Row>
          <Row description={t("installationIdDescription")} label={t("installationId")}><code className="st-code">{plan.license?.installation_id ?? "—"}</code></Row>
        </section>}

        {section === "device" && <section className="st-panel">
          <h2>{t("sectionDevice")}</h2><p>{t("sectionDeviceDescription")}</p>
          <Row description={t("hideHaSidebarDescription")} label={t("hideHaSidebar")}><Switch checked={hideHaSidebar} label={t("hideHaSidebar")} onChange={(hidden) => { setHideHaSidebar(hidden); setHideSidebarPreferred(hidden); }} /></Row>
          <DevicePrefsRows hass={hass} t={t} />
        </section>}

        {section === "system" && <StartScreenPanel hass={hass} t={t} />}

        {section === "system" && <section className="st-panel">
          <h2>{t("sectionSystem")}</h2>
          <Row description={t("reloadDevicesDescription")} label={t("reloadDevices")}><button className="hd-pill" onClick={onReload} type="button"><HDIcon name="refresh" size={16} />{t("refresh")}</button></Row>
          <Row description={t("restartSetupDescription")} label={t("restartSetup")}><button className="hd-pill" disabled={saving} onClick={() => void save({ ...draft, onboarding_complete: false })} type="button">{t("restartSetup")}</button></Row>
          <Row description={t("madeWith")} label={version ? t("version") : "HomeDeck"}>{version && <span className="st-value">{version}</span>}</Row>
        </section>}
      </section>
    </div>
    {feedback && <FeedbackSheet hass={hass} language={language} onClose={() => setFeedback(false)} t={t} />}
    {managing && <EntityPicker filter={isControllable} language={language} onClose={() => setManaging(false)} onToggle={(id) => {
      const current = freeDevices(draft, rooms);
      if (current.includes(id)) update({ free_devices: current.filter((item) => item !== id) });
      else if (current.length >= plan.limits.devices) plan.upsell("devices");
      else update({ free_devices: [...current, id] });
    }} rooms={rooms.filter((room) => freeRoomIds(draft, rooms).includes(room.id))} selected={freeDevices(draft, rooms)} t={t} title={`${t("gateDevices")} · ${freeUsage(draft, rooms).devices} ${t("of")} ${plan.limits.devices}`} />}
  </main>;
}

function Range({ label, max, onChange, value, ends }: { label: string; max: number; onChange: (value: number) => void; value: number; ends: [string, string] }) {
  return <div className="st-range">
    <input aria-label={label} max={max} min={0} onChange={(event) => onChange(Number(event.currentTarget.value))} step={5} style={{ "--value": `${(value / max) * 100}%` } as CSSProperties} type="range" value={value} />
    <span><small>{ends[0]}</small><small>{ends[1]}</small></span>
  </div>;
}

/** Pro: corners, frame and glass, previewed live on the panel behind the settings. */
function CardStylePanel({ cards, locked, onChange, onUpsell, t }: { cards: HomeDeckCardStyle; locked: boolean; onChange: (cards: HomeDeckCardStyle) => void; onUpsell: () => void; t: (key: TranslationKey) => string }) {
  const changed = JSON.stringify({ ...DEFAULT_CARDS, ...cards }) !== JSON.stringify(DEFAULT_CARDS);
  return <section className={`st-panel st-cards ${locked ? "st-cards--locked" : ""}`}>
    <h2>{t("cardStyle")}</h2><p>{t("cardStyleDescription")}</p>
    {locked && <div className="st-actions"><button className="hd-pill" onClick={onUpsell} type="button"><HDIcon name="lock" size={14} />{t("proStyleLocked")}</button></div>}
    <div className="st-cards__body"><fieldset disabled={locked}>
      <Row label={t("corners")}><Range ends={[t("cornersSquare"), t("cornersRound")]} label={t("corners")} max={150} onChange={(corners) => onChange({ ...cards, corners })} value={cards.corners} /></Row>
      <Row label={t("glass")}><Range ends={[t("glassSolid"), t("glassClear")]} label={t("glass")} max={100} onChange={(glass) => onChange({ ...cards, glass })} value={cards.glass} /></Row>
      <Row description={t("frameDescription")} label={t("frame")}><Switch checked={cards.frame} label={t("frame")} onChange={(frame) => onChange({ ...cards, frame })} /></Row>
      <Row description={t("animationsDescription")} label={t("animations")}><Switch checked={Boolean(cards.animations)} label={t("animations")} onChange={(animations) => onChange({ ...cards, animations })} /></Row>
      <Row description={t("sparklinesDescription")} label={t("sparklines")}><Switch checked={Boolean(cards.sparklines)} label={t("sparklines")} onChange={(sparklines) => onChange({ ...cards, sparklines })} /></Row>
    </fieldset>{locked && <button aria-label={t("proStyleLocked")} className="st-cards__lock" onClick={onUpsell} type="button" />}</div>
    {!locked && changed && <div className="st-actions"><button className="hd-pill" onClick={() => onChange(DEFAULT_CARDS)} type="button"><HDIcon name="refresh" size={16} />{t("restoreDefaults")}</button></div>}
  </section>;
}

/** Optional cards on Home: the bigger weather card, the sun and (Pro) energy, with its sensors. */
function ExtraCardsPanel({ draft, hass, onUpsell, pro, t, update }: { draft: HomeDeckConfig; hass: HomeAssistant; onUpsell: () => void; pro: boolean; t: (key: TranslationKey) => string; update: (patch: Partial<HomeDeckConfig>) => void }) {
  const widgets = draft.widgets;
  const energy = draft.energy;
  const candidates = useMemo(() => energyCandidates(hass), [hass.states]);
  const label = (id: string) => String(hass.states[id]?.attributes.friendly_name ?? id);
  const set = (patch: Partial<HomeDeckConfig["widgets"]>) => update({ widgets: { ...widgets, ...patch } });
  const turnOnEnergy = (on: boolean) => {
    if (on && !pro) { onUpsell(); return; }
    // The first time, each field starts with the sensor that best fits it.
    const empty = Object.values(energy).every((id) => !id);
    const guess = (key: keyof typeof candidates) => candidates[key][0]?.entity_id ?? "";
    update({
      widgets: { ...widgets, energy: on },
      ...(on && empty ? { energy: { consumption: guess("consumption"), grid_import: guess("grid_import"), grid_export: "", solar: guess("solar"), battery: guess("battery"), solar_today: guess("solar_today") } } : {}),
    });
  };
  const fields: Array<[keyof HomeDeckConfig["energy"], TranslationKey]> = [["consumption", "energyHome"], ["solar", "energySolar"], ["grid_import", "energyGrid"], ["grid_export", "energyGridExport"], ["battery", "energyBattery"], ["solar_today", "energyToday"]];
  return <section className="st-panel">
    <h2>{t("moreHomeCards")}</h2><p>{t("homeCardsDescription")}</p>
    <Row label={t("weatherCard")}><Switch checked={widgets.weather} label={t("weatherCard")} onChange={(weather) => set({ weather })} /></Row>
    {hass.states["sun.sun"] && <Row description={t("sunCardDescription")} label={t("sunCard")}><Switch checked={widgets.sun} label={t("sunCard")} onChange={(sun) => set({ sun })} /></Row>}
    <div className="st-group">
      <Row description={t("energyCardDescription")} label={t("energyCard")}>{pro ? <Switch checked={widgets.energy} label={t("energyCard")} onChange={turnOnEnergy} /> : <button className="hd-pill" onClick={onUpsell} type="button"><HDIcon name="lock" size={14} />Pro</button>}</Row>
      {pro && widgets.energy && <div className="st-sub">
        {fields.map(([key, name]) => <div className="st-sub__row" key={key}><span>{t(name)}</span><HDSelect ariaLabel={t(name)} onChange={(id) => update({ energy: { ...energy, [key]: id } })} options={[{ value: "", label: t("none") }, ...[...new Set([...(energy[key] ? [energy[key]] : []), ...candidates[key].map((state) => state.entity_id)])].map((id) => ({ value: id, label: label(id) }))]} value={energy[key]} /></div>)}
      </div>}
    </div>
  </section>;
}

/** Pro: special dates. One switch for all, one per occasion (those of the home's country), and the
 * user's own dates with the animation each one gets. */
function SeasonsPanel({ draft, hass, onUpsell, pro, t, update }: { draft: HomeDeckConfig; hass: HomeAssistant; onUpsell: () => void; pro: boolean; t: (key: TranslationKey) => string; update: (patch: Partial<HomeDeckConfig>) => void }) {
  const seasons = draft.seasons ?? { enabled: false, off: [], custom: [] };
  const set = (patch: Partial<typeof seasons>) => update({ seasons: { ...seasons, ...patch } });
  const country = (hass.config?.country ?? "").toUpperCase();
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [effect, setEffect] = useState("confetti");
  const add = () => {
    const match = /^\d{4}-(\d{2})-(\d{2})$/.exec(date);
    if (!name.trim() || !match) return;
    set({ custom: [...seasons.custom, { name: name.trim().slice(0, 40), date: `${match[1]}-${match[2]}`, effect }] });
    setName(""); setDate("");
  };
  const effects = SEASON_EFFECTS.map((value) => ({ value, label: t(`seasonEffect_${value}` as TranslationKey) }));
  // "See" plays an occasion's animation for a few seconds over the settings, with its greeting.
  const [preview, setPreview] = useState<{ id: string; effect: SeasonEffect | null; fireworks: boolean; label: string } | null>(null);
  const greetingOf = (id: string) => id === "birthdays" ? t("seasonBirthdayOf").replace("{name}", t("seasonsSampleName")) : id === "newyear" ? t("seasonNewYear") : t(`seasonGreeting_${id}` as TranslationKey);
  const effectOf = (id: string): SeasonEffect => id === "birthdays" ? "confetti" : RULES.find((rule) => rule.id === id)?.effect ?? "confetti";
  const see = (label: string) => <button className="hd-pill st-season-see" onClick={(event) => { event.preventDefault(); const id = label; setPreview({ id, effect: effectOf(id), fireworks: id === "newyear", label: greetingOf(id) }); }} type="button"><HDIcon name="eye" size={15} />{t("seasonsSee")}</button>;
  return <section className="st-panel">
    <h2>{t("seasonsTitle")}</h2><p>{t("seasonsDescription")}</p>
    <Row label={t("seasonsEnable")}>{pro ? <Switch checked={seasons.enabled} label={t("seasonsEnable")} onChange={(enabled) => set({ enabled })} /> : <button className="hd-pill" onClick={onUpsell} type="button"><HDIcon name="lock" size={14} />Pro</button>}</Row>
    {pro && seasons.enabled && <>
      <div className="st-sub">
        {occasionsFor(country).map((id) => <div className="st-sub__row" key={id}><span>{t(`season_${id}` as TranslationKey)}</span><span className="st-season-actions">{see(id)}<input aria-label={t(`season_${id}` as TranslationKey)} checked={!seasons.off.includes(id)} className="st-switch" onChange={(event) => set({ off: event.target.checked ? seasons.off.filter((item) => item !== id) : [...seasons.off, id] })} type="checkbox" /></span></div>)}
      </div>
      <div className="st-sub">
        <div className="st-sub__title">{t("seasonsCustom")}</div>
        {seasons.custom.map((item, index) => <div className="st-sub__row" key={`${item.name}-${index}`}><span>{item.name} · {item.date.split("-").reverse().join("/")} · {t(`seasonEffect_${item.effect}` as TranslationKey)}</span><span className="st-season-actions"><button className="hd-pill st-season-see" onClick={() => setPreview({ id: `custom:${item.name}`, effect: (SEASON_EFFECTS as string[]).includes(item.effect) ? item.effect as SeasonEffect : "confetti", fireworks: false, label: item.name })} type="button"><HDIcon name="eye" size={15} />{t("seasonsSee")}</button><button aria-label={`${t("removeItem")}: ${item.name}`} className="hd-pill" onClick={() => set({ custom: seasons.custom.filter((_, position) => position !== index) })} type="button"><HDIcon name="trash" size={15} /></button></span></div>)}
        <div className="st-season-add">
          <input aria-label={t("seasonsName")} maxLength={40} onChange={(event) => setName(event.target.value)} placeholder={t("seasonsName")} value={name} />
          <input aria-label={t("seasonsDate")} onChange={(event) => setDate(event.target.value)} type="date" value={date} />
          <HDSelect ariaLabel={t("seasonsEffect")} onChange={setEffect} options={effects} value={effect} />
          <button className="hd-pill" disabled={!name.trim() || !date} onClick={add} type="button"><HDIcon name="plus" size={15} />{t("addItem")}</button>
        </div>
      </div>
    </>}
    {preview && <SeasonPreview closeLabel={t("close")} effect={preview.effect} id={preview.id} fireworks={preview.fireworks} label={preview.label} onClose={() => setPreview(null)} />}
  </section>;
}

/** Choices for this device only: lock editing, and the speaker Spotify starts on from here. */
function DevicePrefsRows({ hass, t }: { hass: HomeAssistant; t: (key: TranslationKey) => string }) {
  const locked = useDevicePref(editingLocked);
  const speaker = useDevicePref(spotifySpeaker);
  const awake = useDevicePref(keepAwakeMode);
  const spotify = Object.values(hass.states).find((state) => state.entity_id.startsWith("media_player.") && (state.entity_id.includes("spotify") || state.attributes.source === "Spotify" || String(state.attributes.friendly_name ?? "").toLowerCase().includes("spotify")));
  const sources = Array.isArray(spotify?.attributes.source_list) ? spotify.attributes.source_list.map(String) : [];
  return <>
    <Row description={`${t("keepAwakeDescription")}${isSilk() ? ` ${t("keepAwakeEcho")}` : ""}`} label={t("keepAwake")}><HDSelect ariaLabel={t("keepAwake")} onChange={(mode) => setKeepAwakeMode(mode as "auto" | "on" | "off")} options={[{ value: "auto", label: t("keepAwakeAuto") }, { value: "on", label: t("keepAwakeOn") }, { value: "off", label: t("keepAwakeOff") }]} value={awake} /></Row>
    <Row description={t("lockEditingDescription")} label={t("lockEditing")}><Switch checked={locked} label={t("lockEditing")} onChange={setEditingLocked} /></Row>
    {spotify && <Row description={t("spotifySpeakerDescription")} label={t("spotifySpeaker")}><HDSelect ariaLabel={t("spotifySpeaker")} onChange={setSpotifySpeaker} options={[{ value: "", label: t("spotifySpeakerAny") }, ...[...new Set([...(speaker ? [speaker] : []), ...sources])].map((source) => ({ value: source, label: source }))]} value={speaker} /></Row>}
  </>;
}

/** Pro: the camera pops up when the doorbell rings. The trigger and camera are guessed the first time. */
function DoorbellPanel({ draft, hass, onUpsell, pro, t, update }: { draft: HomeDeckConfig; hass: HomeAssistant; onUpsell: () => void; pro: boolean; t: (key: TranslationKey) => string; update: (patch: Partial<HomeDeckConfig>) => void }) {
  const doorbell = draft.doorbell;
  const [testing, setTesting] = useState(false);
  const triggers = useMemo(() => doorbellCandidates(hass).map((state) => state.entity_id), [hass.states]);
  const cameras = useMemo(() => cameraIds(hass), [hass.states]);
  const label = (id: string) => String(hass.states[id]?.attributes.friendly_name ?? id);
  const set = (patch: Partial<HomeDeckConfig["doorbell"]>) => update({ doorbell: { ...doorbell, ...patch } });
  const turnOn = (on: boolean) => {
    if (on && !pro) { onUpsell(); return; }
    const trigger = doorbell.trigger || triggers[0] || "";
    set({ enabled: on, ...(on && !doorbell.trigger ? { trigger } : {}), ...(on && !doorbell.camera ? { camera: guessDoorbellCamera(hass, trigger) } : {}) });
  };
  const options = (ids: string[], current: string) => [{ value: "", label: t("none") }, ...[...new Set([...(current ? [current] : []), ...ids])].map((id) => ({ value: id, label: label(id) }))];
  const seconds = [30, 60, 120, 300].map((value) => ({ value: String(value), label: value < 60 ? `${value} s` : `${value / 60} min` }));
  return <section className="st-panel">
    <h2>{t("doorbellTitle")}</h2><p>{t("doorbellDescription")}</p>
    <Row label={t("doorbellEnable")}>{pro ? <Switch checked={doorbell.enabled} label={t("doorbellEnable")} onChange={turnOn} /> : <button className="hd-pill" onClick={onUpsell} type="button"><HDIcon name="lock" size={14} />Pro</button>}</Row>
    {pro && doorbell.enabled && <div className="st-sub">
      <div className="st-sub__row"><span>{t("doorbellTrigger")}</span><HDSelect ariaLabel={t("doorbellTrigger")} onChange={(trigger) => set({ trigger, ...(doorbell.camera ? {} : { camera: guessDoorbellCamera(hass, trigger) }) })} options={options(triggers, doorbell.trigger)} value={doorbell.trigger} /></div>
      <div className="st-sub__row"><span>{t("doorbellCamera")}</span><HDSelect ariaLabel={t("doorbellCamera")} onChange={(camera) => set({ camera })} options={options(cameras, doorbell.camera)} value={doorbell.camera} /></div>
      <div className="st-sub__row"><span>{t("doorbellSeconds")}</span><HDSelect ariaLabel={t("doorbellSeconds")} onChange={(value) => set({ seconds: Number(value) })} options={seconds} value={String(doorbell.seconds)} /></div>
      <div className="st-actions st-actions--end"><button className="hd-pill" onClick={() => setTesting(true)} type="button"><HDIcon name="bell" size={16} />{t("doorbellTest")}</button></div>
    </div>}
    {testing && <DoorbellPopup camera={doorbell.camera} hass={hass} onClose={() => setTesting(false)} seconds={doorbell.seconds} t={t} />}
  </section>;
}

/** Makes HomeDeck the screen Home Assistant opens; applied at once, stored by Home Assistant. */
function StartScreenPanel({ hass, t }: { hass: HomeAssistant; t: (key: TranslationKey) => string }) {
  const [state, setState] = useState<DefaultPanelState | null>(null);
  const [error, setError] = useState<TranslationKey | null>(null);
  useEffect(() => { void getDefaultPanel(hass).then(setState); }, [hass.connection]);
  if (!state) return null;
  const toggle = async (scope: "user" | "system", on: boolean) => {
    setError(null);
    try {
      if (scope === "user") await setUserDefault(hass, on, state.synced);
      else await setSystemDefault(hass, on);
      setState({ ...state, [scope]: on });
    } catch {
      setError(scope === "system" ? "startScreenAdminOnly" : "startScreenFailed");
    }
  };
  return <section className="st-panel">
    <h2>{t("startScreen")}</h2><p>{t("startScreenDescription")}</p>
    <Row description={state.synced ? t("startScreenMineDescription") : t("startScreenBrowserDescription")} label={t("startScreenMine")}><Switch checked={state.user} label={t("startScreenMine")} onChange={(on) => void toggle("user", on)} /></Row>
    {state.synced && <Row description={t("startScreenEveryoneDescription")} label={t("startScreenEveryone")}><Switch checked={state.system} label={t("startScreenEveryone")} onChange={(on) => void toggle("system", on)} /></Row>}
    {error && <p className="hd-pro__error">{t(error)}</p>}
  </section>;
}

function Meter({ label, limit, used }: { label: string; limit: number; used: number }) {
  return <div className={used > limit ? "st-meter st-meter--over" : "st-meter"}>
    <span><b>{label}</b><i>{used} / {limit}</i></span>
    <em><span style={{ width: `${Math.min(100, (used / limit) * 100)}%` }} /></em>
  </div>;
}

function moveItem<T>(items: T[], from: number, to: number): T[] {
  const next = [...items];
  next.splice(to, 0, ...next.splice(from, 1));
  return next;
}

/** Calendar and reminders beside the clock: what to show and from which entities. */
function AgendaPanel({ draft, hass, t, update }: { draft: HomeDeckConfig; hass: HomeAssistant; t: (key: TranslationKey) => string; update: (patch: Partial<HomeDeckConfig>) => void }) {
  const agenda = draft.agenda;
  const set = (patch: Partial<HomeDeckConfig["agenda"]>) => update({ agenda: { ...agenda, ...patch } });
  const calendars = Object.keys(hass.states).filter((id) => id.startsWith("calendar.")).sort();
  const lists = Object.keys(hass.states).filter((id) => id.startsWith("todo.")).sort();
  const name = (id: string) => String(hass.states[id]?.attributes.friendly_name ?? id);
  // An empty choice means every calendar, so new calendars show up on their own.
  const shown = (id: string) => agenda.calendars.length === 0 || agenda.calendars.includes(id);
  const toggleCalendar = (id: string, on: boolean) => {
    const current = agenda.calendars.length === 0 ? calendars : agenda.calendars;
    const next = on ? [...current, id] : current.filter((item) => item !== id);
    set({ calendars: calendars.every((item) => next.includes(item)) ? [] : next });
  };
  if (calendars.length === 0 && lists.length === 0) return null;
  return <section className="st-panel">
    <h2>{t("agendaTitle")}</h2><p>{t("agendaDescription")}</p>
    <div className="st-group">
      <Row description={t("todayCardDescription")} label={t("todayCard")}><Switch checked={agenda.today_card} label={t("todayCard")} onChange={(today_card) => set({ today_card })} /></Row>
    </div>
    {calendars.length > 0 && <div className="st-group">
      <Row label={t("showCalendar")}><Switch checked={agenda.show_calendar} label={t("showCalendar")} onChange={(show_calendar) => set({ show_calendar })} /></Row>
      {(agenda.show_calendar || agenda.today_card) && <div className="st-sub" role="group" aria-label={t("calendars")}>
        <span className="st-sub__title">{t("calendars")}</span>
        {calendars.map((id) => <label className="st-sub__row" key={id}><span>{name(id)}</span><Switch checked={shown(id)} label={name(id)} onChange={(on) => toggleCalendar(id, on)} /></label>)}
      </div>}
    </div>}
    {lists.length > 0 && <div className="st-group">
      <Row label={t("showTodo")}><Switch checked={agenda.show_todo} label={t("showTodo")} onChange={(show_todo) => set({ show_todo })} /></Row>
      {(agenda.show_todo || agenda.today_card) && <div className="st-sub">
        <div className="st-sub__row"><span>{t("todoList")}</span><HDSelect ariaLabel={t("todoList")} onChange={(todo_entity) => set({ todo_entity })} options={lists.map((id) => ({ value: id, label: name(id) }))} value={lists.includes(agenda.todo_entity) ? agenda.todo_entity : lists[0]} /></div>
        <label className="st-sub__row"><span>{t("todoNoDate")}</span><Switch checked={agenda.todo_no_date} label={t("todoNoDate")} onChange={(todo_no_date) => set({ todo_no_date })} /></label>
      </div>}
    </div>}
  </section>;
}
