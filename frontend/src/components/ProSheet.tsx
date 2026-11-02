import { useEffect, useState } from "react";
import { claimCheckout, startCheckout, type LicenseStatus } from "../api/license";
import type { TranslationKey } from "../i18n";
import { formatPrice, PRICES, type UpsellReason } from "../plan";
import type { HomeAssistant } from "../types/home-assistant";
import { HDIcon, type IconName } from "./HDIcon";
import { QrCode } from "./QrCode";

interface ProSheetProps {
  hass: HomeAssistant;
  language?: string;
  license: LicenseStatus | null;
  onActivate: (key: string) => Promise<void>;
  onClose: () => void;
  onLicense: (license: LicenseStatus) => void;
  reason: UpsellReason;
  t: (key: TranslationKey) => string;
}

const BENEFITS: Array<[IconName, TranslationKey]> = [
  ["grid", "proBenefitUnlimited"],
  ["note", "proBenefitMedia"],
  ["sun", "proBenefitLook"],
  ["expand", "proBenefitLayout"],
];
export const LICENSE_ERRORS: Record<string, TranslationKey> = {
  invalid: "licenseInvalid",
  wrong_installation: "licenseWrongInstallation",
  expired: "licenseExpired",
  revoked: "licenseRevoked",
  transferred: "licenseTransferred",
  activation_limit: "licenseActivationLimit",
  offline: "licenseOffline",
};
const POLL_MS = 3000;
const errorOf = (err: unknown): TranslationKey => LICENSE_ERRORS[(err as { code?: string })?.code ?? ""] ?? "licenseOffline";

/** Upgrade sheet: what Pro unlocks, both prices, paying (here or by QR code) and activating a key. */
export function ProSheet({ hass, language, license, onActivate, onClose, onLicense, reason, t }: ProSheetProps) {
  const [plan, setPlan] = useState<"lifetime" | "annual">("lifetime");
  const [key, setKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<TranslationKey | null>(null);
  const [payUrl, setPayUrl] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const canBuy = Boolean(license?.can_buy);

  // Pro turns on by itself once the payment, on this device or a phone, is confirmed.
  useEffect(() => {
    if (!payUrl || done) return;
    const timer = window.setInterval(() => {
      void claimCheckout(hass).then((status) => {
        if (status.plan !== "pro") return;
        onLicense(status);
        setDone(true);
      }).catch(() => undefined);
    }, POLL_MS);
    return () => window.clearInterval(timer);
  }, [payUrl, done, hass.connection]);

  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [onClose]);

  const activate = async () => {
    if (!key.trim() || busy) return;
    setBusy(true);
    setError(null);
    try { await onActivate(key.trim()); } catch (err) { setError(errorOf(err)); } finally { setBusy(false); }
  };
  const buy = async () => {
    if (!canBuy || busy) return;
    setBusy(true);
    setError(null);
    try { setPayUrl((await startCheckout(hass, plan, language)).url); } catch (err) { setError(errorOf(err)); } finally { setBusy(false); }
  };

  const lead: TranslationKey = reason === "rooms" ? "proReasonRooms" : reason === "devices" ? "proReasonDevices" : reason === "feature" ? "proReasonFeature" : "proReasonGeneral";
  const limits = license?.limits ?? { rooms: 4, devices: 10 };

  return <div aria-labelledby="hd-pro-title" aria-modal="true" className="hd-sheet-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }} role="dialog">
    <section className="hd-sheet hd-pro">
      <header className="hd-pro__header">
        <span className="hd-pro__mark"><HDIcon name="star" size={22} /></span>
        <div><span className="eyebrow">{t("appName")}</span><h2 id="hd-pro-title">HomeDeck Pro</h2></div>
        <button aria-label={t("close")} className="hd-close" onClick={onClose} type="button"><HDIcon name="close" size={20} /></button>
      </header>
      {done ? <div className="hd-pro__done">
        <span className="hd-pro__mark"><HDIcon name="check" size={26} /></span>
        <h3>{t("proDone")}</h3>
        <p>{t("proDoneHint")}</p>
        <button className="hd-detail__primary" onClick={onClose} type="button">{t("close")}</button>
      </div> : payUrl ? <div className="hd-pro__pay">
        <QrCode label={t("proQr")} value={payUrl} />
        <div>
          <h3>{t("proPayTitle")}</h3>
          <p>{t("proPayHint")}</p>
          <p className="hd-pro__waiting"><span className="hd-spinner" aria-hidden="true" />{t("proWaiting")}</p>
          <div className="hd-pro__pay-actions">
            <a className="hd-detail__primary" href={payUrl} rel="noopener" target="_blank">{t("proPayHere")}</a>
            <button className="hd-pill" onClick={() => setPayUrl(null)} type="button">{t("proBack")}</button>
          </div>
        </div>
      </div> : <>
        <p className="hd-pro__lead">{t(lead).replace("{rooms}", String(limits.rooms)).replace("{devices}", String(limits.devices))}</p>
        <ul className="hd-pro__benefits">{BENEFITS.map(([icon, label]) => <li key={label}><HDIcon name={icon} size={18} /><span>{t(label)}</span></li>)}</ul>
        <div className="hd-pro__plans" role="radiogroup" aria-label={t("proChoosePlan")}>
          <button aria-checked={plan === "lifetime"} onClick={() => setPlan("lifetime")} role="radio" type="button">
            <small>{t("proLifetime")}</small><strong>{formatPrice(PRICES.lifetime, language)}</strong><span>{t("proLifetimeNote")}</span><i>{t("proRecommended")}</i>
          </button>
          <button aria-checked={plan === "annual"} onClick={() => setPlan("annual")} role="radio" type="button">
            <small>{t("proAnnual")}</small><strong>{formatPrice(PRICES.annual, language)}</strong><span>{t("proAnnualNote")}</span>
          </button>
        </div>
        <button className="hd-detail__primary" disabled={!canBuy || busy} onClick={() => void buy()} type="button"><HDIcon name="star" size={18} />{!canBuy ? t("proBuySoon") : busy ? "…" : t("proBuy")}</button>
        <div className="hd-pro__key">
          <span>{t("proHaveKey")}</span>
          <div>
            <input aria-label={t("proKey")} autoComplete="off" onChange={(event) => { setKey(event.target.value); setError(null); }} onKeyDown={(event) => { if (event.key === "Enter") void activate(); }} placeholder="HD1.…" spellCheck={false} value={key} />
            <button disabled={!key.trim() || busy} onClick={() => void activate()} type="button">{busy ? "…" : t("proActivate")}</button>
          </div>
          {error && <p className="hd-pro__error">{t(error)}</p>}
        </div>
      </>}
    </section>
  </div>;
}
