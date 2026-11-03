import { useEffect, useState } from "react";
import type { TranslationKey } from "../i18n";
import { SUPPORT_EMAIL } from "../plan";
import type { HomeAssistant } from "../types/home-assistant";
import { HDIcon } from "./HDIcon";
import { HDSegmented } from "./HDSelect";

type Kind = "problem" | "idea" | "praise";
const EMAIL_KEY = "homedeck-feedback-email";
const ERRORS: Record<string, TranslationKey> = { too_many: "feedbackTooMany", invalid_email: "feedbackInvalidEmail" };

function rememberedEmail(): string {
  try { return window.localStorage.getItem(EMAIL_KEY) ?? ""; } catch { return ""; }
}

/** Pro: a message to support. It goes through Home Assistant and the license server, which checks the
 * license and e-mails support with Reply-To set to the address given here. */
export function FeedbackSheet({ hass, language, onClose, t }: { hass: HomeAssistant; language?: string; onClose: () => void; t: (key: TranslationKey) => string }) {
  const [email, setEmail] = useState(rememberedEmail);
  const [kind, setKind] = useState<Kind>("idea");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"editing" | "sending" | "sent">("editing");
  const [error, setError] = useState<TranslationKey | null>(null);

  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [onClose]);

  const send = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError("feedbackInvalidEmail");
    if (message.trim().length < 10) return setError("feedbackShort");
    setError(null);
    setState("sending");
    try {
      await hass.connection.sendMessagePromise({
        type: "homedeck/feedback",
        email: email.trim(),
        kind,
        message: message.trim(),
        locale: (language ?? "").slice(0, 12),
        user_agent: navigator.userAgent.slice(0, 300),
      });
      try { window.localStorage.setItem(EMAIL_KEY, email.trim()); } catch { /* private mode */ }
      setState("sent");
    } catch (err) {
      setError(ERRORS[(err as { code?: string })?.code ?? ""] ?? "feedbackFailed");
      setState("editing");
    }
  };

  return <div aria-labelledby="hd-feedback-title" aria-modal="true" className="hd-sheet-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }} role="dialog">
    <section className="hd-sheet hd-pro hd-feedback">
      <header className="hd-pro__header">
        <span className="hd-pro__mark"><HDIcon name="star" size={22} /></span>
        <div><span className="eyebrow">HomeDeck Pro</span><h2 id="hd-feedback-title">{t("feedbackTitle")}</h2></div>
        <button aria-label={t("close")} className="hd-close" onClick={onClose} type="button"><HDIcon name="close" size={20} /></button>
      </header>
      {state === "sent" ? <div className="hd-pro__done">
        <span className="hd-pro__mark"><HDIcon name="check" size={26} /></span>
        <h3>{t("feedbackSent")}</h3>
        <p>{t("feedbackSentDescription")}</p>
        <button className="hd-detail__primary" onClick={onClose} type="button">{t("close")}</button>
      </div> : <form className="hd-feedback__form" onSubmit={(event) => { event.preventDefault(); void send(); }}>
        <label><span>{t("feedbackEmail")}</span><input autoComplete="email" className="hd-feedback__input" inputMode="email" maxLength={200} onChange={(event) => setEmail(event.target.value)} required type="email" value={email} /></label>
        <div><span>{t("feedbackKind")}</span><HDSegmented ariaLabel={t("feedbackKind")} onChange={(value) => setKind(value as Kind)} options={[{ value: "problem", label: t("feedbackProblem") }, { value: "idea", label: t("feedbackIdea") }, { value: "praise", label: t("feedbackPraise") }]} value={kind} /></div>
        <label><span>{t("feedbackMessage")}</span><textarea className="hd-feedback__input hd-feedback__message" maxLength={5000} onChange={(event) => setMessage(event.target.value)} placeholder={t("feedbackPlaceholder")} required rows={6} value={message} /></label>
        <small className="hd-feedback__note">{t("feedbackAttached")}</small>
        {error && <p className="hd-pro__error">{t(error).replace("{email}", SUPPORT_EMAIL)}{error === "feedbackFailed" && <> <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a></>}</p>}
        <button className="hd-detail__primary" disabled={state === "sending"} type="submit"><HDIcon name="check" size={18} />{state === "sending" ? t("feedbackSending") : t("feedbackSend")}</button>
      </form>}
    </section>
  </div>;
}
