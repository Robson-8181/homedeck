import { useCustomize } from "../personalize";
import { HeaderBadges } from "./HeaderBadges";
import { useEffect, useMemo, useRef, useState, useContext } from "react";
import { OccasionContext } from "./SeasonLayer";
import { createPortal } from "react-dom";
import type { CSSProperties } from "react";
import { weatherConditionLabel, type TranslationKey } from "../i18n";
import type { HomeDeckConfig } from "../types/config";
import type { HomeAssistant } from "../types/home-assistant";
import { numeric, useWeather, type WeatherForecast, type WeatherNow } from "../weather";
import { openSidebar, sidebarHidden } from "../sidebar";
import { AgendaButtons } from "./Agenda";
import { HDIcon, type IconName } from "./HDIcon";

interface ContextHeaderProps {
  config: HomeDeckConfig;
  hass: HomeAssistant;
  language?: string;
  onSettings: () => void;
  /** Both halves, or only the clock or only weather, people and settings (split apart by the sidebar layout). */
  part?: "all" | "clock" | "status";
  t: (key: TranslationKey) => string;
}

const AVATAR_COLORS = ["#f0a86a", "#f3c96b", "#8cc4ec", "#b6a3e8"];

function initials(name: string): string {
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

/** Home Assistant weather conditions as icons. */
export function conditionIcon(condition?: string): IconName {
  switch (condition) {
    case "sunny": return "sun";
    case "clear-night": return "moon";
    case "partlycloudy": return "partly";
    case "rainy": case "pouring": return "rain";
    case "lightning": case "lightning-rainy": return "storm";
    case "snowy": case "snowy-rainy": case "hail": return "snow";
    case "fog": return "fog";
    default: return "cloud";
  }
}

export function ContextHeader({ config, hass, language, onSettings, part = "all", t }: ContextHeaderProps) {
  const occasion = useContext(OccasionContext);
  const customize = useCustomize();
  const [now, setNow] = useState(() => new Date());
  const [forecastOpen, setForecastOpen] = useState(false);
  // The forecast opens at the shell, so the dock and the Edit button stay behind it.
  const headerRef = useRef<HTMLElement>(null);
  const shell = headerRef.current?.closest(".app-shell") ?? null;
  const { now: weather, daily, hourly, sunrise, sunset } = useWeather(hass, config, forecastOpen);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const people = useMemo(() => Object.values(hass.states).filter((state) => state.entity_id.startsWith("person.")), [hass.states]);
  const presentPeople = people.filter((person) => person.state === "home");
  const date = new Intl.DateTimeFormat(language, { weekday: "long", day: "2-digit", month: "long" }).format(now);
  const time = new Intl.DateTimeFormat(language, { hour: "2-digit", minute: "2-digit" }).format(now);
  const temperature = weather?.temperature;
  const condition = weather?.condition;
  const conditionLabel = condition ? weatherConditionLabel(condition, language) : t("unavailable");

  return (
    <>
      <header className={part === "all" ? "context-header" : `context-header context-header--${part}`} ref={headerRef}>
        {part !== "status" && <div className="context-header__clock"><span>{date}{occasion && <b className={occasion.phase === "day" ? "hd-season-badge hd-season-badge--day" : "hd-season-badge"}>{occasion.badge}</b>}</span><div className="context-header__time">{config.home.show_clock && <strong>{time}</strong>}<AgendaButtons config={config} hass={hass} language={language} t={t} /></div></div>}
        {part !== "clock" && <div className="context-header__right">
          {(config.home.badges?.length ?? 0) > 0 && <HeaderBadges hass={hass} ids={config.home.badges!.filter((id) => !customize?.restricted(`entity:${id}`))} language={language} rules={config.home.badge_rules} styles={config.home.badge_styles} t={t} texts={config.home.badge_texts} />}
          {config.home.show_weather && weather && (
            <button className="weather-chip" onClick={() => setForecastOpen(true)} title={t("weatherForecast")} type="button">
              <HDIcon name={conditionIcon(condition)} size={20} />
              {temperature != null && <b>{`${Math.round(temperature)}°`}</b>}
              {condition && <small>{conditionLabel}</small>}
            </button>
          )}
          {config.home.show_presence && people.length > 0 && <div className="presence-stack" aria-label={`${presentPeople.length} ${t("peopleHome")}`}>{people.slice(0, 4).map((person, index) => <span className={person.state === "home" ? "presence-avatar presence-avatar--home" : "presence-avatar"} key={person.entity_id} style={{ "--avatar": AVATAR_COLORS[index % AVATAR_COLORS.length] } as CSSProperties} title={`${person.attributes.friendly_name ?? person.entity_id}: ${person.state}`}>{person.attributes.entity_picture ? <img alt="" src={person.attributes.entity_picture} /> : initials(String(person.attributes.friendly_name ?? person.entity_id.split(".")[1]))}</span>)}</div>}
          {sidebarHidden(hass) && <button aria-label={t("openMenu")} className="round-action" onClick={(event) => openSidebar(event.currentTarget)} type="button"><HDIcon name="menu" size={19} /></button>}
          <button aria-label={t("settings")} className="round-action" onClick={onSettings} type="button"><HDIcon name="settings" size={19} /></button>
        </div>}
      </header>
      {forecastOpen && shell && <ForecastSheet daily={daily} hourly={hourly} language={language} onClose={() => setForecastOpen(false)} shell={shell} sunrise={sunrise} sunset={sunset} t={t} weather={weather} />}
    </>
  );
}

/** The forecast window over the whole panel (from the weather chip or the weather card on Home). */
export function ForecastSheet({ daily, hourly, language, onClose, shell, sunrise, sunset, t, weather }: {
  daily: WeatherForecast[]; hourly: WeatherForecast[]; language?: string; onClose: () => void; shell: Element;
  sunrise?: string; sunset?: string; t: (key: TranslationKey) => string; weather?: WeatherNow;
}) {
  const condition = weather?.condition;
  const conditionLabel = condition ? weatherConditionLabel(condition, language) : t("unavailable");
  return createPortal(
    <div aria-labelledby="weather-modal-title" aria-modal="true" className="weather-modal" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }} role="dialog">
      <section className="weather-modal__panel hd-forecast">
        <header><div><h2 id="weather-modal-title">{t("weatherForecast")}</h2></div><button aria-label={t("close")} className="hd-close" onClick={onClose} type="button"><HDIcon name="close" size={20} /></button></header>
        <ForecastBody condition={condition} conditionLabel={conditionLabel} daily={daily} hourly={hourly} language={language} sunrise={sunrise} sunset={sunset} t={t} temperature={weather?.temperature} weather={weather} />
      </section>
    </div>,
    shell,
  );
}

/** The forecast window, as in the main dashboard: now with today's max and min, quick facts,
 * the next hours sideways and the next days with a temperature bar. */
function ForecastBody({ condition, conditionLabel, daily, hourly, language, sunrise, sunset, t, temperature, weather }: {
  condition?: string; conditionLabel: string; daily: WeatherForecast[]; hourly: WeatherForecast[]; language?: string;
  sunrise?: string; sunset?: string; t: (key: TranslationKey) => string; temperature?: number; weather?: WeatherNow;
}) {
  const time = new Intl.DateTimeFormat(language, { hour: "2-digit", minute: "2-digit" });
  const hour = new Intl.DateTimeFormat(language, { hour: "2-digit" });
  const weekday = new Intl.DateTimeFormat(language, { weekday: "short" });
  const today = daily[0];
  const high = numeric(today?.temperature);
  const low = numeric(today?.templow);
  const rain = numeric(today?.precipitation_probability);
  const facts = [
    weather?.apparent != null && `${t("feelsLike")} ${Math.round(weather.apparent)}°`,
    weather?.humidity != null && `${t("humidity")} ${Math.round(weather.humidity)}%`,
    weather?.wind && `${t("wind")} ${weather.wind}`,
    rain != null && `${t("rainChance")} ${Math.round(rain)}%`,
    sunrise && `${t("sunrise")} ${time.format(new Date(sunrise))}`,
    sunset && `${t("sunset")} ${time.format(new Date(sunset))}`,
  ].filter(Boolean) as string[];
  const lows = daily.map((day) => numeric(day.templow) ?? numeric(day.temperature) ?? 0);
  const highs = daily.map((day) => numeric(day.temperature) ?? 0);
  const min = Math.min(...lows);
  const span = Math.max(...highs) - min || 1;
  const label = (value: string) => value.replace(".", "");

  return <>
    <div className="hd-forecast__now">
      <HDIcon name={conditionIcon(condition)} size={56} />
      <strong>{temperature != null ? `${Math.round(temperature)}°` : "—"}</strong>
      <span><b>{conditionLabel}</b>{high != null && <small>{t("maxTemp")} {Math.round(high)}° · {t("minTemp")} {Math.round(low ?? high)}°</small>}</span>
    </div>
    {facts.length > 0 && <div className="hd-forecast__facts">{facts.map((fact) => <span key={fact}>{fact}</span>)}</div>}
    {hourly.length > 0 && <>
      <span className="eyebrow">{t("nextHours")}</span>
      <div className="hd-forecast__hours">{hourly.map((item, index) => {
        const chance = numeric(item.precipitation_probability);
        return <div key={item.datetime ?? index}>
          <small>{index === 0 ? t("now") : `${hour.format(new Date(item.datetime!)).replace(/\D+$/, "")}h`}</small>
          <HDIcon name={conditionIcon(item.condition)} size={24} />
          <b>{numeric(item.temperature) != null ? `${Math.round(numeric(item.temperature)!)}°` : "—"}</b>
          <em>{chance ? `${Math.round(chance)}%` : ""}</em>
        </div>;
      })}</div>
    </>}
    {daily.length > 0 ? <>
      <span className="eyebrow">{t("nextDays").replace("{count}", String(daily.length))}</span>
      <div className="hd-forecast__days">{daily.map((day, index) => {
        const hi = highs[index];
        const lo = lows[index];
        const chance = numeric(day.precipitation_probability);
        return <div key={day.datetime ?? index}>
          <span>{index === 0 ? t("today") : label(weekday.format(new Date(day.datetime!)))}</span>
          <HDIcon name={conditionIcon(day.condition)} size={22} />
          <em>{chance ? `${Math.round(chance)}%` : ""}</em>
          <small>{Math.round(lo)}°</small>
          <i><b style={{ left: `${((lo - min) / span) * 100}%`, width: `${Math.max(4, ((hi - lo) / span) * 100)}%` }} /></i>
          <strong>{Math.round(hi)}°</strong>
        </div>;
      })}</div>
    </> : <p className="weather-modal__empty">{t("forecastUnavailable")}</p>}
    {weather && <p className="hd-forecast__source">{t("source")}: {weather.source}</p>}
  </>;
}
