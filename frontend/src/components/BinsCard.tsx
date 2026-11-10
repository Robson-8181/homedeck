import type { TranslationKey } from "../i18n";
import { useCustomize } from "../personalize";
import type { HomeDeckBinColor, HomeDeckConfig } from "../types/config";
import type { DiscoveredEntity } from "../types/discovery";
import type { HassEntity, HomeAssistant } from "../types/home-assistant";
import { useWideTile } from "./EditableGrid";

// Waste collection: a bin per sensor, with the days left inside it and the day above. Sensors tell this
// in different ways, so several are understood: a number of days, a date, a `daysTo` attribute or a phrase.

export const BIN_COLORS: Record<HomeDeckBinColor, { body: string; lid: string; ink: string }> = {
  black: { body: "#3a3a42", lid: "#4a4a53", ink: "#ffffff" },
  brown: { body: "#a87a45", lid: "#93693a", ink: "#ffffff" },
  green: { body: "#5a9e5a", lid: "#4c8a4c", ink: "#ffffff" },
  blue: { body: "#5488c4", lid: "#4675ac", ink: "#ffffff" },
  yellow: { body: "#d4b44a", lid: "#bd9e3c", ink: "#2a2110" },
  grey: { body: "#8f949c", lid: "#7c8189", ink: "#ffffff" },
  red: { body: "#c05a55", lid: "#a94c48", ink: "#ffffff" },
};

const TODAY = /\b(today|heute|hoje|hoy|dzisiaj|dzi[sś])\b/i;
const TOMORROW = /\b(tomorrow|morgen|amanh[ãa]|ma[ñn]ana|jutro)\b/i;

const daysUntil = (date: Date) => {
  const start = (moment: Date) => new Date(moment.getFullYear(), moment.getMonth(), moment.getDate()).getTime();
  return Math.round((start(date) - start(new Date())) / 86_400_000);
};

/** Days until the collection, or null when the sensor doesn't say in a way that can be read. */
export function binDays(state: HassEntity | undefined): number | null {
  if (!state || ["unavailable", "unknown"].includes(state.state)) return null;
  const attribute = state.attributes.daysTo ?? state.attributes.days_to ?? state.attributes.days;
  if (typeof attribute === "number") return attribute;
  const value = String(state.state).trim();
  if (/^\d{1,3}$/.test(value)) return Number(value);
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    const date = new Date(value.length === 10 ? `${value}T12:00:00` : value);
    return Number.isNaN(+date) ? null : daysUntil(date);
  }
  if (TODAY.test(value)) return 0;
  if (TOMORROW.test(value)) return 1;
  const phrase = value.match(/\b(?:in|em|en|za)\s+(\d{1,3})\b/i) ?? value.match(/\b(\d{1,3})\s*(?:days?|dias?|d[ií]as?|tag|tage|tagen|dni)\b/i);
  return phrase ? Number(phrase[1]) : null;
}

function whenLabel(days: number | null, language: string | undefined, t: (key: TranslationKey) => string): string {
  if (days == null) return "–";
  if (days <= 1) {
    const word = new Intl.RelativeTimeFormat(language, { numeric: "auto" }).format(Math.max(0, days), "day");
    return word.charAt(0).toLocaleUpperCase(language) + word.slice(1);
  }
  const weekday = new Intl.DateTimeFormat(language, { weekday: "long" }).format(new Date(Date.now() + days * 86_400_000));
  const name = weekday.charAt(0).toLocaleUpperCase(language) + weekday.slice(1);
  return days >= 7 ? t("binNext").replace("{day}", name.replace(/-feira$/i, "")) : name;
}

function Bin({ color, days }: { color: HomeDeckBinColor; days: number | null }) {
  const paint = BIN_COLORS[color];
  return <svg aria-hidden="true" className="bins-card__art" viewBox="0 0 64 78">
    <rect fill={paint.lid} height="4.5" rx="2" width="12" x="26" y="3" />
    <rect fill={paint.lid} height="8" rx="3" width="50" x="7" y="8" />
    <path d="M12 18h40l-3.5 50q-.3 4-4.5 4H20q-4.2 0-4.5-4Z" fill={paint.body} />
    <circle cx="46" cy="72" fill={paint.lid} r="5" />
    <text fill={paint.ink} fontFamily="inherit" fontSize={days != null && days > 99 ? 18 : 24} fontWeight="600" textAnchor="middle" x="32" y="53">{days ?? "–"}</text>
  </svg>;
}

/** The soonest bin alone on a normal card; all of them on double and large ones. */
export function BinsCard({ config, hass, language, onOpen, t }: { config: HomeDeckConfig; hass: HomeAssistant; language?: string; onOpen: (entity: DiscoveredEntity) => void; t: (key: TranslationKey) => string }) {
  const wide = useWideTile();
  const customize = useCustomize();
  const bins = (config.bins ?? []).filter((bin) => bin.entity && hass.states[bin.entity]).map((bin) => {
    const state = hass.states[bin.entity];
    return { ...bin, days: binDays(state), label: bin.name || String(state.attributes.friendly_name ?? bin.entity) };
  });
  const known = bins.filter((bin) => bin.days != null).map((bin) => bin.days as number);
  const soonest = known.length > 0 ? Math.min(...known) : null;
  const shown = wide ? bins : [...bins].sort((a, b) => (a.days ?? 9999) - (b.days ?? 9999)).slice(0, 1);
  const open = (id: string) => { const entity = customize?.lookup(id); if (entity) onOpen(entity); };
  return <div className="widget-card bins-card">
    <div className="bins-card__row">
      {shown.map((bin) => <button aria-label={`${bin.label}: ${whenLabel(bin.days, language, t)}`} className={bin.days != null && bin.days === soonest ? "bins-card__bin bins-card__bin--next" : "bins-card__bin"} key={bin.entity} onClick={() => open(bin.entity)} type="button">
        <b>{whenLabel(bin.days, language, t)}</b>
        <Bin color={bin.color} days={bin.days} />
        <small>{bin.label}</small>
      </button>)}
    </div>
  </div>;
}
