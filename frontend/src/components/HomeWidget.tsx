import type { TranslationKey } from "../i18n";
import { hvacLabel } from "../i18n";
import type { WidgetKey } from "../layout";
import { isSecurityAlert, isSecurityEntity } from "../security";
import type { DiscoveredEntity, DiscoveryResponse } from "../types/discovery";
import type { HomeAssistant } from "../types/home-assistant";
import { useWideTile } from "./EditableGrid";
import { displayState } from "./EntityCard";
import { HDIcon } from "./HDIcon";
import { WideControls } from "./WideControls";
import { SpotifyCard } from "./SpotifyCard";
import { usePlan } from "../plan";
import { isSpotify } from "../spotify";
import { mediaArt } from "../devices";
import type { HomeDeckConfig } from "../types/config";
import { TodayCard } from "./Agenda";
import { EnergyWidget, SunWidget, WeatherWidget } from "./ExtraWidgets";

function uniqueEntities(data: DiscoveryResponse): DiscoveredEntity[] {
  const seen = new Set<string>();
  return data.rooms.flatMap((room) => room.entities).filter((entity) => !seen.has(entity.entity_id) && Boolean(seen.add(entity.entity_id)));
}

/** Widgets only exist when the house has something to show in them; Today only when turned on in Settings. */
export function availableWidgets(data: DiscoveryResponse, today = false, extra: WidgetKey[] = []): WidgetKey[] {
  const entities = uniqueEntities(data);
  const keys: WidgetKey[] = [];
  if (entities.some((entity) => isSecurityEntity(entity))) keys.push("widget:security");
  if (entities.some((entity) => entity.domain === "climate")) keys.push("widget:climate");
  if (entities.some((entity) => entity.domain === "media_player")) keys.push("widget:media");
  if (today) keys.push("widget:today");
  return [...keys, ...extra];
}

export const WIDGET_LABELS: Record<WidgetKey, TranslationKey> = {
  "widget:security": "security",
  "widget:climate": "climate",
  "widget:media": "media",
  "widget:today": "today",
  "widget:weather": "weatherNow",
  "widget:sun": "sunCard",
  "widget:energy": "energy",
};

interface HomeWidgetProps {
  config: HomeDeckConfig;
  data: DiscoveryResponse;
  hass: HomeAssistant;
  kind: WidgetKey;
  language?: string;
  onOpen: (entity: DiscoveredEntity) => void;
  t: (key: TranslationKey) => string;
}

export function HomeWidget(props: HomeWidgetProps) {
  if (props.kind === "widget:today") return <TodayCard config={props.config} hass={props.hass} language={props.language} t={props.t} />;
  if (props.kind === "widget:weather") return <WeatherWidget config={props.config} hass={props.hass} language={props.language} t={props.t} />;
  if (props.kind === "widget:sun") return <SunWidget hass={props.hass} language={props.language} onOpen={props.onOpen} t={props.t} />;
  if (props.kind === "widget:energy") return <EnergyWidget config={props.config} hass={props.hass} language={props.language} onOpen={props.onOpen} t={props.t} />;
  return <DeviceWidget {...props} />;
}

function DeviceWidget({ data, hass, kind, language, onOpen, t }: HomeWidgetProps) {
  const { pro } = usePlan();
  const wide = useWideTile();
  const entities = uniqueEntities(data);

  if (kind === "widget:security") {
    const monitored = entities.filter((entity) => isSecurityEntity(entity, hass.states[entity.entity_id]));
    const alerts = monitored.filter((entity) => isSecurityAlert(hass.states[entity.entity_id]));
    const target = alerts[0] ?? monitored[0];
    if (wide) {
      // Double size lists what is being watched, alerts first.
      const listed = [...alerts, ...monitored.filter((entity) => !alerts.includes(entity))].slice(0, 4);
      return <div className={`widget-card widget-card--wide ${alerts.length > 0 ? "widget-card--alert" : ""}`}>
        <span className="widget-card__icon"><HDIcon name="shield" size={22} /></span>
        <span className="widget-card__label">{t("security")}</span>
        <strong>{alerts.length > 0 ? t("attentionRequired") : t("allSecure")}</strong>
        <ul className="widget-list">{listed.map((entity) => <li key={entity.entity_id}><button className={isSecurityAlert(hass.states[entity.entity_id]) ? "widget-list--alert" : undefined} onClick={() => onOpen(entity)} type="button"><span>{entity.name}</span><small>{displayState(hass.states[entity.entity_id], entity, t, language)}</small></button></li>)}</ul>
      </div>;
    }
    return <button className={`widget-card widget-card--interactive ${alerts.length > 0 ? "widget-card--alert" : ""}`} onClick={() => target && onOpen(target)} type="button">
      <span className="widget-card__icon"><HDIcon name="shield" size={22} /></span>
      <span className="widget-card__label">{t("security")}</span>
      <strong>{alerts.length > 0 ? t("attentionRequired") : t("allSecure")}</strong>
      <p>{alerts.length === 0 ? `${monitored.length} ${t("monitored")}` : alerts.length === 1 ? alerts[0].name : `${alerts.length} ${t("alerts")}`}</p>
    </button>;
  }

  if (kind === "widget:climate") {
    const climates = entities.filter((entity) => entity.domain === "climate");
    const climate = climates.find((entity) => !["off", "unavailable"].includes(hass.states[entity.entity_id]?.state ?? "unavailable")) ?? climates[0];
    const state = climate ? hass.states[climate.entity_id] : undefined;
    const running = Boolean(state && !["off", "unavailable", "unknown"].includes(state.state));
    const current = state?.attributes.current_temperature;
    if (wide && climate && state && !["unavailable", "unknown"].includes(state.state)) {
      return <div className={`widget-card widget-card--wide widget-card--climate ${running ? "widget-card--playing" : ""}`} onClick={(event) => { if (!(event.target as HTMLElement).closest("button")) onOpen(climate); }} role="button" tabIndex={0}>
        <span className="widget-card__label">{t("climate")}</span>
        <p>{climate.name}{typeof current === "number" ? ` · ${current}°` : ""} · {hvacLabel(String(state.attributes.hvac_action ?? state.state), language)}</p>
        <div className="tile-wide"><WideControls entity={climate} hass={hass} language={language} state={state} t={t} /></div>
      </div>;
    }
    return <button className={`widget-card widget-card--interactive ${running ? "widget-card--playing" : ""}`} onClick={() => climate && onOpen(climate)} type="button">
      <span className="widget-card__icon"><HDIcon name="climate" size={22} /></span>
      <span className="widget-card__label">{t("climate")}</span>
      <strong>{typeof current === "number" ? `${current}°` : state ? hvacLabel(state.state, language) : "—"}</strong>
      <p>{climate?.name}{state ? ` · ${hvacLabel(String(state.attributes.hvac_action ?? state.state), language)}` : ""}</p>
    </button>;
  }

  const players = entities.filter((entity) => entity.domain === "media_player");
  const spotify = players.find((entity) => isSpotify(entity) && hass.states[entity.entity_id]?.state !== "unavailable") ?? players.find(isSpotify);
  if (spotify && pro) return <SpotifyCard entity={spotify} hass={hass} onOpen={onOpen} t={t} />;
  const media = players.find((entity) => hass.states[entity.entity_id]?.state === "playing")
    ?? players.find((entity) => !["off", "unavailable", "standby"].includes(hass.states[entity.entity_id]?.state ?? "unavailable"))
    ?? players[0];
  const state = media ? hass.states[media.entity_id] : undefined;
  const playing = state?.state === "playing";
  const art = mediaArt(state);
  const icon = art ? <span className="widget-card__icon widget-card__icon--art" style={{ backgroundImage: art }} /> : <span className="widget-card__icon"><HDIcon name="media" size={22} /></span>;
  if (wide && media && state && state.state !== "unavailable") {
    return <div className={`widget-card widget-card--wide widget-card--media ${playing ? "widget-card--playing" : ""}`} onClick={(event) => { if (!(event.target as HTMLElement).closest("button, input, label")) onOpen(media); }} role="button" tabIndex={0}>
      {icon}
      <span className="widget-card__label">{t("media")}</span>
      <strong>{String(state.attributes.media_title ?? media.name)}</strong>
      <p>{String(state.attributes.media_artist ?? media.name)}</p>
      <div className="tile-wide"><WideControls entity={media} hass={hass} language={language} state={state} t={t} /></div>
    </div>;
  }
  return <div className={`widget-card widget-card--media widget-card--interactive ${playing ? "widget-card--playing" : ""}`} onClick={() => media && onOpen(media)} role="button" tabIndex={0}>
    {icon}
    <span className="widget-card__label">{t("media")}</span>
    <strong>{String(state?.attributes.media_title ?? media?.name ?? t("nothingPlaying"))}</strong>
    <p>{String(state?.attributes.media_artist ?? (state ? (playing ? t("on") : t("nothingPlaying")) : ""))}</p>
    {media && <button aria-label={t("playPause")} onClick={(event) => { event.stopPropagation(); void hass.callService("media_player", "media_play_pause", { entity_id: media.entity_id }); }} type="button"><HDIcon name={playing ? "volume" : "media"} size={18} /></button>}
  </div>;
}
