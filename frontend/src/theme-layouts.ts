// Alternative layouts (Lateral, Lista, Foco) and the layout picker.
export const themeLayouts = String.raw`
/* ---------- Layout picker ---------- */
:is(.app-shell, .onboarding-screen) .lp-options { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr)); gap: 10px; }
.onboarding-screen .onboarding-layout .lp-options { margin-top: 22px; grid-template-columns: repeat(auto-fit, minmax(min(100%, 380px), 1fr)); }
:is(.app-shell, .onboarding-screen) .lp-option {
  position: relative; display: flex; align-items: center; gap: 14px; padding: 10px 40px 10px 10px; border-radius: calc(18px*var(--hd-r,1)); text-align: left; cursor: pointer;
  border: 1.5px solid rgba(255,255,255,.14); background: rgba(255,255,255,.06); color: var(--ink); transition: border-color .2s, background .2s, transform .15s;
}
:is(.app-shell, .onboarding-screen) .lp-option:hover { background: rgba(255,255,255,.1); }
:is(.app-shell, .onboarding-screen) .lp-option[aria-checked="true"] { border-color: var(--on); background: color-mix(in srgb, var(--on) 12%, transparent); }
:is(.app-shell, .onboarding-screen) .lp-copy { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
:is(.app-shell, .onboarding-screen) .lp-copy b { font: 600 15px/1.2 var(--f-body); }
:is(.app-shell, .onboarding-screen) .lp-copy small { color: var(--ink-2); font: 500 12.5px/1.35 var(--f-body); }
:is(.app-shell, .onboarding-screen) .lp-pro { position: absolute; top: 10px; right: 10px; display: inline-flex; align-items: center; gap: 4px; padding: 4px 9px; border-radius: var(--hd-pill,99px); font-size: 11px; font-weight: 700; letter-spacing: .04em; background: rgba(0,0,0,.45); color: var(--on); backdrop-filter: blur(8px); }
:is(.app-shell, .onboarding-screen) .lp-check { position: absolute; top: 10px; right: 10px; width: 24px; height: 24px; border-radius: var(--hd-round,50%); display: grid; place-items: center; background: var(--on); color: var(--on-ink); box-shadow: 0 2px 8px rgba(0,0,0,.3); }
:is(.app-shell, .onboarding-screen) .lp-thumb {
  position: relative; flex: none; width: 128px; display: flex; gap: 5px; aspect-ratio: 16 / 10; padding: 8px; border-radius: calc(11px*var(--hd-r,1)); overflow: hidden;
  background: radial-gradient(circle at 20% 20%, #8a4a5a, transparent 60%), radial-gradient(circle at 85% 85%, #4b3b70, transparent 55%), #241a30;
}
:is(.app-shell, .onboarding-screen) .lp-thumb i, :is(.app-shell, .onboarding-screen) .lp-thumb b, :is(.app-shell, .onboarding-screen) .lp-thumb em, :is(.app-shell, .onboarding-screen) .lp-thumb strong { display: block; font-style: normal; }
:is(.app-shell, .onboarding-screen) .lp-on { background: #f4edd9 !important; }
:is(.app-shell, .onboarding-screen) .lp-thumb--grid, :is(.app-shell, .onboarding-screen) .lp-thumb--list { flex-direction: column; }
:is(.app-shell, .onboarding-screen) .lp-line { width: 38%; height: 7px; border-radius: calc(4px*var(--hd-r,1)); background: rgba(255,255,255,.55); }
:is(.app-shell, .onboarding-screen) .lp-grid { flex: 1; display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px; }
:is(.app-shell, .onboarding-screen) .lp-grid i { border-radius: calc(6px*var(--hd-r,1)); background: rgba(255,255,255,.22); }
:is(.app-shell, .onboarding-screen) .lp-dock { align-self: center; width: 46%; height: 7px; border-radius: var(--hd-pill,99px); background: rgba(255,255,255,.4); }
:is(.app-shell, .onboarding-screen) .lp-side { width: 32%; display: flex; flex-direction: column; gap: 4px; padding: 6px; border-radius: calc(8px*var(--hd-r,1)); background: rgba(255,255,255,.14); }
:is(.app-shell, .onboarding-screen) .lp-side b { height: 12px; width: 70%; border-radius: calc(3px*var(--hd-r,1)); background: rgba(255,255,255,.7); margin-bottom: 3px; }
:is(.app-shell, .onboarding-screen) .lp-side i { height: 6px; border-radius: calc(3px*var(--hd-r,1)); background: rgba(255,255,255,.3); }
:is(.app-shell, .onboarding-screen) .lp-side i:nth-child(2) { background: #fff; }
:is(.app-shell, .onboarding-screen) .lp-main { flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 5px; }
:is(.app-shell, .onboarding-screen) .lp-main i { border-radius: calc(6px*var(--hd-r,1)); background: rgba(255,255,255,.22); }
:is(.app-shell, .onboarding-screen) .lp-rows { flex: 1; display: flex; flex-direction: column; gap: 3px; padding: 4px; border-radius: calc(8px*var(--hd-r,1)); background: rgba(255,255,255,.12); }
:is(.app-shell, .onboarding-screen) .lp-rows i { flex: 1; position: relative; border-radius: calc(3px*var(--hd-r,1)); background: rgba(255,255,255,.12); }
:is(.app-shell, .onboarding-screen) .lp-rows i.lp-head { background: rgba(255,255,255,.3); }
:is(.app-shell, .onboarding-screen) .lp-sw { position: absolute; right: 4px; top: 50%; width: 14px; height: 7px; margin-top: -3.5px; border-radius: var(--hd-pill,99px); background: rgba(255,255,255,.35); }
:is(.app-shell, .onboarding-screen) .lp-sw--on { background: #ffc94d; }
:is(.app-shell, .onboarding-screen) .lp-thumb--focus { flex-direction: column; justify-content: center; }
:is(.app-shell, .onboarding-screen) .lp-hero { display: flex; align-items: center; gap: 8px; padding: 0 4px; }
:is(.app-shell, .onboarding-screen) .lp-hero b { height: 18px; flex: 1; border-radius: calc(4px*var(--hd-r,1)); background: rgba(255,255,255,.75); }
:is(.app-shell, .onboarding-screen) .lp-hero strong { width: 28px; height: 28px; border-radius: var(--hd-round,50%); background: #ffc94d; box-shadow: 0 0 14px rgba(255,201,77,.6); }
:is(.app-shell, .onboarding-screen) .lp-hero em { display: none; }
:is(.app-shell, .onboarding-screen) .lp-dots { position: absolute; bottom: 9px; left: 50%; transform: translateX(-50%); display: flex; gap: 4px; }
:is(.app-shell, .onboarding-screen) .lp-dots i { width: 5px; height: 5px; border-radius: var(--hd-pill,99px); background: rgba(255,255,255,.4); }
:is(.app-shell, .onboarding-screen) .lp-dots i.lp-on { width: 14px; background: #fff !important; }

/* ---------- Lateral ---------- */
.app-shell.view-sidebar > .screen.sb-layout {
  display: grid; grid-template-columns: minmax(calc(var(--u)*34), calc(var(--u)*40)) minmax(0, 1fr); align-items: start; gap: calc(var(--u)*3);
  padding: calc(var(--u)*3) calc(var(--u)*3) calc(var(--u)*4); flex-direction: row;
}
.app-shell .sb-side {
  /* Exactly the screen minus the layout padding (3u top, 4u bottom), so a full column never adds a scroll. */
  position: sticky; top: calc(var(--u)*3); max-height: calc(100vh - var(--u)*7); overflow: auto; scrollbar-width: none;
  display: flex; flex-direction: column; gap: calc(var(--u)*2.4); padding: calc(var(--u)*3); border-radius: calc(var(--u)*4*var(--hd-r,1));
  background: rgba(255,255,255,.1); border: 1px solid var(--hd-frame,var(--line)); backdrop-filter: blur(26px) saturate(1.3); -webkit-backdrop-filter: blur(26px) saturate(1.3);
}
.app-shell .sb-side::-webkit-scrollbar { display: none; }
/* The column scrolls instead of squeezing its blocks into each other. */
.app-shell .sb-side > * { flex-shrink: 0; }
/* No wrapping: with a fixed legacy height, a wrapping column would push items into a second column. */
.app-shell .sb-side .context-header { flex-direction: column; flex-wrap: nowrap; align-items: flex-start; gap: calc(var(--u)*1.8); height: auto; }
.app-shell .sb-side .context-header__clock strong { font-size: calc(var(--u)*7.2); }
.app-shell .sb-side .context-header__right { flex-wrap: wrap; justify-content: flex-start; row-gap: calc(var(--u)*1.2); }
.app-shell .sb-side .home-status { flex-direction: column; flex-wrap: nowrap; height: auto; align-items: stretch; gap: calc(var(--u)*1.4); padding-top: calc(var(--u)*1.6); border-top: 1px solid rgba(255,255,255,.12); }
.app-shell .sb-side .home-status h1 { font-size: calc(var(--u)*3); }
.app-shell .sb-side .global-actions { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); width: 100%; }
.app-shell .sb-side .global-actions > button { justify-content: center; min-width: 0; padding-left: calc(var(--u)*1.2); padding-right: calc(var(--u)*1.2); overflow: hidden; text-overflow: ellipsis; }
.app-shell .sb-nav, .app-shell .sb-links { display: flex; flex-direction: column; gap: calc(var(--u)*.5); }
.app-shell .sb-nav { padding-top: calc(var(--u)*1.4); border-top: 1px solid rgba(255,255,255,.12); }
.app-shell .sb-nav > button, .app-shell .sb-nav .hd-item > button:first-child, .app-shell .sb-links button {
  display: flex; align-items: center; gap: calc(var(--u)*1.4); width: 100%; border: 0; border-radius: calc(var(--u)*1.8*var(--hd-r,1)); background: none; color: var(--ink-2);
  padding: calc(var(--u)*1) calc(var(--u)*1.2); font: 500 calc(var(--u)*1.9)/1.2 var(--f-body); text-align: left; cursor: pointer;
}
.app-shell .sb-nav > button > span:not(.sb-nav__icon), .app-shell .sb-nav .hd-item > button:first-child > span:not(.sb-nav__icon), .app-shell .sb-links button span { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.app-shell .sb-nav__icon { width: calc(var(--u)*3.8); height: calc(var(--u)*3.8); flex: none; border-radius: var(--hd-round,50%); display: grid; place-items: center; background: rgba(255,255,255,.12); }
.app-shell .sb-nav > button i , .app-shell .sb-nav .hd-item > button:first-child i { min-width: calc(var(--u)*2.6); height: calc(var(--u)*2.6); padding: 0 calc(var(--u)*.7); border-radius: var(--hd-pill,99px); display: grid; place-items: center; background: var(--on); color: var(--on-ink); font: 700 calc(var(--u)*1.4)/1 var(--f-body); font-style: normal; }
.app-shell .sb-nav > button[aria-current="page"] , .app-shell .sb-nav .hd-item > button:first-child[aria-current="page"] { background: rgba(255,255,255,.92); color: #1d1a17; font-weight: 600; }
.app-shell .sb-nav > button[aria-current="page"] .sb-nav__icon , .app-shell .sb-nav .hd-item > button:first-child[aria-current="page"] .sb-nav__icon { background: rgba(29,26,23,.08); }
.app-shell .sb-links { padding-top: calc(var(--u)*1.4); border-top: 1px solid rgba(255,255,255,.12); }
.app-shell .sb-links button { color: var(--ink-3); font-size: calc(var(--u)*1.75); }
.app-shell .sb-links button[aria-current="page"] { background: rgba(255,255,255,.92); color: #1d1a17; font-weight: 600; }
.app-shell .sb-main { min-width: 0; display: flex; flex-direction: column; gap: calc(var(--u)*2.4); padding-top: calc(var(--u)*1); }
/* Weather, people and settings sit top right, beside the column. */
.app-shell.view-sidebar > .screen.sb-layout { grid-template-areas: "side status" "side main"; grid-template-rows: auto 1fr; row-gap: calc(var(--u)*1.2); }
.app-shell .sb-layout > .sb-side { grid-area: side; }
.app-shell .sb-layout > .sb-main { grid-area: main; }
.app-shell .sb-layout > .context-header--status { grid-area: status; justify-content: flex-end; height: auto; min-height: 0; }
.app-shell .sb-main__header { display: flex; justify-content: space-between; align-items: flex-end; gap: calc(var(--u)*2); flex-wrap: wrap; }
.app-shell .sb-main__header h1 { margin: calc(var(--u)*.6) 0 0; font: 300 calc(var(--u)*5)/1.05 var(--f-display); }
.app-shell .sb-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(calc(var(--u)*20), 1fr)); grid-auto-rows: minmax(calc(var(--u)*17), auto); gap: calc(var(--u)*1.8); }
.app-shell .sb-widgets { display: grid; grid-template-columns: repeat(auto-fill, minmax(calc(var(--u)*24), 1fr)); grid-auto-rows: minmax(calc(var(--u)*17), auto); gap: calc(var(--u)*1.8); }

/* ---------- Edit in place ---------- */
.app-shell .sb-nav__rooms { display: flex; flex-direction: column; gap: calc(var(--u)*.5); }
/* Rooms can still be opened while editing, to arrange their devices. */
.app-shell .sb-nav__rooms.hd-grid--editing .hd-item > :first-child { pointer-events: auto; }
.app-shell .sb-nav__rooms.hd-grid--editing .hd-item { animation: none; outline: 1px dashed rgba(255,255,255,.22); outline-offset: -1px; border-radius: calc(var(--u)*1.8*var(--hd-r,1)); }
.app-shell .sb-nav__rooms.hd-grid--editing .hd-item__badge--remove { top: 50%; left: auto; right: calc(var(--u)*.8); transform: translateY(-50%); }
.app-shell .sb-nav__rooms.hd-grid--editing button i { display: none; }
.app-shell .sb-nav .hd-hidden-tray, .app-shell .fc-page .hd-hidden-tray { margin-top: calc(var(--u)*1); }
.app-shell .ls-groups > .hd-item { break-inside: avoid; margin-bottom: calc(var(--u)*2); }
.app-shell .ls-groups > .hd-item > .ls-group { margin: 0; }
/* Sections stay still and open while editing; their rows jiggle and drag on their own. */
.app-shell .ls-groups.hd-grid--editing > .hd-item { animation: none; }
/* Editing keeps the same columns as the list itself, so sections stay where they are. A badge
   sticking out above a section makes the column flow put every section in the first column, so the
   section's badge is placed on its top edge and only moved up visually (translate does not count). */
.app-shell .ls-groups.hd-grid--editing > .hd-item > .hd-item__badge--remove { top: 0; translate: 0 -50%; }
.app-shell .ls-groups.hd-grid--editing > .hd-item > :first-child { pointer-events: auto; }
.app-shell .ls-groups.hd-grid--editing .ls-group { overflow: visible; outline: 1px dashed rgba(255,255,255,.28); outline-offset: 2px; }
.app-shell .ls-group__toggle:disabled { cursor: inherit; opacity: 1; }
.app-shell .ls-group__grip, .app-shell .ls-row__grip { display: grid; place-items: center; color: var(--ink-3); }
.app-shell .ls-group__grip svg circle, .app-shell .ls-row__grip svg circle { fill: currentColor; stroke: none; }
.app-shell .ls-rows > .hd-item { border-radius: 0; }
.app-shell .ls-rows > .hd-item + .hd-item { border-top: 1px solid rgba(255,255,255,.07); }
.app-shell .ls-rows.hd-grid--editing .hd-item { animation: none; }
.app-shell .ls-rows.hd-grid--editing .hd-item__badge--remove { top: 50%; left: calc(var(--u)*.6); transform: translateY(-50%); }
.app-shell .ls-rows.hd-grid--editing .ls-row { padding-left: calc(var(--u)*5.4); }
.app-shell .ls-rows .hd-add-tile { width: 100%; min-height: calc(var(--u)*6.4); flex-direction: row; justify-content: flex-start; gap: calc(var(--u)*1.4); padding: calc(var(--u)*1) calc(var(--u)*1.6); border-radius: 0; border: 0; border-top: 1px solid rgba(255,255,255,.07); }
.app-shell .ls-rows .hd-add-tile span { width: calc(var(--u)*4.2); height: calc(var(--u)*4.2); }
.app-shell .ls-group .hd-hidden-tray { padding: calc(var(--u)*1.2) calc(var(--u)*1.6) calc(var(--u)*1.6); margin: 0; border-top: 1px solid rgba(255,255,255,.07); }
.app-shell .fc-chips .hd-item, .app-shell .fc-rooms .hd-item, .app-shell .scene-strip .hd-item { border-radius: var(--hd-pill,99px); }
.app-shell .scene-strip .hd-add-tile { min-height: 0; flex-direction: row; gap: calc(var(--u)*.9); padding: calc(var(--u)*.7) calc(var(--u)*2) calc(var(--u)*.7) calc(var(--u)*.7); border-radius: var(--hd-pill,99px); }
.app-shell .scene-strip .hd-add-tile span { width: calc(var(--u)*3.4); height: calc(var(--u)*3.4); }
.app-shell .fc-chips .hd-add-tile { min-height: calc(var(--u)*7.4); flex-direction: row; gap: calc(var(--u)*1.2); padding: calc(var(--u)*1) calc(var(--u)*2.4) calc(var(--u)*1) calc(var(--u)*1); border-radius: var(--hd-pill,99px); }

/* ---------- Lista ---------- */
.app-shell .ls-layout { gap: calc(var(--u)*2.4); }
.app-shell .ls-row__remove { flex: none; display: grid; place-items: center; width: calc(var(--u)*3.6); height: calc(var(--u)*3.6); min-width: 26px; min-height: 26px; margin-left: auto; padding: 0; border: 0; border-radius: 50%; background: #d9534f; color: #fff; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,.3); }
.app-shell .ls-groups { columns: 2 calc(var(--u)*46); column-gap: calc(var(--u)*2); }
.app-shell .ls-groups--single { columns: 1; }
.app-shell .ls-group {
  break-inside: avoid; margin: 0 0 calc(var(--u)*2); border-radius: calc(var(--u)*3*var(--hd-r,1)); overflow: hidden;
  background: rgba(255,255,255,.1); border: 1px solid var(--hd-frame,var(--line)); backdrop-filter: blur(var(--hd-blur,22px)) saturate(1.3); -webkit-backdrop-filter: blur(var(--hd-blur,22px)) saturate(1.3);
}
.app-shell .ls-group__head { display: flex; align-items: center; gap: calc(var(--u)*1.2); padding: calc(var(--u)*1.2) calc(var(--u)*1.8) calc(var(--u)*1.2) calc(var(--u)*1.2); }
.app-shell .ls-group__toggle { flex: 1; min-width: 0; display: flex; align-items: center; gap: calc(var(--u)*1.4); border: 0; padding: calc(var(--u)*.4); background: none; color: var(--ink); text-align: left; cursor: pointer; }
.app-shell .ls-group__icon { width: calc(var(--u)*4.6); height: calc(var(--u)*4.6); flex: none; border-radius: var(--hd-round,50%); display: grid; place-items: center; background: rgba(255,255,255,.14); }
.app-shell .ls-group--lit .ls-group__icon { background: var(--on); color: var(--on-ink); }
.app-shell .ls-group__copy { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.app-shell .ls-group__copy b { font: 600 calc(var(--u)*2.1)/1.2 var(--f-body); }
.app-shell .ls-group__copy small { color: var(--ink-2); font: 500 calc(var(--u)*1.6)/1.2 var(--f-body); }
.app-shell .ls-chevron { margin-left: auto; color: var(--ink-3); transition: transform .2s; }
.app-shell .ls-chevron--open { transform: rotate(90deg); }
.app-shell .ls-rows { border-top: 1px solid rgba(255,255,255,.1); }
.app-shell .ls-row {
  display: flex; align-items: center; gap: calc(var(--u)*1.5); min-height: calc(var(--u)*7); padding: calc(var(--u)*1) calc(var(--u)*1.8) calc(var(--u)*1) calc(var(--u)*1.6);
  cursor: pointer; user-select: none; -webkit-user-select: none; -webkit-tap-highlight-color: transparent; transition: background .15s;
}
.app-shell .ls-rows > .ls-row + .ls-row { border-top: 1px solid rgba(255,255,255,.07); }
.app-shell .ls-row:active { background: rgba(255,255,255,.08); }
.app-shell .ls-row--off { opacity: .45; }
.app-shell .ls-row__icon { width: calc(var(--u)*4.2); height: calc(var(--u)*4.2); flex: none; border-radius: var(--hd-round,50%); display: grid; place-items: center; background: rgba(255,255,255,.12); transition: background .2s, color .2s; }
.app-shell .ls-row--on .ls-row__icon { background: var(--on); color: var(--on-ink); }
.app-shell .ls-row__copy { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.app-shell .ls-row__copy b { font: 600 calc(var(--u)*1.9)/1.2 var(--f-body); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.app-shell .ls-row__copy small { color: var(--ink-2); font: 500 calc(var(--u)*1.6)/1.2 var(--f-body); overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow-wrap: anywhere; }
.app-shell .ls-row__more { color: var(--ink-3); }
.app-shell .ls-switch { position: relative; flex: none; width: calc(var(--u)*5.8); height: calc(var(--u)*3.4); border: 0; padding: 0; border-radius: var(--hd-pill,99px); background: rgba(255,255,255,.22); cursor: pointer; transition: background .2s; }
.app-shell .ls-switch i { position: absolute; top: 3px; left: 3px; width: calc(var(--u)*3.4 - 6px); height: calc(var(--u)*3.4 - 6px); border-radius: var(--hd-round,50%); background: #fff; box-shadow: 0 1px 4px rgba(0,0,0,.3); transition: transform .2s; }
.app-shell .ls-switch--on { background: var(--on); }
.app-shell .ls-switch--on i { transform: translateX(calc(var(--u)*2.4)); }
.app-shell .ls-empty { margin: 0; padding: calc(var(--u)*2); color: var(--ink-2); text-align: center; }
.app-shell .ls-strip { display: flex; gap: calc(var(--u)*1); overflow-x: auto; scrollbar-width: none; padding-bottom: 2px; }
.app-shell .ls-strip::-webkit-scrollbar { display: none; }
.app-shell .ls-strip button { flex: none; display: inline-flex; align-items: center; gap: calc(var(--u)*.8); padding: calc(var(--u)*1) calc(var(--u)*1.8); border-radius: var(--hd-pill,99px); border: 1px solid var(--hd-frame,var(--line)); background: var(--glass); color: var(--ink-2); font: 600 calc(var(--u)*1.75)/1.2 var(--f-body); cursor: pointer; white-space: nowrap; }
.app-shell .ls-strip button[aria-selected="true"] { background: rgba(255,255,255,.92); color: #1d1a17; border-color: transparent; }

/* ---------- Foco ---------- */
.app-shell.view-focus > .screen.fc-layout { padding: 0; gap: 0; min-height: 100vh; }
.app-shell .fc-tools { position: fixed; z-index: 6; top: calc(var(--u)*3 + env(safe-area-inset-top, 0px)); right: calc(var(--u)*3); display: flex; gap: calc(var(--u)*1); }
.app-shell .fc-track { display: flex; height: 100vh; overflow-x: auto; overflow-y: hidden; scroll-snap-type: x mandatory; overscroll-behavior-x: contain; scrollbar-width: none; }
.app-shell .fc-track::-webkit-scrollbar { display: none; }
.app-shell .fc-page {
  position: relative; flex: 0 0 100%; height: 100%; scroll-snap-align: start; overflow-y: auto; scrollbar-width: none;
  display: flex; flex-direction: column; justify-content: center; gap: calc(var(--u)*3);
  padding: calc(var(--u)*9) calc(var(--u)*7) calc(var(--u)*20);
}
.app-shell .fc-page--lit { background: radial-gradient(circle at 82% 28%, color-mix(in srgb, var(--on) 26%, transparent), transparent 58%); }
.app-shell .fc-page .eyebrow { font-size: calc(var(--u)*1.8); }
.app-shell .fc-clock { font: 200 min(22vw, 30vh)/.86 var(--f-display); letter-spacing: -.03em; font-variant-numeric: tabular-nums; }
.app-shell .fc-summary { display: flex; flex-wrap: wrap; align-items: center; gap: calc(var(--u)*1.2) calc(var(--u)*3); margin: 0; color: var(--ink-2); font: 500 calc(var(--u)*2.6)/1.3 var(--f-body); }
.app-shell .fc-rooms { display: flex; flex-wrap: wrap; gap: calc(var(--u)*1.2); max-width: 100%; }
.app-shell .fc-room, .app-shell .fc-chip {
  display: inline-flex; align-items: center; gap: calc(var(--u)*1.2); border-radius: var(--hd-pill,99px); cursor: pointer; color: var(--ink);
  border: 1px solid var(--hd-frame,var(--line)); background: var(--glass); backdrop-filter: blur(var(--hd-blur,22px)); -webkit-backdrop-filter: blur(var(--hd-blur,22px));
  -webkit-tap-highlight-color: transparent; user-select: none; -webkit-user-select: none; transition: background .2s, color .2s, transform .15s;
}
.app-shell .fc-room { padding: calc(var(--u)*1.2) calc(var(--u)*2.2); font: 600 calc(var(--u)*2)/1.2 var(--f-body); }
.app-shell .fc-room i { min-width: calc(var(--u)*2.6); height: calc(var(--u)*2.6); padding: 0 calc(var(--u)*.7); border-radius: var(--hd-pill,99px); display: grid; place-items: center; background: var(--on); color: var(--on-ink); font: 700 calc(var(--u)*1.4)/1 var(--f-body); font-style: normal; }
.app-shell .fc-room--lit { background: var(--paper); color: var(--paper-ink); border-color: transparent; }
.app-shell .fc-hero { display: flex; align-items: flex-end; justify-content: space-between; gap: calc(var(--u)*4); }
.app-shell .fc-hero__copy h1 { margin: 0; font: 300 min(6.6vw, 10vh)/1 var(--f-display); letter-spacing: -.02em; overflow-wrap: anywhere; }
.app-shell .fc-hero__copy p { margin: calc(var(--u)*1.4) 0 0; color: var(--ink-2); font: 500 calc(var(--u)*2.6)/1.2 var(--f-body); }
.app-shell .fc-power {
  flex: none; width: min(26vw, calc(var(--u)*16)); aspect-ratio: 1; border-radius: var(--hd-round,50%); display: grid; place-items: center; cursor: pointer;
  border: 1px solid var(--hd-frame,var(--line)); background: var(--glass); color: var(--ink); backdrop-filter: blur(var(--hd-blur,22px)); -webkit-backdrop-filter: blur(var(--hd-blur,22px)); transition: background .25s, box-shadow .25s, color .25s;
}
.app-shell .fc-power[aria-pressed="true"] { background: var(--on); color: var(--on-ink); border-color: transparent; box-shadow: 0 0 calc(var(--u)*8) color-mix(in srgb, var(--on) 55%, transparent); }
.app-shell .fc-chips { display: flex; flex-wrap: wrap; gap: calc(var(--u)*1.4); }
.app-shell .fc-chip { min-height: calc(var(--u)*7.4); padding: calc(var(--u)*1) calc(var(--u)*2.4) calc(var(--u)*1) calc(var(--u)*1); text-align: left; }
.app-shell .fc-chip:active { transform: scale(.97); }
.app-shell .fc-chip__icon { width: calc(var(--u)*5.2); height: calc(var(--u)*5.2); flex: none; border-radius: var(--hd-round,50%); display: grid; place-items: center; background: rgba(255,255,255,.14); }
.app-shell .fc-chip__copy { display: flex; flex-direction: column; gap: 2px; }
.app-shell .fc-chip__copy b { font: 600 calc(var(--u)*2)/1.15 var(--f-body); }
.app-shell .fc-chip__copy small { color: var(--ink-2); font: 500 calc(var(--u)*1.6)/1.2 var(--f-body); }
.app-shell .fc-chip--on { background: var(--paper); color: var(--paper-ink); border-color: transparent; }
.app-shell .fc-chip--on .fc-chip__icon { background: var(--on); color: var(--on-ink); }
.app-shell .fc-chip--on .fc-chip__copy small { color: var(--paper-ink-2); }
.app-shell .fc-pager {
  position: fixed; z-index: 6; left: 50%; transform: translateX(-50%); bottom: calc(var(--dock-bottom) + var(--dock-height) + var(--u)*1.6);
  display: flex; align-items: center; gap: calc(var(--u)*1.6); padding: calc(var(--u)*.6); border-radius: var(--hd-pill,99px);
  background: rgba(0,0,0,.18); backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px);
}
.app-shell .fc-pager button { width: calc(var(--u)*4.6); height: calc(var(--u)*4.6); border: 0; border-radius: var(--hd-round,50%); display: grid; place-items: center; background: rgba(255,255,255,.14); color: var(--ink); cursor: pointer; }
.app-shell .fc-pager button:disabled { opacity: .3; cursor: default; }
.app-shell .fc-dots { display: flex; align-items: center; gap: 6px; }
.app-shell .fc-dots i { width: 8px; height: 8px; border-radius: var(--hd-pill,99px); background: rgba(255,255,255,.35); cursor: pointer; transition: width .25s, background .25s; }
.app-shell .fc-dots i.fc-dot--on { width: 24px; background: #fff; }

@media (max-width: 720px) {
  .app-shell.view-sidebar > .screen.sb-layout { grid-template-columns: minmax(0, 1fr); padding: calc(var(--u)*2.4) calc(var(--u)*2.4) calc(var(--u)*6); }
  .app-shell .sb-side { position: static; max-height: none; }
  .app-shell.view-sidebar > .screen.sb-layout { grid-template-areas: "status" "side" "main"; grid-template-rows: auto; }
  .app-shell .sb-nav { flex-direction: row; overflow-x: auto; scrollbar-width: none; }
  .app-shell .sb-nav__rooms { flex-direction: row; }
  .app-shell .sb-nav__rooms > .hd-item { flex: none; }
  .app-shell .sb-nav > button , .app-shell .sb-nav .hd-item > button:first-child { width: auto; flex: none; }
  .app-shell .sb-grid, .app-shell .sb-widgets { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .app-shell .ls-groups { columns: 1; }
  .app-shell .fc-page { padding: calc(var(--u)*10) calc(var(--u)*3) calc(var(--u)*24); }
  .app-shell .fc-hero { flex-direction: column; align-items: flex-start; }
  .app-shell .fc-chip { flex: 1 1 calc(50% - var(--u)*1.4); }
}
`;
