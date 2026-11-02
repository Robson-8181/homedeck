export const styles = String.raw`
:host {
  display: block;
  min-height: 100%;
  color: #f4f7f5;
  background:
    radial-gradient(circle at 8% 0%, rgba(90, 151, 128, 0.16), transparent 32rem),
    radial-gradient(circle at 100% 16%, rgba(112, 132, 205, 0.12), transparent 31rem),
    #0b0e0d;
  font-family: Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  -webkit-font-smoothing: antialiased;
}

* { box-sizing: border-box; }
button { font: inherit; }

.app-shell {
  min-height: 100vh;
}

.theme-minimal {
  background: #111412;
}

.theme-minimal .room-card,
.theme-minimal .entity-card {
  border-radius: 14px;
  background: #181c19;
  box-shadow: none;
}

.theme-minimal .room-card__glow {
  display: none;
}

.theme-dark {
  background:
    radial-gradient(circle at 50% -20%, rgba(90, 104, 122, 0.12), transparent 36rem),
    #050606;
}

.theme-dark .room-card {
  background: #0c0e0d;
}

.screen {
  min-height: 100vh;
  padding: 0 clamp(20px, 5vw, 76px) 72px;
}

.topbar {
  height: 82px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 17px;
  font-weight: 720;
  letter-spacing: -0.02em;
}

.brand__mark {
  width: 34px;
  height: 34px;
  display: inline-grid;
  place-items: center;
  border: 1px solid rgba(216, 255, 112, 0.24);
  border-radius: 11px;
  color: #d8ff70;
  background: rgba(216, 255, 112, 0.08);
}

.brand i {
  padding: 3px 7px;
  border-radius: 99px;
  color: #8c9891;
  background: rgba(255, 255, 255, 0.06);
  font-size: 10px;
  font-style: normal;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.icon-button, .back-button, .primary-button {
  border: 0;
  color: inherit;
  cursor: pointer;
}

.icon-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 12px;
  border-radius: 11px;
  color: #a9b2ad;
  background: transparent;
  transition: background 160ms ease, color 160ms ease;
}

.icon-button:hover { color: #fff; background: rgba(255, 255, 255, 0.06); }
.icon-button:disabled { opacity: 0.55; cursor: default; }
.icon-button > span { display: inline-flex; }
.topbar-actions { display: flex; align-items: center; gap: 2px; }

.hero {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 32px;
  padding: clamp(54px, 8vw, 104px) 0 42px;
}

.eyebrow {
  display: block;
  margin-bottom: 13px;
  color: #8b9991;
  font-size: 10px;
  font-weight: 760;
  letter-spacing: 0.2em;
}

h1, h2, p { margin: 0; }

.hero h1 {
  max-width: 700px;
  font-size: clamp(39px, 5.3vw, 72px);
  font-weight: 570;
  letter-spacing: -0.055em;
  line-height: 0.98;
}

.stats {
  display: flex;
  min-width: 280px;
  padding: 4px 0;
}

.stats div {
  min-width: 88px;
  padding: 0 18px;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
}

.stats strong, .stats span { display: block; }
.stats strong { font-size: 22px; font-weight: 630; }
.stats span { margin-top: 3px; color: #78837d; font-size: 11px; }

.room-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 15px;
}

.room-card {
  --room-accent: #d8ff70;
  position: relative;
  min-height: 226px;
  padding: 20px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 22px;
  color: #eff4f1;
  text-align: left;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.055), rgba(255, 255, 255, 0.018)),
    #111513;
  cursor: pointer;
  transition: transform 180ms ease, border-color 180ms ease, background 180ms ease;
}

.room-card:hover {
  transform: translateY(-3px);
  border-color: color-mix(in srgb, var(--room-accent) 34%, transparent);
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.075), rgba(255, 255, 255, 0.024)),
    #121714;
}

.room-card:focus-visible, button:focus-visible {
  outline: 2px solid #d8ff70;
  outline-offset: 3px;
}

.room-card__glow {
  position: absolute;
  width: 150px;
  height: 150px;
  right: -50px;
  top: -65px;
  border-radius: 50%;
  background: var(--room-accent);
  filter: blur(65px);
  opacity: 0.08;
  pointer-events: none;
}

.room-card__top, .room-card__footer {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.room-card__icon {
  width: 47px;
  height: 47px;
  display: inline-grid;
  place-items: center;
  border-radius: 15px;
  color: var(--room-accent);
  background: color-mix(in srgb, var(--room-accent) 10%, transparent);
}

.room-card__arrow {
  width: 31px;
  height: 31px;
  display: inline-grid;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 50%;
  color: #7f8a84;
  background: rgba(255, 255, 255, 0.025);
}

.room-card__content {
  position: relative;
  display: block;
  margin-top: 30px;
}

.room-card__content strong {
  display: block;
  overflow: hidden;
  font-size: 20px;
  font-weight: 610;
  letter-spacing: -0.025em;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.room-card__meta {
  display: block;
  margin-top: 5px;
  color: #7f8a84;
  font-size: 12px;
}

.room-card__footer {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  color: #929d97;
  font-size: 11px;
}

.room-card__footer > span { display: inline-flex; align-items: center; gap: 7px; }
.status-dot { width: 6px; height: 6px; border-radius: 50%; background: #48514c; }
.status-dot--active { background: var(--room-accent); box-shadow: 0 0 11px var(--room-accent); }

.room-topbar { justify-content: flex-start; }
.room-topbar__brand { margin-left: auto; color: #5f6963; font-size: 12px; font-weight: 700; }

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 12px 9px 7px;
  border-radius: 11px;
  color: #a6b0aa;
  background: transparent;
}

.back-button:hover { color: #fff; background: rgba(255, 255, 255, 0.05); }

.room-hero {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: clamp(45px, 7vw, 80px) 0 50px;
}

.room-hero__icon {
  flex: 0 0 auto;
  width: 72px;
  height: 72px;
  display: inline-grid;
  place-items: center;
  border: 1px solid rgba(216, 255, 112, 0.15);
  border-radius: 22px;
  color: #d8ff70;
  background: rgba(216, 255, 112, 0.07);
}

.room-hero .eyebrow { margin-bottom: 8px; }
.room-hero h1 { font-size: clamp(35px, 5vw, 61px); font-weight: 570; letter-spacing: -0.05em; line-height: 1; }
.room-hero p { margin-top: 9px; color: #7d8982; font-size: 13px; }

.entity-groups { display: flex; flex-direction: column; gap: 38px; }
.section-heading { display: flex; align-items: center; gap: 9px; margin-bottom: 14px; }
.section-heading span { color: #cbd2ce; font-size: 12px; font-weight: 720; letter-spacing: 0.06em; text-transform: uppercase; }
.section-heading i { min-width: 20px; padding: 3px 6px; border-radius: 7px; color: #718078; background: rgba(255, 255, 255, 0.05); font-size: 10px; font-style: normal; text-align: center; }

.entity-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 11px;
}

.entity-card {
  min-height: 78px;
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 14px;
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 17px;
  background: rgba(255, 255, 255, 0.028);
  transition: border-color 160ms ease, background 160ms ease;
}

.entity-card--active { border-color: rgba(216, 255, 112, 0.18); background: rgba(216, 255, 112, 0.045); }

.entity-card__icon {
  flex: 0 0 auto;
  width: 42px;
  height: 42px;
  display: inline-grid;
  place-items: center;
  border-radius: 13px;
  color: #8d9892;
  background: rgba(255, 255, 255, 0.045);
}

.entity-card--active .entity-card__icon { color: #d8ff70; background: rgba(216, 255, 112, 0.09); }

.entity-card__body { min-width: 0; flex: 1; }
.entity-card__body strong, .entity-card__body span { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.entity-card__body strong { color: #e2e7e4; font-size: 13px; font-weight: 590; }
.entity-card__body span { margin-top: 4px; color: #76817b; font-size: 11px; text-transform: capitalize; }

.entity-card__action {
  flex: 0 0 auto;
  width: 37px;
  height: 37px;
  display: inline-grid;
  place-items: center;
  border: 0;
  border-radius: 12px;
  color: #65716a;
  background: rgba(255, 255, 255, 0.045);
  cursor: pointer;
}

.entity-card__action:hover { color: #fff; background: rgba(255, 255, 255, 0.08); }
.entity-card__action--active { color: #17200a; background: #d8ff70; }
.entity-card__action--active:hover { color: #17200a; background: #e2ff91; }
.entity-card__action:disabled { opacity: 0.45; cursor: default; }

.center-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.center-state { min-height: 100vh; }
.center-state h1 { margin-top: 18px; font-size: 28px; }
.center-state p, .empty-state p { max-width: 460px; margin-top: 10px; color: #7e8983; font-size: 13px; line-height: 1.6; }
.center-state__icon, .empty-state__icon {
  width: 58px;
  height: 58px;
  display: inline-grid;
  place-items: center;
  border-radius: 18px;
  color: #ff9f8c;
  background: rgba(255, 116, 89, 0.08);
}

.empty-state { min-height: 280px; padding: 40px; border: 1px dashed rgba(255, 255, 255, 0.1); border-radius: 22px; }
.empty-state__icon { color: #d8ff70; background: rgba(216, 255, 112, 0.07); }
.empty-state h2 { margin-top: 17px; font-size: 20px; }

.primary-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 20px;
  padding: 11px 16px;
  border-radius: 12px;
  color: #17200a;
  background: #d8ff70;
  font-size: 12px;
  font-weight: 700;
}

.loader-mark {
  width: 58px;
  height: 58px;
  display: inline-grid;
  place-items: center;
  border: 1px solid rgba(216, 255, 112, 0.2);
  border-radius: 18px;
  color: #d8ff70;
  background: rgba(216, 255, 112, 0.06);
  animation: pulse 1.4s ease-in-out infinite;
}

.mini-spinner {
  width: 15px;
  height: 15px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: rotate 700ms linear infinite;
}

.spin { animation: rotate 850ms linear infinite; }
@keyframes rotate { to { transform: rotate(360deg); } }
@keyframes pulse { 50% { transform: scale(0.94); opacity: 0.6; } }

.onboarding-screen {
  min-height: 100vh;
  background:
    radial-gradient(circle at 50% 15%, rgba(216, 255, 112, 0.09), transparent 34rem),
    #0b0e0d;
}

.onboarding-screen.theme-minimal { background: #111412; }
.onboarding-screen.theme-dark { background: #050606; }

.onboarding-topbar {
  height: 82px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

.step-dots { display: flex; align-items: center; gap: 7px; }
.step-dot { width: 19px; height: 3px; border-radius: 9px; background: rgba(255, 255, 255, 0.1); }
.step-dot--active { background: #d8ff70; }

.onboarding-content {
  min-height: calc(100vh - 82px);
  display: grid;
  place-items: center;
  padding: 54px 0 80px;
}

.welcome-panel {
  max-width: 690px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.welcome-panel__mark {
  width: 84px;
  height: 84px;
  display: inline-grid;
  place-items: center;
  margin-bottom: 34px;
  border: 1px solid rgba(216, 255, 112, 0.22);
  border-radius: 27px;
  color: #d8ff70;
  background: rgba(216, 255, 112, 0.08);
  box-shadow: 0 18px 70px rgba(197, 255, 65, 0.08);
}

.welcome-panel h1,
.setup-panel h1,
.editor-header h1 {
  font-size: clamp(40px, 6vw, 72px);
  font-weight: 570;
  letter-spacing: -0.055em;
  line-height: 0.98;
}

.welcome-panel p,
.setup-panel > p,
.editor-header p {
  max-width: 600px;
  margin-top: 18px;
  color: #849089;
  font-size: 15px;
  line-height: 1.65;
}

.primary-button--large {
  margin-top: 32px;
  padding: 14px 20px;
  font-size: 13px;
}

.setup-panel { width: min(820px, 100%); }
.setup-panel--wide { width: min(980px, 100%); }

.detection-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 38px;
}

.detection-grid div {
  min-height: 140px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 22px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 19px;
  background: rgba(255, 255, 255, 0.03);
}

.detection-grid strong { font-size: 34px; font-weight: 580; }
.detection-grid span { margin-top: 5px; color: #7f8a84; font-size: 12px; }

.setup-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 35px;
}

.setup-actions .primary-button,
.setup-actions .secondary-button,
.editor-actions .primary-button,
.editor-actions .secondary-button {
  margin-top: 0;
}

.secondary-button {
  padding: 11px 16px;
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 12px;
  color: #a7b0ab;
  background: rgba(255, 255, 255, 0.03);
  cursor: pointer;
}

.secondary-button:hover { color: #fff; background: rgba(255, 255, 255, 0.06); }
.primary-button:disabled, .secondary-button:disabled { opacity: 0.42; cursor: default; }

.theme-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 13px;
  margin-top: 34px;
}

.theme-option {
  padding: 12px 12px 18px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  color: #e6ebe8;
  text-align: left;
  background: rgba(255, 255, 255, 0.025);
  cursor: pointer;
}

.theme-option--selected {
  border-color: rgba(216, 255, 112, 0.5);
  box-shadow: 0 0 0 1px rgba(216, 255, 112, 0.08) inset;
}

.theme-option__preview {
  height: 105px;
  display: flex;
  align-items: end;
  gap: 7px;
  padding: 15px;
  margin-bottom: 16px;
  overflow: hidden;
  border-radius: 13px;
  background: linear-gradient(145deg, #1d2420, #101311);
}

.theme-option__preview i { height: 56%; flex: 1; border-radius: 7px; background: rgba(255, 255, 255, 0.08); }
.theme-option__preview i:first-child { height: 82%; background: rgba(216, 255, 112, 0.16); }
.theme-option--minimal .theme-option__preview { background: #e8ece9; }
.theme-option--minimal .theme-option__preview i { border-radius: 3px; background: #c8cfcb; }
.theme-option--minimal .theme-option__preview i:first-child { background: #78857d; }
.theme-option--dark .theme-option__preview { background: #030404; }
.theme-option--dark .theme-option__preview i { background: #161918; }
.theme-option--dark .theme-option__preview i:first-child { background: #29302c; }
.theme-option strong, .theme-option small { display: block; }
.theme-option strong { font-size: 15px; }
.theme-option small { margin-top: 6px; color: #78837d; font-size: 11px; line-height: 1.4; }

.selection-summary {
  display: inline-flex;
  margin-top: 25px;
  padding: 7px 10px;
  border-radius: 9px;
  color: #d8ff70;
  background: rgba(216, 255, 112, 0.07);
  font-size: 11px;
}

.room-selection-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 13px;
}

.selection-card {
  min-height: 68px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 13px;
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 15px;
  color: #8b9690;
  text-align: left;
  background: rgba(255, 255, 255, 0.025);
  cursor: pointer;
}

.selection-card > span {
  width: 37px;
  height: 37px;
  display: inline-grid;
  place-items: center;
  border-radius: 11px;
  background: rgba(255, 255, 255, 0.04);
}

.selection-card strong { min-width: 0; flex: 1; overflow: hidden; color: #c8cfcb; font-size: 12px; font-weight: 580; text-overflow: ellipsis; white-space: nowrap; }
.selection-card > i { width: 21px; height: 21px; display: inline-grid; place-items: center; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 7px; font-size: 11px; font-style: normal; }
.selection-card--selected { border-color: rgba(216, 255, 112, 0.22); background: rgba(216, 255, 112, 0.04); }
.selection-card--selected > span, .selection-card--selected > i { color: #d8ff70; background: rgba(216, 255, 112, 0.08); }

.editor-screen { max-width: 980px; margin: 0 auto; }
.editor-header { padding: clamp(45px, 7vw, 78px) 0 46px; }
.editor-header h1 { font-size: clamp(38px, 5vw, 61px); }
.editor-section { margin-top: 10px; padding: 25px 0; border-top: 1px solid rgba(255, 255, 255, 0.07); }

.theme-switcher { display: flex; flex-wrap: wrap; gap: 8px; }
.theme-pill { padding: 9px 14px; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 99px; color: #86918b; background: rgba(255, 255, 255, 0.025); cursor: pointer; }
.theme-pill--selected { border-color: rgba(216, 255, 112, 0.35); color: #d8ff70; background: rgba(216, 255, 112, 0.07); }

.editor-room-list { display: flex; flex-direction: column; gap: 8px; }
.editor-room {
  display: flex;
  align-items: center;
  min-height: 64px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 15px;
  background: rgba(255, 255, 255, 0.018);
}
.editor-room--visible { border-color: rgba(216, 255, 112, 0.14); background: rgba(216, 255, 112, 0.025); }
.editor-room__toggle { min-width: 0; flex: 1; display: flex; align-items: center; gap: 12px; padding: 10px 13px; border: 0; color: #78837d; text-align: left; background: transparent; cursor: pointer; }
.editor-room__toggle > span { width: 38px; height: 38px; display: inline-grid; place-items: center; border-radius: 11px; background: rgba(255, 255, 255, 0.04); }
.editor-room__toggle strong { min-width: 0; flex: 1; overflow: hidden; color: #cbd2ce; font-size: 13px; font-weight: 580; text-overflow: ellipsis; white-space: nowrap; }
.editor-room__toggle > i { width: 22px; height: 22px; display: inline-grid; place-items: center; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 7px; color: #d8ff70; font-size: 11px; font-style: normal; }
.reorder-actions { display: flex; gap: 4px; padding-right: 10px; }
.reorder-actions button { width: 31px; height: 31px; border: 0; border-radius: 9px; color: #96a09a; background: rgba(255, 255, 255, 0.05); cursor: pointer; }
.reorder-actions button:disabled { opacity: 0.25; cursor: default; }
.editor-actions { position: sticky; bottom: 0; display: flex; justify-content: flex-end; gap: 10px; padding: 18px 0; background: linear-gradient(transparent, #0b0e0d 24%); }

@media (max-width: 980px) {
  .room-grid, .entity-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .room-selection-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .hero { align-items: flex-start; flex-direction: column; }
  .stats { min-width: 0; }
  .stats div:first-child { padding-left: 0; border-left: 0; }
}

@media (max-width: 620px) {
  .screen { padding: 0 16px 44px; }
  .topbar { height: 68px; }
  .icon-button > span:last-child, .back-button > span { display: none; }
  .hero { padding: 44px 0 28px; gap: 25px; }
  .hero h1 { font-size: 42px; }
  .stats { width: 100%; }
  .stats div { flex: 1; min-width: 0; padding: 0 14px; }
  .stats div:first-child { padding-left: 0; }
  .room-grid, .entity-grid { grid-template-columns: 1fr; }
  .onboarding-topbar { height: 68px; }
  .onboarding-content { min-height: calc(100vh - 68px); padding: 40px 0 55px; }
  .welcome-panel h1, .setup-panel h1 { font-size: 41px; }
  .detection-grid, .theme-grid, .room-selection-grid { grid-template-columns: 1fr; }
  .detection-grid div { min-height: 95px; }
  .theme-option__preview { height: 82px; }
  .setup-actions { position: sticky; bottom: 0; padding: 17px 0; background: linear-gradient(transparent, #0b0e0d 24%); }
  .editor-header { padding: 38px 0; }
  .editor-header h1 { font-size: 39px; }
  .reorder-actions button { width: 29px; }
  .room-card { min-height: 205px; }
  .room-hero { align-items: flex-start; padding: 38px 0; }
  .room-hero__icon { width: 58px; height: 58px; border-radius: 18px; }
  .room-hero h1 { font-size: 38px; }
  .room-hero p { line-height: 1.5; }
}

/* HomeDeck 0.2.3 — operational Home */
.home-screen {
  min-height: 100vh;
  padding: 0 clamp(18px, 3.4vw, 54px) 118px;
  background:
    radial-gradient(circle at 12% 2%, rgba(144, 104, 197, 0.25), transparent 34rem),
    radial-gradient(circle at 94% 15%, rgba(85, 124, 180, 0.2), transparent 30rem),
    linear-gradient(145deg, #161226 0%, #121826 54%, #0b1018 100%);
}

.theme-minimal .home-screen { background: #121416; }
.theme-dark .home-screen { background: radial-gradient(circle at 30% 0%, #161929, #06080b 58%); }

.context-header {
  min-height: 112px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 20px 0 14px;
}

.context-header__clock > span {
  display: block;
  color: rgba(244, 247, 255, 0.62);
  font-size: 11px;
  font-weight: 720;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.context-header__clock > strong {
  display: block;
  margin-top: 1px;
  font-size: clamp(37px, 4vw, 58px);
  font-weight: 410;
  letter-spacing: -0.055em;
  line-height: 1;
}

.context-header__right { display: flex; align-items: center; gap: 10px; }
.weather-chip {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 0 15px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  color: #f7f5ff;
  background: rgba(255, 255, 255, 0.07);
  backdrop-filter: blur(18px);
}
.weather-chip span { font-size: 15px; font-weight: 650; }
.presence-stack { display: flex; padding-left: 8px; }
.presence-avatar {
  width: 38px;
  height: 38px;
  display: inline-grid;
  place-items: center;
  margin-left: -8px;
  overflow: hidden;
  border: 2px solid #171525;
  border-radius: 50%;
  color: #9592a3;
  background: #252536;
  font-size: 10px;
  font-weight: 750;
  filter: grayscale(0.8);
}
.presence-avatar--home { color: #201b31; background: #f5e9c9; filter: none; }
.presence-avatar img { width: 100%; height: 100%; object-fit: cover; }
.round-action {
  width: 42px;
  height: 42px;
  display: inline-grid;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  color: #bbb8c9;
  background: rgba(255, 255, 255, 0.045);
  cursor: pointer;
}
.round-action:hover { color: #fff; background: rgba(255, 255, 255, 0.09); }
.round-action:disabled { opacity: 0.45; cursor: default; }
.round-action > span { display: inline-flex; }

.home-status {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  padding: 18px 0 25px;
}
.home-status .eyebrow { margin-bottom: 5px; color: rgba(255, 255, 255, 0.45); }
.home-status h1 { font-size: clamp(24px, 3vw, 38px); font-weight: 520; letter-spacing: -0.04em; }
.home-status p { margin-top: 6px; color: rgba(244, 247, 255, 0.48); font-size: 11px; }
.global-actions { display: flex; gap: 8px; }
.global-actions button {
  min-height: 40px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 14px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 13px;
  color: #e4e2eb;
  background: rgba(255, 255, 255, 0.065);
  cursor: pointer;
}
.global-actions button:hover { background: rgba(255, 255, 255, 0.12); }
.global-actions button:disabled { opacity: 0.4; cursor: default; }

.priority-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 11px;
  margin-bottom: 21px;
}
.widget-card {
  position: relative;
  min-height: 132px;
  padding: 17px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 21px;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.095), rgba(255, 255, 255, 0.035));
  backdrop-filter: blur(18px);
}
.widget-card--playing { background: linear-gradient(145deg, rgba(117, 174, 224, 0.22), rgba(255, 255, 255, 0.035)); }
.widget-card--alert { border-color: rgba(255, 173, 135, 0.3); background: linear-gradient(145deg, rgba(255, 135, 106, 0.16), rgba(255, 255, 255, 0.03)); }
.widget-card__icon { position: absolute; right: 15px; top: 15px; color: rgba(255, 255, 255, 0.57); }
.widget-card__label { color: rgba(255, 255, 255, 0.46); font-size: 9px; font-weight: 750; letter-spacing: 0.13em; text-transform: uppercase; }
.widget-card strong { display: block; max-width: calc(100% - 35px); margin-top: 24px; overflow: hidden; font-size: 23px; font-weight: 560; letter-spacing: -0.035em; text-overflow: ellipsis; white-space: nowrap; }
.widget-card p { margin-top: 4px; overflow: hidden; color: rgba(255, 255, 255, 0.5); font-size: 11px; text-overflow: ellipsis; white-space: nowrap; text-transform: capitalize; }
.widget-card > button { position: absolute; right: 14px; bottom: 14px; width: 36px; height: 36px; display: inline-grid; place-items: center; border: 0; border-radius: 50%; color: #171827; background: #f6f1df; cursor: pointer; }

.operational-section { scroll-margin-top: 20px; }
.operational-heading { display: flex; align-items: center; gap: 8px; margin: 0 0 10px; }
.operational-heading span { color: rgba(255, 255, 255, 0.66); font-size: 10px; font-weight: 760; letter-spacing: 0.12em; text-transform: uppercase; }
.operational-heading i { min-width: 19px; padding: 2px 6px; border-radius: 99px; color: rgba(255, 255, 255, 0.55); background: rgba(255, 255, 255, 0.07); font-size: 9px; font-style: normal; text-align: center; }

.home-screen .room-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 11px; }
.home-screen .room-card {
  min-height: 158px;
  padding: 15px;
  overflow: hidden;
  border-color: rgba(255, 255, 255, 0.09);
  border-radius: 21px;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.085), rgba(255, 255, 255, 0.025));
  cursor: default;
  backdrop-filter: blur(18px);
}
.home-screen .room-card:hover { transform: none; border-color: rgba(255, 255, 255, 0.17); background: linear-gradient(145deg, rgba(255, 255, 255, 0.11), rgba(255, 255, 255, 0.035)); }
.home-screen .room-card--active { border-color: rgba(255, 255, 255, 0.45); color: #191728; background: var(--room-accent); }
.home-screen .room-card--active .room-card__content > span, .home-screen .room-card--active .room-card__footer { color: rgba(24, 22, 38, 0.57); }
.home-screen .room-card--active .room-card__icon { color: #232033; background: rgba(0, 0, 0, 0.08); }
.home-screen .room-card--featured { grid-column: span 2; }
.home-screen .room-card--unavailable { opacity: 0.48; }
.room-card__open { position: absolute; inset: 0; z-index: 1; border: 0; background: transparent; cursor: pointer; }
.room-card__open > span { display: none; }
.home-screen .room-card__top, .home-screen .room-card__content, .home-screen .room-card__footer { pointer-events: none; }
.home-screen .room-card__top { position: relative; z-index: 2; }
.home-screen .room-card__icon { width: 39px; height: 39px; border-radius: 13px; color: #f2ebd5; background: rgba(255, 255, 255, 0.08); }
.room-card__power { width: 36px; height: 36px; display: inline-grid; place-items: center; pointer-events: auto; position: relative; z-index: 3; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 50%; color: inherit; background: rgba(255, 255, 255, 0.075); cursor: pointer; }
.room-card--active .room-card__power { border-color: rgba(0, 0, 0, 0.08); background: rgba(0, 0, 0, 0.09); }
.home-screen .room-card__arrow { width: 30px; height: 30px; pointer-events: none; }
.home-screen .room-card__content { margin-top: 20px; }
.home-screen .room-card__content strong { font-size: 16px; font-weight: 650; }
.home-screen .room-card__content > span { display: block; margin-top: 4px; color: rgba(255, 255, 255, 0.48); font-size: 10px; }
.home-screen .room-card__footer { min-height: 17px; margin-top: 13px; padding-top: 11px; }
.light-pips { display: flex; align-items: center; gap: 4px; }
.light-pip { width: 5px; height: 5px; border-radius: 50%; background: rgba(255, 255, 255, 0.18); }
.light-pip--active { background: currentColor; box-shadow: 0 0 8px currentColor; }
.room-card--active .light-pip { background: rgba(0, 0, 0, 0.14); }
.room-card--active .light-pip--active { background: #242033; box-shadow: none; }

.density-compact .room-card { min-height: 136px; }
.density-compact .room-card__content { margin-top: 13px; }
.density-compact .room-card__footer { margin-top: 8px; }

.scene-section { margin-top: 21px; scroll-margin-top: 20px; }
.home-shortcuts { margin-top: 21px; scroll-margin-top: 20px; }
.home-shortcuts__grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.scene-strip { display: flex; gap: 9px; overflow-x: auto; padding-bottom: 4px; scrollbar-width: none; }
.scene-strip::-webkit-scrollbar { display: none; }
.scene-strip button { flex: 0 0 auto; min-height: 45px; display: inline-flex; align-items: center; gap: 8px; padding: 0 14px; border: 1px solid rgba(255, 255, 255, 0.09); border-radius: 15px; color: #ddd9e8; background: rgba(255, 255, 255, 0.055); cursor: pointer; }
.scene-strip button:hover { background: rgba(255, 255, 255, 0.1); }

.navigation-dock {
  position: fixed;
  z-index: 20;
  left: 50%;
  bottom: 18px;
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 6px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  box-shadow: 0 18px 55px rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(24px) saturate(1.3);
  transform: translateX(-50%);
}
.navigation-dock button { min-height: 43px; display: inline-flex; align-items: center; gap: 7px; padding: 0 13px; border: 0; border-radius: 999px; color: rgba(255, 255, 255, 0.72); background: transparent; cursor: pointer; }
.navigation-dock button:hover { color: #fff; }
.navigation-dock .navigation-dock__active { color: #1d1a17; background: rgba(255, 255, 255, 0.92); }
.navigation-dock span { font-size: 10px; font-weight: 680; }

.editor-toggle-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.editor-toggle-grid label { min-height: 49px; display: flex; align-items: center; gap: 10px; padding: 0 13px; border: 1px solid rgba(255, 255, 255, 0.07); border-radius: 13px; color: #cbd2ce; background: rgba(255, 255, 255, 0.025); font-size: 12px; cursor: pointer; }
.editor-toggle-grid input { width: 17px; height: 17px; accent-color: #d8ff70; }
.editor-select-label { display: flex; align-items: center; justify-content: space-between; gap: 18px; margin-top: 16px; color: #aab3ae; font-size: 12px; }
.editor-select-label select { min-width: 220px; padding: 9px 12px; border: 1px solid rgba(255, 255, 255, 0.09); border-radius: 11px; color: #e4e9e6; background: #171b18; }

@media (max-width: 1050px) {
  .home-screen .room-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .priority-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}

@media (max-width: 760px) {
  .home-screen { padding: 0 16px 105px; }
  .context-header { min-height: 90px; }
  .context-header__clock > strong { font-size: 39px; }
  .context-header__right { gap: 6px; }
  .presence-stack { display: none; }
  .weather-chip { min-height: 39px; padding: 0 11px; }
  .round-action { width: 39px; height: 39px; }
  .home-status { align-items: flex-start; flex-direction: column; padding-top: 8px; }
  .home-status h1 { font-size: 28px; }
  .priority-grid { grid-template-columns: 1fr 1fr; }
  .widget-card { min-height: 124px; }
  .widget-card:last-child:nth-child(odd) { grid-column: span 2; }
  .home-screen .room-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .home-screen .room-card, .density-compact .room-card { min-height: 151px; }
  .home-screen .room-card--featured { grid-column: span 2; }
  .navigation-dock { width: calc(100% - 24px); justify-content: space-around; bottom: 10px; }
  .navigation-dock button { min-width: 48px; justify-content: center; padding: 0 10px; }
  .navigation-dock span { display: none; }
}

@media (max-width: 430px) {
  .context-header__clock > span { max-width: 145px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .weather-chip svg { display: none; }
  .context-header__right .round-action:first-of-type { display: none; }
  .global-actions { width: 100%; }
  .global-actions button { flex: 1; justify-content: center; padding: 0 8px; font-size: 10px; }
  .priority-grid { grid-template-columns: 1fr; }
  .widget-card:last-child:nth-child(odd) { grid-column: auto; }
  .home-screen .room-card { padding: 13px; }
  .home-screen .room-card__content strong { font-size: 14px; }
  .editor-toggle-grid { grid-template-columns: 1fr; }
  .editor-select-label { align-items: stretch; flex-direction: column; }
  .editor-select-label select { min-width: 0; width: 100%; }
}

@media (min-width: 1000px) and (max-height: 620px) {
  .home-screen { padding-bottom: 24px; }
  .context-header { min-height: 75px; padding: 8px 0; }
  .context-header__clock > strong { font-size: 34px; }
  .home-status { padding: 6px 0 14px; }
  .home-status p, .home-status .eyebrow { display: none; }
  .home-status h1 { font-size: 22px; }
  .priority-grid { float: right; width: 39%; grid-template-columns: 1fr; margin-left: 12px; }
  .widget-card { min-height: 99px; }
  .widget-card strong { margin-top: 14px; font-size: 18px; }
  .operational-section { width: calc(61% - 12px); }
  .home-screen .room-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .home-screen .room-card, .density-compact .room-card { min-height: 111px; }
  .home-screen .room-card__content { margin-top: 9px; }
  .home-screen .room-card__footer { display: none; }
}

/* HomeDeck 0.2.3 — shared adaptive backgrounds */
.app-shell {
  --ambient-1: #263d68;
  --ambient-2: #111b38;
  --ambient-3: #536b9b;
  --ambient-4: #090f20;
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  isolation: isolate;
  background: var(--ambient-4);
  transition: background 1200ms ease;
}
.app-shell > .screen { position: relative; z-index: 1; }
.ambient-background { position: fixed; z-index: 0; inset: 0; overflow: hidden; background: var(--ambient-4); transition: background 1200ms ease; pointer-events: none; }
.ambient-background::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 14% 12%, var(--ambient-1) 0, transparent 58%),
    radial-gradient(circle at 88% 86%, var(--ambient-2) 0, transparent 56%),
    radial-gradient(circle at 62% 48%, var(--ambient-3) 0, transparent 45%),
    var(--ambient-4);
  transition: background 1200ms ease;
}
.ambient-background i { position: absolute; display: block; border-radius: 50%; filter: blur(74px); opacity: 0.75; transition: background 1200ms ease; }
.ambient-background i:nth-child(1) { width: 70%; height: 70%; left: -18%; top: -14%; background: var(--ambient-1); }
.ambient-background i:nth-child(2) { width: 62%; height: 62%; right: -16%; bottom: -16%; background: var(--ambient-2); }
.ambient-background i:nth-child(3) { width: 46%; height: 46%; left: 36%; top: 29%; background: var(--ambient-3); }
.ambient-still .ambient-background i { display: none; }
.ambient-animated .ambient-background i:nth-child(1) { animation: ambient-drift-a 20s ease-in-out infinite alternate; }
.ambient-animated .ambient-background i:nth-child(2) { animation: ambient-drift-b 25s ease-in-out infinite alternate; }
.ambient-animated .ambient-background i:nth-child(3) { animation: ambient-drift-c 29s ease-in-out infinite alternate; }
@keyframes ambient-drift-a { to { transform: translate(13%, 9%) scale(1.13); } }
@keyframes ambient-drift-b { to { transform: translate(-11%, -8%) scale(1.16); } }
@keyframes ambient-drift-c { to { transform: translate(8%, -12%) scale(1.12); } }

.home-screen, .theme-minimal .home-screen, .theme-dark .home-screen { background: transparent; }
.room-screen { min-height: 100vh; padding: 0 clamp(18px, 3.4vw, 54px) 96px; background: transparent; }
.editor-screen { background: transparent; }

/* Room workspace follows the same operational grammar as Home */
.room-workspace {
  display: grid;
  grid-template-columns: minmax(210px, 24%) minmax(0, 1fr);
  gap: clamp(16px, 2vw, 28px);
  min-height: calc(100vh - 150px);
  padding-top: 15px;
}
.room-selector { min-width: 0; }
.room-selector__home {
  min-height: 42px;
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 10px;
  padding: 0 13px;
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 14px;
  color: rgba(255, 255, 255, 0.68);
  background: rgba(255, 255, 255, 0.045);
  cursor: pointer;
}
.room-selector__list { display: flex; flex-direction: column; gap: 6px; max-height: calc(100vh - 220px); overflow-y: auto; padding-right: 3px; scrollbar-width: none; }
.room-selector__list::-webkit-scrollbar { display: none; }
.room-selector__list > button {
  min-height: 56px;
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 7px 10px;
  border: 1px solid transparent;
  border-radius: 17px;
  color: rgba(255, 255, 255, 0.62);
  text-align: left;
  background: rgba(255, 255, 255, 0.035);
  cursor: pointer;
  transition: background 180ms ease, color 180ms ease, border-color 180ms ease;
}
.room-selector__list > button:hover { color: #fff; background: rgba(255, 255, 255, 0.08); }
.room-selector__list > button[aria-selected="true"] { color: #201b2b; background: rgba(255, 249, 232, 0.94); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.14); }
.room-selector__icon { flex: 0 0 auto; width: 38px; height: 38px; display: inline-grid; place-items: center; border-radius: 50%; background: rgba(255, 255, 255, 0.09); }
.room-selector__list > button[aria-selected="true"] .room-selector__icon { background: rgba(0, 0, 0, 0.08); }
.room-selector__list > button > span:nth-child(2) { min-width: 0; flex: 1; overflow: hidden; font-size: 12px; font-weight: 620; text-overflow: ellipsis; white-space: nowrap; }
.room-selector__list > button i { min-width: 23px; padding: 3px 7px; border-radius: 99px; color: #2a2110; background: #f3c66f; font-size: 10px; font-style: normal; font-weight: 760; text-align: center; }

.room-pane { min-width: 0; }
.room-operational-header { display: flex; align-items: flex-end; justify-content: space-between; gap: 22px; padding: 0 3px 20px; }
.room-operational-header .eyebrow { margin-bottom: 5px; color: rgba(255, 255, 255, 0.58); }
.room-operational-header h1 { font-size: clamp(35px, 4.4vw, 60px); font-weight: 430; letter-spacing: -0.055em; line-height: 1; }
.room-operational-header p { margin-top: 7px; color: rgba(255, 255, 255, 0.48); font-size: 11px; }
.room-actions { display: flex; gap: 8px; }
.room-actions button {
  min-height: 41px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 15px;
  border: 1px solid rgba(255, 255, 255, 0.11);
  border-radius: 99px;
  color: #ece9f3;
  background: rgba(255, 255, 255, 0.09);
  cursor: pointer;
}
.room-actions .room-actions__primary { color: #201b2b; background: rgba(255, 249, 232, 0.94); }
.room-actions button:disabled { opacity: 0.45; cursor: default; }

.device-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.device-tile {
  position: relative;
  min-height: 166px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 22px;
  color: #f4f1f8;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.045));
  backdrop-filter: blur(20px);
  transition: color 240ms ease, background 240ms ease, border-color 240ms ease;
}
.device-tile--active { color: #292216; border-color: transparent; background: rgba(255, 248, 232, 0.94); }
.device-tile--unavailable { opacity: 0.44; }
.device-tile__busy { position: absolute; z-index: 4; inset: 0; border-radius: inherit; box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.75); animation: pulse 1s ease-in-out infinite; pointer-events: none; }
.device-tile__top { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
.device-tile__icon { width: 45px; height: 45px; display: inline-grid; place-items: center; border-radius: 50%; background: rgba(255, 255, 255, 0.12); }
.device-tile--active .device-tile__icon { background: rgba(223, 139, 61, 0.25); }
.device-tile__power { width: 43px; height: 43px; display: inline-grid; place-items: center; border: 0; border-radius: 50%; color: inherit; background: rgba(255, 255, 255, 0.12); cursor: pointer; }
.device-tile--active .device-tile__power { background: rgba(43, 36, 24, 0.1); }
.device-tile__power:disabled { cursor: default; }
.device-tile__copy { min-width: 0; }
.device-tile__copy strong, .device-tile__copy span { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.device-tile__copy strong { font-size: 15px; font-weight: 650; }
.device-tile__copy span { margin-top: 4px; color: rgba(255, 255, 255, 0.53); font-size: 10px; text-transform: capitalize; }
.device-tile--active .device-tile__copy span { color: rgba(43, 36, 24, 0.6); }
.device-dimmer { display: block; }
.device-dimmer input { width: 100%; height: 25px; margin: 0; accent-color: #dd8b3c; cursor: ew-resize; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
.device-controls { display: grid; grid-template-columns: repeat(3, 1fr); gap: 7px; }
.device-controls button { min-height: 38px; display: grid; place-items: center; border: 0; border-radius: 99px; color: inherit; background: rgba(255, 255, 255, 0.12); cursor: pointer; }
.device-tile--active .device-controls button { background: rgba(43, 36, 24, 0.09); }
.rotate-up, .rotate-down { display: inline-flex; }
.rotate-up { transform: rotate(-90deg); }
.rotate-down { transform: rotate(90deg); }
.climate-quick-control { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.climate-quick-control > span { font-size: 26px; font-weight: 430; letter-spacing: -0.04em; }
.climate-quick-control > div { display: flex; gap: 6px; }
.climate-quick-control button { width: 38px; height: 38px; border: 0; border-radius: 50%; color: inherit; background: rgba(255, 255, 255, 0.12); font-size: 22px; cursor: pointer; }
.device-tile--active .climate-quick-control button { background: rgba(43, 36, 24, 0.09); }

.room-mobile-dock { display: none; }

/* Background selector */
.editor-section__description { margin: -3px 0 16px; color: #7f8a84; font-size: 12px; line-height: 1.55; }
.background-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.background-option { position: relative; min-height: 104px; padding: 9px; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 17px; color: #d9dfdb; text-align: left; background: rgba(255, 255, 255, 0.025); cursor: pointer; }
.background-option > i { display: block; height: 58px; margin-bottom: 9px; border-radius: 10px; }
.background-option > span { display: block; font-size: 11px; font-weight: 650; }
.background-option > small { position: absolute; right: 15px; bottom: 11px; color: #8c9790; font-size: 8px; text-transform: uppercase; }
.background-option--selected { border-color: rgba(216, 255, 112, 0.42); box-shadow: inset 0 0 0 1px rgba(216, 255, 112, 0.08); }
.editor-toggle-grid--background { margin-top: 11px; }

@media (max-width: 980px) {
  .room-workspace { grid-template-columns: minmax(180px, 26%) minmax(0, 1fr); }
  .device-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .home-shortcuts__grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}

@media (max-width: 720px) {
  .room-screen { padding: 0 16px 98px; }
  .room-screen .context-header { min-height: 84px; }
  .room-workspace { display: block; min-height: 0; padding-top: 8px; }
  .room-selector__home { display: none; }
  .room-selector__list { max-height: none; flex-direction: row; overflow-x: auto; padding: 0 0 12px; }
  .room-selector__list > button { flex: 0 0 auto; min-height: 48px; padding: 5px 10px; }
  .room-selector__list > button > span:nth-child(2) { max-width: 112px; }
  .room-selector__icon { width: 34px; height: 34px; }
  .room-operational-header { align-items: flex-start; flex-direction: column; padding-top: 14px; }
  .room-operational-header h1 { font-size: 42px; }
  .room-actions { width: 100%; }
  .room-actions button { flex: 1; justify-content: center; }
  .device-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
  .home-shortcuts__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .device-tile { min-height: 157px; padding: 14px; border-radius: 19px; }
  .room-mobile-dock { position: fixed; z-index: 20; left: 50%; bottom: 10px; display: flex; gap: 4px; padding: 6px; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 20px; background: rgba(22, 21, 35, 0.84); backdrop-filter: blur(24px); transform: translateX(-50%); }
  .room-mobile-dock button { min-height: 42px; display: inline-flex; align-items: center; gap: 7px; padding: 0 15px; border: 0; border-radius: 15px; color: #8e8999; background: transparent; }
  .room-mobile-dock .room-mobile-dock__active { color: #1f1b2b; background: #f4edd9; }
  .room-mobile-dock span { font-size: 10px; font-weight: 650; }
  .background-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 430px) {
  .device-grid { grid-template-columns: 1fr 1fr; }
  .device-tile { min-height: 148px; gap: 12px; }
  .device-tile__icon, .device-tile__power { width: 39px; height: 39px; }
  .device-tile__copy strong { font-size: 13px; }
  .device-controls button { min-height: 34px; }
}

@media (min-width: 1000px) and (max-height: 620px) {
  .room-screen { padding-bottom: 18px; }
  .room-screen .context-header { min-height: 68px; }
  .room-workspace { min-height: calc(100vh - 85px); padding-top: 4px; }
  .room-selector__home { min-height: 34px; margin-bottom: 5px; }
  .room-selector__list { max-height: calc(100vh - 130px); display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .room-selector__list > button { min-height: 48px; }
  .room-selector__icon { display: none; }
  .room-operational-header { padding-bottom: 10px; }
  .room-operational-header h1 { font-size: 34px; }
  .room-operational-header p { display: none; }
  .device-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 9px; }
  .device-tile { min-height: 128px; gap: 10px; padding: 13px; }
  .device-tile__icon, .device-tile__power { width: 37px; height: 37px; }
}

/* HomeDeck 0.2.6 — reference light sheet, Home shortcuts and configurable priority cards */
.weather-chip { border: 1px solid rgba(255, 255, 255, 0.1); cursor: pointer; }
.weather-chip:hover { background: rgba(255, 255, 255, 0.13); }
.weather-modal, .entity-modal { position: fixed; z-index: 100; inset: 0; display: grid; place-items: center; padding: 20px; background: rgba(0, 0, 0, 0.48); backdrop-filter: blur(20px) saturate(0.82); animation: modal-fade 180ms ease; }
.weather-modal__panel, .entity-modal__panel { width: min(660px, 100%); max-height: min(820px, calc(100vh - 40px)); overflow-y: auto; border: 1px solid rgba(255, 255, 255, 0.11); border-radius: 30px; color: #f7f2f8; background: radial-gradient(circle at 18% 0%, rgba(255, 255, 255, 0.07), transparent 35%), rgba(5, 7, 10, 0.88); box-shadow: 0 35px 110px rgba(0, 0, 0, 0.72), inset 0 1px 0 rgba(255, 255, 255, 0.045); backdrop-filter: blur(34px) saturate(1.15); animation: modal-rise 220ms ease; }
.weather-modal__panel { padding: clamp(22px, 4vw, 38px); }
.weather-modal__panel > header, .entity-modal__header { display: flex; align-items: center; gap: 14px; }
.weather-modal__panel > header > div, .entity-modal__header > div { min-width: 0; flex: 1; }
.weather-modal__panel > header span, .entity-modal__header > div > span { color: rgba(255, 255, 255, 0.48); font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; }
.weather-modal__panel h2, .entity-modal__header h2 { margin: 4px 0 0; font-size: 24px; font-weight: 560; letter-spacing: -0.035em; }
.weather-modal__panel > header > button, .entity-modal__header > button { width: 41px; height: 41px; display: grid; place-items: center; border: 0; border-radius: 50%; color: inherit; background: rgba(255, 255, 255, 0.09); cursor: pointer; }
.weather-modal__now { display: flex; align-items: center; gap: 17px; margin: 30px 0 22px; }
.weather-modal__now > strong { font-size: clamp(50px, 9vw, 76px); font-weight: 330; letter-spacing: -0.07em; }
.weather-modal__now > span { display: flex; flex-direction: column; gap: 4px; text-transform: capitalize; }
.weather-modal__now small { color: rgba(255, 255, 255, 0.5); }
.weather-modal__stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin-bottom: 22px; }
.weather-modal__stats > span { min-height: 66px; display: flex; flex-direction: column; justify-content: center; gap: 5px; padding: 12px; border-radius: 16px; background: rgba(255, 255, 255, 0.06); }
.weather-modal__stats small { color: rgba(255, 255, 255, 0.46); font-size: 9px; text-transform: uppercase; }
.weather-modal__stats b { font-size: 13px; }
.forecast-strip { display: grid; grid-auto-columns: minmax(75px, 1fr); grid-auto-flow: column; gap: 8px; overflow-x: auto; padding-bottom: 6px; scrollbar-width: thin; }
.forecast-strip article { min-height: 128px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 7px; padding: 10px 7px; border: 1px solid rgba(255, 255, 255, 0.07); border-radius: 17px; background: rgba(255, 255, 255, 0.04); }
.forecast-strip article > span { color: rgba(255, 255, 255, 0.58); font-size: 10px; text-transform: capitalize; }
.forecast-strip article > strong { font-size: 17px; }
.forecast-strip article > small { color: rgba(255, 255, 255, 0.5); }
.forecast-strip article > i { color: #8bc9ff; font-size: 9px; font-style: normal; }
.weather-modal__empty { padding: 25px; border-radius: 17px; color: rgba(255, 255, 255, 0.52); text-align: center; background: rgba(255, 255, 255, 0.04); }

.device-tile__more { width: 34px; height: 34px; display: grid; place-items: center; margin-left: auto; border: 0; border-radius: 50%; color: inherit; background: transparent; letter-spacing: 2px; cursor: pointer; }
.device-tile__more:hover { background: rgba(255, 255, 255, 0.12); }
.widget-card--interactive { cursor: pointer; }
.entity-modal__panel { width: min(590px, 100%); }
.entity-modal__header { padding: 24px 25px 18px; }
.entity-modal__icon { width: 52px; height: 52px; display: grid; place-items: center; flex: 0 0 auto; border-radius: 18px; color: #f3c66f; background: rgba(243, 198, 111, 0.12); }
.entity-modal__status { display: grid; grid-template-columns: 1fr auto; gap: 4px 14px; padding: 17px 25px; border-top: 1px solid rgba(255, 255, 255, 0.07); border-bottom: 1px solid rgba(255, 255, 255, 0.07); }
.entity-modal__status span, .entity-modal__status small { color: rgba(255, 255, 255, 0.45); font-size: 10px; }
.entity-modal__status strong { grid-row: 1 / span 2; grid-column: 2; align-self: center; font-size: 18px; text-transform: capitalize; }
.entity-modal__section { padding: 24px 25px; border-bottom: 1px solid rgba(255, 255, 255, 0.07); background: rgba(255, 255, 255, 0.012); }
.entity-modal__power-row { display: flex; align-items: center; gap: 15px; }
.entity-modal__power-row > div { display: flex; flex-direction: column; gap: 4px; }
.entity-modal__power-row span { color: rgba(255, 255, 255, 0.46); font-size: 11px; }
.entity-modal__main-power { width: 63px; height: 63px; display: grid; place-items: center; border: 0; border-radius: 50%; color: #fff; background: rgba(255, 255, 255, 0.09); cursor: pointer; }
.entity-modal__main-power--active { color: #2b2418; background: #f4c96f; box-shadow: 0 8px 35px rgba(244, 201, 111, 0.23); }
.entity-modal__range { display: block; margin-top: 22px; }
.entity-modal__range > span { display: flex; justify-content: space-between; font-size: 11px; }
.entity-modal__range i { color: rgba(255, 255, 255, 0.52); font-style: normal; }
.entity-modal__range input { width: 100%; margin-top: 12px; accent-color: #f4c96f; }
.light-color-controls { display: grid; gap: 18px; margin-top: 20px; padding-top: 19px; border-top: 1px solid rgba(255, 255, 255, 0.065); }
.light-color-picker { display: flex; align-items: center; justify-content: space-between; gap: 18px; }
.light-color-picker > span { display: flex; flex-direction: column; gap: 4px; }
.light-color-picker b { font-size: 11px; }
.light-color-picker small { color: rgba(255, 255, 255, 0.42); font-size: 9px; }
.light-color-picker input { width: 70px; height: 44px; padding: 4px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 14px; background: rgba(255, 255, 255, 0.055); cursor: pointer; }
.entity-modal__select { display: flex; align-items: center; justify-content: space-between; gap: 18px; margin-top: 17px; color: rgba(255, 255, 255, 0.68); font-size: 11px; }
.entity-modal__select select { min-width: 170px; padding: 9px 11px; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 11px; color: #f6f3f8; background: #111318; }
.climate-modal-control__temperatures { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.climate-modal-control__temperatures > span { display: flex; flex-direction: column; gap: 5px; padding: 15px; border-radius: 16px; background: rgba(255, 255, 255, 0.055); }
.climate-modal-control__temperatures small { color: rgba(255, 255, 255, 0.45); }
.climate-modal-control__temperatures strong { font-size: 27px; font-weight: 430; }
.climate-modal-control__step { display: flex; align-items: center; justify-content: space-between; margin: 18px 0; }
.climate-modal-control__step button { width: 45px; height: 45px; border: 0; border-radius: 50%; color: inherit; background: rgba(255, 255, 255, 0.09); font-size: 24px; cursor: pointer; }
.climate-modal-control__modes { display: flex; flex-wrap: wrap; gap: 7px; }
.climate-modal-control__modes button { padding: 8px 12px; border: 1px solid rgba(255, 255, 255, 0.09); border-radius: 99px; color: inherit; background: transparent; cursor: pointer; text-transform: capitalize; }
.climate-modal-control__modes button[aria-pressed="true"] { color: #272013; background: #f4c96f; }
.entity-modal__triple { display: grid; grid-template-columns: repeat(3, 1fr); gap: 9px; }
.entity-modal__triple button { min-height: 65px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; border: 0; border-radius: 17px; color: inherit; background: rgba(255, 255, 255, 0.075); cursor: pointer; }
.entity-modal__wide-action { width: 100%; min-height: 52px; display: flex; align-items: center; justify-content: center; gap: 9px; border: 0; border-radius: 17px; color: inherit; background: rgba(255, 255, 255, 0.08); cursor: pointer; }
.entity-modal__wide-action--active { color: #292216; background: #f4c96f; }
.media-modal-copy { display: flex; flex-direction: column; gap: 5px; margin-bottom: 17px; }
.media-modal-copy span { color: rgba(255, 255, 255, 0.46); font-size: 11px; }
.entity-modal__footer { display: flex; align-items: center; justify-content: space-between; gap: 15px; padding: 18px 25px 23px; }
.entity-modal__footer code { overflow: hidden; color: rgba(255, 255, 255, 0.34); font-size: 9px; text-overflow: ellipsis; }
.entity-modal__footer > div { display: flex; align-items: center; gap: 7px; }
.entity-modal__footer button { min-height: 37px; display: inline-flex; align-items: center; gap: 7px; padding: 9px 15px; border: 0; border-radius: 99px; color: #282115; background: #f4c96f; cursor: pointer; white-space: nowrap; }
.entity-modal__footer .entity-modal__hide { color: rgba(255, 255, 255, 0.62); background: rgba(255, 255, 255, 0.065); }
.entity-modal__footer .entity-modal__hide:hover { color: #fff; background: rgba(255, 255, 255, 0.11); }

/* Reference light sheet: tall brightness control and fixed swatches */
.light-sheet__panel { width: min(64%, 420px); height: min(80vh, 720px); display: grid; grid-template-rows: auto minmax(0, 1fr) auto; gap: 20px; justify-items: center; padding: clamp(24px, 4vw, 38px); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 42px; color: #fff; background: rgba(30, 26, 24, 0.62); box-shadow: 0 28px 85px rgba(0, 0, 0, 0.48); backdrop-filter: blur(24px) saturate(1.3); animation: modal-rise 220ms ease; }
.light-sheet__panel > header { text-align: center; }
.light-sheet__panel > header h2 { margin: 0; font-size: clamp(24px, 3.2vw, 34px); font-weight: 500; letter-spacing: -0.035em; }
.light-sheet__panel > header p { margin-top: 5px; color: rgba(255, 255, 255, 0.72); font-size: 14px; }
.light-sheet__control { min-height: 0; display: grid; place-items: center; width: 100%; }
.light-sheet__slider { position: relative; width: 112px; height: 100%; min-height: 210px; max-height: 390px; overflow: hidden; border-radius: 40px; background: rgba(255, 255, 255, 0.18); cursor: ns-resize; }
.light-sheet__fill { position: absolute; right: 0; bottom: 0; left: 0; border-radius: inherit; transition: height 160ms ease, background 180ms ease; }
.light-sheet__bulb { position: absolute; z-index: 2; left: 50%; bottom: 23px; display: grid; place-items: center; color: #2a2110; transform: translateX(-50%); pointer-events: none; }
.light-sheet__slider input { position: absolute; z-index: 3; inset: 0; width: 100%; height: 100%; margin: 0; opacity: 0; cursor: ns-resize; writing-mode: vertical-lr; direction: rtl; }
.light-sheet__simple { width: 112px; height: 112px; display: grid; place-items: center; border-radius: 50%; background: rgba(255, 255, 255, 0.15); }
.light-sheet__simple--on { color: #2a2110; background: #ffc94d; }
.light-sheet__footer { width: 100%; display: grid; gap: 17px; justify-items: center; }
.light-sheet__swatches { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; }
.light-sheet__swatches button { width: 34px; height: 34px; padding: 0; border: 2px solid transparent; border-radius: 50%; cursor: pointer; }
.light-sheet__swatches button[aria-pressed="true"] { border-color: #fff; box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.4) inset; }
.light-sheet__actions { display: flex; justify-content: center; gap: 9px; }
.light-sheet__actions button { min-height: 42px; padding: 0 20px; border: 0; border-radius: 999px; color: #fff; background: rgba(255, 255, 255, 0.18); cursor: pointer; }
.light-sheet__actions .light-sheet__done { color: #1d1a17; background: rgba(255, 255, 255, 0.92); }
.light-sheet__hide { display: inline-flex; align-items: center; gap: 6px; padding: 6px 10px; border: 0; color: rgba(255, 255, 255, 0.5); background: transparent; font-size: 10px; cursor: pointer; }

.collection-screen { min-height: 100vh; padding: 0 clamp(18px, 3.4vw, 54px) 115px; background: transparent; }
.collection-header { display: flex; align-items: center; gap: 18px; padding: clamp(28px, 5vw, 62px) 0 28px; }
.collection-header h1 { margin: 2px 0 4px; font-size: clamp(34px, 5vw, 56px); font-weight: 430; letter-spacing: -0.055em; }
.collection-header p { color: rgba(255, 255, 255, 0.48); font-size: 11px; }
.collection-grid { max-width: 1180px; }
.navigation-dock { max-width: calc(100vw - 24px); overflow-x: auto; justify-content: flex-start; scrollbar-width: none; }
.navigation-dock::-webkit-scrollbar { display: none; }
.navigation-dock button { flex: 0 0 auto; }

.settings-screen { width: min(1260px, 100%); max-width: none; margin: 0 auto; padding-bottom: 90px; }
.settings-topbar { position: sticky; z-index: 20; top: 12px; height: 64px; margin-top: 12px; padding: 0 18px; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 20px; background: rgba(255, 255, 255, 0.14); box-shadow: 0 16px 45px rgba(0, 0, 0, 0.16); backdrop-filter: blur(24px) saturate(1.3); }
.settings-save { margin: 0; padding: 9px 15px; color: #1d1a17; background: rgba(255, 255, 255, 0.92); }
.settings-intro { padding: clamp(32px, 5vw, 62px) 0 30px; }
.settings-intro h1 { margin-top: 6px; font-size: clamp(39px, 5vw, 62px); font-weight: 430; letter-spacing: -0.055em; }
.settings-intro p { max-width: 620px; margin-top: 10px; color: rgba(255, 255, 255, 0.47); font-size: 13px; line-height: 1.6; }
.settings-workspace { display: grid; grid-template-columns: 210px minmax(0, 1fr); gap: clamp(16px, 3vw, 38px); align-items: start; }
.settings-nav { position: sticky; top: 98px; display: flex; flex-direction: column; gap: 5px; padding: 7px; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 20px; background: rgba(255, 255, 255, 0.035); backdrop-filter: blur(18px); }
.settings-nav button { min-height: 48px; display: flex; align-items: center; gap: 11px; padding: 0 13px; border: 0; border-radius: 14px; color: rgba(255, 255, 255, 0.5); text-align: left; background: transparent; cursor: pointer; }
.settings-nav button:hover { color: #fff; }
.settings-nav .settings-nav__active { color: #282115; background: #f4edd9; }
.settings-content { min-width: 0; display: flex; flex-direction: column; gap: 13px; }
.settings-panel { padding: clamp(18px, 3vw, 27px); border: 1px solid rgba(255, 255, 255, 0.09); border-radius: 24px; background: linear-gradient(145deg, rgba(255, 255, 255, 0.075), rgba(255, 255, 255, 0.025)); backdrop-filter: blur(18px); }
.settings-panel__heading { display: flex; justify-content: space-between; gap: 15px; margin-bottom: 20px; }
.settings-panel__heading span { font-size: 16px; font-weight: 620; }
.settings-panel__heading p { max-width: 650px; margin-top: 6px; color: rgba(255, 255, 255, 0.42); font-size: 11px; line-height: 1.5; }
.settings-panel__heading > i { min-width: 28px; height: 28px; display: grid; place-items: center; border-radius: 9px; color: #d8ff70; background: rgba(216, 255, 112, 0.08); font-size: 11px; font-style: normal; }
.settings-toggle-list { display: flex; flex-direction: column; gap: 7px; }
.settings-subheading { display: flex; align-items: center; justify-content: space-between; margin: 22px 0 9px; padding-top: 18px; border-top: 1px solid rgba(255, 255, 255, 0.07); font-size: 11px; font-weight: 620; }
.settings-subheading small { min-width: 25px; padding: 4px 7px; border-radius: 99px; color: #1d1a17; background: rgba(255, 255, 255, 0.9); text-align: center; }
.featured-entity-list { max-height: 320px; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; overflow-y: auto; padding-right: 3px; }
.settings-toggle-list--split, .visibility-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 7px; margin-top: 12px; }
.settings-toggle { min-height: 50px; display: flex; align-items: center; justify-content: space-between; gap: 15px; padding: 0 14px; border: 1px solid rgba(255, 255, 255, 0.07); border-radius: 14px; background: rgba(255, 255, 255, 0.025); font-size: 12px; cursor: pointer; }
.settings-toggle input, .entity-visibility-list input { width: 18px; height: 18px; accent-color: #d8ff70; }
.editor-select-label--top { margin: 0 0 15px; }
.entity-visibility-list { overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.07); border-radius: 16px; }
.entity-visibility-list > header, .entity-visibility-list > div { min-height: 54px; display: grid; grid-template-columns: minmax(0, 1fr) 100px 100px; align-items: center; gap: 8px; padding: 8px 14px; border-bottom: 1px solid rgba(255, 255, 255, 0.06); }
.entity-visibility-list > header { min-height: 38px; color: rgba(255, 255, 255, 0.4); font-size: 9px; text-transform: uppercase; }
.entity-visibility-list > header span:not(:first-child), .entity-visibility-list input { justify-self: center; }
.entity-visibility-list > div:last-child { border-bottom: 0; }
.entity-visibility-list > div > span { min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.entity-visibility-list strong { overflow: hidden; font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
.entity-visibility-list small { color: rgba(255, 255, 255, 0.4); font-size: 9px; }
.page-add-actions { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.page-add-actions button { min-height: 49px; display: flex; align-items: center; justify-content: center; gap: 8px; border: 1px solid rgba(255, 255, 255, 0.09); border-radius: 14px; color: inherit; background: rgba(255, 255, 255, 0.035); cursor: pointer; }
.page-builder { display: grid; grid-template-columns: 190px minmax(0, 1fr); gap: 13px; margin-top: 17px; }
.page-builder > aside { display: flex; flex-direction: column; gap: 5px; }
.page-builder > aside button { min-height: 45px; display: flex; align-items: center; gap: 9px; padding: 0 11px; border: 0; border-radius: 12px; color: rgba(255, 255, 255, 0.5); text-align: left; background: rgba(255, 255, 255, 0.035); cursor: pointer; }
.page-builder > aside button[aria-selected="true"] { color: #292216; background: #f4edd9; }
.page-builder > aside span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.page-editor { min-width: 0; padding: 16px; border-radius: 17px; background: rgba(0, 0, 0, 0.12); }
.page-editor > label { display: flex; flex-direction: column; gap: 7px; color: rgba(255, 255, 255, 0.5); font-size: 10px; }
.page-editor > label input { width: 100%; padding: 11px 12px; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 11px; color: #fff; background: rgba(255, 255, 255, 0.055); }
.page-editor__heading { display: flex; justify-content: space-between; margin: 19px 0 8px; font-size: 11px; }
.page-editor__hint { margin-bottom: 9px; color: rgba(255, 255, 255, 0.42); font-size: 10px; }
.page-entity-list { max-height: 330px; display: flex; flex-direction: column; gap: 5px; overflow-y: auto; }
.danger-button { margin-top: 16px; padding: 9px 13px; border: 1px solid rgba(255, 113, 113, 0.2); border-radius: 11px; color: #ffacac; background: rgba(255, 83, 83, 0.06); cursor: pointer; }
@keyframes modal-fade { from { opacity: 0; } }
@keyframes modal-rise { from { opacity: 0; transform: translateY(14px) scale(0.985); } }

@media (max-width: 800px) {
  .settings-workspace { display: block; }
  .settings-nav { position: sticky; z-index: 15; top: 68px; flex-direction: row; overflow-x: auto; margin-bottom: 14px; border-radius: 16px; }
  .settings-nav button { flex: 0 0 auto; }
  .page-builder { grid-template-columns: 1fr; }
  .page-builder > aside { flex-direction: row; overflow-x: auto; }
  .page-builder > aside button { flex: 0 0 auto; max-width: 180px; }
}
@media (max-width: 620px) {
  .settings-screen { padding-bottom: 50px; }
  .settings-save { font-size: 10px; }
  .settings-topbar { top: 8px; height: 58px; margin-top: 8px; padding-inline: 12px; border-radius: 17px; }
  .settings-intro { padding: 28px 0 22px; }
  .settings-toggle-list--split, .visibility-grid, .page-add-actions { grid-template-columns: 1fr; }
  .featured-entity-list { grid-template-columns: 1fr; }
  .entity-visibility-list > header, .entity-visibility-list > div { grid-template-columns: minmax(0, 1fr) 68px 68px; padding-inline: 9px; }
  .entity-visibility-list > header span:not(:first-child) { font-size: 8px; text-align: center; }
  .weather-modal, .entity-modal { align-items: end; padding: 0; }
  .weather-modal__panel, .entity-modal__panel { max-height: 92vh; border-radius: 28px 28px 0 0; }
  .weather-modal__stats { grid-template-columns: 1fr; }
  .collection-screen { padding-inline: 16px; }
  .entity-modal__footer { align-items: stretch; flex-direction: column; }
  .entity-modal__footer > div { width: 100%; }
  .entity-modal__footer > div button { flex: 1; justify-content: center; }
  .light-sheet { align-items: center; padding: 14px; }
  .light-sheet__panel { width: min(92%, 420px); height: min(84vh, 700px); border-radius: 34px; }
  .light-sheet__slider { width: 96px; min-height: 190px; }
}

/* HomeDeck 0.2.7 — explicit Home shortcuts, unified climate sheet and floating settings actions */
.settings-floating-close, .settings-floating-save { position: fixed; z-index: 45; border: 1px solid rgba(255, 255, 255, 0.2); box-shadow: 0 16px 42px rgba(0, 0, 0, 0.28); backdrop-filter: blur(24px) saturate(1.3); cursor: pointer; }
.settings-floating-close { top: 20px; right: 20px; width: 48px; height: 48px; display: grid; place-items: center; border-radius: 50%; color: #fff; background: rgba(24, 22, 24, 0.5); }
.settings-floating-save { right: 20px; bottom: 20px; min-height: 50px; padding: 0 22px; border-radius: 999px; color: #1d1a17; background: rgba(255, 255, 255, 0.94); font-weight: 700; }
.settings-floating-close:hover, .settings-floating-save:hover { transform: translateY(-1px); }
.settings-floating-close:disabled, .settings-floating-save:disabled { opacity: 0.5; cursor: default; transform: none; }
.settings-screen { padding-bottom: 110px; }
.settings-nav { top: 20px; }

.climate-sheet__panel { height: auto; min-height: min(72vh, 610px); max-height: min(86vh, 760px); overflow-y: auto; grid-template-rows: auto minmax(0, 1fr) auto; }
.climate-sheet__control { width: 100%; min-height: 0; display: flex; flex-direction: column; align-items: stretch; justify-content: center; gap: 16px; }
.climate-sheet__current { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.climate-sheet__current small, .climate-sheet__target small { color: rgba(255, 255, 255, 0.5); font-size: 10px; letter-spacing: 0.06em; text-transform: uppercase; }
.climate-sheet__current strong { font-size: 28px; font-weight: 420; }
.climate-sheet__target { display: grid; grid-template-columns: 52px minmax(0, 1fr) 52px; align-items: center; gap: 12px; padding: 18px 14px; border-radius: 25px; background: rgba(255, 255, 255, 0.09); }
.climate-sheet__target > span { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.climate-sheet__target strong { font-size: clamp(42px, 8vw, 64px); font-weight: 350; letter-spacing: -0.06em; }
.climate-sheet__target button { width: 52px; height: 52px; border: 0; border-radius: 50%; color: #fff; background: rgba(255, 255, 255, 0.14); font-size: 28px; cursor: pointer; }
.climate-sheet__target button:disabled { opacity: 0.35; }
.climate-sheet__modes { display: flex; flex-wrap: wrap; justify-content: center; gap: 7px; }
.climate-sheet__modes button { padding: 9px 13px; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 999px; color: rgba(255, 255, 255, 0.72); background: rgba(255, 255, 255, 0.05); text-transform: capitalize; cursor: pointer; }
.climate-sheet__modes button[aria-pressed="true"] { color: #1d1a17; background: rgba(255, 255, 255, 0.92); }
.climate-sheet__select { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 11px 13px; border-radius: 14px; color: rgba(255, 255, 255, 0.7); background: rgba(255, 255, 255, 0.06); font-size: 11px; }
.climate-sheet__select select { max-width: 58%; padding: 8px 10px; border: 0; border-radius: 10px; color: #fff; background: rgba(0, 0, 0, 0.32); }

@media (max-width: 800px) {
  .settings-nav { top: 14px; }
}
@media (max-width: 620px) {
  .settings-screen { padding-bottom: 105px; }
  .settings-floating-close { top: 12px; right: 12px; }
  .settings-floating-save { right: 12px; bottom: 12px; }
  .climate-sheet { align-items: center; padding: 14px; }
  .climate-sheet__panel { width: min(92%, 420px); min-height: min(78vh, 620px); border-radius: 34px; }
  .climate-sheet__target { grid-template-columns: 45px minmax(0, 1fr) 45px; gap: 8px; padding-inline: 10px; }
  .climate-sheet__target button { width: 45px; height: 45px; }
}

/* HomeDeck 0.2.8 — one accent color and unified Home card surfaces */
.app-shell, .onboarding-screen { --hd-accent: #f4edd9; --hd-accent-contrast: #201d22; }
button:focus-visible, input:focus-visible, select:focus-visible, .room-card:focus-visible { outline-color: var(--hd-accent); }
.primary-button, .step-dot--active, .loader-mark, .welcome-panel__mark { color: var(--hd-accent-contrast); background: var(--hd-accent); }
.brand__mark, .selection-card--selected > span, .selection-card--selected > i, .theme-pill--selected, .settings-panel__heading > i, .entity-modal__icon { color: var(--hd-accent); }
.selection-card--selected, .theme-pill--selected, .background-option--selected { border-color: color-mix(in srgb, var(--hd-accent) 48%, transparent); }
.theme-pill--selected, .selection-card--selected > span, .selection-card--selected > i { background: color-mix(in srgb, var(--hd-accent) 10%, transparent); }
.settings-toggle input, .entity-visibility-list input, .onboarding-toggle input, .editor-toggle-grid input { accent-color: var(--hd-accent); }
.settings-nav .settings-nav__active, .page-builder > aside button[aria-selected="true"], .navigation-dock button.navigation-dock__active, .room-selector__list > button[aria-selected="true"], .light-sheet__actions .light-sheet__done, .climate-sheet__modes button[aria-pressed="true"], .settings-floating-save { color: var(--hd-accent-contrast); background: var(--hd-accent); }
.room-selector__list > button i, .editor-room__toggle > i { color: var(--hd-accent-contrast); background: var(--hd-accent); }
.device-tile--active, .entity-card__action--active { color: var(--hd-accent-contrast); background: var(--hd-accent); }

.home-screen .widget-card,
.home-screen .room-card,
.home-screen .device-tile,
.home-screen .scene-strip button { border-color: rgba(255, 255, 255, 0.1); color: #f4f1f8; background: linear-gradient(145deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.045)); }
.home-screen .widget-card--playing, .home-screen .widget-card--alert { border-color: color-mix(in srgb, var(--hd-accent) 32%, transparent); background: linear-gradient(145deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.045)); }
.home-screen .room-card--active, .home-screen .device-tile--active { border-color: transparent; color: var(--hd-accent-contrast); background: var(--hd-accent); }
.home-screen .room-card--active .room-card__content > span, .home-screen .room-card--active .room-card__footer, .home-screen .device-tile--active .device-tile__copy span { color: color-mix(in srgb, var(--hd-accent-contrast) 62%, transparent); }
.home-screen .widget-card__icon, .home-screen .widget-card > button { color: var(--hd-accent); }
.home-screen .widget-card > button { background: color-mix(in srgb, var(--hd-accent) 14%, transparent); }

.accent-color-control { display: flex; align-items: center; justify-content: space-between; gap: 18px; margin-top: 20px; padding: 14px 16px; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; background: rgba(255, 255, 255, 0.035); }
.accent-color-control > span { display: flex; flex-direction: column; gap: 4px; }
.accent-color-control strong { font-size: 12px; }
.accent-color-control small { color: rgba(255, 255, 255, 0.45); font-size: 10px; line-height: 1.45; }
.accent-color-control input { width: 54px; height: 44px; flex: 0 0 auto; padding: 4px; border: 1px solid rgba(255, 255, 255, 0.14); border-radius: 14px; background: rgba(255, 255, 255, 0.08); cursor: pointer; }

.onboarding-screen { min-height: 100vh; height: auto; overflow-y: auto; }
.onboarding-content { min-height: calc(100vh - 82px); height: auto; padding-block: 30px 50px; }
.onboarding-content .setup-panel { margin: auto; }
.onboarding-backgrounds { margin-top: 18px; }
.onboarding-toggle-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-top: 12px; }
.onboarding-toggle { min-height: 48px; display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 0 14px; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 14px; background: rgba(255, 255, 255, 0.035); font-size: 11px; }
.onboarding-toggle input { width: 18px; height: 18px; }
.onboarding-inline-options { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin-top: 18px; }
.onboarding-inline-options label, .onboarding-select { display: flex; flex-direction: column; gap: 7px; color: rgba(255, 255, 255, 0.56); font-size: 10px; }
.onboarding-inline-options select, .onboarding-select select { width: 100%; padding: 11px 12px; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; color: #fff; background: #171519; }
.onboarding-option-columns { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; margin-top: 22px; }
.onboarding-option-columns > section { min-width: 0; display: flex; flex-direction: column; gap: 7px; padding: 18px; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 20px; background: rgba(255, 255, 255, 0.025); }
.onboarding-option-columns h3 { margin: 0 0 6px; font-size: 13px; }
.onboarding-entity-list { max-height: 310px; display: flex; flex-direction: column; gap: 6px; overflow-y: auto; }
.onboarding-pages-hint { margin-top: 16px; padding: 13px 15px; border-radius: 14px; color: rgba(255, 255, 255, 0.58); background: rgba(255, 255, 255, 0.04); font-size: 10px; }
.setup-panel--ready { max-width: 720px; text-align: center; }
.setup-panel--ready .welcome-panel__mark { margin: 0 auto 18px; }
.setup-ready-summary { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 9px; margin-top: 24px; }
.setup-ready-summary span { display: flex; flex-direction: column; gap: 5px; padding: 17px; border-radius: 17px; background: rgba(255, 255, 255, 0.05); font-size: 10px; text-transform: capitalize; }
.setup-ready-summary strong { color: var(--hd-accent); font-size: 22px; }
.setup-restart-panel { display: flex; align-items: center; justify-content: space-between; gap: 20px; }
.setup-restart-panel > div { min-width: 0; }
.setup-restart-panel strong { font-size: 13px; }
.setup-restart-panel p { margin-top: 5px; color: rgba(255, 255, 255, 0.44); font-size: 10px; }
.setup-restart-panel button { flex: 0 0 auto; min-height: 42px; padding: 0 15px; border: 1px solid color-mix(in srgb, var(--hd-accent) 28%, transparent); border-radius: 999px; color: var(--hd-accent); background: color-mix(in srgb, var(--hd-accent) 8%, transparent); cursor: pointer; }

@media (max-width: 720px) {
  .onboarding-option-columns, .onboarding-toggle-grid, .onboarding-inline-options { grid-template-columns: 1fr; }
  .onboarding-content { padding-inline: 16px; }
  .step-dots { max-width: 150px; overflow: hidden; }
  .setup-ready-summary { grid-template-columns: 1fr; }
  .setup-restart-panel { align-items: stretch; flex-direction: column; }
}

/* HomeDeck 0.2.9 — single Glass identity and panel-like guided setup */
.onboarding-screen { position: relative; isolation: isolate; transition: background 420ms ease; }
.onboarding-screen::before { content: ""; position: fixed; z-index: 0; inset: 0; background: linear-gradient(180deg, rgba(5, 7, 10, 0.22), rgba(5, 7, 10, 0.58)); pointer-events: none; }
.onboarding-topbar { position: relative; z-index: 2; background: rgba(8, 10, 14, 0.12); backdrop-filter: blur(22px); }
.onboarding-content { position: relative; z-index: 1; }
.onboarding-dashboard-welcome { width: min(760px, 100%); padding: clamp(28px, 5vw, 50px); border: 1px solid rgba(255, 255, 255, 0.11); border-radius: 34px; background: linear-gradient(145deg, rgba(255, 255, 255, 0.115), rgba(255, 255, 255, 0.035)); box-shadow: 0 36px 110px rgba(0, 0, 0, 0.27); backdrop-filter: blur(30px) saturate(1.2); }
.welcome-room-sample { width: min(440px, 100%); min-height: 92px; display: grid; grid-template-columns: 54px minmax(0, 1fr) 10px 10px; align-items: center; gap: 13px; margin-top: 28px; padding: 16px 18px; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 22px; background: rgba(255, 255, 255, 0.07); text-align: left; }
.welcome-room-sample > span { width: 54px; height: 54px; display: grid; place-items: center; border-radius: 17px; color: var(--hd-accent); background: color-mix(in srgb, var(--hd-accent) 12%, transparent); }
.welcome-room-sample > div { display: flex; flex-direction: column; gap: 5px; }
.welcome-room-sample strong { font-size: 14px; }
.welcome-room-sample small { color: rgba(255, 255, 255, 0.48); font-size: 10px; }
.welcome-room-sample > i { width: 8px; height: 8px; border-radius: 50%; background: rgba(255, 255, 255, 0.15); }
.welcome-room-sample > i.active { background: var(--hd-accent); box-shadow: 0 0 18px color-mix(in srgb, var(--hd-accent) 55%, transparent); }
.onboarding-live-demo { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 11px; margin-top: 28px; }
.onboarding-live-demo article { min-height: 124px; position: relative; display: flex; flex-direction: column; justify-content: flex-end; gap: 5px; padding: 19px; border: 1px solid rgba(255, 255, 255, 0.11); border-radius: 23px; background: linear-gradient(145deg, rgba(255, 255, 255, 0.11), rgba(255, 255, 255, 0.035)); }
.onboarding-live-demo article > svg { position: absolute; top: 18px; right: 18px; color: var(--hd-accent); }
.onboarding-live-demo article > span, .onboarding-live-demo article > small { color: rgba(255, 255, 255, 0.48); font-size: 10px; }
.onboarding-live-demo article > strong { font-size: 16px; }
.onboarding-live-demo article.active { border-color: transparent; color: var(--hd-accent-contrast); background: var(--hd-accent); }
.onboarding-live-demo article.active > span, .onboarding-live-demo article.active > small, .onboarding-live-demo article.active > svg { color: color-mix(in srgb, var(--hd-accent-contrast) 65%, transparent); }
.onboarding-color-section { display: flex; align-items: center; justify-content: space-between; gap: 18px; margin-top: 22px; padding: 17px 18px; border: 1px solid rgba(255, 255, 255, 0.09); border-radius: 19px; background: rgba(255, 255, 255, 0.045); }
.onboarding-color-section > div:first-child { display: flex; flex-direction: column; gap: 4px; }
.onboarding-color-section strong, .onboarding-background-heading strong { font-size: 12px; }
.onboarding-color-section small, .onboarding-background-heading small { color: rgba(255, 255, 255, 0.46); font-size: 10px; line-height: 1.45; }
.accent-suggestions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 8px; }
.accent-suggestions button, .accent-suggestions label { width: 32px; height: 32px; position: relative; padding: 0; border: 2px solid rgba(255, 255, 255, 0.12); border-radius: 50%; cursor: pointer; box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.12); }
.accent-suggestions button[aria-pressed="true"] { border-color: #fff; box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.11), inset 0 0 0 1px rgba(0, 0, 0, 0.14); }
.accent-suggestions label { overflow: hidden; background: conic-gradient(#d4c3c4, #bdccd4, #c8d2c2, #e8dcc6, #d4c3c4); }
.accent-suggestions input { width: 48px; height: 48px; position: absolute; inset: -8px; opacity: 0; cursor: pointer; }
.accent-suggestions--settings { justify-content: flex-start; margin: 4px 0 18px; }
.onboarding-background-heading { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-top: 24px; }
.onboarding-header-preview { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin-top: 28px; }
.onboarding-preview-choice { min-height: 94px; display: grid; grid-template-columns: 44px minmax(0, 1fr) 22px; align-items: center; gap: 13px; padding: 15px; border: 1px solid rgba(255, 255, 255, 0.09); border-radius: 20px; background: linear-gradient(145deg, rgba(255, 255, 255, 0.085), rgba(255, 255, 255, 0.025)); cursor: pointer; transition: border-color 160ms ease, background 160ms ease, transform 160ms ease; }
.onboarding-preview-choice:hover { transform: translateY(-1px); }
.onboarding-preview-choice > span { width: 44px; height: 44px; display: grid; place-items: center; border-radius: 14px; color: var(--hd-accent); background: color-mix(in srgb, var(--hd-accent) 10%, transparent); }
.onboarding-preview-choice > div { min-width: 0; display: flex; flex-direction: column; gap: 5px; }
.onboarding-preview-choice strong { overflow: hidden; font-size: 13px; text-overflow: ellipsis; white-space: nowrap; }
.onboarding-preview-choice small { color: rgba(255, 255, 255, 0.45); font-size: 10px; }
.onboarding-preview-choice input { width: 19px; height: 19px; accent-color: var(--hd-accent); }
.onboarding-preview-choice--selected { border-color: color-mix(in srgb, var(--hd-accent) 44%, transparent); background: color-mix(in srgb, var(--hd-accent) 8%, rgba(255, 255, 255, 0.03)); }
.ready-color { width: 26px; height: 26px; align-self: center; border: 2px solid rgba(255, 255, 255, 0.6); border-radius: 50%; }

.settings-screen { position: relative; isolation: isolate; }
.settings-background-preview { position: fixed; z-index: 0; inset: 0; transition: background 420ms ease; }
.settings-background-preview::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(6, 8, 11, 0.45), rgba(6, 8, 11, 0.76)); }
.settings-screen > :not(.settings-background-preview) { position: relative; z-index: 1; }
.settings-screen .settings-floating-close, .settings-screen .settings-floating-save { position: fixed; z-index: 45; }

.editor-select-label select, .onboarding-select select, .onboarding-inline-options select, .climate-sheet__select select { appearance: none; min-height: 46px; padding: 0 45px 0 14px; border: 1px solid rgba(255, 255, 255, 0.13); border-radius: 14px; color: #f5f4f7; background-color: rgba(10, 12, 16, 0.58); background-image: linear-gradient(45deg, transparent 50%, rgba(255,255,255,.62) 50%), linear-gradient(135deg, rgba(255,255,255,.62) 50%, transparent 50%); background-position: calc(100% - 18px) 19px, calc(100% - 13px) 19px; background-size: 5px 5px, 5px 5px; background-repeat: no-repeat; box-shadow: inset 0 1px rgba(255, 255, 255, 0.045), 0 10px 24px rgba(0, 0, 0, 0.12); cursor: pointer; }
.editor-select-label select:hover, .onboarding-select select:hover, .onboarding-inline-options select:hover, .climate-sheet__select select:hover { border-color: rgba(255, 255, 255, 0.24); }
.editor-select-label select:focus, .onboarding-select select:focus, .onboarding-inline-options select:focus, .climate-sheet__select select:focus { border-color: color-mix(in srgb, var(--hd-accent) 56%, transparent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--hd-accent) 10%, transparent); outline: 0; }

@media (max-width: 720px) {
  .onboarding-live-demo, .onboarding-header-preview { grid-template-columns: 1fr; }
  .onboarding-color-section, .onboarding-background-heading { align-items: flex-start; flex-direction: column; }
  .accent-suggestions { justify-content: flex-start; }
  .onboarding-dashboard-welcome { border-radius: 26px; }
}

/* HomeDeck 0.2.10 — custom Glass selects and quieter onboarding */
.onboarding-topbar { border-bottom: 0; background: transparent; backdrop-filter: none; }
.onboarding-dashboard-welcome .primary-button--large { margin-top: 38px; }

.hd-select { width: min(100%, 340px); position: relative; z-index: 12; }
.hd-select--open { z-index: 80; }
.hd-select__button { width: 100%; min-height: 54px; display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 0 17px; border: 1px solid rgba(255, 255, 255, 0.16); border-radius: 17px; color: #f8f7f8; background: linear-gradient(145deg, rgba(255, 255, 255, 0.17), rgba(255, 255, 255, 0.09)); box-shadow: inset 0 1px rgba(255, 255, 255, 0.08), 0 10px 28px rgba(0, 0, 0, 0.1); text-align: left; cursor: pointer; backdrop-filter: blur(18px) saturate(1.18); }
.hd-select__button:hover { border-color: rgba(255, 255, 255, 0.26); background: linear-gradient(145deg, rgba(255, 255, 255, 0.21), rgba(255, 255, 255, 0.11)); }
.hd-select__button:focus-visible { outline: 2px solid var(--hd-accent); outline-offset: 2px; }
.hd-select__button:disabled { opacity: 0.45; cursor: default; }
.hd-select__button svg { flex: 0 0 auto; opacity: 0.72; transform: rotate(90deg); transition: transform 160ms ease; }
.hd-select--open .hd-select__button svg { transform: rotate(-90deg); }
.hd-select__menu { width: 100%; max-height: 270px; position: absolute; top: calc(100% + 8px); right: 0; z-index: 90; display: flex; flex-direction: column; gap: 5px; overflow-y: auto; padding: 7px; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 19px; background: rgba(45, 57, 61, 0.94); box-shadow: 0 24px 70px rgba(0, 0, 0, 0.42); backdrop-filter: blur(30px) saturate(1.28); animation: hd-select-open 140ms ease-out; }
.hd-select__option { width: 100%; min-height: 46px; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 0 13px; border: 0; border-radius: 13px; color: rgba(255, 255, 255, 0.82); background: rgba(255, 255, 255, 0.055); text-align: left; cursor: pointer; }
.hd-select__option:hover { color: #fff; background: rgba(255, 255, 255, 0.12); }
.hd-select__option--selected { color: var(--hd-accent-contrast); background: var(--hd-accent); }
.hd-select__option--selected:hover { color: var(--hd-accent-contrast); background: var(--hd-accent); }
.hd-select__option i { width: 22px; height: 22px; display: grid; place-items: center; flex: 0 0 auto; border-radius: 7px; color: inherit; background: color-mix(in srgb, currentColor 12%, transparent); font-style: normal; font-weight: 800; }
@keyframes hd-select-open { from { opacity: 0; transform: translateY(-5px) scale(0.985); } }

.onboarding-select .hd-select { width: 100%; }
.onboarding-option-columns > section { overflow: visible; }
.settings-panel:has(.hd-select--open), .onboarding-option-columns > section:has(.hd-select--open), .entity-modal__section:has(.hd-select--open), .climate-sheet__control:has(.hd-select--open) { position: relative; z-index: 75; }
.editor-select-label .hd-select { flex: 0 1 340px; }
.entity-modal__select .hd-select, .climate-sheet__select .hd-select { width: min(100%, 270px); }
.entity-modal__select, .climate-sheet__select { overflow: visible; }

@media (max-width: 620px) {
  .editor-select-label .hd-select, .entity-modal__select .hd-select, .climate-sheet__select .hd-select { width: 100%; flex-basis: auto; }
  .hd-select__menu { position: fixed; width: calc(100vw - 32px); max-height: 48vh; top: auto; right: 16px; bottom: 16px; border-radius: 24px; }
}
`;

