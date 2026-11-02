import { useEffect, useMemo, useState } from "react";
import type { HomeDeckConfig } from "./types/config";
import type { HassEntity, HomeAssistant } from "./types/home-assistant";

// Weather from the best source available, in the same order as the main dashboard:
// the chosen weather entity, any working weather entity, an outdoor temperature sensor
// (such as sensor.openweathermap_temperature), then Open-Meteo at the home's location.

export const OPEN_METEO = "open_meteo";
const OPEN_METEO_TTL = 15 * 60 * 1000;

export interface WeatherForecast {
  datetime?: string;
  condition?: string;
  temperature?: number;
  templow?: number;
  precipitation_probability?: number;
  wind_speed?: number;
}

export interface WeatherNow {
  /** Where the numbers come from: an entity name or "Open-Meteo". */
  source: string;
  entityId?: string;
  temperature?: number;
  condition?: string;
  apparent?: number;
  humidity?: number;
  wind?: string;
  pressure?: string;
}

interface OpenMeteo {
  now: WeatherNow;
  daily: WeatherForecast[];
  hourly: WeatherForecast[];
  sunrise?: string;
  sunset?: string;
}

/** Everything the forecast window shows, from the same sources as the current weather. */
export interface WeatherDetails {
  now?: WeatherNow;
  daily: WeatherForecast[];
  hourly: WeatherForecast[];
  sunrise?: string;
  sunset?: string;
}

export function numeric(value: unknown): number | undefined {
  if (value == null || value === "") return undefined;
  const parsed = typeof value === "number" ? value : Number.parseFloat(String(value));
  return Number.isFinite(parsed) ? parsed : undefined;
}

const usable = (state?: HassEntity): state is HassEntity => Boolean(state && !["unknown", "unavailable", "none", ""].includes(state.state.toLowerCase()));

/** A working weather entity: the chosen one, or any other with a temperature. */
export function weatherEntity(hass: HomeAssistant, source: string): HassEntity | undefined {
  const chosen = source.startsWith("weather.") ? hass.states[source] : undefined;
  if (usable(chosen)) return chosen;
  if (source === OPEN_METEO) return undefined;
  return Object.values(hass.states).find((state) => state.entity_id.startsWith("weather.") && usable(state) && numeric(state.attributes.temperature) != null);
}

/** An outdoor temperature sensor and the condition sensor beside it (OpenWeatherMap creates both).
 * Indoor sensors are never used: a fridge or a 3D printer bed would show a wrong temperature. */
function outdoorSensor(hass: HomeAssistant): { temperature: number; condition?: string; name: string } | undefined {
  const states = Object.values(hass.states);
  const candidates = states.filter((state) => state.entity_id.startsWith("sensor.")
    && (state.attributes.device_class === "temperature" || ["°C", "°F"].includes(String(state.attributes.unit_of_measurement)))
    && /outdoor|outside|extern|exterior|weather|openweather|rua|quintal/i.test(`${state.entity_id} ${state.attributes.friendly_name ?? ""}`)
    && !/dew|orvalho|feels|apparent|sensa|wind_chill|heat_index/i.test(state.entity_id)
    && numeric(state.state) != null);
  const sensor = candidates.find((state) => state.entity_id.endsWith("_temperature")) ?? candidates[0];
  if (!sensor) return undefined;
  const condition = hass.states[sensor.entity_id.replace(/_temperature$/, "_condition")];
  return { temperature: numeric(sensor.state)!, condition: usable(condition) ? condition.state : undefined, name: String(sensor.attributes.friendly_name ?? sensor.entity_id).replace(/\s*(temperature|temperatura)$/i, "") };
}

/** WMO weather codes as Home Assistant conditions. */
function wmoCondition(code: number, day = true): string {
  if (code === 0) return day ? "sunny" : "clear-night";
  if (code <= 2) return "partlycloudy";
  if (code === 3) return "cloudy";
  if (code === 45 || code === 48) return "fog";
  if (code === 65 || code === 82) return "pouring";
  if (code === 66 || code === 67) return "snowy-rainy";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "snowy";
  if (code >= 95) return "lightning-rainy";
  if (code >= 51) return "rainy";
  return "cloudy";
}

const openMeteoCache = new Map<string, { at: number; data: Promise<OpenMeteo | null> }>();

function loadOpenMeteo(latitude: number, longitude: number): Promise<OpenMeteo | null> {
  const key = `${latitude.toFixed(2)},${longitude.toFixed(2)}`;
  const cached = openMeteoCache.get(key);
  if (cached && Date.now() - cached.at < OPEN_METEO_TTL) return cached.data;
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}`
    + "&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day"
    + "&hourly=temperature_2m,weather_code,precipitation_probability,is_day"
    + "&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max,sunrise,sunset&timezone=auto&forecast_days=7";
  const data = fetch(url).then((response) => response.ok ? response.json() : null).then((json) => {
    if (!json?.current) return null;
    const now = Date.now();
    const hourly: WeatherForecast[] = json.hourly.time.map((time: string, index: number) => ({
      datetime: time,
      condition: wmoCondition(json.hourly.weather_code[index], Boolean(json.hourly.is_day[index])),
      temperature: json.hourly.temperature_2m[index],
      precipitation_probability: json.hourly.precipitation_probability[index],
    })).filter((item: WeatherForecast) => Date.parse(item.datetime!) > now - 3_600_000);
    const daily: WeatherForecast[] = json.daily.time.map((time: string, index: number) => ({
      datetime: `${time}T12:00`,
      condition: wmoCondition(json.daily.weather_code[index]),
      temperature: json.daily.temperature_2m_max[index],
      templow: json.daily.temperature_2m_min[index],
      precipitation_probability: json.daily.precipitation_probability_max[index],
    }));
    return {
      now: {
        source: "Open-Meteo",
        temperature: json.current.temperature_2m,
        condition: wmoCondition(json.current.weather_code, Boolean(json.current.is_day)),
        apparent: json.current.apparent_temperature,
        humidity: json.current.relative_humidity_2m,
        wind: `${Math.round(json.current.wind_speed_10m)} km/h`,
      },
      daily,
      hourly,
      sunrise: json.daily.sunrise?.[0],
      sunset: json.daily.sunset?.[0],
    };
  }).catch(() => null);
  openMeteoCache.set(key, { at: Date.now(), data });
  return data;
}

/** Current weather and, with `withForecast`, the daily and hourly forecast with sunrise and sunset,
 * from the best source available (Open-Meteo fills in what the weather entity does not have). */
export function useWeather(hass: HomeAssistant, config: HomeDeckConfig, withForecast = false): WeatherDetails {
  const source = config.weather.entity_id;
  const entity = useMemo(() => weatherEntity(hass, source), [hass.states, source]);
  const sensor = useMemo(() => (entity || source === OPEN_METEO ? undefined : outdoorSensor(hass)), [hass.states, entity, source]);
  const [entityDaily, setEntityDaily] = useState<WeatherForecast[]>([]);
  const [entityHourly, setEntityHourly] = useState<WeatherForecast[]>([]);
  const [meteo, setMeteo] = useState<OpenMeteo | null>(null);
  const latitude = hass.config?.latitude;
  const longitude = hass.config?.longitude;
  // Open-Meteo fills in whatever the entities cannot: everything without an entity, and the forecast,
  // sunrise and sunset while the forecast is shown.
  const needsMeteo = (!entity || withForecast) && latitude != null && longitude != null;

  useEffect(() => {
    if (!needsMeteo) { setMeteo(null); return; }
    let cancelled = false;
    void loadOpenMeteo(latitude!, longitude!).then((data) => { if (!cancelled) setMeteo(data); });
    const timer = window.setInterval(() => void loadOpenMeteo(latitude!, longitude!).then((data) => { if (!cancelled) setMeteo(data); }), OPEN_METEO_TTL);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, [needsMeteo, latitude, longitude]);

  useEffect(() => {
    const legacy = entity?.attributes.forecast;
    setEntityDaily(Array.isArray(legacy) ? legacy as WeatherForecast[] : []);
    setEntityHourly([]);
    if (!withForecast || !entity || !hass.connection.subscribeMessage) return;
    let cancelled = false;
    const removers: Array<() => void> = [];
    for (const [type, set] of [["daily", setEntityDaily], ["hourly", setEntityHourly]] as const) {
      void hass.connection.subscribeMessage<{ forecast?: WeatherForecast[] | null }>((message) => {
        if (!cancelled && Array.isArray(message.forecast)) set(message.forecast);
      }, { type: "weather/subscribe_forecast", entity_id: entity.entity_id, forecast_type: type })
        .then((remove) => { if (cancelled) remove(); else removers.push(remove); }).catch(() => undefined);
    }
    return () => { cancelled = true; removers.forEach((remove) => remove()); };
  }, [withForecast, entity?.entity_id, hass.connection]);

  let now: WeatherNow | undefined;
  if (entity) {
    const a = entity.attributes;
    now = {
      source: String(a.friendly_name ?? entity.entity_id),
      entityId: entity.entity_id,
      temperature: numeric(a.temperature),
      condition: entity.state,
      apparent: numeric(a.apparent_temperature),
      humidity: numeric(a.humidity),
      wind: numeric(a.wind_speed) != null ? `${Math.round(Number(a.wind_speed))} ${a.wind_speed_unit ?? ""}`.trim() : undefined,
      pressure: numeric(a.pressure) != null ? `${a.pressure} ${a.pressure_unit ?? ""}`.trim() : undefined,
    };
  } else if (sensor) {
    now = { ...meteo?.now, source: sensor.name, temperature: sensor.temperature, condition: sensor.condition ?? meteo?.now.condition };
  } else if (meteo) {
    now = meteo.now;
  }
  const now36 = Date.now() - 3_600_000;
  const hourly = (entityHourly.length > 0 ? entityHourly : meteo?.hourly ?? []).filter((item) => !item.datetime || Date.parse(item.datetime) > now36).slice(0, 24);
  const daily = (entityDaily.length > 0 ? entityDaily : meteo?.daily ?? []).slice(0, 7);
  return { now, daily, hourly, sunrise: meteo?.sunrise, sunset: meteo?.sunset };
}
