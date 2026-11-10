import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { domainLabel, type TranslationKey } from "../i18n";
import { entityRules, useCustomize } from "../personalize";
import { usePlan } from "../plan";
import type { HomeDeckCondition, HomeDeckEntityRule } from "../types/config";
import type { Room } from "../types/discovery";
import type { HassEntity, HomeAssistant } from "../types/home-assistant";
import { EntityPicker } from "./EntityPicker";
import { HDIcon } from "./HDIcon";

// The rules that decide when something shows: checks on entities (on or off, a state, a number above
// or below), people at home, a time window and days of the week. Used by the cards (in Edit mode)
// and by the header notices (in Settings).

const RULE_DOMAINS = ["person", "sun", "binary_sensor", "sensor", "switch", "input_boolean", "light", "fan", "media_player", "cover", "lock", "climate", "alarm_control_panel", "vacuum", "select", "input_select", "number", "input_number", "device_tracker", "weather", "group"];
/** Entities that are only ever on or off (or home or away, day or night). */
const TWO_STATE = new Set(["binary_sensor", "switch", "input_boolean", "light", "fan", "person", "device_tracker", "sun", "group"]);
/** Usual states, for the kinds whose states are a short known list. */
const KNOWN_STATES: Record<string, string[]> = {
  media_player: ["playing", "paused", "idle", "on", "off"],
  cover: ["open", "closed", "opening", "closing"],
  lock: ["locked", "unlocked", "jammed"],
  alarm_control_panel: ["disarmed", "armed_home", "armed_away", "armed_night", "triggered"],
  vacuum: ["cleaning", "docked", "returning", "idle", "error"],
};
const WEEK = [0, 1, 2, 3, 4, 5, 6];
const MAX_RULES = 6;
const CHECK_LABELS: Record<HomeDeckEntityRule["is"], TranslationKey> = { on: "showWhenOn", off: "showWhenOff", eq: "ruleEq", neq: "ruleNeq", above: "ruleAbove", below: "ruleBelow" };

const isNumeric = (state?: HassEntity) => state != null && state.state !== "" && Number.isFinite(Number(state.state));

/** The checks that make sense for an entity, and the states to offer when it compares to one. */
function checksFor(id: string, state?: HassEntity): { checks: HomeDeckEntityRule["is"][]; choices: string[] } {
  const domain = id.split(".")[0];
  const options = Array.isArray(state?.attributes.options) ? state.attributes.options.map(String) : Array.isArray(state?.attributes.hvac_modes) ? state.attributes.hvac_modes.map(String) : KNOWN_STATES[domain] ?? [];
  if (isNumeric(state) || domain === "input_number" || domain === "number") return { checks: ["above", "below", "eq"], choices: [] };
  if (TWO_STATE.has(domain)) return { checks: ["on", "off"], choices: [] };
  return { checks: options.length > 0 ? ["eq", "neq"] : ["on", "off", "eq", "neq"], choices: options };
}

/** A typed value, saved when leaving the field (or on Enter), so each key doesn't save the panel. */
function RuleValue({ label, numeric, onCommit, placeholder, suffix, value }: { label: string; numeric: boolean; onCommit: (value: string) => void; placeholder?: string; suffix?: string; value?: string }) {
  const [draft, setDraft] = useState(value ?? "");
  useEffect(() => setDraft(value ?? ""), [value]);
  const commit = () => { const clean = draft.trim().replace(",", "."); if (clean !== (value ?? "")) onCommit(clean); };
  return <span className="hd-rules__value">
    <input aria-label={label} className="st-input st-input--framed" inputMode={numeric ? "decimal" : "text"} maxLength={60} onBlur={commit} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); }} placeholder={placeholder} value={draft} />
    {suffix && <small>{suffix}</small>}
  </span>;
}

export function ConditionFields({ exclude, hass, onChange, t, value }: { exclude?: string; hass: HomeAssistant; onChange: (next: HomeDeckCondition | undefined) => void; t: (key: TranslationKey) => string; value?: HomeDeckCondition }) {
  const plan = usePlan();
  const customize = useCustomize();
  const [picking, setPicking] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const language = hass.locale?.language ?? hass.language;
  const rules = entityRules(value);
  const current = value ?? {};
  const name = (id: string) => customize?.lookup(id)?.name ?? String(hass.states[id]?.attributes.friendly_name ?? id);
  // Home Assistant's own words for a state ("Playing", "Armed away"...) when it can give them.
  const stateLabel = (id: string, state: string) => {
    const format = (hass as unknown as { formatEntityState?: (stateObj: HassEntity, state?: string) => string }).formatEntityState;
    const stateObj = hass.states[id];
    const plain = state === "on" ? t("stateOn") : state === "off" ? t("stateOff") : state.replaceAll("_", " ");
    try { return format && stateObj ? format(stateObj, state) : plain; } catch { return plain; }
  };
  const save = (patch: Partial<HomeDeckCondition>) => {
    if (!plan.pro) { plan.upsell("feature"); return; }
    // The first version's single entity is written as a rule from now on.
    const merged: HomeDeckCondition = { ...current, rules, ...patch, entity: undefined, state: undefined };
    if (!merged.rules?.length) merged.rules = undefined;
    if (!merged.rules || merged.rules.length < 2) merged.match = undefined;
    const next = Object.fromEntries(Object.entries(merged).filter(([, item]) => item !== undefined)) as HomeDeckCondition;
    onChange(next.rules?.length || next.people || (next.from && next.to) || next.days?.length ? next : undefined);
  };
  const setRule = (index: number, patch: Partial<HomeDeckEntityRule>) => save({ rules: rules.map((rule, at) => at === index ? { ...rule, ...patch } : rule) });
  const addRule = (id: string) => {
    const state = hass.states[id];
    const { checks, choices } = checksFor(id, state);
    const first = checks[0];
    const start = first === "above" || first === "below" ? String(Number(state?.state ?? 0)) : first === "eq" || first === "neq" ? (choices.includes(String(state?.state)) ? String(state?.state) : choices[0] ?? String(state?.state ?? "")) : undefined;
    save({ rules: [...rules, { entity: id, is: first, ...(start ? { value: start } : {}) }].slice(0, MAX_RULES) });
  };
  // Every candidate from Home Assistant, people and the sun included, grouped by kind.
  const groups = useMemo<Room[]>(() => RULE_DOMAINS.map((domain) => ({
    id: domain, name: domainLabel(domain, language), icon: null, aliases: [], floor_id: null, device_count: 0,
    entities: Object.keys(hass.states).filter((id) => id.startsWith(`${domain}.`) && id !== exclude).sort((a, b) => name(a).localeCompare(name(b))).map((id) => ({ entity_id: id, domain, name: name(id), area_id: "", device_id: null, device_class: null, icon: null })),
  })).filter((group) => group.entities.length > 0), [picking]);
  // From a Sunday, in the panel's language.
  const dayNames = useMemo(() => WEEK.map((day) => new Intl.DateTimeFormat(language, { weekday: "short" }).format(new Date(2024, 0, 7 + day)).replace(".", "")), [language]);
  const days = current.days ?? [];
  const shell = root.current?.closest(".app-shell");
  const pick = () => { if (!plan.pro) plan.upsell("feature"); else if (rules.length < MAX_RULES) setPicking(true); };
  const hasPeople = Object.keys(hass.states).some((id) => id.startsWith("person."));

  return <div className="hd-rules" ref={root}>
    <div className="hd-rules__row">
      <span className="hd-rules__label">{t("ruleConditions")}</span>
      {rules.map((rule, index) => {
        const state = hass.states[rule.entity];
        const kind = rule.entity.split(".")[0];
        const { checks, choices } = checksFor(rule.entity, state);
        const shown = checks.includes(rule.is) ? checks : [...checks, rule.is];
        const label = (check: HomeDeckEntityRule["is"]): TranslationKey => kind === "sun" && check === "on" ? "ruleSunUp" : kind === "sun" && check === "off" ? "ruleSunDown"
          : (kind === "person" || kind === "device_tracker") && check === "on" ? "ruleHome" : (kind === "person" || kind === "device_tracker") && check === "off" ? "ruleAway" : CHECK_LABELS[check];
        const unit = typeof state?.attributes.unit_of_measurement === "string" ? state.attributes.unit_of_measurement : undefined;
        const compares = rule.is === "eq" || rule.is === "neq";
        const numeric = rule.is === "above" || rule.is === "below";
        return <div className="hd-rules__rule" key={`${rule.entity}-${index}`}>
          <div className="hd-rules__head">
            <span className="hd-condition__name">{name(rule.entity)}</span>
            {state && <small>{t("ruleNow")}: {stateLabel(rule.entity, state.state)}{unit && isNumeric(state) ? ` ${unit}` : ""}</small>}
            <button aria-label={`${t("removeItem")}: ${name(rule.entity)}`} className="hd-pill" onClick={() => save({ rules: rules.filter((_, at) => at !== index) })} type="button"><HDIcon name="minus" size={14} /></button>
          </div>
          <div aria-label={name(rule.entity)} className="room-options__icons" role="radiogroup">{shown.map((check) => <button aria-checked={rule.is === check} key={check} onClick={() => setRule(index, { is: check, value: (check === "above" || check === "below") ? (isNumeric(state) ? String(Number(state!.state)) : rule.value) : (check === "eq" || check === "neq") ? (rule.value ?? choices[0] ?? state?.state) : undefined })} role="radio" type="button">{t(label(check))}</button>)}</div>
          {compares && choices.length > 0 && choices.length <= 12 && <div aria-label={t("ruleValue")} className="room-options__icons" role="radiogroup">{choices.map((choice) => <button aria-checked={rule.value === choice} key={choice} onClick={() => setRule(index, { value: choice })} role="radio" type="button">{stateLabel(rule.entity, choice)}</button>)}</div>}
          {(numeric || (compares && (choices.length === 0 || choices.length > 12))) && <RuleValue label={`${t("ruleValue")}: ${name(rule.entity)}`} numeric={numeric} onCommit={(next) => setRule(index, { value: next })} placeholder={state?.state} suffix={numeric ? unit : undefined} value={rule.value} />}
        </div>;
      })}
      {rules.length >= 2 && <div className="hd-rules__body"><span>{t("ruleMatch")}</span><div aria-label={t("ruleMatch")} className="room-options__icons" role="radiogroup">{(["all", "any"] as const).map((match) => <button aria-checked={(current.match ?? "all") === match} key={match} onClick={() => save({ match: match === "any" ? "any" : undefined })} role="radio" type="button">{t(match === "any" ? "ruleMatchAny" : "ruleMatchAll")}</button>)}</div></div>}
      {rules.length < MAX_RULES && <button className="hd-pill" onClick={pick} type="button"><HDIcon name="plus" size={16} />{t(rules.length === 0 ? "showWhenPick" : "ruleAdd")}</button>}
    </div>
    {hasPeople && <div className="hd-rules__row">
      <span className="hd-rules__label">{t("rulePeople")}</span>
      <div aria-label={t("rulePeople")} className="room-options__icons" role="radiogroup">{([undefined, "home", "away"] as const).map((people) => <button aria-checked={current.people === people} key={people ?? "any"} onClick={() => save({ people })} role="radio" type="button">{t(people === "home" ? "ruleAnyoneHome" : people === "away" ? "ruleNobodyHome" : "ruleAnyway")}</button>)}</div>
    </div>}
    <div className="hd-rules__row">
      <span className="hd-rules__label">{t("ruleTime")}</span>
      {current.from && current.to
        ? <div className="hd-rules__body">
          <input aria-label={t("ruleFrom")} className="st-input st-input--framed hd-rules__time" onChange={(event) => { if (event.target.value) save({ from: event.target.value }); }} type="time" value={current.from} />
          <span>{t("ruleTo")}</span>
          <input aria-label={t("ruleTo")} className="st-input st-input--framed hd-rules__time" onChange={(event) => { if (event.target.value) save({ to: event.target.value }); }} type="time" value={current.to} />
          <button aria-label={`${t("removeItem")}: ${t("ruleTime")}`} className="hd-pill" onClick={() => save({ from: undefined, to: undefined })} type="button"><HDIcon name="minus" size={14} /></button>
        </div>
        : <button className="hd-pill" onClick={() => save({ from: "08:00", to: "22:00" })} type="button"><HDIcon name="plus" size={16} />{t("ruleAddTime")}</button>}
    </div>
    <div className="hd-rules__row">
      <span className="hd-rules__label">{t("ruleDays")}</span>
      <div className="room-options__icons hd-rules__days">{WEEK.map((day) => <button aria-checked={days.includes(day)} key={day} onClick={() => save({ days: days.includes(day) ? days.filter((item) => item !== day) : [...days, day].sort() })} role="checkbox" type="button">{dayNames[day]}</button>)}</div>
      <small>{t("ruleDaysHint")}</small>
    </div>
    {picking && shell && createPortal(<EntityPicker language={language} onClose={() => setPicking(false)} onToggle={(id) => { addRule(id); setPicking(false); }} rooms={groups} selected={rules.map((rule) => rule.entity)} t={t} title={t(rules.length === 0 ? "showWhenPick" : "ruleAdd")} />, shell)}
  </div>;
}
