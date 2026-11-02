import type { TranslationKey } from "../i18n";
import { FREE_VIEW_MODES, usePlan } from "../plan";
import type { HomeDeckViewMode } from "../types/config";
import { HDIcon } from "./HDIcon";

export const VIEW_MODES: Array<{ id: HomeDeckViewMode; name: TranslationKey; description: TranslationKey }> = [
  { id: "grid", name: "viewGrid", description: "viewGridDescription" },
  { id: "sidebar", name: "viewSidebar", description: "viewSidebarDescription" },
  { id: "list", name: "viewList", description: "viewListDescription" },
  { id: "focus", name: "viewFocus", description: "viewFocusDescription" },
];

/** Miniature drawing of each layout, so the choice is visual. */
function Thumb({ mode }: { mode: HomeDeckViewMode }) {
  return <span className={`lp-thumb lp-thumb--${mode}`} aria-hidden="true">
    {mode === "grid" && <><b className="lp-line" /><span className="lp-grid">{Array.from({ length: 6 }, (_, i) => <i className={i < 2 ? "lp-on" : ""} key={i} />)}</span><b className="lp-dock" /></>}
    {mode === "sidebar" && <><span className="lp-side"><b /><i /><i /><i /><i /></span><span className="lp-main">{Array.from({ length: 4 }, (_, i) => <i className={i === 0 ? "lp-on" : ""} key={i} />)}</span></>}
    {mode === "list" && <><b className="lp-line" /><span className="lp-rows">{Array.from({ length: 5 }, (_, i) => <i className={i === 0 || i === 3 ? "lp-head" : ""} key={i}><em className={i === 1 ? "lp-sw lp-sw--on" : "lp-sw"} /></i>)}</span></>}
    {mode === "focus" && <><span className="lp-hero"><b /><strong /><em /></span><span className="lp-dots"><i className="lp-on" /><i /><i /></span></>}
  </span>;
}

interface LayoutPickerProps {
  onChange: (mode: HomeDeckViewMode) => void;
  t: (key: TranslationKey) => string;
  value: HomeDeckViewMode;
}

export function LayoutPicker({ onChange, t, value }: LayoutPickerProps) {
  const plan = usePlan();
  const locked = (mode: HomeDeckViewMode) => !plan.pro && !FREE_VIEW_MODES.includes(mode);
  return <div className="lp-options" role="radiogroup" aria-label={t("viewMode")}>
    {VIEW_MODES.map((mode) => <button aria-checked={value === mode.id} className="lp-option" key={mode.id} onClick={() => (locked(mode.id) ? plan.upsell("feature") : onChange(mode.id))} role="radio" type="button">
      <Thumb mode={mode.id} />
      <span className="lp-copy"><b>{t(mode.name)}</b><small>{t(mode.description)}</small></span>
      {value === mode.id && <span className="lp-check"><HDIcon name="check" size={14} /></span>}
      {locked(mode.id) && <span className="lp-pro"><HDIcon name="lock" size={12} />Pro</span>}
    </button>)}
  </div>;
}
