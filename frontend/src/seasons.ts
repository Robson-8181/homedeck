import type { TranslationKey } from "./i18n";

// Special dates (Pro, off by default): which occasion is near or happening now, by the home's country
// in Home Assistant, plus birthdays from the calendar and the user's own dates. The panel shows a
// small countdown before it, and an animation and a greeting on the day.

export type SeasonEffect = "snow" | "sparkle" | "halloween" | "hearts" | "eggs" | "confetti" | "bunting" | "leaves";
export const SEASON_EFFECTS: SeasonEffect[] = ["snow", "sparkle", "halloween", "hearts", "eggs", "confetti", "bunting", "leaves"];

export type OccasionId = "christmas" | "newyear" | "halloween" | "valentines" | "easter" | "carnival" | "thanksgiving" | "birthdays";

export interface CustomDate { name: string; date: string; effect: string }

export interface SeasonsConfig { enabled: boolean; off: string[]; custom: CustomDate[] }

export interface Occasion {
  id: string;
  emoji: string;
  /** The animation, or null for a countdown only. */
  effect: SeasonEffect | null;
  /** "lead": the days before (a countdown, and for Christmas a light snow); "day": the day itself. */
  phase: "lead" | "day";
  daysLeft: number;
  /** The badge and the screensaver greeting, already translated. */
  badge: string;
  greeting?: string;
}

const DAY = 86_400_000;
const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const at = (year: number, month: number, day: number) => new Date(year, month - 1, day);

/** Easter Sunday (Gregorian, anonymous algorithm). */
export function easter(year: number): Date {
  const a = year % 19, b = Math.floor(year / 100), c = year % 100, d = Math.floor(b / 4), e = b % 4;
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1;
  return at(year, month, day);
}

/** The fourth Thursday of November (US Thanksgiving). */
function thanksgiving(year: number): Date {
  const first = at(year, 11, 1);
  return at(year, 11, 1 + ((4 - first.getDay() + 7) % 7) + 21);
}

interface Rule { id: OccasionId; emoji: string; effect: SeasonEffect; lead: number; leadEffect?: boolean; countries?: string[]; notIn?: string[]; days: (year: number, country: string) => [Date, Date] }

/** The fixed occasions, in priority order when two fall together. */
export const RULES: Rule[] = [
  { id: "newyear", emoji: "🎆", effect: "sparkle", lead: 0, days: (year) => [at(year, 12, 31), at(year + 1, 1, 1)] },
  { id: "christmas", emoji: "🎄", effect: "snow", lead: 23, leadEffect: true, days: (year) => [at(year, 12, 24), at(year, 12, 25)] },
  { id: "valentines", emoji: "💕", effect: "hearts", lead: 7, days: (year, country) => (country === "BR" ? [at(year, 6, 12), at(year, 6, 12)] : [at(year, 2, 14), at(year, 2, 14)]) },
  { id: "halloween", emoji: "🎃", effect: "halloween", lead: 7, days: (year) => [at(year, 10, 31), at(year, 10, 31)] },
  { id: "easter", emoji: "🐣", effect: "eggs", lead: 7, days: (year) => [easter(year), easter(year)] },
  { id: "carnival", emoji: "🎭", effect: "confetti", lead: 7, countries: ["BR"], days: (year) => [new Date(+easter(year) - 50 * DAY), new Date(+easter(year) - 47 * DAY)] },
  { id: "thanksgiving", emoji: "🦃", effect: "leaves", lead: 7, countries: ["US"], days: (year) => [thanksgiving(year), thanksgiving(year)] },
];

/** The occasions that apply to a country (the settings list them, each with its own switch). */
export function occasionsFor(country: string): OccasionId[] {
  return [...RULES.filter((rule) => (!rule.countries || rule.countries.includes(country)) && !rule.notIn?.includes(country)).map((rule) => rule.id), "birthdays"];
}

/** The occasion to show now, if any: a birthday first, then the user's dates, then the others. */
export function currentOccasion(now: Date, country: string, config: SeasonsConfig, birthdays: string[], t: (key: TranslationKey) => string): Occasion | null {
  if (!config.enabled) return null;
  const today = startOfDay(now);
  const off = new Set(config.off);
  const days = (target: Date) => Math.round((+startOfDay(target) - +today) / DAY);

  if (!off.has("birthdays") && birthdays.length > 0) {
    const names = birthdays.filter(Boolean);
    const greeting = names.length > 0 ? t("seasonBirthdayOf").replace("{name}", names.join(" & ")) : t("seasonBirthday");
    return { id: "birthdays", emoji: "🎂", effect: "confetti", phase: "day", daysLeft: 0, badge: greeting, greeting };
  }

  for (const custom of config.custom) {
    const match = /^(\d{2})-(\d{2})$/.exec(custom.date);
    if (!match) continue;
    let target = at(today.getFullYear(), Number(match[1]), Number(match[2]));
    if (+target < +today) target = at(today.getFullYear() + 1, Number(match[1]), Number(match[2]));
    const left = days(target);
    const effect = (SEASON_EFFECTS as string[]).includes(custom.effect) ? custom.effect as SeasonEffect : "confetti";
    if (left === 0) return { id: `custom:${custom.name}`, emoji: "✨", effect, phase: "day", daysLeft: 0, badge: custom.name, greeting: custom.name };
    if (left > 0 && left <= 7) return { id: `custom:${custom.name}`, emoji: "✨", effect: null, phase: "lead", daysLeft: left, badge: countdown(left, custom.name, t) };
  }

  let lead: Occasion | null = null;
  for (const rule of RULES) {
    if (off.has(rule.id) || (rule.countries && !rule.countries.includes(country))) continue;
    // The occasion of this year, or of last year when it spans New Year.
    for (const year of [today.getFullYear() - 1, today.getFullYear()]) {
      const [from, to] = rule.days(year, country);
      const name = t(`season_${rule.id}` as TranslationKey);
      if (+today >= +startOfDay(from) && +today <= +startOfDay(to)) {
        const greeting = rule.id === "newyear" ? (today.getMonth() === 11 ? t("seasonNewYearEve") : t("seasonNewYear")) : t(`seasonGreeting_${rule.id}` as TranslationKey);
        return { id: rule.id, emoji: rule.emoji, effect: rule.effect, phase: "day", daysLeft: 0, badge: greeting, greeting };
      }
      const left = days(from);
      if (!lead && left > 0 && left <= rule.lead) lead = { id: rule.id, emoji: rule.emoji, effect: rule.leadEffect ? rule.effect : null, phase: "lead", daysLeft: left, badge: countdown(left, name, t) };
    }
  }
  return lead;
}

function countdown(days: number, name: string, t: (key: TranslationKey) => string): string {
  return days === 1 ? t("seasonTomorrow").replace("{name}", name) : t("seasonDaysTo").replace("{days}", String(days)).replace("{name}", name);
}

/** On New Year's Eve: the time left to midnight, once it's 6 hours or less (for the screensaver). */
export function newYearCountdown(now: Date): { hours: number; minutes: number; year: number } | null {
  if (now.getMonth() !== 11 || now.getDate() !== 31) return null;
  const midnight = at(now.getFullYear() + 1, 1, 1);
  const left = +midnight - +now;
  if (left > 6 * 3_600_000) return null;
  return { hours: Math.floor(left / 3_600_000), minutes: Math.floor((left % 3_600_000) / 60_000), year: now.getFullYear() + 1 };
}

/** Fireworks: the first minutes of the new year. */
export function fireworksTime(now: Date): boolean {
  return now.getMonth() === 0 && now.getDate() === 1 && now.getHours() === 0 && now.getMinutes() < 20;
}

/** The name in a birthday event ("Grandma's birthday", "Aniversário da Vovó"), or "" when there is none. */
export function birthdayName(title: string): string | null {
  const keyword = /\b(anivers[aá]rio|birthday|cumplea[ñn]os|geburtstag|urodziny|bday)\b/i;
  if (!keyword.test(title)) return null;
  return title.replace(keyword, " ").replace(/^\s*(de|do|da|dos|das|of|von|del|de la)\s+/i, "").replace(/['’]s\s*$/i, "").replace(/\s+(de|do|da|of|von)\s*$/i, "").replace(/[🎂🎉🎈]/gu, "").replace(/\s{2,}/g, " ").trim().replace(/^[-–:·,]\s*|\s*[-–:·,]$/g, "");
}
