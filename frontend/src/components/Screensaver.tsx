import { useContext, useEffect, useState } from "react";
import { newYearCountdown } from "../seasons";
import { OccasionContext } from "./SeasonLayer";
import { weatherConditionLabel, type TranslationKey } from "../i18n";
import type { HomeDeckConfig } from "../types/config";
import type { HomeAssistant } from "../types/home-assistant";
import { useWeather } from "../weather";
import { HDIcon, type IconName } from "./HDIcon";
import { SaverAgenda } from "./Agenda";

function weatherIcon(condition: string): IconName {
  if (condition === "sunny") return "sun";
  if (condition === "clear-night") return "moon";
  return "cloud";
}

interface ScreensaverProps {
  config: HomeDeckConfig;
  hass: HomeAssistant;
  language?: string;
  onDismiss: () => void;
  t: (key: TranslationKey) => string;
}

/** Large clock with date and weather over a blurred copy of the panel background. */
export function Screensaver({ config, hass, language, onDismiss, t }: ScreensaverProps) {
  const occasion = useContext(OccasionContext);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 5_000);
    const key = () => onDismiss();
    window.addEventListener("keydown", key);
    return () => { window.clearInterval(timer); window.removeEventListener("keydown", key); };
  }, [onDismiss]);

  const { now: weather } = useWeather(hass, config);
  const temperature = weather?.temperature != null ? Math.round(weather.temperature) : undefined;

  return <div aria-label={t("tapToReturn")} className="hd-saver" onClick={onDismiss} role="button" tabIndex={0}>
    <div className="hd-saver__clock">
      <time className="hd-saver__time">{new Intl.DateTimeFormat(language, { hour: "2-digit", minute: "2-digit" }).format(now)}</time>
      <div className="hd-saver__date">{new Intl.DateTimeFormat(language, { weekday: "long", day: "numeric", month: "long" }).format(now)}</div>
      {weather && <div className="hd-saver__weather"><HDIcon name={weatherIcon(weather.condition ?? "")} size={22} /><span>{temperature != null ? `${temperature}°` : ""}{temperature != null && weather.condition ? " · " : ""}{weather.condition ? weatherConditionLabel(weather.condition, language) : ""}</span></div>}
      {(() => {
        // Special dates: the greeting on the day, and on New Year's Eve the time left to midnight.
        const eve = occasion?.id === "newyear" ? newYearCountdown(now) : null;
        if (eve) return <div className="hd-saver__season">{t("seasonNewYearIn").replace("{year}", String(eve.year)).replace("{time}", eve.hours > 0 ? `${eve.hours} h ${String(eve.minutes).padStart(2, "0")} min` : `${eve.minutes} min`)}</div>;
        return occasion?.phase === "day" && occasion.greeting ? <div className="hd-saver__season">{occasion.greeting}</div> : null;
      })()}
    </div>
    {(config.screensaver.show_events || config.screensaver.show_todo) && <SaverAgenda config={config} hass={hass} language={language} showEvents={Boolean(config.screensaver.show_events)} showTodo={Boolean(config.screensaver.show_todo)} t={t} />}
    <div className="hd-saver__hint">{t("tapToReturn")}</div>
  </div>;
}
