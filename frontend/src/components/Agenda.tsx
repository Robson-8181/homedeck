import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { CSSProperties } from "react";
import type { TranslationKey } from "../i18n";
import type { HomeDeckConfig } from "../types/config";
import type { HomeAssistant } from "../types/home-assistant";
import { useWideTile } from "./EditableGrid";
import { HDIcon } from "./HDIcon";

// Calendar and reminders beside the clock, as in the main dashboard: a button for each with a count
// (events today, reminders due), opening a month view with the day's agenda, or the due reminders.
// Which calendars and which list are chosen in Settings → Home. The Today card shows the same on Home.

const PALETTE = ["#ff7a59", "#4fa3ff", "#38c793", "#b38cff", "#ffc24d", "#ff5c8a", "#34c3d6", "#a3b86c"];
const EVENTS_TTL = 5 * 60 * 1000;
const TODAY_REFRESH = 10 * 60 * 1000;

interface Calendar { id: string; name: string; color: string }
interface CalendarEvent { calendar: string; title: string; start: Date; end: Date; allDay: boolean; location: string; description: string }
interface RawEvent { summary?: string; start?: { date?: string; dateTime?: string }; end?: { date?: string; dateTime?: string }; location?: string; description?: string }
interface TodoItem { uid: string; summary: string; status: string; due?: string; description?: string }
interface DueItem extends TodoItem { late: boolean; when: string; noDate: boolean; sort: number }

interface AgendaProps {
  config: HomeDeckConfig;
  hass: HomeAssistant;
  language?: string;
  t: (key: TranslationKey) => string;
}

const dayKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const parseDate = (value?: { date?: string; dateTime?: string }) => {
  if (!value) return null;
  if (value.dateTime) return new Date(value.dateTime);
  if (!value.date) return null;
  const [year, month, day] = value.date.split("-").map(Number);
  return new Date(year, month - 1, day);
};
/** Whether an event touches a day (all-day events end at midnight of the next day). */
const onDay = (event: CalendarEvent, day: Date) => {
  const from = startOfDay(day);
  const to = new Date(from.getTime() + 86_400_000);
  return event.allDay ? event.start < to && event.end > from : event.start < to && (event.end > from || (+event.start === +event.end && event.start >= from));
};

const eventCache = new Map<string, { at: number; events: Promise<CalendarEvent[]> }>();

function fetchEvents(hass: HomeAssistant, calendars: Calendar[], start: Date, end: Date): Promise<CalendarEvent[]> {
  const key = `${calendars.map((calendar) => calendar.id).join(",")}|${start.toISOString()}|${end.toISOString()}`;
  const cached = eventCache.get(key);
  if (cached && Date.now() - cached.at < EVENTS_TTL) return cached.events;
  const events = Promise.all(calendars.map(async (calendar) => {
    try {
      const raw = await hass.callApi!<RawEvent[]>("GET", `calendars/${calendar.id}?start=${encodeURIComponent(start.toISOString())}&end=${encodeURIComponent(end.toISOString())}`);
      return (raw ?? []).flatMap((item) => {
        const from = parseDate(item.start);
        if (!from) return [];
        return [{ calendar: calendar.id, title: item.summary || "—", start: from, end: parseDate(item.end) ?? from, allDay: Boolean(item.start?.date && !item.start.dateTime), location: item.location ?? "", description: item.description ?? "" }];
      });
    } catch {
      return []; // a calendar that is down leaves the others
    }
  })).then((lists) => lists.flat().sort((a, b) => Number(b.allDay) - Number(a.allDay) || +a.start - +b.start));
  eventCache.set(key, { at: Date.now(), events });
  return events;
}

/** The calendars to show: the chosen ones, or every calendar entity. */
function useCalendars(config: HomeDeckConfig, hass: HomeAssistant): Calendar[] {
  const chosen = config.agenda.calendars;
  const ids = Object.keys(hass.states).filter((id) => id.startsWith("calendar.")).sort().join(",");
  return useMemo(() => ids.split(",").filter(Boolean)
    .map((id, index) => ({ id, name: String(hass.states[id]?.attributes.friendly_name ?? id.split(".")[1]), color: PALETTE[index % PALETTE.length] }))
    .filter((calendar) => chosen.length === 0 || chosen.includes(calendar.id)), [ids, chosen.join(",")]);
}

/** The chosen to-do list, or the first one. */
function todoEntity(config: HomeDeckConfig, hass: HomeAssistant): string | undefined {
  const chosen = config.agenda.todo_entity;
  if (chosen && hass.states[chosen]) return chosen;
  return Object.keys(hass.states).sort().find((id) => id.startsWith("todo."));
}

/** Whether the Today card has anything to read from: a calendar or a to-do list. */
export function todayCardAvailable(config: HomeDeckConfig, hass: HomeAssistant): boolean {
  return config.agenda.today_card && (Boolean(todoEntity(config, hass)) || (Boolean(hass.callApi) && Object.keys(hass.states).some((id) => id.startsWith("calendar."))));
}

/** A list's items, reloaded when it changes in Home Assistant (its state is the open count), and the due ones. */
function useReminders(hass: HomeAssistant, todo: string | undefined, noDate: boolean, language: string | undefined, t: (key: TranslationKey) => string) {
  const [items, setItems] = useState<TodoItem[] | null>(null);
  const todoState = todo ? hass.states[todo]?.state : undefined;
  const reload = useCallback(() => {
    if (!todo) return;
    void hass.connection.sendMessagePromise<{ items?: TodoItem[] }>({ type: "todo/item/list", entity_id: todo })
      .then((result) => setItems([...(result?.items ?? [])])).catch(() => setItems([]));
  }, [todo, hass.connection]);
  useEffect(() => { reload(); }, [reload, todoState]);
  const due = useMemo(() => dueItems(items ?? [], noDate, language, t), [items, noDate, language]);
  return { due, loaded: items !== null, reload };
}

export function AgendaButtons({ config, hass, language, t }: AgendaProps) {
  const calendars = useCalendars(config, hass);
  const todo = config.agenda.show_todo ? todoEntity(config, hass) : undefined;
  const showCalendar = config.agenda.show_calendar && calendars.length > 0 && Boolean(hass.callApi);
  const [todayCount, setTodayCount] = useState(0);
  const [open, setOpen] = useState<"calendar" | "todo" | null>(null);
  // Sheets render at the shell, outside the clock: above the dock, and free of the clock's text styles.
  const anchor = useRef<HTMLDivElement>(null);
  const shell = anchor.current?.closest(".app-shell") ?? null;

  // Events today, for the badge.
  useEffect(() => {
    if (!showCalendar) return;
    let cancelled = false;
    const load = () => {
      const from = startOfDay(new Date());
      const to = new Date(from.getTime() + 86_400_000);
      void fetchEvents(hass, calendars, from, to).then((events) => { if (!cancelled) setTodayCount(events.filter((event) => onDay(event, from)).length); });
    };
    load();
    const timer = window.setInterval(load, TODAY_REFRESH);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, [showCalendar, calendars.map((calendar) => calendar.id).join(",")]);

  const { due, loaded, reload: loadTodo } = useReminders(hass, todo, config.agenda.todo_no_date, language, t);
  const late = due.some((item) => item.late);

  if (!showCalendar && !todo) return null;
  return <>
    <div className="hd-agenda" ref={anchor}>
      {showCalendar && <button aria-label={todayCount ? `${t("calendar")}: ${todayCount} ${t("eventsToday")}` : t("calendar")} className="hd-agenda__button" onClick={() => setOpen("calendar")} type="button">
        <HDIcon name="calendar" size={20} />{todayCount > 0 && <b>{todayCount > 9 ? "9+" : todayCount}</b>}
      </button>}
      {todo && <button aria-label={due.length ? `${t("reminders")}: ${due.length} ${t("pending")}` : t("reminders")} className="hd-agenda__button" onClick={() => { setOpen("todo"); loadTodo(); }} type="button">
        <HDIcon name="list" size={20} />{due.length > 0 && <b className={late ? "hd-agenda__late" : undefined}>{due.length > 9 ? "9+" : due.length}</b>}
      </button>}
    </div>
    {open === "calendar" && shell && createPortal(<CalendarSheet calendars={calendars} hass={hass} language={language} onClose={() => setOpen(null)} t={t} />, shell)}
    {open === "todo" && todo && shell && createPortal(<TodoSheet due={due} entityId={todo} hass={hass} loaded={loaded} onClose={() => setOpen(null)} onReload={loadTodo} t={t} />, shell)}
  </>;
}

/** The Today card on Home: what is left of today's events and the reminders due, without opening anything.
 * A tap opens the month view; on the double-size card, a reminder opens the reminders. */
export function TodayCard({ config, hass, language, t }: AgendaProps) {
  const wide = useWideTile();
  const calendars = useCalendars(config, hass);
  const todo = todoEntity(config, hass);
  const { due, loaded, reload } = useReminders(hass, todo, config.agenda.todo_no_date, language, t);
  const hasCalendar = calendars.length > 0 && Boolean(hass.callApi);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [now, setNow] = useState(() => new Date());
  const [open, setOpen] = useState<"calendar" | "todo" | null>(null);
  const anchor = useRef<HTMLDivElement>(null);
  const shell = anchor.current?.closest(".app-shell") ?? null;
  const today = dayKey(now);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    if (!hasCalendar) return;
    let cancelled = false;
    const load = () => {
      const from = startOfDay(new Date());
      void fetchEvents(hass, calendars, from, new Date(from.getTime() + 86_400_000)).then((list) => { if (!cancelled) setEvents(list); });
    };
    load();
    const timer = window.setInterval(load, TODAY_REFRESH);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, [hasCalendar, today, calendars.map((calendar) => calendar.id).join(",")]);

  const colors = new Map(calendars.map((calendar) => [calendar.id, calendar.color]));
  const time = new Intl.DateTimeFormat(language, { hour: "2-digit", minute: "2-digit" });
  // Events that haven't ended yet, all-day ones first.
  const left = events.filter((event) => colors.has(event.calendar) && onDay(event, now) && (event.allDay || event.end > now || event.start >= now));
  const rows = [
    ...left.map((event, index) => ({ key: `e${index}`, title: event.title, when: event.allDay ? t("allDay") : time.format(event.start), color: colors.get(event.calendar), late: false, open: "calendar" as const })),
    ...due.map((item) => ({ key: item.uid, title: item.summary, when: item.when, color: undefined, late: item.late, open: "todo" as const })),
  ];
  // The small card names the next event with a time; all-day events and reminders count in the "+N".
  const first = rows.find((row) => row.open === "calendar" && row.when !== t("allDay")) ?? rows[0];
  const weekday = new Intl.DateTimeFormat(language, { weekday: "long" }).format(now);
  const date = new Intl.DateTimeFormat(language, { day: "numeric", month: "long" }).format(now);
  const openMain = () => setOpen(hasCalendar ? "calendar" : todo ? "todo" : null);

  return <>
    <div className={`widget-card widget-card--interactive widget-card--today ${wide ? "widget-card--wide" : ""}`} onClick={(event) => { if (!(event.target as HTMLElement).closest("button")) openMain(); }} ref={anchor} role="button" tabIndex={0}>
      <span className="widget-card__icon"><HDIcon name="calendar" size={22} /></span>
      <span className="widget-card__label">{t("today")}</span>
      {wide ? <>
        <strong>{weekday.charAt(0).toUpperCase() + weekday.slice(1)}</strong>
        <p>{date}</p>
        {rows.length === 0 ? <p className="widget-card__empty">{t("nothingToday")}</p> : <ul className="widget-list">{rows.slice(0, 4).map((row) => <li key={row.key}><button className={row.late ? "widget-list--alert" : undefined} onClick={() => { setOpen(row.open); if (row.open === "todo") reload(); }} type="button">
          <span>{row.color ? <i className="widget-list__dot" style={{ background: row.color }} /> : <i className="widget-list__dot widget-list__dot--todo" />}{row.title}</span><small>{row.when}</small>
        </button></li>)}</ul>}
      </> : <>
        <strong>{first ? first.title : (loaded || !todo) ? t("nothingToday") : t("loadingShort")}</strong>
        <p>{first ? `${first.when}${rows.length > 1 ? ` · +${rows.length - 1}` : ""}` : date}</p>
      </>}
    </div>
    {open === "calendar" && hasCalendar && shell && createPortal(<CalendarSheet calendars={calendars} hass={hass} language={language} onClose={() => setOpen(null)} t={t} />, shell)}
    {open === "todo" && todo && shell && createPortal(<TodoSheet due={due} entityId={todo} hass={hass} loaded={loaded} onClose={() => setOpen(null)} onReload={reload} t={t} />, shell)}
  </>;
}

/** Pending reminders up to today (late first), and the ones without a date when asked. */
function dueItems(items: TodoItem[], noDate: boolean, language: string | undefined, t: (key: TranslationKey) => string): DueItem[] {
  const now = new Date();
  const today = dayKey(now);
  const time = new Intl.DateTimeFormat(language, { hour: "2-digit", minute: "2-digit" });
  const date = new Intl.DateTimeFormat(language, { day: "numeric", month: "short" });
  return items.flatMap((item): DueItem[] => {
    if (item.status !== "needs_action") return [];
    let when: Date | null = null;
    let hasTime = false;
    if (item.due) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(item.due)) { const [y, m, d] = item.due.split("-").map(Number); when = new Date(y, m - 1, d); } else { when = new Date(item.due); hasTime = true; }
    }
    if (!when || Number.isNaN(+when)) return noDate ? [{ ...item, late: false, when: t("noDate"), noDate: true, sort: Number.MAX_SAFE_INTEGER }] : [];
    const key = dayKey(when);
    if (key > today) return [];
    const label = key === today ? (hasTime ? `${t("today")} · ${time.format(when)}` : t("today")) : `${date.format(when)}${hasTime ? ` · ${time.format(when)}` : ""}`;
    return [{ ...item, late: key < today || (hasTime && when < now), when: label, noDate: false, sort: +when }];
  }).sort((a, b) => a.sort - b.sort);
}

function TodoSheet({ due, entityId, hass, loaded, onClose, onReload, t }: { due: DueItem[]; entityId: string; hass: HomeAssistant; loaded: boolean; onClose: () => void; onReload: () => void; t: (key: TranslationKey) => string }) {
  const [done, setDone] = useState<string[]>([]);
  useEffect(() => { const key = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); }; window.addEventListener("keydown", key); return () => window.removeEventListener("keydown", key); }, [onClose]);
  const complete = (item: DueItem) => {
    if (done.includes(item.uid)) return;
    setDone([...done, item.uid]);
    void hass.callService("todo", "update_item", { entity_id: entityId, item: item.uid, status: "completed" });
    window.setTimeout(onReload, 1200);
  };
  const late = due.filter((item) => item.late && !item.when.startsWith(t("today")));
  const noDate = due.filter((item) => item.noDate);
  const rest = due.filter((item) => !late.includes(item) && !noDate.includes(item));
  const section = (title: string, list: DueItem[]) => list.length > 0 && <div className="hd-todo__section">
    <span className="eyebrow">{title}</span>
    {list.map((item) => <button aria-label={`${t("completeTask")}: ${item.summary}`} className={`hd-todo__item ${item.late ? "hd-todo__item--late" : ""} ${done.includes(item.uid) ? "hd-todo__item--done" : ""}`} key={item.uid} onClick={() => complete(item)} type="button">
      <span className="hd-todo__check"><HDIcon name="check" size={14} /></span>
      <span className="hd-todo__copy"><b>{item.summary}</b>{item.description && <small>{item.description}</small>}</span>
      <span className="hd-todo__when">{item.when}</span>
    </button>)}
  </div>;
  return <div aria-labelledby="hd-todo-title" aria-modal="true" className="hd-sheet-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }} role="dialog">
    <section className="hd-sheet hd-todo">
      <header className="hd-todo__head">
        <div><h2 id="hd-todo-title">{t("reminders")}</h2><p>{String(hass.states[entityId]?.attributes.friendly_name ?? entityId)}</p></div>
        <button aria-label={t("close")} className="hd-close" onClick={onClose} type="button"><HDIcon name="close" size={20} /></button>
      </header>
      {!loaded ? <p className="hd-todo__empty">{t("loadingShort")}</p>
        : due.length === 0 ? <p className="hd-todo__ok"><HDIcon name="check" size={22} />{t("noReminders")}</p>
        : <>{section(t("overdue"), late)}{section(t("today"), rest)}{section(t("noDate"), noDate)}</>}
    </section>
  </div>;
}

/** The calendars shown are the ones chosen in Settings → Home. */
function CalendarSheet({ calendars, hass, language, onClose, t }: { calendars: Calendar[]; hass: HomeAssistant; language?: string; onClose: () => void; t: (key: TranslationKey) => string }) {
  const now = new Date();
  const [month, setMonth] = useState(() => new Date(now.getFullYear(), now.getMonth(), 1));
  const [selected, setSelected] = useState(() => startOfDay(now));
  const [events, setEvents] = useState<CalendarEvent[] | null>(null);
  const colors = new Map(calendars.map((calendar) => [calendar.id, calendar]));
  // Six weeks starting on the Sunday on or before the 1st.
  const start = new Date(month.getFullYear(), month.getMonth(), 1 - new Date(month.getFullYear(), month.getMonth(), 1).getDay());
  const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 42);

  useEffect(() => { const key = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); }; window.addEventListener("keydown", key); return () => window.removeEventListener("keydown", key); }, [onClose]);
  // Full screen means the panel's area: Home Assistant's sidebar sits on the left of the viewport.
  const sheet = useRef<HTMLDivElement>(null);
  // The black sheet covers the whole window, under Home Assistant's sidebar too, so no seam can show at
  // the sidebar's edge; only its content starts after the sidebar.
  const [left, setLeft] = useState(0);
  useLayoutEffect(() => {
    const measure = () => {
      const shell = sheet.current?.parentElement?.getBoundingClientRect();
      if (shell) setLeft(Math.max(0, Math.round(shell.left)));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);
  useEffect(() => {
    let cancelled = false;
    setEvents(null);
    void fetchEvents(hass, calendars, start, end).then((list) => { if (!cancelled) setEvents(list); });
    return () => { cancelled = true; };
  }, [month.getTime(), calendars.map((calendar) => calendar.id).join(",")]);

  const shown = (events ?? []).filter((event) => colors.has(event.calendar));
  const today = dayKey(now);
  const weekdays = Array.from({ length: 7 }, (_, index) => new Intl.DateTimeFormat(language, { weekday: "short" }).format(new Date(2026, 0, 4 + index)));
  const monthTitle = new Intl.DateTimeFormat(language, { month: "long" }).format(month);
  const time = new Intl.DateTimeFormat(language, { hour: "2-digit", minute: "2-digit" });
  const goMonth = (delta: number) => setMonth(new Date(month.getFullYear(), month.getMonth() + delta, 1));
  const pick = (day: Date) => { setSelected(day); if (day.getMonth() !== month.getMonth() || day.getFullYear() !== month.getFullYear()) setMonth(new Date(day.getFullYear(), day.getMonth(), 1)); };
  const dayEvents = shown.filter((event) => onDay(event, selected));
  const when = (event: CalendarEvent) => {
    if (event.allDay) return t("allDay");
    const sameStart = dayKey(event.start) === dayKey(selected);
    const sameEnd = dayKey(event.end) === dayKey(selected);
    return `${sameStart ? time.format(event.start) : "…"} – ${sameEnd || +event.start === +event.end ? time.format(event.end) : "…"}`;
  };

  return <div aria-labelledby="hd-cal-title" aria-modal="true" className="hd-cal" ref={sheet} role="dialog" style={left ? { paddingLeft: `calc(var(--co) + env(safe-area-inset-left, 0px) + ${left}px)` } : undefined}>
    <header className="hd-cal__head">
      <div className="hd-cal__nav">
        <button aria-label={t("previousMonth")} className="hd-cal__round" onClick={() => goMonth(-1)} type="button"><HDIcon name="arrow" size={20} /></button>
        <h2 id="hd-cal-title">{monthTitle.charAt(0).toUpperCase() + monthTitle.slice(1)} <span>{month.getFullYear()}</span></h2>
        <button aria-label={t("nextMonth")} className="hd-cal__round" onClick={() => goMonth(1)} type="button"><HDIcon name="chevron" size={20} /></button>
      </div>
      <button className="hd-pill" onClick={() => { setMonth(new Date(now.getFullYear(), now.getMonth(), 1)); setSelected(startOfDay(now)); }} type="button">{t("today")}</button>
      <button aria-label={t("close")} className="hd-close" onClick={onClose} type="button"><HDIcon name="close" size={20} /></button>
    </header>
    <div className="hd-cal__body">
      <div className="hd-cal__month">
        <div className="hd-cal__week">{weekdays.map((day) => <span key={day}>{day.replace(".", "")}</span>)}</div>
        <div className="hd-cal__grid">{Array.from({ length: 42 }, (_, index) => {
          const day = new Date(start.getFullYear(), start.getMonth(), start.getDate() + index);
          const list = shown.filter((event) => onDay(event, day));
          return <button className={`hd-cal__day ${day.getMonth() !== month.getMonth() ? "hd-cal__day--out" : ""} ${dayKey(day) === today ? "hd-cal__day--today" : ""} ${dayKey(day) === dayKey(selected) ? "hd-cal__day--selected" : ""}`} key={index} onClick={() => pick(day)} type="button">
            <span className="hd-cal__num">{day.getDate()}</span>
            <span className="hd-cal__chips">{list.slice(0, 3).map((event, chip) => <span className="hd-cal__chip" key={chip} style={{ "--c": colors.get(event.calendar)!.color } as CSSProperties}><i /><span>{event.title}</span></span>)}{list.length > 3 && <span className="hd-cal__more">+{list.length - 3}</span>}</span>
            <span className="hd-cal__dotrow">{list.slice(0, 4).map((event, dot) => <i key={dot} style={{ background: colors.get(event.calendar)!.color }} />)}</span>
          </button>;
        })}</div>
      </div>
      <aside className="hd-cal__agenda">
        <div><span className="eyebrow">{dayKey(selected) === today ? t("today") : new Intl.DateTimeFormat(language, { weekday: "long" }).format(selected)}</span><h3>{new Intl.DateTimeFormat(language, { day: "numeric", month: "long" }).format(selected)}</h3></div>
        <div className="hd-cal__list">
          {events === null ? <p className="hd-cal__empty">{t("loadingShort")}</p>
            : dayEvents.length === 0 ? <p className="hd-cal__empty">{t("nothingThisDay")}</p>
            : dayEvents.map((event, index) => <div className="hd-cal__event" key={index} style={{ "--c": colors.get(event.calendar)!.color } as CSSProperties}><i /><div>
              <b>{event.title}</b>
              <span><HDIcon name="clock" size={14} />{when(event)}<em>{colors.get(event.calendar)!.name}</em></span>
              {event.location && <span><HDIcon name="pin" size={14} /><small>{event.location}</small></span>}
              {event.description && <p>{event.description}</p>}
            </div></div>)}
        </div>
      </aside>
    </div>
  </div>;
}
