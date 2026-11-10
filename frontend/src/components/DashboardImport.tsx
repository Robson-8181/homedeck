import { useEffect, useState } from "react";
import { importedIds, listDashboards, readDashboard, type DashboardInfo, type ImportedDashboard, type ImportResult } from "../dashboardImport";
import type { TranslationKey } from "../i18n";
import { usePlan } from "../plan";
import type { HomeAssistant } from "../types/home-assistant";
import { HDIcon } from "./HDIcon";

export interface ImportChoice { dashboard: ImportedDashboard; pages: boolean; onlyThese: boolean }

/** Pick one of the user's Home Assistant dashboards, see what it holds and bring it in. Used in
 * Settings → Navigation and in the first setup; the caller applies the choice. */
export function DashboardImport({ hass, onCancel, onImport, t }: { hass: HomeAssistant; onCancel: () => void; onImport: (choice: ImportChoice) => void; t: (key: TranslationKey) => string }) {
  const plan = usePlan();
  const [dashboards, setDashboards] = useState<DashboardInfo[] | null>(null);
  const [chosen, setChosen] = useState<DashboardInfo | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [pages, setPages] = useState(plan.pro);
  const [onlyThese, setOnlyThese] = useState(false);

  useEffect(() => { void listDashboards(hass, t("importOverview")).then(setDashboards); }, []);
  const choose = (dashboard: DashboardInfo) => {
    setChosen(dashboard);
    setResult(null);
    void readDashboard(hass, dashboard).then(setResult);
  };

  const found = result?.kind === "ok" ? result.dashboard : null;
  const devices = found ? importedIds(found).size : 0;
  const fill = (key: TranslationKey, values: Record<string, number>) => Object.entries(values).reduce((text, [name, value]) => text.replace(`{${name}}`, String(value)), t(key));

  return <div className="hd-import">
    <p>{t("importIntro")}</p>
    {!dashboards && <p className="hd-import__note">{t("importLoading")}</p>}
    {dashboards && <div className="hd-import__list" role="radiogroup" aria-label={t("importTitle")}>
      {dashboards.map((dashboard) => <button aria-checked={chosen?.url_path === dashboard.url_path} className="hd-import__option" key={dashboard.url_path ?? "default"} onClick={() => choose(dashboard)} role="radio" type="button">
        <HDIcon name="grid" size={18} /><span><b>{dashboard.title}</b>{dashboard.url_path && <small>/{dashboard.url_path}</small>}</span>
      </button>)}
    </div>}
    {chosen && !result && <p className="hd-import__note">{t("importLoading")}</p>}
    {result?.kind === "auto" && <p className="hd-import__note">{t("importAuto")}</p>}
    {result?.kind === "strategy" && <p className="hd-import__note">{t("importStrategy")}</p>}
    {result?.kind === "failed" && <p className="hd-import__note">{t("importFailed")}</p>}
    {found && devices === 0 && <p className="hd-import__note">{t("importEmpty")}</p>}
    {found && devices > 0 && <>
      <p className="hd-import__summary">{fill("importSummary", { views: found.views.length, devices })}{found.skipped > 0 ? ` ${fill("importSkipped", { cards: found.skipped })}` : ""}</p>
      <ul className="hd-import__views">{found.views.map((view) => <li key={view.title}><b>{view.title}</b><span>{view.groups.reduce((total, group) => total + group.ids.length, 0)}</span></li>)}</ul>
      <label className="hd-import__check">
        <input checked={pages} disabled={!plan.pro} onChange={(event) => setPages(event.target.checked)} type="checkbox" />
        <span><b>{t("importPages")}{!plan.pro && <em><HDIcon name="lock" size={12} />Pro</em>}</b><small>{t("importPagesHint")}</small></span>
      </label>
      <label className="hd-import__check">
        <input checked={onlyThese} onChange={(event) => setOnlyThese(event.target.checked)} type="checkbox" />
        <span><b>{t("importOnly")}</b><small>{t("importOnlyHint")}</small></span>
      </label>
    </>}
    <div className="hd-import__actions">
      <button className="secondary-button" onClick={onCancel} type="button">{t("cancel")}</button>
      <button className="primary-button" disabled={!found || devices === 0 || (!pages && !onlyThese)} onClick={() => { if (!plan.pro && !onlyThese) { plan.upsell("feature"); return; } if (found) onImport({ dashboard: found, pages: pages && plan.pro, onlyThese }); }} type="button">{t("importAction")}</button>
    </div>
  </div>;
}
