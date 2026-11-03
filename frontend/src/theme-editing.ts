// Edit mode, sheets (details and device picker) and the settings screen.
export const themeEditing = String.raw`
/* Grid items: the wrapper is the grid cell, the card fills it */
.app-shell .hd-item { position: relative; display: flex; min-width: 0; border-radius: calc(var(--u)*3.4*var(--hd-r,1)); }
.app-shell .hd-item > :first-child { flex: 1; width: 100%; min-width: 0; }
.app-shell .hd-item--wide { grid-column: span 2; }
.app-shell button.widget-card { width: 100%; font: inherit; text-align: left; cursor: pointer; }

/* Edit mode: iOS-like jiggle, remove and size badges */
@keyframes hd-jiggle { 0% { transform: rotate(-.8deg); } 50% { transform: rotate(.8deg); } 100% { transform: rotate(-.8deg); } }
.app-shell .hd-grid--editing .hd-item { animation: hd-jiggle .34s ease-in-out infinite; cursor: grab; touch-action: pan-y; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; }
.app-shell .hd-grid--editing .hd-item > :first-child { pointer-events: none; }
/* The item sits below its badges: Safari otherwise paints a blurred (backdrop-filter) pill or card
   over the badge that should be on top of it. */
.app-shell .hd-grid--editing .hd-item > :first-child { position: relative; z-index: 0; }
.app-shell .hd-grid--editing .hd-item--dragging { animation: none; z-index: 30; cursor: grabbing; filter: drop-shadow(0 calc(var(--u)*2) calc(var(--u)*3) rgba(0,0,0,.45)); }
@media (prefers-reduced-motion: reduce) { .app-shell .hd-grid--editing .hd-item { animation: none; outline: 1px dashed rgba(255,255,255,.35); outline-offset: 3px; } }
.app-shell .hd-item__badge {
  position: absolute; z-index: 6; width: calc(var(--u)*3.8); height: calc(var(--u)*3.8); min-width: 26px; min-height: 26px;
  border-radius: var(--hd-round,50%); border: 0; padding: 0; display: grid; place-items: center; cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,.35); animation: hd-pop .18s ease-out;
}
.app-shell .hd-item__badge--remove { top: calc(var(--u)*-1); left: calc(var(--u)*-1); background: #d9534f; color: #fff; }
.app-shell .hd-item__badge--size { bottom: calc(var(--u)*-1); right: calc(var(--u)*-1); background: rgba(255,255,255,.95); color: #1d1a17; }
@keyframes hd-pop { from { transform: scale(.4); opacity: 0; } }
.app-shell .hd-add-tile {
  min-height: calc(var(--u)*18); border-radius: calc(var(--u)*3.4*var(--hd-r,1)); border: 1.5px dashed rgba(255,255,255,.35); background: rgba(255,255,255,.05);
  color: var(--ink-2); font: 600 calc(var(--u)*1.9)/1.2 var(--f-body); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: calc(var(--u)*1); cursor: pointer;
}
.app-shell .hd-add-tile span { width: calc(var(--u)*5.4); height: calc(var(--u)*5.4); border-radius: var(--hd-round,50%); display: grid; place-items: center; background: rgba(255,255,255,.14); color: var(--ink); }
.app-shell .hd-hidden-tray { display: flex; flex-direction: column; gap: calc(var(--u)*1.2); margin-top: calc(var(--u)*.6); }
.app-shell .hd-hidden-tray > div { display: flex; flex-wrap: wrap; gap: calc(var(--u)*1); }
.app-shell .hd-hidden-tray button, .app-shell .hd-pill {
  display: inline-flex; align-items: center; gap: calc(var(--u)*.8); border-radius: var(--hd-pill,99px); border: 1px solid var(--line); background: var(--glass);
  backdrop-filter: blur(var(--hd-blur,22px)); -webkit-backdrop-filter: blur(var(--hd-blur,22px)); color: var(--ink); padding: calc(var(--u)*1) calc(var(--u)*2); font: 600 calc(var(--u)*1.75)/1.2 var(--f-body); cursor: pointer; white-space: nowrap;
}
.app-shell .hd-pill--solid { background: rgba(255,255,255,.92); color: #1d1a17; border-color: transparent; }
.app-shell .edit-hint { margin: calc(var(--u)*-1) 0 0; color: var(--ink-2); font: 500 calc(var(--u)*1.75)/1.35 var(--f-body); }
.app-shell .edit-toggle {
  display: inline-flex; align-items: center; gap: calc(var(--u)*.8); height: calc(var(--u)*5.4); padding: 0 calc(var(--u)*2); border-radius: var(--hd-pill,99px);
  border: 1px solid var(--line); background: var(--glass); backdrop-filter: blur(var(--hd-blur,22px)); -webkit-backdrop-filter: blur(var(--hd-blur,22px)); color: var(--ink); font: 600 calc(var(--u)*1.8)/1 var(--f-body); cursor: pointer;
}
.app-shell .edit-toggle--on { background: rgba(255,255,255,.92); color: #1d1a17; border-color: transparent; }
.app-shell .empty-state .hd-pill { margin-top: calc(var(--u)*1.6); }

/* Sheets: device details and pickers */
.app-shell .hd-sheet-backdrop {
  position: fixed; inset: 0; z-index: 50; display: grid; place-items: center; padding: calc(var(--u)*3);
  background: rgba(8,6,10,.5); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); animation: hd-fade .2s ease;
}
@keyframes hd-fade { from { opacity: 0; } }
/* The screen is its own stacking context, so the dock would float over sheets. */
.app-shell:has(.hd-sheet-backdrop) .navigation-dock { visibility: hidden; }
@keyframes hd-rise { from { opacity: 0; transform: translateY(12px) scale(.98); } }
.app-shell .hd-sheet {
  width: min(100%, calc(var(--u)*58)); max-height: min(88vh, 760px); overflow: auto; display: flex; flex-direction: column; gap: calc(var(--u)*2.4);
  padding: calc(var(--u)*3); border-radius: calc(var(--u)*5*var(--hd-r,1)); color: var(--ink);
  background: rgba(30,26,24,.74); border: 1px solid var(--line); backdrop-filter: blur(30px) saturate(1.3); -webkit-backdrop-filter: blur(30px) saturate(1.3);
  box-shadow: 0 calc(var(--u)*3) calc(var(--u)*8) rgba(0,0,0,.45); animation: hd-rise .28s cubic-bezier(.2,.8,.2,1);
}
.app-shell .hd-sheet > * { flex-shrink: 0; }
.app-shell .hd-detail--busy { cursor: progress; }
.app-shell .hd-detail__header { display: flex; align-items: center; gap: calc(var(--u)*1.8); }
.app-shell .hd-detail__header > div { flex: 1; min-width: 0; }
.app-shell .hd-detail__header h2 { margin: calc(var(--u)*.3) 0 0; font: 500 calc(var(--u)*3)/1.15 var(--f-display); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.app-shell .hd-detail__header p { margin: calc(var(--u)*.4) 0 0; color: var(--ink-2); font: 500 calc(var(--u)*1.8)/1.3 var(--f-body); }
.app-shell .hd-detail__icon { width: calc(var(--u)*6.4); height: calc(var(--u)*6.4); border-radius: var(--hd-round,50%); flex: none; display: grid; place-items: center; background: rgba(255,255,255,.14); }
.app-shell .hd-detail__icon--on { background: var(--on); color: var(--on-ink, #2a2110); }
.app-shell .hd-detail__x, .app-shell .st-icon-button { width: calc(var(--u)*4.8); height: calc(var(--u)*4.8); flex: none; border-radius: var(--hd-round,50%); border: 0; display: grid; place-items: center; background: rgba(255,255,255,.12); color: var(--ink); cursor: pointer; }
.app-shell .hd-detail__body { display: flex; flex-direction: column; gap: calc(var(--u)*2); }
.app-shell .hd-detail__meta { margin: 0; color: var(--ink-2); font: 500 calc(var(--u)*1.9)/1.3 var(--f-body); text-align: center; }
.app-shell .hd-detail__reading { display: flex; flex-direction: column; align-items: center; gap: calc(var(--u)*.8); padding: calc(var(--u)*2) 0; }
.app-shell .hd-detail__reading strong { font: 300 calc(var(--u)*6)/1 var(--f-display); }
.app-shell .hd-detail__reading small { color: var(--ink-3); font: 500 calc(var(--u)*1.6)/1 var(--f-body); }
.app-shell .hd-detail__primary {
  display: flex; align-items: center; justify-content: center; gap: calc(var(--u)*1); width: 100%; height: calc(var(--u)*6.4); border: 0; border-radius: var(--hd-pill,99px);
  background: rgba(255,255,255,.92); color: #1d1a17; font: 600 calc(var(--u)*2)/1 var(--f-body); cursor: pointer;
}
.app-shell .hd-detail__primary--off { background: var(--on); color: var(--on-ink, #2a2110); }
.app-shell .hd-slider { display: flex; flex-direction: column; gap: calc(var(--u)*1); }
.app-shell .hd-slider__label { display: flex; justify-content: space-between; font: 600 calc(var(--u)*1.8)/1 var(--f-body); }
.app-shell .hd-slider__label i { font-style: normal; color: var(--ink-2); font-variant-numeric: tabular-nums; }
.app-shell .hd-slider__track { position: relative; display: block; height: calc(var(--u)*7); border-radius: calc(var(--u)*2.4*var(--hd-r,1)); overflow: hidden; background: rgba(255,255,255,.14); }
.app-shell .hd-slider__track b { position: absolute; left: 0; top: 0; bottom: 0; width: max(var(--value, 0%), calc(var(--u)*7)); border-radius: inherit; background: var(--on); pointer-events: none; }
.app-shell .hd-slider__track b::after { content: ""; position: absolute; right: calc(var(--u)*1.6); top: 28%; bottom: 28%; width: 4px; border-radius: calc(4px*var(--hd-r,1)); background: rgba(43,36,24,.55); }
.app-shell .hd-slider--off .hd-slider__track b { display: none; }
.app-shell .hd-slider__track input { position: absolute; inset: 0; width: 100%; height: 100%; margin: 0; opacity: 0; cursor: ew-resize; touch-action: pan-y; }
.app-shell .hd-slider__track:has(input:focus-visible) { outline: 2px solid currentColor; outline-offset: 2px; }
.app-shell .hd-swatches { display: flex; flex-wrap: wrap; justify-content: center; gap: calc(var(--u)*1.2); }
.app-shell .hd-swatches button { width: calc(var(--u)*4.6); height: calc(var(--u)*4.6); border-radius: var(--hd-round,50%); border: 2px solid rgba(255,255,255,.25); cursor: pointer; }
.app-shell .hd-segment { display: flex; padding: calc(var(--u)*.5); border-radius: var(--hd-pill,99px); background: rgba(0,0,0,.22); gap: calc(var(--u)*.4); }
.app-shell .hd-segment button { flex: 1; border: 0; border-radius: var(--hd-pill,99px); padding: calc(var(--u)*1.2) calc(var(--u)*1); background: none; color: var(--ink-2); font: 600 calc(var(--u)*1.75)/1 var(--f-body); cursor: pointer; }
.app-shell .hd-segment button[aria-pressed="true"] { background: rgba(255,255,255,.92); color: #1d1a17; }
.app-shell .hd-stepper { display: flex; align-items: center; justify-content: space-between; gap: calc(var(--u)*2); }
.app-shell .hd-stepper > span { display: flex; flex-direction: column; align-items: center; gap: calc(var(--u)*.6); }
.app-shell .hd-stepper small { color: var(--ink-3); font: 600 calc(var(--u)*1.5)/1 var(--f-body); letter-spacing: .08em; text-transform: uppercase; }
.app-shell .hd-stepper strong { font: 300 calc(var(--u)*7.4)/1 var(--f-display); font-variant-numeric: tabular-nums; }
.app-shell .hd-stepper button, .app-shell .hd-transport button { width: calc(var(--u)*7); height: calc(var(--u)*7); border-radius: var(--hd-round,50%); border: 0; display: grid; place-items: center; background: rgba(255,255,255,.14); color: var(--ink); cursor: pointer; }
.app-shell .hd-transport { display: flex; justify-content: center; align-items: center; gap: calc(var(--u)*2.4); }
.app-shell .hd-transport .hd-transport__play { width: calc(var(--u)*8.4); height: calc(var(--u)*8.4); background: rgba(255,255,255,.92); color: #1d1a17; }

/* Device picker */
.app-shell .hd-sheet__header { display: flex; align-items: flex-end; justify-content: space-between; gap: calc(var(--u)*2); }
.app-shell .hd-sheet__header h2 { margin: calc(var(--u)*.4) 0 0; font: 400 calc(var(--u)*3.2)/1.1 var(--f-display); }
.app-shell .hd-sheet__close { border: 0; border-radius: var(--hd-pill,99px); padding: calc(var(--u)*1) calc(var(--u)*2.2); background: rgba(255,255,255,.92); color: #1d1a17; font: 600 calc(var(--u)*1.8)/1.2 var(--f-body); cursor: pointer; }
.app-shell .hd-search { display: flex; align-items: center; gap: calc(var(--u)*1.2); padding: 0 calc(var(--u)*1.8); height: calc(var(--u)*5.6); border-radius: var(--hd-pill,99px); background: rgba(255,255,255,.1); border: 1px solid var(--line); color: var(--ink-2); }
.app-shell .hd-search input { flex: 1; min-width: 0; border: 0; outline: 0; background: none; color: var(--ink); font: 500 calc(var(--u)*1.9)/1 var(--f-body); }
.app-shell .hd-picker__list { display: flex; flex-direction: column; gap: calc(var(--u)*2); }
.app-shell .hd-picker__list section { display: flex; flex-direction: column; gap: calc(var(--u)*.6); }
.app-shell .hd-picker__row { display: flex; align-items: center; gap: calc(var(--u)*1.4); width: 100%; padding: calc(var(--u)*1) calc(var(--u)*1.2); border: 0; border-radius: calc(var(--u)*2*var(--hd-r,1)); background: none; color: var(--ink); text-align: left; cursor: pointer; }
.app-shell .hd-picker__row:hover { background: rgba(255,255,255,.06); }
.app-shell .hd-picker__icon { width: calc(var(--u)*4.2); height: calc(var(--u)*4.2); border-radius: var(--hd-round,50%); display: grid; place-items: center; background: rgba(255,255,255,.12); flex: none; }
.app-shell .hd-picker__row--on .hd-picker__icon { background: var(--on); color: var(--on-ink, #2a2110); }
.app-shell .hd-picker__copy { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.app-shell .hd-picker__copy strong { font: 600 calc(var(--u)*1.9)/1.2 var(--f-body); }
.app-shell .hd-picker__copy small { color: var(--ink-3); font: 500 calc(var(--u)*1.55)/1.2 var(--f-body); }
.app-shell .hd-picker__check { width: calc(var(--u)*3.2); height: calc(var(--u)*3.2); border-radius: var(--hd-round,50%); display: grid; place-items: center; border: 1.5px solid rgba(255,255,255,.35); }
.app-shell .hd-picker__row--on .hd-picker__check { background: rgba(255,255,255,.92); color: #1d1a17; border-color: transparent; }
.app-shell .hd-picker__empty { color: var(--ink-2); text-align: center; }

/* Settings, in the same layout as the rooms screen */
.app-shell .settings-v2 { gap: calc(var(--u)*3.4); }
.app-shell .st-header { display: flex; justify-content: space-between; align-items: flex-end; gap: calc(var(--u)*2); flex-wrap: wrap; }
.app-shell .st-header h1 { margin: calc(var(--u)*.6) 0 0; font: 300 calc(var(--u)*5)/1.05 var(--f-display); }
.app-shell .st-header p { margin: calc(var(--u)*.8) 0 0; color: var(--ink-2); font: 500 calc(var(--u)*1.8)/1.35 var(--f-body); max-width: 60ch; }
.app-shell .st-header__actions { display: flex; align-items: center; gap: calc(var(--u)*1); flex-wrap: wrap; }
.app-shell .st-dirty { color: var(--on); font: 600 calc(var(--u)*1.6)/1 var(--f-body); margin-right: calc(var(--u)*.6); }
.app-shell .st-content { min-width: 0; display: flex; flex-direction: column; gap: calc(var(--u)*1.8); }
.app-shell .st-panel {
  display: flex; flex-direction: column; gap: calc(var(--u)*1.4); padding: calc(var(--u)*2.6); border-radius: calc(var(--u)*3.4*var(--hd-r,1));
  background: var(--glass); border: 1px solid var(--line); backdrop-filter: blur(var(--hd-blur,22px)) saturate(1.3); -webkit-backdrop-filter: blur(var(--hd-blur,22px)) saturate(1.3);
}
.app-shell .st-panel h2 { margin: 0; font: 600 calc(var(--u)*2.2)/1.2 var(--f-body); }
.app-shell .st-panel > p { margin: calc(var(--u)*-.8) 0 calc(var(--u)*.4); color: var(--ink-2); font: 500 calc(var(--u)*1.7)/1.35 var(--f-body); }
.app-shell .st-row { display: flex; align-items: center; justify-content: space-between; gap: calc(var(--u)*2); min-height: calc(var(--u)*6); padding-top: calc(var(--u)*1.2); border-top: 1px solid rgba(255,255,255,.1); }
.app-shell .st-row > span { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.app-shell .st-row b { font: 600 calc(var(--u)*1.9)/1.25 var(--f-body); }
.app-shell .st-row small { color: var(--ink-2); font: 500 calc(var(--u)*1.6)/1.3 var(--f-body); }
.app-shell .st-row .hd-select { min-width: min(48%, 260px); }
/* An option with its own choices inside: the choices sit in a panel under its switch. */
.app-shell .st-group { display: flex; flex-direction: column; }
.app-shell .st-sub { display: flex; flex-direction: column; margin: calc(var(--u)*.4) 0 calc(var(--u)*1.2); padding: calc(var(--u)*.6) calc(var(--u)*1.6); border-radius: calc(var(--u)*2*var(--hd-r,1)); background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.08); }
.app-shell .st-sub__title { padding: calc(var(--u)*1) 0 calc(var(--u)*.4); color: var(--ink-3); font: 700 calc(var(--u)*1.35)/1 var(--f-body); letter-spacing: .12em; text-transform: uppercase; }
.app-shell .st-sub__row { display: flex; align-items: center; justify-content: space-between; gap: calc(var(--u)*2); min-height: calc(var(--u)*5.4); color: var(--ink); font: 600 calc(var(--u)*1.75)/1.25 var(--f-body); cursor: pointer; }
.app-shell .st-sub__row + .st-sub__row { border-top: 1px solid rgba(255,255,255,.07); }
.app-shell .st-sub__row > span { min-width: 0; overflow: hidden; text-overflow: ellipsis; }
.app-shell .st-sub__row .hdx-select { width: auto; min-width: min(55%, 260px); }
.app-shell .st-value { color: var(--ink-2); font: 500 calc(var(--u)*1.8)/1 var(--f-body); }
.app-shell .st-cards__body { position: relative; }
.app-shell .st-cards fieldset { margin: 0; padding: 0; border: 0; min-width: 0; display: flex; flex-direction: column; gap: calc(var(--u)*1.2); }
.app-shell .st-cards--locked fieldset > .st-row { opacity: .45; }
.app-shell .st-cards__lock { position: absolute; inset: 0; z-index: 1; border: 0; padding: 0; background: none; cursor: pointer; }
.app-shell .st-range { flex: 1; max-width: 360px; display: flex; flex-direction: column; gap: 4px; }
.app-shell .st-range input { -webkit-appearance: none; appearance: none; width: 100%; height: calc(var(--u)*3.2); margin: 0; border-radius: var(--hd-pill,99px); cursor: pointer; touch-action: pan-y; background: linear-gradient(90deg, var(--on) var(--value), rgba(255,255,255,.18) var(--value)); }
.app-shell .st-range input::-webkit-slider-thumb { -webkit-appearance: none; width: calc(var(--u)*3.2); height: calc(var(--u)*3.2); border-radius: var(--hd-round,50%); background: #fff; box-shadow: 0 1px 6px rgba(0,0,0,.35); }
.app-shell .st-range input::-moz-range-thumb { width: calc(var(--u)*3.2); height: calc(var(--u)*3.2); border: 0; border-radius: var(--hd-round,50%); background: #fff; box-shadow: 0 1px 6px rgba(0,0,0,.35); }
.app-shell .st-range span { display: flex; justify-content: space-between; color: var(--ink-3); }
.app-shell .st-switch { -webkit-appearance: none; appearance: none; position: relative; flex: none; width: calc(var(--u)*6.2); height: calc(var(--u)*3.6); margin: 0; border-radius: var(--hd-pill,99px); background: rgba(255,255,255,.2); cursor: pointer; transition: background .2s; }
.app-shell .st-switch::before { content: ""; position: absolute; top: 3px; left: 3px; width: calc(var(--u)*3.6 - 6px); height: calc(var(--u)*3.6 - 6px); border-radius: var(--hd-round,50%); background: #fff; box-shadow: 0 1px 4px rgba(0,0,0,.3); transition: transform .2s; }
.app-shell .st-switch:checked { background: var(--ok); }
.app-shell .st-switch:checked::before { transform: translateX(calc(var(--u)*2.6)); }
.app-shell .st-swatches { display: flex; flex-wrap: wrap; gap: calc(var(--u)*1.2); }
.app-shell .st-swatches button { width: calc(var(--u)*5.4); height: calc(var(--u)*5.4); border-radius: var(--hd-round,50%); border: 2px solid transparent; display: grid; place-items: center; color: #2b2418; cursor: pointer; box-shadow: inset 0 0 0 1px rgba(0,0,0,.08); }
.app-shell .st-swatches button[aria-pressed="true"] { border-color: #fff; box-shadow: 0 0 0 3px rgba(255,255,255,.25); }
.app-shell .st-backgrounds { display: grid; grid-template-columns: repeat(auto-fill, minmax(calc(var(--u)*19), 1fr)); gap: calc(var(--u)*1.4); }
.app-shell .st-backgrounds button { min-width: 0; display: flex; flex-direction: column; gap: calc(var(--u)*.5); padding: calc(var(--u)*1) calc(var(--u)*1) calc(var(--u)*1.2); border-radius: calc(var(--u)*2.4*var(--hd-r,1)); border: 1px solid var(--line); background: rgba(255,255,255,.06); color: var(--ink); text-align: left; cursor: pointer; }
.app-shell .st-backgrounds button[aria-pressed="true"] { background: rgba(255,255,255,.92); color: #1d1a17; border-color: transparent; }
.app-shell .st-backgrounds i { display: block; width: 100%; height: calc(var(--u)*8); margin-bottom: calc(var(--u)*.4); border-radius: calc(var(--u)*1.6*var(--hd-r,1)); }
.app-shell .st-backgrounds b { font: 600 calc(var(--u)*1.7)/1.2 var(--f-body); padding-left: calc(var(--u)*.4); }
.app-shell .st-backgrounds small { color: inherit; opacity: .6; font: 600 calc(var(--u)*1.35)/1.6 var(--f-body); text-transform: uppercase; letter-spacing: .08em; padding-right: calc(var(--u)*.4); }
.app-shell .st-list { display: flex; flex-direction: column; gap: calc(var(--u)*.6); }
.app-shell .st-item { display: flex; align-items: center; gap: calc(var(--u)*1.2); padding: calc(var(--u)*.6) calc(var(--u)*.8); border-radius: calc(var(--u)*2*var(--hd-r,1)); background: rgba(255,255,255,.04); }
.app-shell .st-item--on { background: rgba(255,255,255,.1); }
.app-shell .st-item--held { position: relative; z-index: 2; background: rgba(255,255,255,.2); box-shadow: 0 calc(var(--u)*1.2) calc(var(--u)*3.5) rgba(0,0,0,.35); }
.app-shell .st-grip { flex-shrink: 0; width: calc(var(--u)*4.6); height: calc(var(--u)*4.6); border-radius: calc(var(--u)*1.4*var(--hd-r,1)); display: grid; place-items: center; color: var(--ink-2); cursor: grab; touch-action: none; }
.app-shell .st-grip:hover { background: rgba(255,255,255,.08); color: var(--ink); }
.app-shell .st-item--held .st-grip { cursor: grabbing; color: var(--ink); }
.app-shell .st-grip svg circle { fill: currentColor; stroke: none; }
.app-shell .st-item__main { flex: 1; min-width: 0; display: flex; align-items: center; gap: calc(var(--u)*1.2); padding: calc(var(--u)*.8); border: 0; background: none; color: var(--ink); text-align: left; cursor: pointer; }
.app-shell .st-item__main b { font: 600 calc(var(--u)*1.85)/1.2 var(--f-body); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.app-shell .st-item__icon { width: calc(var(--u)*4.2); height: calc(var(--u)*4.2); border-radius: var(--hd-round,50%); display: grid; place-items: center; background: rgba(255,255,255,.12); flex: none; }
.app-shell .st-check { width: calc(var(--u)*3); height: calc(var(--u)*3); border-radius: var(--hd-round,50%); display: grid; place-items: center; border: 1.5px solid rgba(255,255,255,.4); flex: none; }
.app-shell .st-item--on .st-check { background: var(--ok); border-color: transparent; color: #0c2a16; }
/* A page row: the name field, and the trash button beside it */
.app-shell .st-page { display: flex; align-items: center; gap: calc(var(--u)*1); }
.app-shell .st-page > .st-item { flex: 1; min-width: 0; }
.app-shell .st-icon-button--danger:hover { background: rgba(229,72,77,.22); color: #ffb3b5; }
/* Text fields: transparent, so the row around them shows through; a soft line marks focus */
.app-shell .st-input { flex: 1; min-width: 0; height: calc(var(--u)*4.8); padding: 0 calc(var(--u)*1.2); border-radius: calc(var(--u)*1.4*var(--hd-r,1)); border: 1px solid transparent; background: transparent; color: var(--ink); font: 600 calc(var(--u)*1.85)/1 var(--f-body); outline: 0; transition: border-color .15s; }
.app-shell .st-input::placeholder { color: var(--ink-3); }
.app-shell .st-input:focus { border-color: rgba(255,255,255,.3); }
.app-shell .st-actions { display: flex; flex-wrap: wrap; gap: calc(var(--u)*1); }

@media (max-width: 720px) {
  .app-shell .context-header__right { flex-wrap: wrap; row-gap: calc(var(--u)*1.2); }
  .app-shell .weather-chip small { display: none; }
  .app-shell .presence-stack { padding-left: calc(var(--u)*1.2); }
  .app-shell .hd-item__badge { min-width: 30px; min-height: 30px; }
  .app-shell .hd-item__badge--remove { top: -8px; left: -6px; }
  .app-shell .hd-item__badge--size { bottom: -8px; right: -6px; }
  .app-shell .hd-sheet-backdrop { place-items: end center; padding: 0; }
  .app-shell .hd-sheet { width: 100%; border-radius: calc(var(--u)*4*var(--hd-r,1)) calc(var(--u)*4*var(--hd-r,1)) 0 0; padding-bottom: calc(var(--u)*3 + env(safe-area-inset-bottom, 0px)); }
  .app-shell .st-header h1 { font-size: calc(var(--u)*4.2); }
  /* Save and close stay in the top right corner, as round buttons beside the title. */
  .app-shell .st-header { position: relative; padding-right: calc(40px * 2 + var(--u)*2.2); }
  .app-shell .st-header__actions { position: absolute; top: 0; right: 0; flex-wrap: nowrap; }
  .app-shell .st-header .st-dirty { display: none; }
  .app-shell .st-header__actions .hd-pill--solid { width: 40px; height: 40px; min-height: 0; padding: 0; justify-content: center; font-size: 0; gap: 0; }
  .app-shell .st-header__actions .hd-close { width: 40px; height: 40px; }
}
`;
