// Free and Pro: upgrade sheet, plan settings, limit screen and locks.
export const themePlan = String.raw`
.app-shell--overlay { min-height: 0; height: 0; }

/* Pro sheet */
.app-shell .hd-pro { gap: calc(var(--u)*2); }
.app-shell .hd-pro__header { display: flex; align-items: center; gap: calc(var(--u)*1.6); }
.app-shell .hd-pro__header > div { flex: 1; }
.app-shell .hd-pro__header h2 { margin: calc(var(--u)*.3) 0 0; font: 500 calc(var(--u)*3.2)/1.1 var(--f-display); }
.app-shell .hd-pro__mark { width: calc(var(--u)*6); height: calc(var(--u)*6); flex: none; border-radius: 50%; display: grid; place-items: center; background: linear-gradient(135deg, #ffd978, #f5a524); color: #2a2110; box-shadow: 0 6px 18px rgba(245,165,36,.35); }
.app-shell .hd-pro__mark--free { background: rgba(255,255,255,.16); color: var(--ink); box-shadow: none; }
.app-shell .hd-pro__lead { margin: 0; color: var(--ink-2); font: 500 calc(var(--u)*1.9)/1.4 var(--f-body); }
.app-shell .hd-pro__benefits { list-style: none; margin: 0; padding: 0; display: grid; gap: calc(var(--u)*1.1); }
.app-shell .hd-pro__benefits li { display: flex; align-items: center; gap: calc(var(--u)*1.2); font: 600 calc(var(--u)*1.85)/1.3 var(--f-body); }
.app-shell .hd-pro__benefits svg { flex: none; color: #ffc94d; }
.app-shell .hd-pro__plans { display: grid; grid-template-columns: 1fr 1fr; gap: calc(var(--u)*1.2); }
.app-shell .hd-pro__plans button {
  position: relative; display: flex; flex-direction: column; align-items: flex-start; gap: calc(var(--u)*.4); padding: calc(var(--u)*1.8);
  border-radius: calc(var(--u)*2.6); border: 1.5px solid rgba(255,255,255,.18); background: rgba(255,255,255,.06); color: var(--ink); text-align: left; cursor: pointer;
}
.app-shell .hd-pro__plans button[aria-checked="true"] { border-color: #ffc94d; background: rgba(255,201,77,.12); }
.app-shell .hd-pro__plans small { font: 700 calc(var(--u)*1.45)/1 var(--f-body); letter-spacing: .1em; text-transform: uppercase; color: var(--ink-3); }
.app-shell .hd-pro__plans strong { font: 500 calc(var(--u)*3.6)/1.05 var(--f-display); font-variant-numeric: tabular-nums; }
.app-shell .hd-pro__plans span { color: var(--ink-2); font: 500 calc(var(--u)*1.55)/1.3 var(--f-body); }
.app-shell .hd-pro__plans i { position: absolute; top: calc(var(--u)*-1.1); right: calc(var(--u)*1.2); padding: 3px 9px; border-radius: 99px; background: #ffc94d; color: #2a2110; font: 700 calc(var(--u)*1.3)/1.3 var(--f-body); font-style: normal; }
.app-shell .hd-pro .hd-detail__primary { background: linear-gradient(135deg, #ffd978, #f5a524); color: #2a2110; }
.app-shell .hd-pro .hd-detail__primary:disabled { background: rgba(255,255,255,.14); color: var(--ink-2); cursor: default; }
.app-shell .hd-pro__key { display: flex; flex-direction: column; gap: calc(var(--u)*.9); padding-top: calc(var(--u)*1.6); border-top: 1px solid rgba(255,255,255,.12); }
.app-shell .hd-pro__key > span { color: var(--ink-2); font: 600 calc(var(--u)*1.7)/1.2 var(--f-body); }
.app-shell .hd-pro__key > div { display: flex; gap: calc(var(--u)*1); }
.app-shell .hd-pro__key input { flex: 1; min-width: 0; height: calc(var(--u)*5.4); padding: 0 calc(var(--u)*1.6); border-radius: calc(var(--u)*1.6); border: 1px solid rgba(255,255,255,.2); background: rgba(0,0,0,.2); color: var(--ink); font: 500 calc(var(--u)*1.7)/1 ui-monospace, "SF Mono", Menlo, monospace; outline: 0; }
.app-shell .hd-pro__key input:focus { border-color: rgba(255,255,255,.55); }
.app-shell .hd-pro__key button { flex: none; height: calc(var(--u)*5.4); padding: 0 calc(var(--u)*2.4); border: 0; border-radius: 99px; background: rgba(255,255,255,.92); color: #1d1a17; font: 600 calc(var(--u)*1.8)/1 var(--f-body); cursor: pointer; }
.app-shell .hd-pro__key button:disabled { opacity: .45; cursor: default; }
/* Paying: QR code for a phone, or this device; then the thank-you state */
.app-shell .hd-pro__pay { display: grid; grid-template-columns: auto 1fr; gap: calc(var(--u)*2.4); align-items: center; }
.app-shell .hd-qr { width: calc(var(--u)*22); height: calc(var(--u)*22); border-radius: calc(var(--u)*1.6); display: block; }
.app-shell .hd-pro__pay h3, .app-shell .hd-pro__done h3 { margin: 0; font: 500 calc(var(--u)*2.6)/1.15 var(--f-display); }
.app-shell .hd-pro__pay p, .app-shell .hd-pro__done p { margin: calc(var(--u)*.8) 0 0; color: var(--ink-2); font: 500 calc(var(--u)*1.75)/1.4 var(--f-body); }
.app-shell .hd-pro__waiting { display: flex; align-items: center; gap: calc(var(--u)*1); color: var(--ink) !important; font-weight: 600 !important; }
.app-shell .hd-spinner { width: 16px; height: 16px; flex: none; border-radius: 50%; border: 2px solid rgba(255,255,255,.25); border-top-color: #ffc94d; animation: hd-spin .9s linear infinite; }
@keyframes hd-spin { to { transform: rotate(360deg); } }
.app-shell .hd-pro__pay-actions { display: flex; flex-wrap: wrap; gap: calc(var(--u)*1); margin-top: calc(var(--u)*1.8); }
.app-shell .hd-pro__pay-actions .hd-detail__primary { width: auto; padding: 0 calc(var(--u)*2.4); text-decoration: none; display: inline-flex; align-items: center; }
.app-shell .hd-pro__done { display: flex; flex-direction: column; align-items: center; text-align: center; gap: calc(var(--u)*.6); padding: calc(var(--u)*2) 0 calc(var(--u)*.6); }
.app-shell .hd-pro__done .hd-detail__primary { margin-top: calc(var(--u)*2); }
@media (max-width: 560px) {
  .app-shell .hd-pro__pay { grid-template-columns: 1fr; justify-items: center; text-align: center; }
  .app-shell .hd-pro__pay-actions, .app-shell .hd-pro__waiting { justify-content: center; }
}
@media (prefers-reduced-motion: reduce) { .app-shell .hd-spinner { animation-duration: 3s; } }
.app-shell .st-plan__ended { display: flex; align-items: center; gap: calc(var(--u)*1); margin: 0; padding: calc(var(--u)*1.2) calc(var(--u)*1.6); border-radius: calc(var(--u)*1.6); background: rgba(255,154,143,.12); color: #ffc2bb; font: 600 calc(var(--u)*1.65)/1.35 var(--f-body); }
.app-shell .hd-pro__error { margin: 0; color: #ff9a8f; font: 600 calc(var(--u)*1.65)/1.3 var(--f-body); }

/* Locks on Pro options */
.app-shell .st-lock { position: absolute; right: -3px; bottom: -3px; width: 18px; height: 18px; border-radius: 50%; display: grid; place-items: center; background: rgba(29,26,23,.85); color: #fff; }
.app-shell .st-swatches button { position: relative; }
.app-shell .st-backgrounds i { position: relative; }
.app-shell .st-backgrounds i .st-lock { right: 6px; bottom: 6px; }
.app-shell .st-item--locked { opacity: .55; }
.app-shell .st-item--locked .st-check { border-style: dashed; }
.pro-locked { position: relative; opacity: .45; }

/* Plan section in settings */
.app-shell .st-plan__head { display: flex; align-items: center; gap: calc(var(--u)*1.6); }
.app-shell .st-plan__head p { margin: calc(var(--u)*.4) 0 0; color: var(--ink-2); font: 500 calc(var(--u)*1.7)/1.35 var(--f-body); }
.app-shell .st-meters { display: grid; grid-template-columns: 1fr 1fr; gap: calc(var(--u)*1.6); }
.app-shell .st-meter span { display: flex; justify-content: space-between; margin-bottom: calc(var(--u)*.8); font: 600 calc(var(--u)*1.75)/1 var(--f-body); }
.app-shell .st-meter i { font-style: normal; color: var(--ink-2); font-variant-numeric: tabular-nums; }
.app-shell .st-meter em { display: block; height: calc(var(--u)*1); border-radius: 99px; background: rgba(255,255,255,.14); overflow: hidden; }
.app-shell .st-meter em span { display: block; height: 100%; margin: 0; border-radius: inherit; background: var(--on); }
.app-shell .st-meter--over em span { background: var(--bad); }
.app-shell .st-code { font: 500 calc(var(--u)*1.5)/1.3 ui-monospace, "SF Mono", Menlo, monospace; color: var(--ink-2); word-break: break-all; text-align: right; max-width: 60%; user-select: all; }

/* Free plan over its limits */
.app-shell .plan-gate__pro { flex-direction: row; align-items: center; gap: calc(var(--u)*2); }
.app-shell .plan-gate__pro > div { flex: 1; }
.app-shell .plan-gate__pro p { margin: calc(var(--u)*.5) 0 0; color: var(--ink-2); font: 500 calc(var(--u)*1.75)/1.35 var(--f-body); }
.app-shell .plan-gate__columns { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr); gap: calc(var(--u)*1.8); align-items: start; }
.app-shell .plan-gate__count { margin-left: calc(var(--u)*.6); color: var(--ink-3); font-weight: 600; font-size: .8em; }
.app-shell .plan-gate__group { display: flex; flex-direction: column; gap: calc(var(--u)*.6); margin-bottom: calc(var(--u)*1.2); }
.app-shell .plan-gate .st-item__main small { margin-left: auto; color: var(--ink-3); font: 500 calc(var(--u)*1.5)/1 var(--f-body); }
.app-shell .plan-gate__actions { position: sticky; bottom: calc(var(--u)*2); display: flex; justify-content: flex-end; }

/* Plan choice during setup (legacy onboarding styles) */
.onboarding-plan { display: flex; flex-direction: column; gap: 12px; margin-top: 18px; }
.onboarding-plan > p { margin: 0 0 4px; opacity: .78; }
.onboarding-plan > button { display: flex; align-items: center; gap: 14px; padding: 16px 18px; border-radius: 20px; border: 1px solid rgba(255,255,255,.2); background: rgba(255,255,255,.1); color: #fff; text-align: left; cursor: pointer; font: inherit; }
.onboarding-plan > button > span { width: 42px; height: 42px; flex: none; border-radius: 50%; display: grid; place-items: center; background: rgba(255,255,255,.16); }
.onboarding-plan__pro { border-color: rgba(255,201,77,.6) !important; background: rgba(255,201,77,.12) !important; }
.onboarding-plan__pro > span { background: linear-gradient(135deg, #ffd978, #f5a524) !important; color: #2a2110; }
.onboarding-plan > button strong { display: block; font-size: 17px; }
.onboarding-plan > button small { display: block; margin-top: 3px; opacity: .72; font-size: 14px; line-height: 1.35; }

@media (max-width: 720px) {
  .app-shell .hd-pro__plans, .app-shell .st-meters, .app-shell .plan-gate__columns { grid-template-columns: minmax(0, 1fr); }
  .app-shell .plan-gate__pro { flex-wrap: wrap; }
}
`;
