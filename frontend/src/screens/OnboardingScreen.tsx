import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { HDIcon, RoomIcon, type IconName } from "../components/HDIcon";
import { HDSelect } from "../components/HDSelect";
import { LayoutPicker, VIEW_MODES } from "../components/LayoutPicker";
import { keepAwakeMode, setKeepAwakeMode, useDevicePref } from "../devicePrefs";
import { isSilk } from "../keepAwake";
import { hideSidebarPreferred, setHideSidebarPreferred } from "../sidebar";
import type { TranslationKey } from "../i18n";
import type { HomeDeckBackgroundPreset, HomeDeckConfig } from "../types/config";
import type { DiscoveryResponse } from "../types/discovery";
import type { HomeAssistant } from "../types/home-assistant";
import { DEFAULT_ACCENT, FREE_BACKGROUNDS, isControllable, proPrice, usePlan } from "../plan";

interface OnboardingScreenProps { config: HomeDeckConfig; data: DiscoveryResponse; hass: HomeAssistant; onComplete: (config: HomeDeckConfig) => Promise<void>; t: (key: TranslationKey) => string; }
const BACKGROUNDS: Array<[HomeDeckBackgroundPreset, TranslationKey, string]> = [
  ["adaptive_ember", "backgroundEmber", "linear-gradient(135deg,#263d68 0%,#5e477d 48%,#8f5f45 100%)"],
  ["adaptive_aurora", "backgroundAurora", "linear-gradient(135deg,#173a53 0%,#245d69 52%,#776d51 100%)"],
  ["adaptive_sunset", "backgroundSunset", "linear-gradient(135deg,#273554 0%,#76506c 55%,#9d6957 100%)"],
  ["adaptive_forest", "backgroundForest", "linear-gradient(135deg,#1d3b33 0%,#5f8a62 50%,#8a7a45 100%)"],
  ["adaptive_lagoon", "backgroundLagoon", "linear-gradient(135deg,#14324f 0%,#3f9aa3 50%,#a8706a 100%)"],
  ["fixed_night", "backgroundNight", "linear-gradient(135deg,#263d68,#111b38,#090f20)"],
  ["fixed_ocean", "backgroundOcean", "linear-gradient(135deg,#17677a,#0a334d,#051d2b)"],
  ["fixed_graphite", "backgroundGraphite", "linear-gradient(135deg,#3c414d,#1d2027,#0c0e12)"],
  ["fixed_wine", "backgroundWine", "linear-gradient(135deg,#5a1f2e,#2e0f18,#14060a)"],
  ["fixed_plum", "backgroundPlum", "linear-gradient(135deg,#3d2a55,#1e1430,#0d0816)"],
];
const ACCENTS = ["#f4edd9", "#e8dcc6", "#d9d1bd", "#cad7dc", "#bdccd4", "#c9c2d2", "#d4c3c4", "#c8d2c2", "#b8c1b5", "#b8a99b", "#aeb7c2", "#c2b7a3", "#b8b4c4", "#aebfbb"];
const STEPS = 9;

function accentContrast(hex: string): string { const values = [1, 3, 5].map((index) => Number.parseInt(hex.slice(index, index + 2), 16)); return (values[0] * 299 + values[1] * 587 + values[2] * 114) / 1000 > 150 ? "#201d22" : "#ffffff"; }
function PreviewChoice({ checked, icon, label, value, onChange }: { checked: boolean; icon: IconName; label: string; value: string; onChange: (checked: boolean) => void }) { return <label className={checked ? "onboarding-preview-choice onboarding-preview-choice--selected" : "onboarding-preview-choice"}><span><HDIcon name={icon} size={20} /></span><div><strong>{value}</strong><small>{label}</small></div><input checked={checked} onChange={(event) => onChange(event.target.checked)} type="checkbox" /></label>; }
function Toggle({ checked, description, label, onChange }: { checked: boolean; description?: string; label: string; onChange: (checked: boolean) => void }) { return <label className={description ? "onboarding-toggle onboarding-toggle--described" : "onboarding-toggle"}><span>{label}{description && <small>{description}</small>}</span><input checked={checked} onChange={(event) => onChange(event.target.checked)} type="checkbox" /></label>; }

export function OnboardingScreen({ config, data, hass, onComplete, t }: OnboardingScreenProps) {
  const initialRooms = useMemo(() => config.selected_rooms.length > 0 ? config.selected_rooms : data.rooms.map((room) => room.id), [config.selected_rooms, data.rooms]);
  const weatherEntities = useMemo(() => Object.values(hass.states).filter((state) => state.entity_id.startsWith("weather.") && !["unknown", "unavailable"].includes(state.state)), [hass.states]);
  const [step, setStep] = useState(0);
  const [selectedRooms, setSelectedRooms] = useState(initialRooms);
  const [accentColor, setAccentColor] = useState(config.accent_color);
  const [background, setBackground] = useState(config.background);
  const [home, setHome] = useState(config.home);
  const [globalActions, setGlobalActions] = useState(config.global_actions);
  const [weather, setWeather] = useState(() => ({ ...config.weather, entity_id: config.weather.entity_id === "auto" || weatherEntities.some((entity) => entity.entity_id === config.weather.entity_id) ? config.weather.entity_id : "auto" }));
  const [navigation, setNavigation] = useState(config.navigation);
  const [viewMode, setViewMode] = useState(config.view_mode);
  const [screensaver, setScreensaver] = useState(config.screensaver);
  // Choices kept on this device (like in Settings → Device): they apply right away.
  const [hideHaSidebar, setHideHaSidebar] = useState(hideSidebarPreferred);
  const awake = useDevicePref(keepAwakeMode);
  const [saving, setSaving] = useState(false);
  const backgroundGradient = BACKGROUNDS.find(([preset]) => preset === background.preset)?.[2] ?? BACKGROUNDS[0][2];
  const style = { "--hd-accent": accentColor, "--hd-accent-contrast": accentContrast(accentColor), background: backgroundGradient } as CSSProperties;

  const plan = usePlan();
  const controllable = data.rooms.flatMap((room) => room.entities).filter(isControllable).length;
  // The house is bigger than the free plan: offer Pro right after detection.
  const overFree = !plan.pro && (data.rooms.length > plan.limits.rooms || controllable > plan.limits.devices);
  const roomsFull = !plan.pro && selectedRooms.length >= plan.limits.rooms;
  const toggleRoom = (roomId: string) => {
    if (selectedRooms.includes(roomId)) setSelectedRooms(selectedRooms.filter((id) => id !== roomId));
    else if (roomsFull) plan.upsell("rooms");
    else setSelectedRooms([...selectedRooms, roomId]);
  };
  const continueFree = () => { setSelectedRooms((current) => current.slice(0, plan.limits.rooms)); setStep(2); };
  const layoutName = t(VIEW_MODES.find((mode) => mode.id === viewMode)?.name ?? "viewGrid");
  const complete = async () => { if (selectedRooms.length === 0) return; setSaving(true); try { await onComplete({ ...config, version: 9, view_mode: viewMode, screensaver, onboarding_complete: true, selected_rooms: selectedRooms, theme: "glass", accent_color: accentColor, background, home, global_actions: globalActions, navigation, layout: { ...config.layout, density: "comfortable" }, weather }); } finally { setSaving(false); } };
  const actions = (back: number, next?: number) => <div className="setup-actions"><button className="secondary-button" onClick={() => setStep(back)} type="button">{t("back")}</button>{next != null && <button className="primary-button" onClick={() => setStep(next)} type="button">{t("continue")} <HDIcon name="chevron" size={17} /></button>}</div>;

  return <main className="screen onboarding-screen theme-glass" style={style}>
    <header className="onboarding-topbar"><div className="brand"><span className="brand__mark"><HDIcon name="home" size={19} /></span><span>{t("appName")}</span></div><div className="step-dots" aria-label={`${step + 1} / ${STEPS}`}>{Array.from({ length: STEPS }, (_, item) => <i className={item <= step ? "step-dot step-dot--active" : "step-dot"} key={item} />)}</div></header>
    <section className="onboarding-content">
      {step === 0 && <div className="welcome-panel onboarding-dashboard-welcome"><span className="eyebrow">HOMEDECK</span><h1>{t("welcomeTitle")}</h1><p>{t("welcomeDescription")}</p><button className="primary-button primary-button--large" onClick={() => setStep(1)} type="button">{t("getStarted")} <HDIcon name="chevron" size={18} /></button></div>}
      {step === 1 && <div className="setup-panel"><span className="eyebrow">{t("homeEyebrow")}</span><h1>{t("detectionTitle")}</h1><p>{t("detectionDescription")}</p><div className="detection-grid"><div><strong>{data.counts.rooms}</strong><span>{t("rooms")}</span></div><div><strong>{data.counts.devices}</strong><span>{t("devices")}</span></div><div><strong>{data.counts.entities}</strong><span>{t("entities")}</span></div></div>{overFree ? <div className="onboarding-plan">
        <p>{t("onboardingPlanIntro").replace("{rooms}", String(plan.limits.rooms)).replace("{devices}", String(plan.limits.devices))}</p>
        <button className="onboarding-plan__pro" onClick={() => plan.upsell("general")} type="button"><span><HDIcon name="star" size={20} /></span><div><strong>HomeDeck Pro</strong><small>{t("onboardingPlanPro").replace("{lifetime}", proPrice("lifetime", hass.locale?.language ?? hass.language)).replace("{annual}", proPrice("annual", hass.locale?.language ?? hass.language))}</small></div></button>
        <button className="onboarding-plan__free" onClick={continueFree} type="button"><span><HDIcon name="home" size={20} /></span><div><strong>{t("onboardingPlanFree")}</strong><small>{t("onboardingPlanFreeNote").replace("{rooms}", String(plan.limits.rooms)).replace("{devices}", String(plan.limits.devices))}</small></div></button>
        <div className="setup-actions"><button className="secondary-button" onClick={() => setStep(0)} type="button">{t("back")}</button></div>
      </div> : actions(0, 2)}</div>}
      {step === 2 && <div className="setup-panel setup-panel--wide onboarding-appearance"><span className="eyebrow">{t("appearance")}</span><h1>{t("setupAppearanceTitleSimple")}</h1><p>{t("setupAppearanceDescriptionSimple")}</p><div className="onboarding-live-demo"><article><span>{t("security")}</span><strong>{t("allSecure")}</strong><small>{t("monitoredSample")}</small><HDIcon name="shield" size={21} /></article><article className="active"><span>{t("roomsPage")}</span><strong>{t("livingRoomSample")}</strong><small>{t("lightsSample")}</small><HDIcon name="sofa" size={21} /></article></div><div className="onboarding-color-section"><div><strong>{t("accentColor")}</strong><small>{t("accentLampDescription")}</small></div><div className="accent-suggestions">{ACCENTS.map((color) => <button aria-label={`${t("accentColor")} ${color}`} aria-pressed={accentColor.toLowerCase() === color} className={!plan.pro && color !== DEFAULT_ACCENT ? "pro-locked" : undefined} key={color} onClick={() => (!plan.pro && color !== DEFAULT_ACCENT ? plan.upsell("feature") : setAccentColor(color))} style={{ background: color }} type="button" />)}</div></div><div className="onboarding-background-heading"><strong>{t("background")}</strong><small>{t("backgroundLiveDescription")}</small></div><div className="background-grid onboarding-backgrounds">{BACKGROUNDS.map(([preset, label, preview]) => <button aria-pressed={background.preset === preset} className={background.preset === preset ? "background-option background-option--selected" : "background-option"} key={preset} onClick={() => (!plan.pro && !FREE_BACKGROUNDS.includes(preset) ? plan.upsell("feature") : setBackground({ ...background, preset }))} type="button"><i style={{ background: preview }} /><span>{t(label)}</span>{!plan.pro && !FREE_BACKGROUNDS.includes(preset) ? <small>Pro</small> : preset.startsWith("adaptive_") && <small>{t("automatic")}</small>}</button>)}</div>{actions(1, 3)}</div>}
      {step === 3 && <div className="setup-panel setup-panel--wide onboarding-layout"><span className="eyebrow">{t("viewMode")}</span><h1>{t("setupLayoutTitle")}</h1><p>{t("setupLayoutDescription")}</p><LayoutPicker onChange={setViewMode} t={t} value={viewMode} />{actions(2, 4)}</div>}
      {step === 4 && <div className="setup-panel setup-panel--wide"><span className="eyebrow">{t("roomsPage")}</span><h1>{t("chooseRoomsTitle")}</h1><p>{t("chooseRoomsDescription")}</p><div className="selection-summary">{plan.pro ? `${selectedRooms.length} ${t("roomsSelected")}` : `${selectedRooms.length} ${t("of")} ${plan.limits.rooms} · ${t("freePlan")}`}</div><div className="room-selection-grid">{data.rooms.map((room) => { const selected = selectedRooms.includes(room.id); return <button aria-pressed={selected} className={`selection-card ${selected ? "selection-card--selected" : ""}`} key={room.id} onClick={() => toggleRoom(room.id)} type="button"><span><RoomIcon room={room} size={21} /></span><strong>{room.id === "__unassigned__" ? t("unassigned") : room.name}</strong><i>{selected ? "✓" : roomsFull ? <HDIcon name="lock" size={14} /> : ""}</i></button>; })}</div>{actions(3, 5)}</div>}
      {step === 5 && <div className="setup-panel setup-panel--wide"><span className="eyebrow">{t("home")}</span><h1>{t("setupHeaderTitle")}</h1><p>{t("setupHeaderDescription")}</p><div className="onboarding-header-preview"><PreviewChoice checked={home.show_clock} icon="clock" label={t("showClock")} onChange={(checked) => setHome({ ...home, show_clock: checked })} value="20:14" /><PreviewChoice checked={home.show_weather} icon="cloud" label={t("showWeather")} onChange={(checked) => setHome({ ...home, show_weather: checked })} value={t("weatherSample")} /><PreviewChoice checked={home.show_presence} icon="home" label={t("showPresence")} onChange={(checked) => setHome({ ...home, show_presence: checked })} value={t("presenceSample")} /><PreviewChoice checked={globalActions.lights_on} icon="light" label={t("turnAllOn")} onChange={(checked) => setGlobalActions({ ...globalActions, lights_on: checked })} value={t("allLightsSample")} /><PreviewChoice checked={globalActions.lights_off} icon="power" label={t("turnAllOff")} onChange={(checked) => setGlobalActions({ ...globalActions, lights_off: checked })} value={t("allLightsSample")} /></div>{actions(4, 6)}</div>}
      {step === 6 && <div className="setup-panel setup-panel--wide"><span className="eyebrow">{t("navigation")}</span><h1>{t("setupNavigationTitle")}</h1><p>{t("setupNavigationDescription")}</p><div className="onboarding-option-columns"><section><h3>{t("weatherForecast")}</h3><div className="onboarding-select"><span>{t("weatherSource")}</span><HDSelect ariaLabel={t("weatherSource")} onChange={(value) => setWeather({ ...weather, entity_id: value })} options={[{ value: "auto", label: t("automatic") }, ...weatherEntities.map((entity) => ({ value: entity.entity_id, label: String(entity.attributes.friendly_name ?? entity.entity_id) }))]} value={weather.entity_id} /></div><div className="onboarding-select"><span>{t("forecastType")}</span><HDSelect ariaLabel={t("forecastType")} onChange={(value) => setWeather({ ...weather, forecast_type: value as "daily" | "hourly" })} options={[{ value: "daily", label: t("daily") }, { value: "hourly", label: t("hourly") }]} value={weather.forecast_type} /></div></section><section><h3>{t("builtInNavigation")}</h3><Toggle checked={navigation.rooms} label={t("roomsPage")} onChange={(checked) => setNavigation({ ...navigation, rooms: checked })} /><Toggle checked={navigation.scenes} label={t("scenes")} onChange={(checked) => setNavigation({ ...navigation, scenes: checked })} /><Toggle checked={navigation.media} label={t("media")} onChange={(checked) => setNavigation({ ...navigation, media: checked })} /><Toggle checked={navigation.security} label={t("security")} onChange={(checked) => setNavigation({ ...navigation, security: checked })} /></section></div>{actions(5, 7)}</div>}
      {step === 7 && <div className="setup-panel setup-panel--wide"><span className="eyebrow">{t("sectionDevice")}</span><h1>{t("setupDeviceTitle")}</h1><p>{t("setupDeviceDescription")}</p><div className="onboarding-device">
        <Toggle checked={hideHaSidebar} description={t("hideHaSidebarDescription")} label={t("hideHaSidebar")} onChange={(hidden) => { setHideHaSidebar(hidden); setHideSidebarPreferred(hidden); }} />
        <div className="onboarding-select onboarding-select--described"><span>{t("keepAwake")}<small>{`${t("keepAwakeDescription")}${isSilk() ? ` ${t("keepAwakeEcho")}` : ""}`}</small></span><HDSelect ariaLabel={t("keepAwake")} onChange={(mode) => setKeepAwakeMode(mode as "auto" | "on" | "off")} options={[{ value: "auto", label: t("keepAwakeAuto") }, { value: "on", label: t("keepAwakeOn") }, { value: "off", label: t("keepAwakeOff") }]} value={awake} /></div>
        {plan.pro ? <Toggle checked={screensaver.enabled} description={t("screensaverDescription")} label={t("screensaverEnable")} onChange={(enabled) => setScreensaver({ ...screensaver, enabled })} /> : <button className="onboarding-toggle onboarding-toggle--described onboarding-toggle--pro" onClick={() => plan.upsell("feature")} type="button"><span>{t("screensaverEnable")}<small>{t("screensaverDescription")}</small></span><b><HDIcon name="lock" size={13} />Pro</b></button>}
      </div>{actions(6, 8)}</div>}
      {step === 8 && <div className="setup-panel setup-panel--ready"><span className="welcome-panel__mark"><HDIcon name="home" size={34} /></span><span className="eyebrow">HOMEDECK</span><h1>{t("setupReadyTitle")}</h1><p>{t("setupReadyDescription")}</p><div className="setup-ready-summary"><span><strong>{selectedRooms.length}</strong>{t("roomsPage")}</span><span><strong className="ready-color" style={{ background: accentColor }} />{t("accentColor")}</span><span><strong>{t(BACKGROUNDS.find(([preset]) => preset === background.preset)?.[1] ?? "backgroundEmber")}</strong>{t("background")}</span><span><strong>{layoutName}</strong>{t("viewMode")}</span></div><div className="setup-actions"><button className="secondary-button" onClick={() => setStep(7)} type="button">{t("back")}</button><button className="primary-button" disabled={saving || selectedRooms.length === 0} onClick={() => void complete()} type="button">{saving ? t("saving") : t("buildDashboard")}</button></div></div>}
    </section>
  </main>;
}
