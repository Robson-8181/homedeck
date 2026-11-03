// HomeDeck visual language, aligned with the Casa Painel reference dashboard.
// Everything here is unlayered, so it wins over the older rules that main.tsx
// wraps in `@layer legacy`, whatever their specificity.
export const theme = String.raw`
:host {
  --glass: rgba(255,255,255,.14); --glass-strong: rgba(255,255,255,.18); --line: rgba(255,255,255,.2);
  --ink: #fff; --ink-2: rgba(255,255,255,.72); --ink-3: rgba(255,255,255,.5);
  --paper-ink: #2b2418; --paper-ink-2: rgba(43,36,24,.62);
  --on: #ffc94d; --on-deep: #e8a21b; --cool: #6cc4ff; --heat: #ff9d4d; --ok: #5fd68a; --bad: #ff6b5e;
  --f-display: "HomeDeck Outfit", "Outfit", "Segoe UI", system-ui, sans-serif;
  --f-body: "HomeDeck Figtree", "Figtree", "Segoe UI", system-ui, sans-serif;
  font-family: var(--f-body);
  color: var(--ink);
  background: #120f14;
  color-scheme: dark;
}

/* One unit drives every size, so a 7" Echo Show and a 27" monitor keep the same proportions. */
.app-shell { --u: clamp(4.4px, min(1vw, 1.05vh), 13px); --paper: var(--hd-accent, #f4edd9); font-family: var(--f-body); -webkit-font-smoothing: antialiased; }
/* No container-type here: it would turn the shell into the containing block of the fixed dock and sheets. */
.app-shell > .screen {
  min-height: 100vh; display: flex; flex-direction: column; gap: calc(var(--u)*2.6);
  /* No top safe area: Home Assistant already keeps its panels below the status bar, and adding it here
     left an empty band at the top of the companion app. Fixed overlays still use it. */
  /* The bottom only clears the floating dock (and the Edit button beside it), so a screen that fits
     never scrolls: the old fixed u*13 left extra space that tipped Home with scenes into a scroll. */
  padding: calc(var(--u)*4) calc(var(--u)*4) calc(var(--dock-bottom) + var(--dock-height) + var(--u)*2.4);
  font-size: calc(var(--u)*2.1);
}
.app-shell button { font-family: inherit; -webkit-tap-highlight-color: transparent; }
.app-shell :focus-visible { outline: 2px solid #fff; outline-offset: 2px; }

/* Shared surfaces */
/* :where keeps this at the specificity of .app-shell alone, so state rules below always win. */
.app-shell :where(.room-card, .device-tile, .widget-card, .weather-chip, .navigation-dock, .round-action, .global-actions > button, .room-actions > button, .scene-strip .hd-item > button:first-child, .empty-state) {
  background: var(--glass); border: 1px solid var(--line);
  backdrop-filter: blur(22px) saturate(1.3); -webkit-backdrop-filter: blur(22px) saturate(1.3);
  box-shadow: none;
}
.app-shell .eyebrow, .app-shell .operational-heading span, .app-shell .widget-card__label {
  font: 700 calc(var(--u)*1.6)/1.2 var(--f-body); letter-spacing: .12em; text-transform: uppercase; color: var(--ink-3);
}

/* Header: date, clock, weather, people */
.app-shell .context-header { display: flex; justify-content: space-between; align-items: flex-end; gap: calc(var(--u)*2); flex-wrap: wrap; min-height: 0; padding: 0; margin: 0; border: 0; }
.app-shell .context-header__clock { display: flex; flex-direction: column; min-width: 0; }
.app-shell .context-header__clock span { white-space: normal; overflow: visible; max-width: none; }
.app-shell .context-header__clock span { font: 600 calc(var(--u)*1.9)/1.2 var(--f-body); letter-spacing: .1em; text-transform: uppercase; color: var(--ink-2); }
.app-shell .context-header__clock strong { font: 300 calc(var(--u)*6.4)/1 var(--f-display); letter-spacing: -.01em; margin-top: calc(var(--u)*.6); font-variant-numeric: tabular-nums; color: var(--ink); }
.app-shell .context-header__right { display: flex; align-items: center; gap: calc(var(--u)*1.6); }
.app-shell .weather-chip { display: flex; align-items: center; gap: calc(var(--u)*1.2); height: auto; border-radius: 99px; padding: calc(var(--u)*.9) calc(var(--u)*2) calc(var(--u)*.9) calc(var(--u)*1.4); color: var(--ink); cursor: pointer; }
.app-shell .weather-chip svg { width: calc(var(--u)*3.4); height: calc(var(--u)*3.4); }
.app-shell .weather-chip b { font: 500 calc(var(--u)*2.8)/1 var(--f-display); }
.app-shell .weather-chip small { color: var(--ink-2); font: 500 calc(var(--u)*1.8)/1 var(--f-body); white-space: nowrap; }
.app-shell .presence-stack { display: flex; padding-left: calc(var(--u)*1.2); }
.app-shell .presence-avatar { position: relative; width: calc(var(--u)*5.4); height: calc(var(--u)*5.4); margin-left: calc(var(--u)*-1.2); border-radius: 50%; display: grid; place-items: center; overflow: visible; font: 600 calc(var(--u)*2.2)/1 var(--f-display); color: #2a1408; background: var(--avatar, #f0a86a); border: 2px solid rgba(0,0,0,.25); }
.app-shell .presence-avatar img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }
.app-shell .presence-avatar::after { content: ""; position: absolute; right: -1px; bottom: -1px; width: 28%; height: 28%; border-radius: 50%; background: #8c8c8c; border: 2px solid #1b1514; }
.app-shell .presence-avatar--home::after { background: var(--ok); }
.app-shell .round-action { width: calc(var(--u)*5.4); height: calc(var(--u)*5.4); border-radius: 99px; display: grid; place-items: center; padding: 0; color: var(--ink); cursor: pointer; }
.app-shell .round-action svg { width: calc(var(--u)*2.6); height: calc(var(--u)*2.6); }

/* Home status line: "CASA / 6 luzes acesas em casa" with pill actions */
.app-shell .home-status, .app-shell .room-operational-header, .app-shell .collection-header {
  display: flex; justify-content: space-between; align-items: flex-end; gap: calc(var(--u)*2); flex-wrap: wrap;
  padding: 0; margin: 0; border: 0; background: none; min-height: 0; text-align: left;
}
.app-shell :is(.home-status, .room-operational-header, .collection-header) h1 { font: 300 calc(var(--u)*4)/1.1 var(--f-display); letter-spacing: 0; margin: calc(var(--u)*.6) 0 0; text-wrap: balance; color: var(--ink); }
.app-shell :is(.home-status, .room-operational-header, .collection-header) p { display: none; }
.app-shell :is(.global-actions, .room-actions) { display: flex; gap: calc(var(--u)*1); flex-wrap: wrap; }
.app-shell :is(.global-actions, .room-actions) > button {
  border-radius: 99px; height: auto; min-height: 0; padding: calc(var(--u)*1) calc(var(--u)*2.2);
  font: 600 calc(var(--u)*1.8)/1.2 var(--f-body); color: var(--ink); display: inline-flex; align-items: center; gap: calc(var(--u)*.8); white-space: nowrap; cursor: pointer;
}
.app-shell :is(.global-actions > button:last-child, .room-actions__primary) { background: rgba(255,255,255,.92); color: #1d1a17; border-color: transparent; }
.app-shell :is(.global-actions, .room-actions) svg { width: calc(var(--u)*2.4); height: calc(var(--u)*2.4); }
.app-shell button:disabled { opacity: .45; cursor: default; }
.app-shell :is(button, .room-card, .device-tile):active:not(:disabled) { box-shadow: inset 0 0 0 999px rgba(255,255,255,.12); }

/* Home grid: rooms, top cards and shortcuts share one grid, like the reference */
.app-shell .home-grid { flex: 1 0 auto; display: grid; grid-template-columns: repeat(auto-fill, minmax(calc(var(--u)*21), 1fr)); grid-auto-rows: minmax(calc(var(--u)*19), 1fr); align-content: stretch; grid-auto-flow: row dense; gap: calc(var(--u)*1.8); }

/* Tiles */
.app-shell :is(.room-card, .device-tile, .widget-card) {
  position: relative; min-width: 0; min-height: calc(var(--u)*18); overflow: hidden;
  border-radius: calc(var(--u)*3.4); padding: calc(var(--u)*2); color: var(--ink);
  display: flex; flex-direction: column; justify-content: space-between; gap: calc(var(--u)*1.4);
  transition: background .25s, color .25s, opacity .25s, transform .16s ease;
}
.app-shell :is(.room-card--active, .device-tile--active) { background: var(--paper); color: var(--paper-ink); border-color: transparent; }
.app-shell :is(.room-card--unavailable, .device-tile--unavailable) { opacity: .4; }
.app-shell :is(.room-card__icon, .device-tile__icon, .widget-card__icon) {
  position: static; inset: auto; margin: 0;
  width: calc(var(--u)*5); height: calc(var(--u)*5); border-radius: 50%; display: grid; place-items: center; flex: none;
  background: rgba(255,255,255,.17); color: inherit; transition: background .25s, color .25s;
}
.app-shell :is(.room-card__icon, .device-tile__icon, .widget-card__icon) svg { width: 56%; height: 56%; }
.app-shell :is(.room-card--active .room-card__icon, .device-tile--active .device-tile__icon) { background: var(--lc, var(--on)); color: var(--on-ink, #2a2110); }
.app-shell :is(.room-card__power, .device-tile__power) {
  position: absolute; top: calc(var(--u)*1.4); right: calc(var(--u)*1.4); z-index: 2;
  width: calc(var(--u)*6.4); height: calc(var(--u)*6.4); border-radius: 50%; border: 0; padding: 0;
  display: grid; place-items: center; background: rgba(255,255,255,.17); color: inherit; cursor: pointer;
}
.app-shell :is(.room-card__power, .device-tile__power) svg { width: 48%; height: 48%; }
.app-shell .device-tile--active .device-tile__power { background: rgba(43,36,24,.12); }
/* A room with a light on lights its power button in the highlight color: one tap turns them off. */
.app-shell .room-card--active .room-card__power { background: var(--on); color: var(--on-ink, #2a2110); box-shadow: 0 0 calc(var(--u)*2.4) color-mix(in srgb, var(--on) 45%, transparent); }
.app-shell .room-card__top, .app-shell .device-tile__top { display: flex; align-items: flex-start; justify-content: space-between; min-height: calc(var(--u)*5); }
.app-shell .room-card__arrow { color: var(--ink-3); }
.app-shell .room-card__content, .app-shell .device-tile__copy { margin-top: auto; min-width: 0; }
.app-shell :is(.room-card__content strong, .device-tile__copy strong, .widget-card > strong) {
  display: block; font: 600 calc(var(--u)*2.05)/1.15 var(--f-body); color: inherit; white-space: normal; overflow: hidden; text-overflow: ellipsis;
}
.app-shell :is(.room-card__content span, .device-tile__copy span, .widget-card > p) {
  display: block; margin: calc(var(--u)*.35) 0 0; font: 500 calc(var(--u)*1.75)/1.25 var(--f-body); color: var(--ink-2);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.app-shell :is(.room-card--active .room-card__content span, .device-tile--active .device-tile__copy span) { color: var(--paper-ink-2); }
.app-shell .room-card__open { position: absolute; inset: 0; z-index: 1; border: 0; background: none; padding: 0; cursor: pointer; border-radius: inherit; }
.app-shell .room-card__footer { display: flex; align-items: center; justify-content: space-between; gap: calc(var(--u)*1); margin-top: calc(var(--u)*-.6); font: 500 calc(var(--u)*1.75)/1 var(--f-body); color: var(--ink-2); border: 0; padding: 0; }
.app-shell .room-card--active .room-card__footer { color: var(--paper-ink-2); }
.app-shell .light-pips { display: flex; gap: calc(var(--u)*.5); flex-wrap: wrap; }
.app-shell .light-pip { width: calc(var(--u)*1.1); height: calc(var(--u)*1.1); border-radius: 50%; background: rgba(255,255,255,.28); box-shadow: none; }
.app-shell .room-card--active .light-pip { background: rgba(43,36,24,.16); }
.app-shell .room-card--active .light-pip--active { background: var(--on-deep); }

/* Device tiles */
.app-shell .device-tile__more {
  position: absolute; top: calc(var(--u)*1.4); right: calc(var(--u)*8.6); z-index: 2;
  width: calc(var(--u)*4.4); height: calc(var(--u)*4.4); border-radius: 50%; border: 0; padding: 0;
  background: transparent; color: var(--ink-3); font: 700 calc(var(--u)*1.6)/1 var(--f-body); letter-spacing: .05em; cursor: pointer;
}
.app-shell .device-tile:not(:has(.device-tile__power)) .device-tile__more { right: calc(var(--u)*1.4); }
.app-shell .device-tile--active .device-tile__more { color: var(--paper-ink-2); }
/* Brightness, like the main dashboard: a rounded fill with its marker set a little inside the end */
.app-shell .device-dimmer { position: relative; display: block; margin: 0; height: calc(var(--u)*3.6); border-radius: 99px; overflow: hidden; background: rgba(255,255,255,.16); }
.app-shell .device-tile--active .device-dimmer { background: rgba(43,36,24,.1); }
.app-shell .device-dimmer b, .app-shell .tile-slider__track b { position: absolute; left: 0; top: 0; bottom: 0; width: max(var(--value, 0%), calc(var(--u)*3.6)); border-radius: inherit; background: rgba(255,255,255,.55); pointer-events: none; }
.app-shell .device-dimmer b::after, .app-shell .tile-slider__track b::after { content: ""; position: absolute; right: calc(var(--u)*.9); top: 25%; bottom: 25%; width: 3px; border-radius: 3px; background: rgba(255,255,255,.95); }
.app-shell .device-tile--active .device-dimmer b { background: var(--lc, var(--on)); }
.app-shell .device-tile--active .device-dimmer b::after { background: rgba(43,36,24,.55); }
.app-shell .device-dimmer--off b { display: none; }
.app-shell .device-dimmer input, .app-shell .tile-slider__track input { position: absolute; inset: 0; width: 100%; height: 100%; margin: 0; opacity: 0; cursor: ew-resize; touch-action: pan-y; }
.app-shell .device-dimmer:has(input:focus-visible), .app-shell .tile-slider__track:has(input:focus-visible) { outline: 2px solid currentColor; outline-offset: 2px; }
.app-shell :is(.device-controls, .climate-quick-control > div) { display: flex; gap: calc(var(--u)*1); }
.app-shell :is(.device-controls, .climate-quick-control > div) button {
  flex: 1; height: calc(var(--u)*4.4); border-radius: 99px; border: 0; padding: 0;
  display: grid; place-items: center; background: rgba(255,255,255,.18); color: inherit; font: 400 calc(var(--u)*2.8)/1 var(--f-display); cursor: pointer;
}
.app-shell .device-tile--active :is(.device-controls, .climate-quick-control > div) button { background: rgba(43,36,24,.1); }
.app-shell .device-controls svg { width: calc(var(--u)*2.4); height: calc(var(--u)*2.4); }
.app-shell .climate-quick-control { display: flex; flex-direction: column; gap: calc(var(--u)*1); }
.app-shell .climate-quick-control > span { font: 300 calc(var(--u)*3.6)/1 var(--f-display); font-variant-numeric: tabular-nums; }
.app-shell .device-tile__busy { position: absolute; inset: 0; border-radius: inherit; box-shadow: inset 0 0 0 2px rgba(255,255,255,.7); animation: hd-busy 1s ease-in-out infinite; pointer-events: none; background: none; }
@keyframes hd-busy { 50% { box-shadow: inset 0 0 0 2px rgba(255,255,255,.15); } }

/* Top cards */
.app-shell .widget-card { cursor: default; }
.app-shell .widget-card--interactive { cursor: pointer; }
.app-shell .widget-card__label { position: absolute; top: calc(var(--u)*2.6); left: calc(var(--u)*8.4); margin: 0; }
.app-shell .widget-card > strong { margin-top: auto; font: 300 calc(var(--u)*3.2)/1.08 var(--f-display); white-space: normal; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.app-shell .widget-card--alert { background: rgba(255,107,94,.22); border-color: rgba(255,107,94,.45); }
.app-shell .widget-card--alert .widget-card__icon { background: var(--bad); color: #fff; }
.app-shell :is(.widget-card--playing, .widget-card--featured.widget-card--playing) { background: var(--paper); color: var(--paper-ink); border-color: transparent; }
.app-shell .widget-card--playing :is(.widget-card__label, p) { color: var(--paper-ink-2); }
.app-shell .widget-card--playing .widget-card__icon { background: var(--green, #1fd36b); color: #08210f; }
.app-shell .widget-card > button {
  position: absolute; top: calc(var(--u)*1.4); right: calc(var(--u)*1.4); width: calc(var(--u)*6.4); height: calc(var(--u)*6.4);
  border-radius: 50%; border: 0; padding: 0; display: grid; place-items: center; background: rgba(255,255,255,.17); color: inherit; cursor: pointer;
}
.app-shell .widget-card--playing > button { background: rgba(43,36,24,.12); }

/* Scenes */
.app-shell .scene-section { display: flex; flex-direction: column; gap: calc(var(--u)*1.2); margin: 0; }
.app-shell .operational-heading { display: flex; align-items: center; gap: calc(var(--u)*1); margin: 0; }
.app-shell .operational-heading i { font: 600 calc(var(--u)*1.5)/1 var(--f-body); font-style: normal; color: var(--ink-3); }
.app-shell .scene-strip { display: flex; gap: calc(var(--u)*1); flex-wrap: wrap; overflow: visible; }
.app-shell .scene-strip .hd-item > button:first-child { display: inline-flex; align-items: center; gap: calc(var(--u)*.9); border-radius: 99px; padding: calc(var(--u)*1.1) calc(var(--u)*2.2); color: var(--ink); font: 600 calc(var(--u)*1.8)/1.2 var(--f-body); cursor: pointer; min-height: 0; }
.app-shell .scene-strip .hd-item > button:first-child svg { width: calc(var(--u)*2.4); height: calc(var(--u)*2.4); }

/* Navigation dock */
.app-shell .navigation-dock {
  position: fixed; left: 50%; right: auto; bottom: calc(var(--u)*2.4 + env(safe-area-inset-bottom, 0px)); transform: translateX(-50%); z-index: 20;
  width: auto; max-width: calc(100% - var(--u)*4); display: flex; gap: calc(var(--u)*.6); padding: calc(var(--u)*.8); border-radius: 99px;
  overflow-x: auto; scrollbar-width: none; box-shadow: 0 calc(var(--u)*1.2) calc(var(--u)*4) rgba(0,0,0,.35);
}
.app-shell .navigation-dock::-webkit-scrollbar { display: none; }
.app-shell .navigation-dock button {
  flex: none; display: flex; align-items: center; gap: calc(var(--u)*.9); min-height: 0; height: auto; border: 0; border-radius: 99px;
  padding: calc(var(--u)*1.1) calc(var(--u)*2.2); background: none; color: var(--ink-2); font: 600 calc(var(--u)*1.9)/1.2 var(--f-body); white-space: nowrap; cursor: pointer;
}
.app-shell .navigation-dock button span { display: inline; font: inherit; }
.app-shell .navigation-dock button svg { width: calc(var(--u)*2.7); height: calc(var(--u)*2.7); flex: none; }
.app-shell .navigation-dock button.navigation-dock__active { background: rgba(255,255,255,.92); color: #1d1a17; }

/* Rooms screen: plain list on the left, tiles on the right */
.app-shell .room-workspace { display: grid; grid-template-columns: minmax(calc(var(--u)*22), calc(var(--u)*26)) minmax(0, 1fr); gap: calc(var(--u)*4); align-items: start; min-height: 0; }
.app-shell .room-selector { position: sticky; top: calc(var(--u)*2); min-width: 0; padding: 0; background: none; border: 0; box-shadow: none; backdrop-filter: none; -webkit-backdrop-filter: none; }
.app-shell .room-selector__list { display: flex; flex-direction: column; gap: calc(var(--u)*.6); max-height: none; overflow: visible; padding: 0; }
.app-shell .room-selector__list > button {
  display: flex; align-items: center; gap: calc(var(--u)*1.4); min-height: 0; width: 100%; border: 0; border-radius: calc(var(--u)*1.6);
  padding: calc(var(--u)*1.1) calc(var(--u)*1.2); background: none; color: var(--ink-2); font: 500 calc(var(--u)*1.9)/1.2 var(--f-body); text-align: left; cursor: pointer;
}
.app-shell .room-selector__list > button > span:not(.room-selector__icon) { font: inherit; flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.app-shell .room-selector__icon { width: calc(var(--u)*3.6); height: calc(var(--u)*3.6); border-radius: 50%; display: grid; place-items: center; flex: none; background: rgba(255,255,255,.12); color: inherit; }
.app-shell .room-selector__icon svg { width: 55%; height: 55%; }
.app-shell .room-selector__list > button i { min-width: calc(var(--u)*2.6); height: calc(var(--u)*2.6); padding: 0 calc(var(--u)*.7); border-radius: 99px; display: grid; place-items: center; background: var(--on); color: var(--on-ink, #2a2110); font: 700 calc(var(--u)*1.4)/1 var(--f-body); font-style: normal; }
.app-shell .room-selector__list > button[aria-selected="true"] { background: rgba(255,255,255,.92); color: #1d1a17; font-weight: 600; }
.app-shell .room-selector__list > button[aria-selected="true"] .room-selector__icon { background: rgba(29,26,23,.08); }
.app-shell .room-pane { min-width: 0; display: flex; flex-direction: column; gap: calc(var(--u)*2); }
.app-shell .room-pane .device-grid, .app-shell .collection-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(calc(var(--u)*20), 1fr)); grid-auto-rows: minmax(calc(var(--u)*16.5), auto); gap: calc(var(--u)*1.8); }
/* Pages use the whole width, like Home (the old styles stopped them at 1180px). */
.app-shell .collection-grid { max-width: none; }
.app-shell .collection-header { align-items: center; justify-content: flex-start; }
.app-shell .empty-state { border-radius: calc(var(--u)*3.4); padding: calc(var(--u)*4); color: var(--ink-2); text-align: center; }

/* Phones and narrow panels */
@media (max-width: 720px) {
  .app-shell { --u: 6.6px; }
  .app-shell > .screen { --u: 6.6px; padding-left: calc(var(--u)*2.4); padding-right: calc(var(--u)*2.4); }
  .app-shell .home-grid { flex: none; grid-template-columns: repeat(2, minmax(0, 1fr)); grid-auto-rows: minmax(calc(var(--u)*22), auto); }
  .app-shell :is(.home-status, .room-operational-header) { flex-direction: column; align-items: stretch; }
  .app-shell :is(.home-status, .room-operational-header) > div:first-child { margin: 0; text-align: left; }
  .app-shell .global-actions > button { flex: 1; justify-content: center; }
  .app-shell .room-workspace { grid-template-columns: minmax(0, 1fr); gap: calc(var(--u)*2); }
  .app-shell .room-selector { position: static; }
  .app-shell .room-selector__list { flex-direction: row; overflow-x: auto; scrollbar-width: none; }
  .app-shell .room-selector__list > button { width: auto; flex: none; }
  .app-shell .room-pane .device-grid, .app-shell .collection-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .app-shell .navigation-dock button { padding: calc(var(--u)*1.1) calc(var(--u)*1.6); }
}
`;
