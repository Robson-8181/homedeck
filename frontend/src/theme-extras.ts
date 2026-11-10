// Floating edit button, tap cards, screensaver, Spotify and the select controls.
export const themeExtras = String.raw`
/* Dock and the floating Edit button share one baseline at the bottom */
.app-shell { --dock-bottom: calc(var(--u)*2.4 + env(safe-area-inset-bottom, 0px)); --dock-height: calc(var(--u)*6.2 + 2px); }
.app-shell .navigation-dock { bottom: var(--dock-bottom); max-width: calc(100% - var(--u)*24); }
.app-shell .navigation-dock button { height: calc(var(--u)*4.6); padding-top: 0; padding-bottom: 0; }
/* Edit mode: the tabs after Home are dragged sideways to reorder them. */
.app-shell .navigation-dock--editing { touch-action: none; outline: 1.5px dashed color-mix(in srgb, var(--ink) 35%, transparent); outline-offset: calc(var(--u)*.4); }
.app-shell .navigation-dock--editing button[data-tab] { cursor: grab; background: color-mix(in srgb, var(--ink) 8%, transparent); user-select: none; -webkit-user-select: none; }
.app-shell .navigation-dock--editing button.navigation-dock__dragging { cursor: grabbing; background: var(--paper); color: var(--paper-ink); }
.app-shell .edit-fab {
  position: fixed; right: calc(var(--u)*4); bottom: var(--dock-bottom); z-index: 21; width: var(--dock-height); height: var(--dock-height);
  display: inline-flex; align-items: center; justify-content: center; padding: 0; border-radius: var(--hd-round,50%);
  border: 1px solid var(--hd-frame,var(--line)); background: var(--glass); color: var(--ink); backdrop-filter: blur(var(--hd-blur,22px)) saturate(1.3); -webkit-backdrop-filter: blur(var(--hd-blur,22px)) saturate(1.3);
  box-shadow: 0 calc(var(--u)*1.2) calc(var(--u)*4) rgba(0,0,0,.35); font: 600 calc(var(--u)*1.9)/1 var(--f-body); cursor: pointer;
}
.app-shell .edit-fab--on { background: rgba(255,255,255,.92); color: #1d1a17; border-color: transparent; }
.app-shell:has(.hd-sheet-backdrop, .hd-player, .hd-saver) .edit-fab,
.app-shell:has(.hd-player, .hd-saver) .navigation-dock { visibility: hidden; }

/* Tap cards: the whole card is the switch, press and hold opens the details */
.app-shell .device-tile--tap { cursor: pointer; -webkit-tap-highlight-color: transparent; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; }
.app-shell .device-tile--tap:active:not(:has(input:active, button:active)) { transform: scale(.98); }
.app-shell .device-tile--tap .device-tile__top { min-height: calc(var(--u)*5); }

/* Screensaver */
.app-shell .hd-saver {
  position: fixed; inset: 0; z-index: 90; display: grid; place-items: center; color: #fff; cursor: pointer;
  background: color-mix(in srgb, var(--ambient-4, #120f14) 40%, rgba(0,0,0,.3));
  backdrop-filter: blur(32px) saturate(.9) brightness(.82); -webkit-backdrop-filter: blur(32px) saturate(.9) brightness(.82);
  animation: hd-saver-in .6s ease;
}
@keyframes hd-saver-in { from { opacity: 0; } }
.app-shell .hd-saver__clock { display: flex; flex-direction: column; align-items: center; gap: min(2.4vw, 22px); transform: translateY(-4vh); text-align: center; }
.app-shell .hd-saver__time { font: 300 min(30vw, 42vh, 260px)/.82 var(--f-display); letter-spacing: -.02em; font-variant-numeric: tabular-nums; text-shadow: 0 2px 24px rgba(0,0,0,.18); }
.app-shell .hd-saver__date { font: 600 min(3.2vw, 28px)/1.2 var(--f-body); letter-spacing: .14em; text-transform: uppercase; opacity: .82; }
.app-shell .hd-saver__weather { display: flex; align-items: center; gap: 10px; font: 500 min(3vw, 24px)/1.2 var(--f-body); opacity: .8; }
.app-shell .hd-saver__hint { position: absolute; left: 0; right: 0; bottom: calc(48px + env(safe-area-inset-bottom, 0px)); text-align: center; font: 500 13px/1 var(--f-body); letter-spacing: .06em; opacity: .45; }

/* Spotify card */
/* The grid cell is the size container: a container can only restyle its descendants. */
.app-shell .hd-item:has(> .spotify-card) { container: tile / inline-size; }
.app-shell .spotify-card { flex-direction: row; align-items: center; justify-content: flex-start; gap: calc(var(--u)*2); cursor: pointer; }
/* Higher specificity than the generic top-right button of widget cards. */
.app-shell .spotify-card > .spotify-card__cover {
  position: static; inset: auto; height: auto; flex: none; width: min(42%, calc(var(--u)*14)); aspect-ratio: 1; border: 0; padding: 0; border-radius: calc(var(--u)*2*var(--hd-r,1)); cursor: pointer;
  background: conic-gradient(from 200deg, #1c7c4a, #1fd36b, #b8f5cf, #0f3f2a, #1c7c4a) center / cover no-repeat; color: rgba(255,255,255,.75);
  display: grid; place-items: center; box-shadow: 0 8px 20px -8px rgba(0,0,0,.5);
}
.app-shell .spotify-card > .spotify-card__cover:not(.spotify-card__cover--empty) { background-size: cover; background-position: center; }
.app-shell .spotify-card__meta { flex: 1; min-width: 0; align-self: stretch; display: flex; flex-direction: column; justify-content: space-between; gap: calc(var(--u)*1.1); }
.app-shell .spotify-card.spotify-card--idle { flex-direction: column; align-items: center; justify-content: center; gap: calc(var(--u)*1.2); text-align: center; }
.app-shell .spotify-card.spotify-card--idle > strong { margin: 0; max-width: 100%; font: 600 calc(var(--u)*1.9)/1.15 var(--f-body); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.app-shell .spotify-card.spotify-card--idle > .spotify-card__start { position: static; inset: auto; flex: none; width: calc(var(--u)*7); height: calc(var(--u)*7); padding: 0; border: 0; border-radius: var(--hd-round,50%); display: grid; place-items: center; background: #fff; color: #111; cursor: pointer; }
.app-shell .spotify-card.spotify-card--idle > .spotify-card__start:disabled { opacity: .4; cursor: default; }
.app-shell .spotify-card__source { display: flex; align-items: center; gap: calc(var(--u)*.6); font: 700 calc(var(--u)*1.5)/1 var(--f-body); letter-spacing: .08em; text-transform: uppercase; color: #1fd36b; }
.app-shell .spotify-card__source > span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.app-shell .spotify-card__source--other, .app-shell .hd-player__source--other { color: rgba(255,255,255,.72); }
.app-shell .spotify-card__line { display: flex; align-items: center; gap: calc(var(--u)*1); min-width: 0; }
.app-shell .spotify-card__line > .spotify-card__copy { flex: 1; }
.app-shell .spotify-card__thumb { flex: none; width: calc(var(--u)*5); height: calc(var(--u)*5); border-radius: calc(var(--u)*1*var(--hd-r,1)); background: center / cover no-repeat; }
.app-shell .spotify-card__copy { display: flex; flex-direction: column; gap: calc(var(--u)*.35); min-width: 0; }
.app-shell .spotify-card__copy strong { font: 600 calc(var(--u)*2.05)/1.15 var(--f-body); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.app-shell .spotify-card__copy small { font: 500 calc(var(--u)*1.75)/1.25 var(--f-body); color: var(--ink-2); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.app-shell .spotify-card__bar { height: calc(var(--u)*.9); border-radius: var(--hd-pill,99px); background: rgba(255,255,255,.2); overflow: hidden; }
.app-shell .spotify-card__bar b { display: block; height: 100%; border-radius: inherit; background: #fff; transition: width 1s linear; }
.app-shell .spotify-card__controls { display: flex; align-items: center; justify-content: center; gap: calc(var(--u)*1.4); }
.app-shell .spotify-card__controls > button { width: calc(var(--u)*3.8); height: calc(var(--u)*3.8); border: 0; padding: 0; border-radius: var(--hd-round,50%); display: grid; place-items: center; background: none; color: inherit; cursor: pointer; flex: none; }
.app-shell .spotify-card__controls > .spotify-card__pp { width: calc(var(--u)*5); height: calc(var(--u)*5); background: #fff; color: #111; }
.app-shell .spotify-card__volume { margin-left: auto; display: flex; align-items: center; gap: calc(var(--u)*.6); font: 600 calc(var(--u)*1.6)/1 var(--f-body); color: var(--ink-2); font-variant-numeric: tabular-nums; }
.app-shell .spotify-card__volume button { width: calc(var(--u)*3.2); height: calc(var(--u)*3.2); border: 0; padding: 0; border-radius: var(--hd-round,50%); display: grid; place-items: center; background: rgba(255,255,255,.15); color: var(--ink); cursor: pointer; }
@container tile (max-width: 330px) {
  .app-shell .spotify-card { flex-direction: column; align-items: stretch; }
  .app-shell .spotify-card > .spotify-card__cover { width: calc(var(--u)*6.4); }
  .app-shell .spotify-card__source { order: -1; }
  .app-shell .spotify-card__volume { display: none; }
}

/* Full-screen player */
.app-shell .hd-player { --u: clamp(5px, min(.95vh, 1.8vw), 12px); position: fixed; inset: 0; z-index: 80; overflow: hidden; color: #fff; background: #121012; animation: hd-player-in .35s cubic-bezier(.2,.8,.2,1); }
@keyframes hd-player-in { from { opacity: 0; transform: translateY(3%); } }
.app-shell .hd-player__bg { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
.app-shell .hd-player__bg i { position: absolute; inset: -20%; background: radial-gradient(60% 50% at 30% 30%, var(--on, #c98a3a) 0, transparent 70%), radial-gradient(60% 60% at 75% 70%, #3a4d7a 0, transparent 70%), #1b1820; background-size: cover; background-position: center; filter: blur(80px) saturate(1.5) brightness(.7); transform: scale(1.15); }
.app-shell .hd-player__bg::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,.15), rgba(0,0,0,.55)); }
/* The one close button: round, frosted, like the Spotify player's */
.app-shell .hd-close { width: calc(var(--u)*6); height: calc(var(--u)*6); flex: none; padding: 0; border: 0; border-radius: var(--hd-round,50%); display: grid; place-items: center; background: rgba(255,255,255,.16); color: #fff; backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); cursor: pointer; }
.app-shell .hd-close:active { background: rgba(255,255,255,.26); }
.app-shell .hd-player__close { position: absolute; z-index: 2; top: calc(var(--u)*3 + env(safe-area-inset-top, 0px)); right: calc(var(--u)*3); }
.app-shell .hd-player__scroll { position: absolute; inset: 0; z-index: 1; display: flex; flex-direction: column; align-items: center; overflow: hidden auto; overscroll-behavior: contain; scrollbar-width: none; padding: calc(var(--u)*6 + env(safe-area-inset-top, 0px)) calc(var(--u)*4) calc(var(--u)*4 + env(safe-area-inset-bottom, 0px)); }
.app-shell .hd-player__wrap { margin: auto 0; width: min(100%, calc(var(--u)*62)); display: flex; flex-direction: column; align-items: center; gap: calc(var(--u)*2.6); text-align: center; }
.app-shell .hd-player__wrap > * { width: 100%; min-width: 0; }
.app-shell .hd-player__art { width: min(34vh, 86vw, 560px); aspect-ratio: 1; border-radius: calc(var(--u)*3*var(--hd-r,1)); display: grid; place-items: center; color: rgba(255,255,255,.55); background: linear-gradient(135deg, #3a4d7a, #b5523f) center / cover no-repeat; box-shadow: 0 calc(var(--u)*3) calc(var(--u)*9) rgba(0,0,0,.5), inset 0 0 0 1px rgba(255,255,255,.12); transition: transform .45s cubic-bezier(.2,.8,.2,1); }
.app-shell .hd-player__art--paused { transform: scale(.92); }
.app-shell .hd-player__source { display: inline-flex; align-items: center; justify-content: center; gap: calc(var(--u)*.8); font: 700 calc(var(--u)*1.5)/1 var(--f-body); letter-spacing: .14em; text-transform: uppercase; color: rgba(255,255,255,.62); }
.app-shell .hd-player__source svg { color: #1ed760; }
.app-shell .hd-player__source--other svg { color: inherit; }
.app-shell .hd-player__title { margin-top: calc(var(--u)*1.2); font: 600 calc(var(--u)*4.6)/1.08 var(--f-display); overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.app-shell .hd-player__artist { margin-top: calc(var(--u)*.8); font: 500 calc(var(--u)*2.2)/1.2 var(--f-body); color: rgba(255,255,255,.72); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.app-shell .hd-player__track { display: grid; gap: calc(var(--u)*.6); }
.app-shell .hd-player__bar { position: relative; height: calc(var(--u)*3); display: flex; align-items: center; cursor: pointer; touch-action: none; }
.app-shell .hd-player__bar::before { content: ""; position: absolute; left: 0; right: 0; height: calc(var(--u)*.8); border-radius: var(--hd-pill,99px); background: rgba(255,255,255,.22); }
.app-shell .hd-player__bar b { position: absolute; left: 0; height: calc(var(--u)*.8); border-radius: var(--hd-pill,99px); background: #fff; }
.app-shell .hd-player__bar b::after { content: ""; position: absolute; right: calc(var(--u)*-1.1); top: 50%; width: calc(var(--u)*2.2); height: calc(var(--u)*2.2); margin-top: calc(var(--u)*-1.1); border-radius: var(--hd-round,50%); background: #fff; box-shadow: 0 1px 6px rgba(0,0,0,.35); transform: scale(0); transition: transform .15s; }
.app-shell .hd-player__bar:hover b::after, .app-shell .hd-player__bar--drag b::after { transform: scale(1); }
.app-shell .hd-player__bar--drag::before, .app-shell .hd-player__bar--drag b { height: calc(var(--u)*1.2); }
.app-shell .hd-player__times { display: flex; justify-content: space-between; font: 600 calc(var(--u)*1.6)/1 var(--f-body); color: rgba(255,255,255,.6); font-variant-numeric: tabular-nums; }
.app-shell .hd-player__controls { display: grid; grid-template-columns: minmax(0,1fr) auto minmax(0,1fr); align-items: center; column-gap: calc(var(--u)*2); }
.app-shell .hd-player__side { display: flex; gap: calc(var(--u)*.6); justify-self: start; }
.app-shell .hd-player__side--end { justify-self: end; }
.app-shell .hd-player__main { display: flex; align-items: center; gap: calc(var(--u)*2.2); }
.app-shell .hd-player__controls button { position: relative; border: 0; background: none; color: #fff; padding: 0; width: calc(var(--u)*6.4); height: calc(var(--u)*6.4); border-radius: var(--hd-round,50%); display: grid; place-items: center; cursor: pointer; }
.app-shell .hd-player__controls button:active { background: rgba(255,255,255,.14); }
.app-shell .hd-player__controls .hd-player__pp { width: calc(var(--u)*10); height: calc(var(--u)*10); background: #fff; color: #111; box-shadow: 0 calc(var(--u)*1.4) calc(var(--u)*4) rgba(0,0,0,.35); }
.app-shell .hd-player__small { color: rgba(255,255,255,.55) !important; }
.app-shell .hd-player__small--on { color: #1ed760 !important; }
.app-shell .hd-player__small--on::after { content: ""; position: absolute; bottom: calc(var(--u)*.4); left: 50%; width: 4px; height: 4px; margin-left: -2px; border-radius: 50%; background: currentColor; }
.app-shell .hd-player__volume { display: flex; align-items: center; gap: calc(var(--u)*.4); padding: calc(var(--u)*.5); border-radius: var(--hd-pill,99px); background: rgba(255,255,255,.13); }
.app-shell .hd-player__volume button { width: calc(var(--u)*4.8) !important; height: calc(var(--u)*4.8) !important; background: rgba(255,255,255,.14) !important; }
.app-shell .hd-player__volume span { min-width: calc(var(--u)*6); text-align: center; font: 600 calc(var(--u)*1.9)/1 var(--f-body); font-variant-numeric: tabular-nums; }
.app-shell .hd-player__devices { display: flex; flex-wrap: wrap; justify-content: center; gap: calc(var(--u)*.9); }
.app-shell .hd-player__devices button { display: inline-flex; align-items: center; gap: calc(var(--u)*.7); max-width: 100%; border: 0; border-radius: var(--hd-pill,99px); padding: calc(var(--u)*1) calc(var(--u)*1.8); background: rgba(255,255,255,.13); color: #fff; font: 600 calc(var(--u)*1.7)/1.2 var(--f-body); cursor: pointer; }
.app-shell .hd-player__devices button span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.app-shell .hd-player__devices button[aria-pressed="true"] { background: #fff; color: #111; }
.app-shell .hd-player__devices button[aria-pressed="true"] svg { color: #1a9f4a; }
@media (orientation: portrait) {
  .app-shell .hd-player__controls { grid-template-columns: minmax(0,1fr) auto minmax(0,1fr); grid-template-areas: "m m m" "s . v"; row-gap: calc(var(--u)*1.6); }
  .app-shell .hd-player__main { grid-area: m; justify-self: center; }
  .app-shell .hd-player__side { grid-area: s; }
  .app-shell .hd-player__side--end { grid-area: v; }
}

/* Select: trigger, floating list and phone sheet (px units: also used outside the shell) */
.hdx-select {
  display: inline-flex; align-items: center; justify-content: space-between; gap: 10px; width: 100%; min-width: 0; min-height: 44px; padding: 0 14px 0 16px;
  border-radius: calc(14px*var(--hd-r,1)); border: 1px solid rgba(255,255,255,.2); background: rgba(255,255,255,.1); color: #fff;
  font: 600 15px/1.2 "HomeDeck Figtree", "Figtree", system-ui, sans-serif; text-align: left; cursor: pointer; transition: background .15s, border-color .15s;
}
.hdx-select > span { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.hdx-select svg { flex: none; transform: rotate(90deg); opacity: .7; transition: transform .2s; }
.hdx-select--open { border-color: rgba(255,255,255,.55); background: rgba(255,255,255,.16); }
.hdx-select--open svg { transform: rotate(-90deg); }
.hdx-select:disabled { opacity: .45; cursor: default; }
.hdx-select:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
.hdx-select__list {
  position: fixed; z-index: 95; overflow: auto; padding: 6px; border-radius: calc(16px*var(--hd-r,1)); color: #1d1a17;
  /* Light frosted glass, like iOS menus and the light pills of the dock. */
  background: rgba(255,255,255,.86); border: 1px solid rgba(255,255,255,.6);
  backdrop-filter: blur(30px) saturate(1.6); -webkit-backdrop-filter: blur(30px) saturate(1.6);
  box-shadow: 0 18px 50px rgba(0,0,0,.4); font: 500 15px/1.25 "HomeDeck Figtree", "Figtree", system-ui, sans-serif; animation: hdx-pop .14s ease-out; overscroll-behavior: contain;
}
.hdx-select__list--up { transform: translateY(-100%); animation-name: hdx-pop-up; }
@keyframes hdx-pop { from { opacity: 0; transform: translateY(-4px); } }
@keyframes hdx-pop-up { from { opacity: 0; transform: translateY(calc(-100% + 4px)); } }
.hdx-select__option { display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 44px; padding: 10px 12px; border-radius: calc(10px*var(--hd-r,1)); cursor: pointer; }
.hdx-select__option > span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.hdx-select__option--active { background: rgba(0,0,0,.06); }
.hdx-select__option[aria-selected="true"] { font-weight: 700; }
/* Deeper shade of the highlight: the light tone alone fades on white. */
.hdx-select__option[aria-selected="true"] svg { color: color-mix(in srgb, var(--on, #ffc94d) 62%, #000); }
.hdx-select__backdrop { position: fixed; inset: 0; z-index: 95; background: rgba(0,0,0,.45); animation: hdx-fade .2s ease; }
@keyframes hdx-fade { from { opacity: 0; } }
.hdx-select__list--sheet {
  left: 0; right: 0; bottom: 0; max-height: 72vh; border-radius: calc(22px*var(--hd-r,1)) calc(22px*var(--hd-r,1)) 0 0; padding: 10px 12px calc(16px + env(safe-area-inset-bottom, 0px));
  font-size: 17px; animation: hdx-sheet .25s cubic-bezier(.2,.8,.2,1);
}
.hdx-select__list--sheet::before { content: ""; display: block; width: 40px; height: 5px; margin: 0 auto 10px; border-radius: var(--hd-pill,99px); background: rgba(0,0,0,.18); }
@keyframes hdx-sheet { from { transform: translateY(100%); } }
.hdx-select__sheet-title { padding: 4px 12px 10px; font: 700 13px/1.2 "HomeDeck Figtree", "Figtree", system-ui, sans-serif; letter-spacing: .1em; text-transform: uppercase; color: rgba(29,26,23,.5); }
.hdx-select__list--sheet .hdx-select__option { min-height: 52px; }
.hdx-segmented { display: inline-flex; padding: 4px; gap: 4px; border-radius: var(--hd-pill,99px); background: rgba(0,0,0,.22); }
.hdx-segmented button { min-height: 36px; padding: 0 16px; border: 0; border-radius: var(--hd-pill,99px); background: none; color: rgba(255,255,255,.72); font: 600 14px/1 "HomeDeck Figtree", "Figtree", system-ui, sans-serif; cursor: pointer; white-space: nowrap; }
.hdx-segmented button[aria-checked="true"] { background: rgba(255,255,255,.92); color: #1d1a17; }
.app-shell .st-row .hdx-select { width: auto; min-width: min(52%, 280px); }

/* Phones: the dock is a strip you drag sideways, between fixed edges, as tall as the main dashboard's
   (56px), with the Edit button beside it at the same height. Like the main dashboard, it sits low: it
   takes 30px off the bottom safe area (the home indicator). */
@media (max-width: 720px) {
  .app-shell {
    --dock-bottom: max(6px, calc(var(--u)*1.6 + env(safe-area-inset-bottom, 0px) - 30px));
    --dock-height: calc(var(--u)*8.5);
    --dock-side: calc(var(--u)*2.4 + env(safe-area-inset-right, 0px));
  }
  .app-shell .navigation-dock {
    left: calc(var(--u)*2.4 + env(safe-area-inset-left, 0px)); right: calc(var(--dock-side) + var(--dock-height) + var(--u)*1.2);
    transform: none; max-width: none; height: var(--dock-height); box-sizing: border-box; align-items: stretch; padding: calc(var(--u)*.6);
  }
  .app-shell .navigation-dock button { height: auto; padding: 0 calc(var(--u)*2); font-size: calc(var(--u)*2.1); }
  .app-shell .navigation-dock button svg { width: calc(var(--u)*3); height: calc(var(--u)*3); }
  .app-shell .edit-fab { right: var(--dock-side); }
}
}

/* Settings: card color + vivid highlight, with a live sample */
.app-shell .st-colors { display: grid; grid-template-columns: minmax(0, 1fr) auto; grid-template-areas: "cards preview" "vivid preview"; gap: calc(var(--u)*2.4) calc(var(--u)*3); }
.app-shell .st-colors__group { display: flex; flex-direction: column; gap: calc(var(--u)*1.2); }
.app-shell .st-colors__group:first-of-type { grid-area: cards; }
.app-shell .st-colors__group:last-of-type { grid-area: vivid; }
.app-shell .st-colors__group > p { margin: calc(var(--u)*-.6) 0 calc(var(--u)*.2); color: var(--ink-2); font: 500 calc(var(--u)*1.7)/1.35 var(--f-body); }
.app-shell .st-colors__preview { grid-area: preview; align-self: center; position: relative; padding: calc(var(--u)*1.2); }
.app-shell .st-colors__card {
  display: flex; flex-direction: column; width: calc(var(--u)*20); padding: calc(var(--u)*2); gap: calc(var(--u)*.4); border-radius: calc(var(--u)*3.4*var(--hd-r,1));
  background: var(--hd-accent); color: #2b2418; box-shadow: 0 calc(var(--u)*1.6) calc(var(--u)*4) rgba(0,0,0,.3); transition: background .25s;
}
.app-shell .st-colors__card i { width: calc(var(--u)*5); height: calc(var(--u)*5); margin-bottom: calc(var(--u)*3); border-radius: var(--hd-round,50%); display: grid; place-items: center; background: var(--on); color: var(--on-ink); transition: background .25s; }
.app-shell .st-colors__card b { font: 600 calc(var(--u)*2.05)/1.15 var(--f-body); }
.app-shell .st-colors__card small { font: 500 calc(var(--u)*1.75)/1.2 var(--f-body); color: rgba(43,36,24,.62); }
.app-shell .st-colors__card em { display: block; height: calc(var(--u)*3.2); margin-top: calc(var(--u)*1.2); border-radius: var(--hd-pill,99px); background: rgba(43,36,24,.1); overflow: hidden; }
.app-shell .st-colors__card em span { display: block; width: 75%; height: 100%; border-radius: inherit; background: var(--on); transition: background .25s; }
.app-shell .st-colors__badge { position: absolute; top: 0; right: 0; min-width: calc(var(--u)*3.4); height: calc(var(--u)*3.4); padding: 0 calc(var(--u)*.8); border-radius: var(--hd-pill,99px); display: grid; place-items: center; background: var(--on); color: var(--on-ink); font: 700 calc(var(--u)*1.6)/1 var(--f-body); box-shadow: 0 2px 8px rgba(0,0,0,.3); }
.app-shell .st-swatches--vivid button { box-shadow: none; }
@media (max-width: 720px) {
  .app-shell .st-colors { grid-template-columns: minmax(0, 1fr); grid-template-areas: "preview" "cards" "vivid"; }
  .app-shell .st-colors__preview { justify-self: center; }
}

/* Room card toggle mirrors the icon: same distance from the top and side edges. The top row
   already sits inside the card padding, so the button anchors to its corner. Size unchanged. */
.app-shell .room-card__top { position: relative; }
.app-shell .room-card .room-card__power { top: 0; right: 0; }

/* ---------- Double-size cards: more controls ---------- */
.app-shell .device-tile--wide { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr); grid-template-rows: auto 1fr; column-gap: calc(var(--u)*2.4); row-gap: calc(var(--u)*1); }
.app-shell .device-tile--wide > .device-tile__top { grid-area: 1 / 1; }
.app-shell .device-tile--wide > .device-tile__copy { grid-area: 2 / 1; align-self: end; }
.app-shell .device-tile--wide > .tile-wide { grid-area: 1 / 2 / 3 / 3; align-self: center; min-width: 0; }
.app-shell .widget-card--wide { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr); grid-template-rows: auto 1fr auto; column-gap: calc(var(--u)*2.4); align-items: end; }
.app-shell .widget-card--wide > .widget-card__icon { grid-area: 1 / 1; align-self: start; }
.app-shell .widget-card--wide > strong { grid-area: 2 / 1; }
.app-shell .widget-card--wide > p { grid-area: 3 / 1; margin: 0; }
.app-shell .widget-card--wide > .tile-wide, .app-shell .widget-card--wide > .widget-list { grid-area: 1 / 2 / 4 / 3; align-self: center; min-width: 0; }
.app-shell .tile-wide__controls { display: flex; flex-direction: column; gap: calc(var(--u)*1.1); }
.app-shell .tile-wide__since { margin: 0; text-align: right; color: var(--ink-2); font: 500 calc(var(--u)*1.6)/1.3 var(--f-body); }
.app-shell .device-tile--active .tile-wide__since { color: var(--paper-ink-2); }
.app-shell .tile-slider { display: flex; align-items: center; gap: calc(var(--u)*1); margin: 0; }
.app-shell .tile-slider__track { position: relative; flex: 1; min-width: 0; height: calc(var(--u)*3.6); border-radius: var(--hd-pill,99px); overflow: hidden; background: color-mix(in srgb, currentColor 14%, transparent); }
.app-shell .tile-slider__track b { background: color-mix(in srgb, currentColor 50%, transparent); }
.app-shell .tile-slider__track b::after { background: currentColor; }
.app-shell :is(.device-tile--active, .widget-card--playing) .tile-slider__track { background: rgba(43,36,24,.1); }
.app-shell :is(.device-tile--active, .widget-card--playing) .tile-slider__track b { background: var(--lc, var(--on)); }
.app-shell :is(.device-tile--active, .widget-card--playing) .tile-slider__track b::after { background: rgba(43,36,24,.55); }
.app-shell .tile-slider--off .tile-slider__track b { display: none; }
.app-shell .tile-slider > span { min-width: calc(var(--u)*4.4); text-align: right; font: 600 calc(var(--u)*1.6)/1 var(--f-body); font-variant-numeric: tabular-nums; opacity: .75; }
/* Climate, double size: target on a ring beside the modes and − / +, like the main dashboard */
.app-shell .tile-climate { display: grid; grid-template-columns: auto minmax(0, 1fr); grid-template-areas: "ring seg" "ring step"; column-gap: calc(var(--u)*2); row-gap: calc(var(--u)*1); align-items: center; --cool: #6cb8ff; --heat: #ff9b5e; }
.app-shell .device-tile--wide-climate { grid-template-columns: auto minmax(0, 1fr); grid-template-rows: auto 1fr auto auto; grid-template-areas: "ring copy" "ring ." "ring seg" "ring step"; column-gap: calc(var(--u)*2.2); }
.app-shell .device-tile--wide.device-tile--wide-climate > .device-tile__top { display: none; }
.app-shell .device-tile--wide.device-tile--wide-climate > .device-tile__copy { grid-area: copy; align-self: start; }
.app-shell .widget-card--wide.widget-card--climate { grid-template-columns: auto minmax(0, 1fr); grid-template-rows: auto auto 1fr auto auto; grid-template-areas: "ring label" "ring copy" "ring ." "ring seg" "ring step"; column-gap: calc(var(--u)*2.2); align-items: stretch; }
.app-shell .widget-card--climate > .widget-card__label { grid-area: label; position: static; }
.app-shell .widget-card--wide.widget-card--climate > p { grid-area: copy; margin: calc(var(--u)*.4) 0 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.app-shell :is(.device-tile--wide-climate, .widget-card--climate) > .tile-wide, .app-shell :is(.device-tile--wide-climate, .widget-card--climate) .tile-climate { display: contents; }
.app-shell .tile-ring { grid-area: ring; position: relative; width: calc(var(--u)*13); aspect-ratio: 1; display: grid; place-items: center; align-self: center; }
.app-shell .tile-ring svg { position: absolute; inset: 0; width: 100%; height: 100%; transform: rotate(135deg); }
.app-shell .tile-ring circle { fill: none; stroke-width: 7; stroke-linecap: round; }
.app-shell .tile-ring__track { stroke: color-mix(in srgb, currentColor 16%, transparent); }
.app-shell .tile-ring__value { stroke: var(--cool); transition: stroke-dasharray .4s ease; }
.app-shell .tile-ring--heat .tile-ring__value { stroke: var(--heat); }
.app-shell .tile-ring strong { position: relative; font: 300 calc(var(--u)*4.4)/1 var(--f-display); font-variant-numeric: tabular-nums; letter-spacing: -.02em; }
.app-shell .tile-ring strong small { font-size: .5em; vertical-align: top; margin-left: 1px; }
.app-shell :is(.device-tile--active, .widget-card--playing) .tile-climate { --cool: #2f86d6; --heat: #e0702a; }
.app-shell .tile-seg { grid-area: seg; display: flex; padding: calc(var(--u)*.35); border-radius: var(--hd-pill,99px); background: color-mix(in srgb, currentColor 12%, transparent); }
.app-shell .tile-seg button { flex: 1; min-width: 0; height: calc(var(--u)*3.6); border: 0; border-radius: var(--hd-pill,99px); background: none; color: inherit; opacity: .72; cursor: pointer; font: 600 calc(var(--u)*1.5)/1 var(--f-body); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.app-shell .tile-seg button[aria-pressed="true"] { opacity: 1; background: rgba(255,255,255,.92); color: #1d1a17; }
.app-shell :is(.device-tile--active, .widget-card--playing) .tile-seg button[aria-pressed="true"] { background: var(--paper-ink, #2a2110); color: var(--paper, #f4edd9); }
.app-shell .tile-step { grid-area: step; display: flex; gap: calc(var(--u)*.8); }
.app-shell .tile-step button { flex: 1; height: calc(var(--u)*4.2); border: 0; border-radius: var(--hd-pill,99px); background: color-mix(in srgb, currentColor 13%, transparent); color: inherit; cursor: pointer; display: grid; place-items: center; }
.app-shell .tile-step button:disabled { opacity: .35; cursor: default; }

/* Covers, double size: a vertical position bar and open / stop / close stacked */
.app-shell .device-tile--wide-cover > .tile-wide { align-self: stretch; }
.app-shell .tile-cover { flex-direction: row; justify-content: flex-end; align-items: stretch; height: 100%; gap: calc(var(--u)*1); }
.app-shell .tile-vslider { position: relative; width: calc(var(--u)*6.2); min-height: calc(var(--u)*11); border-radius: calc(var(--u)*1.8*var(--hd-r,1)); overflow: hidden; background: color-mix(in srgb, currentColor 12%, transparent); cursor: ns-resize; touch-action: none; outline-offset: 2px; }
.app-shell .tile-vslider[aria-disabled="true"] { cursor: default; }
.app-shell .tile-vslider b { position: absolute; left: 0; right: 0; bottom: 0; height: var(--value); background: color-mix(in srgb, currentColor 42%, transparent); transition: height .2s ease; }
.app-shell .device-tile--active .tile-vslider b { background: var(--lc, var(--on)); }
.app-shell .tile-vslider span { position: absolute; left: 0; right: 0; bottom: calc(var(--u)*.8); text-align: center; font: 600 calc(var(--u)*1.45)/1 var(--f-body); font-variant-numeric: tabular-nums; }
.app-shell .tile-buttons--vertical { flex-direction: column; width: calc(var(--u)*5.2); }
.app-shell .tile-buttons--vertical button { flex: 1; height: auto; min-height: calc(var(--u)*3.4); padding: 0; }
.app-shell .tile-swatches { display: flex; flex-wrap: wrap; gap: calc(var(--u)*.8); }
.app-shell .tile-swatches button { width: calc(var(--u)*3.4); height: calc(var(--u)*3.4); padding: 0; border-radius: var(--hd-round,50%); border: 2px solid color-mix(in srgb, currentColor 18%, transparent); cursor: pointer; box-shadow: inset 0 0 0 1px rgba(0,0,0,.08); transition: transform .15s; }
.app-shell .tile-swatches button[aria-pressed="true"] { border-color: currentColor; transform: scale(1.08); }
.app-shell :is(.tile-buttons, .tile-chips, .tile-target) button {
  border: 0; border-radius: var(--hd-pill,99px); cursor: pointer; color: inherit; background: color-mix(in srgb, currentColor 13%, transparent);
  font: 600 calc(var(--u)*1.55)/1 var(--f-body); display: inline-flex; align-items: center; justify-content: center; gap: calc(var(--u)*.6);
}
.app-shell :is(.tile-buttons, .tile-chips, .tile-target) button:disabled { opacity: .35; cursor: default; }
.app-shell .tile-buttons { display: flex; align-items: center; gap: calc(var(--u)*.8); }
.app-shell .tile-buttons button { flex: 1; height: calc(var(--u)*4.4); padding: 0 calc(var(--u)*1.2); white-space: nowrap; }
.app-shell .tile-buttons .tile-buttons__icon { flex: 0 0 calc(var(--u)*4.4); padding: 0; }
.app-shell .tile-buttons--media { justify-content: center; }
.app-shell .tile-buttons .tile-buttons__main { flex-basis: calc(var(--u)*5.4); height: calc(var(--u)*5.4); background: currentColor; }
.app-shell .tile-buttons .tile-buttons__main svg { color: var(--paper, #f4edd9); }
.app-shell .device-tile--active .tile-buttons .tile-buttons__main svg, .app-shell .widget-card--playing .tile-buttons .tile-buttons__main svg { color: #fff; }
.app-shell .tile-buttons .tile-buttons__warn { background: #e5484d; color: #fff; }
.app-shell .tile-chips { display: flex; align-items: center; gap: calc(var(--u)*.6); overflow-x: auto; scrollbar-width: none; }
.app-shell .tile-chips::-webkit-scrollbar { display: none; }
.app-shell .tile-chips button { flex: none; height: calc(var(--u)*3.6); padding: 0 calc(var(--u)*1.3); }
.app-shell .tile-chips--small button { height: calc(var(--u)*3); font-size: calc(var(--u)*1.4); text-transform: capitalize; }
.app-shell .tile-chips > svg { flex: none; opacity: .6; }
.app-shell .tile-chips button[aria-pressed="true"] { background: currentColor; }
.app-shell .tile-chips button[aria-pressed="true"] > * , .app-shell .tile-chips button[aria-pressed="true"] { color: var(--paper, #f4edd9); }
.app-shell .device-tile--active .tile-chips button[aria-pressed="true"], .app-shell .widget-card--playing .tile-chips button[aria-pressed="true"] { background: var(--paper-ink, #2a2110); color: var(--paper, #f4edd9); }
.app-shell .tile-target { display: flex; align-items: center; justify-content: space-between; gap: calc(var(--u)*1); }
.app-shell .tile-target strong { font: 300 calc(var(--u)*4.2)/1 var(--f-display); font-variant-numeric: tabular-nums; }
.app-shell .tile-target button { width: calc(var(--u)*4.6); height: calc(var(--u)*4.6); padding: 0; }
.app-shell .widget-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: calc(var(--u)*.5); }
.app-shell .widget-list button { width: 100%; display: flex; justify-content: space-between; gap: calc(var(--u)*1); padding: calc(var(--u)*.8) calc(var(--u)*1.2); border: 0; border-radius: calc(var(--u)*1.4*var(--hd-r,1)); background: color-mix(in srgb, currentColor 9%, transparent); color: inherit; font: 500 calc(var(--u)*1.6)/1.2 var(--f-body); cursor: pointer; text-align: left; }
.app-shell .widget-list button span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.app-shell .widget-list button small { flex: none; opacity: .65; text-transform: capitalize; }
.app-shell .widget-list button.widget-list--alert { background: rgba(229,72,77,.22); }
/* Today card: a dot in the calendar's color before each event, an empty ring before each reminder. */
.app-shell .widget-list__dot { display: inline-block; width: calc(var(--u)*.9); height: calc(var(--u)*.9); margin-right: calc(var(--u)*.8); border-radius: var(--hd-round,50%); vertical-align: .1em; }
.app-shell .widget-list__dot--todo { box-sizing: border-box; border: 2px solid currentColor; opacity: .6; }
.app-shell .widget-card--today .widget-list small { text-transform: none; }
.app-shell .widget-card--today > p { text-transform: none; }
/* Double size: the weekday in the card's body size, and three rows at most, so the card keeps its row's height. */
.app-shell .widget-card--today.widget-card--wide > strong { font: 600 calc(var(--u)*2.2)/1.2 var(--f-body); -webkit-line-clamp: 2; overflow-wrap: anywhere; }
.app-shell .widget-card--today .widget-list button { padding-block: calc(var(--u)*.6); }
.app-shell .widget-card--today:not(.widget-card--wide) > strong { font: 600 calc(var(--u)*2.2)/1.2 var(--f-body); -webkit-line-clamp: 3; }
.app-shell .widget-card--wide > .widget-card__empty { grid-area: 1 / 2 / 4 / 3; align-self: center; margin: 0; opacity: .6; }
/* Spotify, double size: times, shuffle, repeat and a volume slider. */
.app-shell .spotify-card__progress { display: flex; align-items: center; gap: calc(var(--u)*1); }
.app-shell .spotify-card__progress .spotify-card__bar { flex: 1; }
.app-shell .spotify-card__progress small { font: 600 calc(var(--u)*1.35)/1 var(--f-body); color: var(--ink-2); font-variant-numeric: tabular-nums; }
.app-shell .spotify-card__controls > .spotify-card__toggle { opacity: .55; }
.app-shell .spotify-card__controls > .spotify-card__toggle--on { opacity: 1; color: #1ed760; }
.app-shell .spotify-card--wide .spotify-card__controls { flex-wrap: wrap; align-items: center; row-gap: calc(var(--u)*.6); }
/* Double size: shuffle, previous, play, next and repeat on one line; the volume buttons on the next. */
.app-shell .spotify-card--wide .spotify-card__controls { column-gap: calc(var(--u)*.6); }
.app-shell .spotify-card--wide .spotify-card__volume { flex-basis: 100%; margin-left: 0; justify-content: flex-start; }
.app-shell .spotify-card__slider { flex: 1 0 100%; min-width: 0; display: flex; align-items: center; gap: calc(var(--u)*.8); color: var(--ink-2); }
.app-shell .spotify-card__slider .tile-slider { flex: 1; color: var(--ink); }
.app-shell .spotify-card__slider .tile-slider__track { height: calc(var(--u)*2.6); }

/* ---------- Calendar and reminders beside the clock ---------- */
.app-shell .context-header__time { display: flex; align-items: center; gap: calc(var(--u)*1.4); flex-wrap: wrap; }
.app-shell .hd-agenda { display: inline-flex; gap: calc(var(--u)*.8); margin-top: calc(var(--u)*.6); }
.app-shell .hd-agenda__button { position: relative; width: calc(var(--u)*5.4); height: calc(var(--u)*5.4); min-width: 40px; min-height: 40px; padding: 0; border: 1px solid var(--hd-frame,var(--line)); border-radius: var(--hd-round,50%); display: grid; place-items: center; background: var(--glass); color: var(--ink); cursor: pointer; backdrop-filter: blur(var(--hd-blur,22px)); -webkit-backdrop-filter: blur(var(--hd-blur,22px)); -webkit-tap-highlight-color: transparent; }
.app-shell .hd-agenda__button:active { background: rgba(255,255,255,.2); }
.app-shell .hd-agenda__button b { position: absolute; top: -3px; right: -3px; min-width: 20px; height: 20px; padding: 0 5px; box-sizing: border-box; border-radius: var(--hd-pill,99px); display: grid; place-items: center; background: var(--on); color: var(--on-ink, #2a2110); font: 700 11px/1 var(--f-body); }
.app-shell .hd-agenda__button b.hd-agenda__late { background: #ff6b5e; color: #fff; }

/* Reminders sheet */
.app-shell .hd-todo { gap: calc(var(--u)*1.8); width: min(92%, 620px); }
.app-shell .hd-todo__head { display: flex; align-items: center; gap: calc(var(--u)*1.6); }
.app-shell .hd-todo__head > div { flex: 1; min-width: 0; }
.app-shell .hd-todo__head h2 { margin: 0; font: 500 calc(var(--u)*3.2)/1.1 var(--f-display); }
.app-shell .hd-todo__head p { margin: calc(var(--u)*.4) 0 0; color: var(--ink-2); font: 500 calc(var(--u)*1.7)/1.3 var(--f-body); }
.app-shell .hd-todo__section { display: flex; flex-direction: column; gap: calc(var(--u)*.8); }
.app-shell .hd-todo__item { display: flex; align-items: center; gap: calc(var(--u)*1.4); padding: calc(var(--u)*1.3) calc(var(--u)*1.6); border: 0; border-radius: calc(var(--u)*2*var(--hd-r,1)); background: rgba(255,255,255,.08); color: var(--ink); text-align: left; cursor: pointer; transition: opacity .3s; -webkit-tap-highlight-color: transparent; }
.app-shell .hd-todo__item:active { background: rgba(255,255,255,.14); }
.app-shell .hd-todo__check { flex: none; width: calc(var(--u)*3.2); height: calc(var(--u)*3.2); border-radius: var(--hd-round,50%); box-shadow: inset 0 0 0 2px rgba(255,255,255,.7); display: grid; place-items: center; color: transparent; transition: background .2s, color .2s; }
.app-shell .hd-todo__item--late .hd-todo__check { box-shadow: inset 0 0 0 2px #ff8a7e; }
.app-shell .hd-todo__item--done { opacity: .45; }
.app-shell .hd-todo__item--done .hd-todo__check { background: var(--on); box-shadow: none; color: #2a2110; }
.app-shell .hd-todo__item--done b { text-decoration: line-through; }
.app-shell .hd-todo__copy { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.app-shell .hd-todo__copy b { font: 600 calc(var(--u)*2)/1.25 var(--f-body); }
.app-shell .hd-todo__copy small { color: var(--ink-3); font: 500 calc(var(--u)*1.55)/1.3 var(--f-body); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.app-shell .hd-todo__when { flex: none; color: var(--ink-2); font: 600 calc(var(--u)*1.6)/1 var(--f-body); font-variant-numeric: tabular-nums; }
.app-shell .hd-todo__item--late .hd-todo__when { color: #ff9a8f; }
.app-shell .hd-todo__ok, .app-shell .hd-todo__empty { display: flex; align-items: center; gap: calc(var(--u)*1.2); margin: 0; padding: calc(var(--u)*2); border-radius: calc(var(--u)*2*var(--hd-r,1)); background: rgba(255,255,255,.06); color: var(--ink-2); font: 500 calc(var(--u)*1.9)/1.3 var(--f-body); }
.app-shell .hd-todo__ok svg { color: #7bd88f; }

/* Calendar: full screen month with the day's agenda */
.app-shell .hd-cal { --cb: clamp(40px, 5.6vmin, 54px); --co: clamp(14px, 2.4vmin, 26px); --u: clamp(5px, min(1vh, 1.6vw), 12px); position: fixed; inset: 0; z-index: 100; display: flex; flex-direction: column; gap: calc(var(--u)*1.6); padding: calc(var(--co) + env(safe-area-inset-top, 0px)) calc(var(--co) + env(safe-area-inset-right, 0px)) calc(var(--co) + env(safe-area-inset-bottom, 0px)) calc(var(--co) + env(safe-area-inset-left, 0px)); background: #000; color: var(--ink); animation: hd-cal-in .35s cubic-bezier(.2,.8,.2,1); }
/* Same opening as the main dashboard: rises a little while fading in. */
@keyframes hd-cal-in { from { opacity: 0; transform: translateY(3%); } to { opacity: 1; transform: none; } }
.app-shell .hd-cal__head { position: relative; display: flex; align-items: center; gap: 10px; height: var(--cb); flex: none; padding-right: calc(var(--cb) + 10px); }
.app-shell .hd-cal__head .hd-close { position: absolute; top: 0; right: 0; width: var(--cb); height: var(--cb); }
.app-shell .hd-cal__head .hd-pill { height: var(--cb); padding: 0 calc(var(--cb)*.42); font-size: calc(var(--cb)*.32); }
.app-shell .hd-cal__nav { flex: 1; min-width: 0; display: flex; align-items: center; gap: 10px; }
.app-shell .hd-cal__nav h2 { margin: 0; min-width: calc(var(--u)*26); font: 500 calc(var(--u)*3.6)/1 var(--f-display); white-space: nowrap; }
.app-shell .hd-cal__nav h2 span { color: var(--ink-2); font-weight: 300; }
.app-shell .hd-cal__round { width: var(--cb); height: var(--cb); flex: none; padding: 0; border: 0; border-radius: var(--hd-round,50%); display: grid; place-items: center; background: rgba(255,255,255,.12); color: var(--ink); cursor: pointer; }
.app-shell .hd-cal__body { flex: 1; min-height: 0; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, clamp(240px, 30%, 420px)); gap: calc(var(--u)*2); }
.app-shell .hd-cal__month, .app-shell .hd-cal__agenda { min-height: 0; display: flex; flex-direction: column; border-radius: calc(var(--u)*3*var(--hd-r,1)); background: #000; border: 1px solid rgba(255,255,255,.1); }
.app-shell .hd-cal__month { padding: calc(var(--u)*1.2); }
.app-shell .hd-cal__week { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); padding: calc(var(--u)*.4) 0 calc(var(--u)*.8); }
.app-shell .hd-cal__week span { text-align: center; color: var(--ink-3); font: 700 calc(var(--u)*1.4)/1 var(--f-body); letter-spacing: .12em; text-transform: uppercase; }
.app-shell .hd-cal__grid { flex: 1; min-height: 0; display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); grid-template-rows: repeat(6, minmax(0, 1fr)); gap: calc(var(--u)*.5); }
.app-shell .hd-cal__day { min-width: 0; min-height: 0; overflow: hidden; display: flex; flex-direction: column; gap: calc(var(--u)*.4); padding: calc(var(--u)*.7); border: 0; border-radius: calc(var(--u)*1.6*var(--hd-r,1)); background: rgba(255,255,255,.055); color: var(--ink); text-align: left; cursor: pointer; -webkit-tap-highlight-color: transparent; }
.app-shell .hd-cal__day:active { background: rgba(255,255,255,.12); }
.app-shell .hd-cal__day--out { opacity: .35; }
.app-shell .hd-cal__day--selected { background: rgba(255,255,255,.14); box-shadow: inset 0 0 0 2px rgba(255,255,255,.75); }
.app-shell .hd-cal__num { align-self: flex-start; flex: none; min-width: calc(var(--u)*3.4); height: calc(var(--u)*3.4); padding: 0 calc(var(--u)*.6); border-radius: var(--hd-pill,99px); display: grid; place-items: center; font: 600 calc(var(--u)*1.75)/1 var(--f-body); font-variant-numeric: tabular-nums; }
.app-shell .hd-cal__day--today .hd-cal__num { background: var(--on); color: #2a2110; }
.app-shell .hd-cal__chips { min-height: 0; overflow: hidden; display: flex; flex-direction: column; gap: calc(var(--u)*.3); }
.app-shell .hd-cal__chip { flex: none; min-width: 0; display: flex; align-items: center; gap: calc(var(--u)*.5); padding: calc(var(--u)*.2) calc(var(--u)*.6); border-radius: calc(var(--u)*.8*var(--hd-r,1)); background: color-mix(in srgb, var(--c) 22%, transparent); font: 600 calc(var(--u)*1.3)/1.3 var(--f-body); }
.app-shell .hd-cal__chip i { flex: none; width: 3px; align-self: stretch; border-radius: calc(2px*var(--hd-r,1)); background: var(--c); }
.app-shell .hd-cal__chip span { min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.app-shell .hd-cal__more { padding-left: calc(var(--u)*.6); color: var(--ink-2); font: 600 calc(var(--u)*1.25)/1 var(--f-body); }
.app-shell .hd-cal__dotrow { display: none; gap: 3px; justify-content: center; }
.app-shell .hd-cal__dotrow i { width: 6px; height: 6px; border-radius: var(--hd-round,50%); }
.app-shell .hd-cal__agenda { gap: calc(var(--u)*1.4); padding: calc(var(--u)*2); }
.app-shell .hd-cal__agenda h3 { margin: calc(var(--u)*.3) 0 0; font: 500 calc(var(--u)*3)/1.1 var(--f-display); }
.app-shell .hd-cal__list { flex: 1; min-height: 0; overflow-y: auto; scrollbar-width: none; display: flex; flex-direction: column; gap: calc(var(--u)*1); }
.app-shell .hd-cal__event { flex: none; display: flex; gap: calc(var(--u)*1.2); padding: calc(var(--u)*1.4); border-radius: calc(var(--u)*2*var(--hd-r,1)); background: color-mix(in srgb, var(--c) 14%, rgba(255,255,255,.04)); }
.app-shell .hd-cal__event > i { flex: none; width: 4px; border-radius: calc(3px*var(--hd-r,1)); background: var(--c); }
.app-shell .hd-cal__event > div { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: calc(var(--u)*.5); }
.app-shell .hd-cal__event b { font: 600 calc(var(--u)*2.1)/1.2 var(--f-body); }
.app-shell .hd-cal__event span { min-width: 0; display: flex; align-items: center; gap: calc(var(--u)*.6); color: var(--ink-2); font: 500 calc(var(--u)*1.6)/1.3 var(--f-body); }
.app-shell .hd-cal__event em { margin-left: auto; padding-left: calc(var(--u)*1); color: var(--c); font-style: normal; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.app-shell .hd-cal__event small { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: inherit; }
.app-shell .hd-cal__event p { margin: 0; color: var(--ink-3); font: 500 calc(var(--u)*1.5)/1.35 var(--f-body); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.app-shell .hd-cal__empty { margin: 0; color: var(--ink-3); font: 500 calc(var(--u)*1.8)/1.3 var(--f-body); }
@media (max-width: 720px) {
  .app-shell .hd-cal { --u: 6px; }
  .app-shell .hd-cal__head { flex-wrap: wrap; height: auto; row-gap: 10px; }
  .app-shell .hd-cal__nav { flex-basis: 100%; }
  .app-shell .hd-cal__nav h2 { min-width: 0; font-size: calc(var(--u)*3.4); }
  .app-shell .hd-cal__body { grid-template-columns: minmax(0, 1fr); grid-template-rows: minmax(0, 1.15fr) minmax(0, 1fr); }
  .app-shell .hd-cal__chips { display: none; }
  .app-shell .hd-cal__dotrow { display: flex; margin-top: auto; }
  .app-shell .hd-cal__num { align-self: center; }
}
}

/* ---------- Forecast window, as in the main dashboard ---------- */
.app-shell .hd-forecast { display: flex; flex-direction: column; gap: calc(var(--u)*1.6); width: min(720px, 100%); }
.app-shell .hd-forecast > * { flex: none; }
.app-shell .hd-forecast__now { display: flex; align-items: center; gap: calc(var(--u)*2); margin: calc(var(--u)*1) 0 0; }
.app-shell .hd-forecast__now > strong { font: 300 calc(var(--u)*7.4)/1 var(--f-display); letter-spacing: -.03em; }
.app-shell .hd-forecast__now > span { display: flex; flex-direction: column; gap: calc(var(--u)*.5); }
.app-shell .hd-forecast__now b { font: 600 calc(var(--u)*2.2)/1.2 var(--f-body); text-transform: capitalize; }
.app-shell .hd-forecast__now small { color: var(--ink-2); font: 500 calc(var(--u)*1.8)/1.2 var(--f-body); }
.app-shell .hd-forecast__facts { display: flex; flex-wrap: wrap; gap: calc(var(--u)*.8); }
.app-shell .hd-forecast__facts span { padding: calc(var(--u)*.7) calc(var(--u)*1.4); border-radius: var(--hd-pill,99px); background: rgba(255,255,255,.12); font: 600 calc(var(--u)*1.7)/1.2 var(--f-body); }
.app-shell .hd-forecast > .eyebrow { margin-top: calc(var(--u)*.6); }
.app-shell .hd-forecast__hours { display: flex; gap: calc(var(--u)*1); overflow-x: auto; scrollbar-width: none; padding-bottom: calc(var(--u)*.4); }
.app-shell .hd-forecast__hours::-webkit-scrollbar { display: none; }
.app-shell .hd-forecast__hours > div { flex: none; width: calc(var(--u)*8.5); display: flex; flex-direction: column; align-items: center; gap: calc(var(--u)*.6); padding: calc(var(--u)*1.2) calc(var(--u)*.4); border-radius: calc(var(--u)*2*var(--hd-r,1)); background: rgba(255,255,255,.08); }
.app-shell .hd-forecast__hours small { color: var(--ink-2); font: 600 calc(var(--u)*1.5)/1 var(--f-body); }
.app-shell .hd-forecast__hours b { font: 500 calc(var(--u)*2.2)/1 var(--f-display); }
.app-shell .hd-forecast em { min-height: 1.2em; color: #6cc4ff; font: 600 calc(var(--u)*1.5)/1.2 var(--f-body); font-style: normal; font-variant-numeric: tabular-nums; }
.app-shell .hd-forecast__days { display: flex; flex-direction: column; }
.app-shell .hd-forecast__days > div { display: grid; grid-template-columns: calc(var(--u)*7) calc(var(--u)*3.4) calc(var(--u)*5) calc(var(--u)*4.4) minmax(0, 1fr) calc(var(--u)*4.4); align-items: center; gap: calc(var(--u)*1.2); padding: calc(var(--u)*1) 0; border-top: 1px solid rgba(255,255,255,.08); font: 600 calc(var(--u)*1.9)/1.2 var(--f-body); font-variant-numeric: tabular-nums; }
.app-shell .hd-forecast__days span { text-transform: capitalize; }
.app-shell .hd-forecast__days small { color: var(--ink-2); text-align: right; font: inherit; }
.app-shell .hd-forecast__days i { position: relative; height: calc(var(--u)*.8); border-radius: var(--hd-pill,99px); background: rgba(255,255,255,.14); }
.app-shell .hd-forecast__days i b { position: absolute; top: 0; bottom: 0; border-radius: inherit; background: linear-gradient(90deg, #6cc4ff, #ffc94d, #ff9d4d); }
.app-shell .hd-forecast__source { margin: 0; color: var(--ink-3); font: 500 calc(var(--u)*1.5)/1.3 var(--f-body); }
@media (max-width: 560px) {
  .app-shell .hd-forecast__days > div { grid-template-columns: calc(var(--u)*6) calc(var(--u)*3.2) calc(var(--u)*4.4) calc(var(--u)*4.2) minmax(0, 1fr) calc(var(--u)*4.2); gap: calc(var(--u)*.9); }
}

/* ---------- Cameras: the latest still fills the card; a tap opens the live view ---------- */
.app-shell .camera-tile { padding: 0; border: 0; justify-content: flex-end; background: #0c0a0f; color: #fff; cursor: pointer; text-align: left; font: inherit; }
.app-shell .camera-tile__image, .app-shell .camera-tile__empty { position: absolute; inset: 0; width: 100%; height: 100%; }
.app-shell .camera-tile__image { object-fit: cover; }
/* Live video in the card: the player fills it and never takes the tap (which opens the details). */
.app-shell .camera-tile__player { display: block; overflow: hidden; pointer-events: none; }
.app-shell .camera-tile__player ha-camera-stream { display: block; width: 100%; height: 100%; }
.app-shell .camera-tile__badge--live i { width: 7px; height: 7px; border-radius: 50%; background: #ff4d4d; box-shadow: 0 0 0 3px rgba(255,77,77,.25); animation: hd-live 1.6s ease-in-out infinite; }
@keyframes hd-live { 50% { opacity: .35; } }
.app-shell .camera-tile__empty { display: grid; place-items: center; color: rgba(255,255,255,.35); background: rgba(255,255,255,.06); }
.app-shell .camera-tile__shade { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,.62), rgba(0,0,0,0) 55%); pointer-events: none; }
.app-shell .camera-tile__badge { position: absolute; top: calc(var(--u)*1.4); left: calc(var(--u)*1.4); display: inline-flex; align-items: center; gap: calc(var(--u)*.6); padding: calc(var(--u)*.6) calc(var(--u)*1.2); border-radius: var(--hd-pill,99px); background: rgba(0,0,0,.5); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); font: 600 calc(var(--u)*1.4)/1 var(--f-body); letter-spacing: .02em; }
/* A double-size camera keeps the photo layout: the grid of other double cards would put the name at the top, under the badge. */
.app-shell .camera-tile.device-tile--wide { display: flex; flex-direction: column; justify-content: flex-end; }
.app-shell .camera-tile__name { position: relative; padding: calc(var(--u)*2); font: 600 calc(var(--u)*2)/1.2 var(--f-body); text-shadow: 0 1px 8px rgba(0,0,0,.5); }
.app-shell .hd-detail--camera { width: min(960px, calc(100vw - var(--u)*6)); }
.app-shell .hd-camera { overflow: hidden; border-radius: calc(var(--u)*2.4*var(--hd-r,1)); background: #000; aspect-ratio: 16 / 9; display: grid; place-items: center; }
.app-shell .hd-camera img { width: 100%; height: 100%; object-fit: contain; }
.app-shell .hd-camera p { color: var(--ink-2); }

/* ---------- Vacuums: the robot drives around its icon while it cleans ---------- */
.app-shell .device-tile--cleaning .device-tile__icon { position: relative; overflow: visible; }
.app-shell .device-tile--cleaning .device-tile__icon svg { animation: hd-vacuum-drive 3.6s ease-in-out infinite; }
.app-shell .device-tile--cleaning .device-tile__icon::after { content: ""; position: absolute; inset: calc(var(--u)*-.6); border-radius: 50%; border: 2px solid var(--on); opacity: 0; animation: hd-vacuum-sweep 2.4s ease-out infinite; }
@keyframes hd-vacuum-drive {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  25% { transform: translate(3px, -2px) rotate(35deg); }
  50% { transform: translate(0, 2px) rotate(110deg); }
  75% { transform: translate(-3px, -1px) rotate(200deg); }
}
@keyframes hd-vacuum-sweep { 0% { opacity: .7; transform: scale(.85); } 100% { opacity: 0; transform: scale(1.35); } }
@media (prefers-reduced-motion: reduce) { .app-shell .device-tile--cleaning .device-tile__icon svg, .app-shell .device-tile--cleaning .device-tile__icon::after { animation: none; } }

/* ---------- Selects: the current option in the card; every option in the details ---------- */
.app-shell .device-tile .device-select { position: relative; z-index: 2; min-height: calc(var(--u)*4.4); border-radius: var(--hd-pill,99px); font-size: calc(var(--u)*1.7); }
.app-shell .device-tile--active .device-select { border-color: rgba(43,36,24,.16); background: rgba(43,36,24,.08); color: var(--paper-ink); }
.app-shell .hd-options { display: flex; flex-wrap: wrap; gap: calc(var(--u)*.8); }
/* Volume − and +, on double cards and in the details. */
.app-shell .hd-volume { display: flex; align-items: center; justify-content: center; gap: calc(var(--u)*1.2); }
.app-shell .hd-volume button { width: calc(var(--u)*4.4); height: calc(var(--u)*4.4); flex: none; display: grid; place-items: center; padding: 0; border: 0; border-radius: var(--hd-round,50%); background: color-mix(in srgb, currentColor 12%, transparent); color: inherit; cursor: pointer; }
.app-shell .hd-volume button:active { transform: scale(.94); }
.app-shell .hd-volume--large button { width: calc(var(--u)*5.6); height: calc(var(--u)*5.6); }

/* Media: the artwork of what is playing, and the player's sources (Sonos favorites, Apple TV apps). */
.app-shell :is(.device-tile__icon--art, .widget-card__icon--art) { background: center / cover no-repeat; border-radius: calc(var(--u)*1.2*var(--hd-r,1)); box-shadow: 0 calc(var(--u)*.4) calc(var(--u)*1.2) rgba(0,0,0,.25); }
.app-shell .hd-detail__art { width: min(60%, calc(var(--u)*26)); aspect-ratio: 1; margin: 0 auto; border-radius: calc(var(--u)*2.4*var(--hd-r,1)); background: center / cover no-repeat; box-shadow: 0 calc(var(--u)*1.6) calc(var(--u)*4) rgba(0,0,0,.4); }
.app-shell .hd-detail__sources { display: grid; gap: calc(var(--u)*1); max-height: calc(var(--u)*30); overflow-y: auto; }
.app-shell .hd-options button { flex: 1 1 calc(50% - var(--u)*.8); min-height: calc(var(--u)*5.2); padding: 0 calc(var(--u)*1.6); border: 1px solid rgba(255,255,255,.14); border-radius: calc(var(--u)*1.8*var(--hd-r,1)); background: rgba(255,255,255,.08); color: var(--ink); font: 600 calc(var(--u)*1.8)/1.2 var(--f-body); cursor: pointer; }
.app-shell .hd-options button[aria-pressed="true"] { border-color: transparent; background: var(--on); color: var(--on-ink, #2a2110); }
.app-shell .tile-buttons--options { flex-wrap: wrap; }
.app-shell .tile-buttons--options button { flex: 1 1 calc(33% - var(--u)*.8); }
.app-shell .tile-buttons--options button[aria-pressed="true"] { background: var(--on); color: var(--on-ink, #2a2110); }

/* 0.15: room options in Edit mode, nicknames, alarm panels and plants. */
.app-shell .room-options { display: grid; gap: calc(var(--u)*1.4); margin: 0 0 calc(var(--u)*2); padding: calc(var(--u)*1.6); border: 1px dashed rgba(255,255,255,.22); border-radius: calc(var(--u)*2.2*var(--hd-r,1)); background: rgba(255,255,255,.05); }
.app-shell .room-options__row { display: grid; gap: calc(var(--u)*.8); min-width: 0; }
.app-shell .room-options__icons { display: flex; flex-wrap: wrap; gap: calc(var(--u)*.7); max-height: calc(var(--u)*17); overflow-y: auto; scrollbar-width: none; padding-bottom: 2px; }
.app-shell .room-options__icons::-webkit-scrollbar { display: none; }
.app-shell .room-options__icons button { flex: none; display: inline-flex; align-items: center; justify-content: center; gap: calc(var(--u)*.7); min-width: calc(var(--u)*4.6); height: calc(var(--u)*4.6); padding: 0 calc(var(--u)*1.1); border: 1px solid rgba(255,255,255,.14); border-radius: calc(var(--u)*1.6*var(--hd-r,1)); background: rgba(255,255,255,.07); color: var(--ink); font: 600 calc(var(--u)*1.6)/1 var(--f-body); cursor: pointer; }
.app-shell .room-options__icons button[aria-checked="true"] { border-color: transparent; background: var(--on); color: var(--on-ink, #2a2110); }
.app-shell .room-options__select { max-width: calc(var(--u)*44); }
.app-shell .hd-ha-icon { color: inherit; }
.app-shell .hd-detail__name { display: flex; align-items: center; gap: calc(var(--u)*.8); }
/* A long name wraps to two lines and the pencil stays beside it. */
.app-shell .hd-detail__header h2.hd-detail__name { overflow: visible; white-space: normal; }
.app-shell .hd-detail__name > span { min-width: 0; overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow-wrap: anywhere; }
.app-shell .hd-detail__rename { flex: none; display: inline-grid; place-items: center; width: calc(var(--u)*3.4); height: calc(var(--u)*3.4); border: 0; border-radius: 50%; background: rgba(255,255,255,.1); color: var(--ink-2); cursor: pointer; }
.app-shell .hd-detail__naming { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: calc(var(--u)*.8); align-items: center; margin-top: calc(var(--u)*.3); }
.app-shell .hd-detail__naming input { min-width: 0; height: calc(var(--u)*4.6); padding: 0 calc(var(--u)*1.4); border: 1px solid rgba(255,255,255,.22); border-radius: calc(var(--u)*1.4*var(--hd-r,1)); background: rgba(0,0,0,.18); color: var(--ink); font: 500 calc(var(--u)*2.2)/1 var(--f-body); }
.app-shell .hd-detail__naming button { width: calc(var(--u)*4.6); height: calc(var(--u)*4.6); border: 0; border-radius: calc(var(--u)*1.4*var(--hd-r,1)); background: var(--on); color: var(--on-ink, #2a2110); cursor: pointer; display: grid; place-items: center; }
.app-shell .hd-detail__naming small { grid-column: 1 / -1; color: var(--ink-2); font: 500 calc(var(--u)*1.5)/1.3 var(--f-body); }
.app-shell .hd-alarm { display: grid; gap: calc(var(--u)*1.2); }
.app-shell .hd-alarm__code { height: calc(var(--u)*5.6); padding: 0 calc(var(--u)*1.6); border: 1px solid rgba(255,255,255,.22); border-radius: calc(var(--u)*1.8*var(--hd-r,1)); background: rgba(0,0,0,.18); color: var(--ink); font: 600 calc(var(--u)*2.4)/1 var(--f-body); letter-spacing: .3em; text-align: center; }
.app-shell .hd-alarm .hd-detail__primary { margin: 0; }
.app-shell .device-tile--alert { border-color: rgba(255,107,94,.5); background: rgba(255,107,94,.2); }
.app-shell .device-tile--alert .device-tile__icon { background: var(--bad); color: #fff; }
.app-shell .hd-plant { display: grid; gap: calc(var(--u)*1.2); }
.app-shell .hd-plant__head { display: flex; align-items: center; gap: calc(var(--u)*1.2); color: var(--ink-2); font: italic 500 calc(var(--u)*1.8)/1.3 var(--f-body); }
.app-shell .hd-plant__head img { width: calc(var(--u)*7); height: calc(var(--u)*7); border-radius: calc(var(--u)*1.6*var(--hd-r,1)); object-fit: cover; }
.app-shell .hd-plant__readings { display: grid; gap: calc(var(--u)*.7); margin: 0; padding: 0; list-style: none; }
.app-shell .hd-plant__readings li { display: flex; align-items: center; gap: calc(var(--u)*1); min-height: calc(var(--u)*5); padding: 0 calc(var(--u)*1.6); border-radius: calc(var(--u)*1.6*var(--hd-r,1)); background: rgba(255,255,255,.07); font: 500 calc(var(--u)*1.8)/1.2 var(--f-body); }
.app-shell .hd-plant__readings li span { flex: 1; color: var(--ink-2); }
.app-shell .hd-plant__readings li i { font-style: normal; font-weight: 700; color: #ffb3b5; }
.app-shell .hd-plant__readings .hd-plant__reading--problem { background: rgba(255,107,94,.18); }

.app-shell .st-icon-button--small { width: calc(var(--u)*4); height: calc(var(--u)*4); background: rgba(255,255,255,.08); color: var(--ink-2); }
.app-shell .st-input--framed { height: calc(var(--u)*4.2); border-color: rgba(255,255,255,.3); background: rgba(0,0,0,.16); }
.app-shell .st-item__was { flex: none; max-width: 40%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--ink-3); font: 500 calc(var(--u)*1.5)/1 var(--f-body); }

/* 0.16: history, large cards, camera full screen, weather, sun and energy cards, animations. */
.app-shell .hd-item--tall { grid-row: span 2; }
.app-shell .hd-item--tall > :first-child { height: 100%; }
.app-shell .empty-state p { color: #fff; }
.app-shell .hd-alarm__open { display: grid; gap: calc(var(--u)*.5); padding: calc(var(--u)*1.2) calc(var(--u)*1.4); border-radius: calc(var(--u)*1.6*var(--hd-r,1)); background: rgba(255,122,107,.14); color: #ffd9d4; font-size: calc(var(--u)*1.7); }
.app-shell .hd-alarm__open button { justify-self: start; height: calc(var(--u)*4); min-height: 32px; margin-top: calc(var(--u)*.4); padding: 0 calc(var(--u)*1.6); border: 0; border-radius: var(--hd-pill,99px); background: #fff; color: #1d1a17; font: 600 calc(var(--u)*1.6)/1 var(--f-body); cursor: pointer; }
.app-shell .hd-audience { display: flex; flex-wrap: wrap; gap: calc(var(--u)*.7); }
.app-shell .hd-audience button { display: inline-flex; align-items: center; gap: calc(var(--u)*.5); height: calc(var(--u)*4); min-height: 32px; padding: 0 calc(var(--u)*1.5); border: 1px solid rgba(255,255,255,.16); border-radius: var(--hd-pill,99px); background: transparent; color: rgba(255,255,255,.65); font: 600 calc(var(--u)*1.6)/1 var(--f-body); cursor: pointer; }
.app-shell .hd-audience button[aria-pressed="true"] { border-color: transparent; background: var(--on); color: var(--on-ink, #2a2110); }
.app-shell .hd-grid--editing .hd-item--restricted > :first-child { opacity: .42; }
.app-shell .hd-grid--editing .hd-item--restricted::after { content: ""; position: absolute; left: 50%; top: 50%; width: calc(var(--u)*4); height: 3px; border-radius: 3px; background: var(--bad, #ff7a6b); transform: translate(-50%, -50%) rotate(-35deg); pointer-events: none; }
.app-shell .bins-card { padding: calc(var(--u)*1.6); }
.app-shell .bins-card__row { flex: 1; min-height: 0; height: 100%; display: flex; align-items: stretch; justify-content: space-around; gap: calc(var(--u)*1); }
.app-shell .bins-card__bin { flex: 1 1 0; min-width: 0; min-height: 0; display: flex; flex-direction: column; align-items: center; justify-content: space-between; gap: calc(var(--u)*.5); padding: 0; border: 0; background: none; color: inherit; cursor: pointer; }
.app-shell .bins-card__bin b { max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font: 700 calc(var(--u)*1.45)/1.1 var(--f-body); letter-spacing: .04em; text-transform: uppercase; color: var(--ink-2, rgba(255,255,255,.75)); }
.app-shell .bins-card__bin--next b { color: var(--on, #ffc94d); }
.app-shell .bins-card__art { flex: 1 1 0; min-height: 0; width: 100%; max-height: calc(var(--u)*11); }
.app-shell .hd-item--tall .bins-card__art { max-height: calc(var(--u)*22); }
.app-shell .bins-card__bin small { max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font: 500 calc(var(--u)*1.45)/1.1 var(--f-body); color: var(--ink-2, rgba(255,255,255,.75)); }
.app-shell .st-bin { display: grid; grid-template-columns: minmax(0, 2fr) minmax(0, 1.4fr) minmax(0, 1fr) auto; align-items: center; gap: calc(var(--u)*.8); padding: calc(var(--u)*.6) 0; }
@media (max-width: 720px) { .app-shell .st-bin { grid-template-columns: minmax(0, 1fr) auto; } }
.app-shell .hd-links { display: grid; gap: calc(var(--u)*.7); min-width: 0; margin-top: calc(var(--u)*.8); }
.app-shell .hd-link { display: flex; align-items: center; justify-content: space-between; gap: calc(var(--u)*.8); min-width: 0; min-height: calc(var(--u)*3.8); }
.app-shell .hd-link__name { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font: 600 calc(var(--u)*1.6)/1.15 var(--f-body); }
.app-shell .hd-link__value { flex: none; font: 600 calc(var(--u)*1.6)/1 var(--f-body); opacity: .75; }
.app-shell .hd-link__buttons { flex: none; display: inline-flex; gap: calc(var(--u)*.5); }
.app-shell .hd-link__buttons button { width: calc(var(--u)*3.8); height: calc(var(--u)*3.8); min-width: 30px; min-height: 30px; padding: 0; display: grid; place-items: center; border: 0; border-radius: var(--hd-round,50%); background: color-mix(in srgb, currentColor 14%, transparent); color: inherit; cursor: pointer; }
.app-shell .hd-link--select .device-select { flex: 0 1 62%; min-width: 0; }
.app-shell .hd-link__run { display: flex; align-items: center; justify-content: center; gap: calc(var(--u)*.7); width: 100%; height: calc(var(--u)*4.4); min-height: 34px; padding: 0 calc(var(--u)*1.2); border: 0; border-radius: var(--hd-pill,99px); background: #fff; color: #1d1a17; font: 600 calc(var(--u)*1.65)/1 var(--f-body); cursor: pointer; }
.app-shell .device-tile--active .hd-link__run { background: var(--lc, var(--on)); color: var(--on-ink, #2a2110); }
.app-shell .hd-link__run span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.app-shell .hd-link button:disabled, .app-shell .hd-link__run:disabled { opacity: .4; cursor: default; }
/* Cards with extra devices split half and half: the card's own content left, the devices right. */
.app-shell .room-card__links { position: absolute; z-index: 2; left: calc(50% + var(--u)*1.2); right: calc(var(--u)*2.4); bottom: calc(var(--u)*2); }
.app-shell .room-card__links .hd-links { margin: 0; }
.app-shell .room-card:has(.hd-links) .room-card__content { max-width: calc(50% - var(--u)*3.6); }
.app-shell .device-tile--wide:has(.hd-links) { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
.app-shell .room-card:has(.hd-links) .room-card__content strong { white-space: normal; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; }
.app-shell .hd-link .ls-switch { flex: none; background: color-mix(in srgb, currentColor 20%, transparent); }
.app-shell .hd-link .ls-switch--on { background: var(--on, #ffc94d); }
.app-shell .room-card--active .hd-link .ls-switch i, .app-shell .device-tile--active .hd-link .ls-switch i { background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,.3); }
.app-shell .hd-links-editor small { opacity: .65; font-size: calc(var(--u)*1.5); }
.app-shell .hd-links-editor__item { display: flex; align-items: center; justify-content: space-between; gap: calc(var(--u)*1); padding: calc(var(--u)*.6) calc(var(--u)*.6) calc(var(--u)*.6) calc(var(--u)*1.2); border-radius: var(--hd-pill,99px); background: rgba(255,255,255,.08); }
.app-shell .hd-links-editor__item button { width: calc(var(--u)*3.2); height: calc(var(--u)*3.2); min-width: 26px; min-height: 26px; padding: 0; display: grid; place-items: center; border: 0; border-radius: 50%; background: #d9534f; color: #fff; cursor: pointer; }
.app-shell .hd-links-editor > .hd-pill { justify-self: start; }
.app-shell .hd-links-editor__item input { flex: 1; min-width: 0; height: calc(var(--u)*3.8); min-height: 32px; padding: 0 calc(var(--u)*1); border: 1px solid transparent; border-radius: calc(var(--u)*1*var(--hd-r,1)); background: transparent; color: inherit; font: 600 calc(var(--u)*1.7)/1 var(--f-body); }
.app-shell .hd-links-editor__item input:focus { outline: none; border-color: rgba(255,255,255,.35); background: rgba(0,0,0,.18); }
.app-shell .hd-links-editor__item input::placeholder { color: inherit; opacity: .85; }
.app-shell .hd-detail .hd-swatches { flex-wrap: nowrap; justify-content: space-between; gap: calc(var(--u)*.5); }
.app-shell .hd-detail .hd-swatches button { flex: 0 1 calc(var(--u)*4.2); width: auto; height: auto; aspect-ratio: 1; min-width: 0; padding: 0; }
.app-shell .hd-swatches button.hd-swatches__other { border: 0; background: conic-gradient(#f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00); box-shadow: inset 0 0 0 2px rgba(255,255,255,.28); }
.app-shell .hd-temps { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: calc(var(--u)*.8); }
.app-shell .hd-temps button { display: inline-flex; align-items: center; justify-content: center; gap: calc(var(--u)*.8); height: calc(var(--u)*5); min-height: 38px; padding: 0 calc(var(--u)*.8); border: 1px solid rgba(255,255,255,.14); border-radius: var(--hd-pill,99px); background: rgba(255,255,255,.08); color: var(--ink,#fff); font: 600 calc(var(--u)*1.7)/1 var(--f-body); cursor: pointer; }
.app-shell .hd-temps button i { flex: none; width: calc(var(--u)*1.8); height: calc(var(--u)*1.8); border-radius: 50%; background: var(--t); }
.app-shell .hd-temps button[aria-pressed="true"] { border-color: transparent; background: #fff; color: #1d1a17; }
.app-shell .hd-wheel { position: relative; width: min(calc(var(--u)*30), 100%); aspect-ratio: 1; margin: calc(var(--u)*.6) auto; border-radius: 50%; background: radial-gradient(closest-side, #fff, rgba(255,255,255,0)), conic-gradient(#f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00); box-shadow: 0 0 0 1px rgba(255,255,255,.18), 0 calc(var(--u)*1) calc(var(--u)*3) rgba(0,0,0,.35); cursor: crosshair; touch-action: none; }
.app-shell .hd-wheel:focus-visible { outline: 2px solid #fff; outline-offset: 3px; }
.app-shell .hd-wheel i { position: absolute; width: calc(var(--u)*3.4); height: calc(var(--u)*3.4); min-width: 24px; min-height: 24px; border: 3px solid #fff; border-radius: 50%; transform: translate(-50%, -50%); box-shadow: 0 2px 8px rgba(0,0,0,.45); pointer-events: none; }
.app-shell .st-page-row { display: grid; gap: calc(var(--u)*.8); min-width: 0; }
.app-shell .hd-pill--danger { background: var(--bad, #ff7a6b); border-color: transparent; color: #fff; }
/* Small sensor cards: a grid holding one switches to half-height rows, every other card spans two. */
.app-shell .hd-grid--halves { grid-auto-flow: row dense; }
.app-shell .hd-grid--halves > :is(.hd-item, .hd-add-tile) { grid-row: span 2; }
.app-shell .hd-grid--halves > .hd-item--tall { grid-row: span 4; }
.app-shell .hd-grid--halves > .hd-item--small { grid-row: span 1; }
.app-shell .home-grid.hd-grid--halves { grid-auto-rows: minmax(calc(var(--u)*8.6), 1fr); }
.app-shell :is(.room-pane .device-grid, .collection-grid).hd-grid--halves { grid-auto-rows: minmax(calc(var(--u)*7.35), auto); }
.app-shell .sb-grid.hd-grid--halves { grid-auto-rows: minmax(calc(var(--u)*7.6), auto); }
@media (max-width: 720px) { .app-shell .home-grid.hd-grid--halves { grid-auto-rows: minmax(calc(var(--u)*10.1), auto); } }
.app-shell .hd-item--small > .device-tile { height: 100%; min-height: 0; flex-direction: row; align-items: center; gap: calc(var(--u)*1.4); padding: calc(var(--u)*1.2) calc(var(--u)*1.6); }
.app-shell .hd-item--small > .device-tile > .device-tile__top { min-height: 0; flex: none; }
.app-shell .hd-item--small > .device-tile .device-tile__icon { width: calc(var(--u)*4.4); height: calc(var(--u)*4.4); }
.app-shell .hd-item--small > .device-tile > .device-tile__copy { flex: 1; min-width: 0; margin: 0; display: flex; flex-direction: column; align-items: flex-start; gap: 2px; text-align: left; }
.app-shell .hd-item--small > .device-tile .device-tile__copy :is(strong, span) { -webkit-line-clamp: 1; }
.app-shell .hd-item--small > .device-tile .device-tile__guard { display: none; }
.app-shell .hd-history { display: grid; gap: calc(var(--u)*1); color: var(--on); }
.app-shell .hd-history__head { display: flex; align-items: center; justify-content: space-between; gap: calc(var(--u)*1); color: var(--ink); }
.app-shell .hd-history__ranges { display: flex; gap: calc(var(--u)*.5); }
.app-shell .hd-history__ranges button { min-height: calc(var(--u)*3.6); padding: 0 calc(var(--u)*1.2); border: 1px solid rgba(255,255,255,.14); border-radius: 99px; background: rgba(255,255,255,.06); color: var(--ink-2); font: 600 calc(var(--u)*1.5)/1 var(--f-body); cursor: pointer; }
.app-shell .hd-history__ranges button[aria-pressed="true"] { background: var(--on); border-color: transparent; color: var(--on-ink, #2a2110); }
.app-shell .hd-history__empty { display: grid; place-items: center; min-height: calc(var(--u)*12); margin: 0; color: var(--ink-2); font: 500 calc(var(--u)*1.7)/1.3 var(--f-body); text-align: center; }
.app-shell .hd-spark { margin: 0; display: grid; gap: calc(var(--u)*.6); }
.app-shell .hd-spark svg { width: 100%; height: calc(var(--u)*14); display: block; touch-action: none; overflow: visible; }
.app-shell .hd-spark--compact svg { height: 100%; min-height: calc(var(--u)*6); }
.app-shell .hd-spark figcaption { display: flex; justify-content: center; color: var(--ink-2); font: 500 calc(var(--u)*1.6)/1.2 var(--f-body); }
.app-shell .hd-spark figcaption span { display: flex; gap: calc(var(--u)*2); }
.app-shell .hd-spark figcaption i { font-style: normal; }
.app-shell .hd-spark__hover b { color: var(--ink); }
.app-shell .hd-camera { position: relative; }
.app-shell .hd-camera__full { position: absolute; right: calc(var(--u)*1); bottom: calc(var(--u)*1); width: calc(var(--u)*4.4); height: calc(var(--u)*4.4); display: grid; place-items: center; border: 0; border-radius: 50%; background: rgba(0,0,0,.55); color: #fff; cursor: pointer; backdrop-filter: blur(6px); }
.app-shell .hd-camera:fullscreen, .app-shell .hd-camera--full { position: fixed; inset: 0; z-index: 400; width: 100vw; height: 100vh; height: 100dvh; aspect-ratio: auto; display: grid; place-items: center; margin: 0; border-radius: 0; background: #000; }
.app-shell .hd-camera:fullscreen img, .app-shell .hd-camera--full img { width: 100%; height: 100%; max-height: none; object-fit: contain; border-radius: 0; }
.app-shell .hd-camera__player { display: block; width: 100%; height: 100%; }
.app-shell .hd-camera:fullscreen .hd-camera__player, .app-shell .hd-camera--full .hd-camera__player { width: 100%; height: 100%; }
.app-shell .widget-card--wide > .widget-hours, .app-shell .widget-card--wide > .sun-arc { grid-area: 1 / 2 / 4 / 3; align-self: center; min-width: 0; }
.app-shell .widget-hours { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: calc(var(--u)*.6); text-align: center; }
.app-shell .widget-hours span { display: grid; justify-items: center; gap: calc(var(--u)*.5); }
.app-shell .widget-hours small { color: var(--ink-2); font: 500 calc(var(--u)*1.4)/1 var(--f-body); }
.app-shell .widget-hours b { font: 600 calc(var(--u)*1.8)/1 var(--f-body); }
.app-shell .sun-arc { width: 100%; height: auto; overflow: visible; color: inherit; }
.app-shell .widget-card--wide.widget-card--energy { grid-template-rows: auto 1fr auto auto; }
.app-shell .widget-card__chart { grid-column: 1 / -1; min-height: calc(var(--u)*7); color: var(--on); margin-top: calc(var(--u)*1); }
.app-shell .hd-item--tall .widget-card__chart { flex: 1; }
/* Sensor charts (optional): double cards draw a thin line on the right half, large cards fill the middle. */
.app-shell .device-tile__spark { position: absolute; right: calc(var(--u)*1.6); bottom: calc(var(--u)*1.6); width: 46%; height: calc(var(--u)*4.4); color: var(--on); opacity: .85; pointer-events: none; }
.app-shell .device-tile__spark .hd-spark, .app-shell .device-tile__spark svg { height: 100%; min-height: 0; }
.app-shell .device-tile__spark--tall { left: calc(var(--u)*1.6); width: auto; top: 38%; bottom: 34%; height: auto; }
.app-shell .device-tile:has(.device-tile__spark) .tile-wide__since { position: absolute; top: calc(var(--u)*2.2); right: calc(var(--u)*2.2); margin: 0; }
@keyframes hd-spin { to { transform: rotate(360deg); } }
@keyframes hd-glow { 0%, 100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--lc, var(--on)) 0%, transparent); } 50% { box-shadow: 0 0 calc(var(--u)*2.4) calc(var(--u)*.4) color-mix(in srgb, var(--lc, var(--on)) 55%, transparent); } }
@keyframes hd-shake { 0%, 100% { transform: translate(0, 0) rotate(0); } 20% { transform: translate(-1px, 1px) rotate(-3deg); } 40% { transform: translate(1px, -1px) rotate(3deg); } 60% { transform: translate(-1px, 0) rotate(-2deg); } 80% { transform: translate(1px, 1px) rotate(2deg); } }
.app-shell.hd-anim [data-domain="fan"].device-tile--active .device-tile__icon svg { animation: hd-spin 1.6s linear infinite; }
.app-shell.hd-anim [data-domain="light"].device-tile--active .device-tile__icon { animation: hd-glow 3.2s ease-in-out infinite; }
.app-shell.hd-anim [data-running="appliance"] .device-tile__icon svg { animation: hd-shake .45s linear infinite; }
@media (prefers-reduced-motion: reduce) { .app-shell.hd-anim [data-domain] .device-tile__icon, .app-shell.hd-anim [data-domain] .device-tile__icon svg { animation: none !important; } }

/* No scroll bars inside the panel: scrolling works as before. */
.app-shell, .app-shell * { scrollbar-width: none; }
.app-shell ::-webkit-scrollbar, .app-shell::-webkit-scrollbar { display: none; }

/* Screensaver agenda, as on the home dashboard: today's events and reminders under the clock. */
.app-shell .hd-saver__clock { transition: transform .4s ease; }
.app-shell .hd-saver:has(.hd-saver__agenda) .hd-saver__clock { transform: translateY(-9vh); }
.app-shell .hd-saver:has(.hd-saver__agenda--many) .hd-saver__clock { transform: translateY(-15vh); }
.app-shell .hd-saver:has(.hd-saver__agenda) .hd-saver__time { font-size: min(26vw, 34vh, 240px); }
.app-shell .hd-saver__agenda { position: absolute; left: 50%; bottom: calc(80px + env(safe-area-inset-bottom, 0px)); transform: translateX(-50%); width: min(560px, calc(100vw - 48px)); max-height: 40vh; overflow: hidden; display: flex; flex-direction: column; gap: 14px; padding: 14px 16px; border-radius: 22px; background: rgba(0,0,0,.22); box-shadow: inset 0 0 0 1px rgba(255,255,255,.1); text-align: left; cursor: default; }
.app-shell .hd-saver__agenda section { display: flex; flex-direction: column; gap: 6px; }
.app-shell .hd-saver__head { display: flex; align-items: center; gap: 8px; padding-bottom: 4px; font: 700 12px/1 var(--f-body); letter-spacing: .14em; text-transform: uppercase; opacity: .65; }
.app-shell .hd-saver__row { display: flex; align-items: center; gap: 12px; font: 500 clamp(14px, 2.2vw, 19px)/1.25 var(--f-body); }
.app-shell .hd-saver__row i { flex: none; width: 14px; height: 14px; border-radius: 50%; box-shadow: inset 0 0 0 2px rgba(255,255,255,.8); }
.app-shell .hd-saver__row span { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.app-shell .hd-saver__row small { flex: none; font-size: .82em; opacity: .65; font-variant-numeric: tabular-nums; }
.app-shell .hd-saver__row--late i { box-shadow: inset 0 0 0 2px #ff8a7e; }
.app-shell .hd-saver__row--late small { color: #ffb0a8; opacity: .95; }
.app-shell .hd-saver__more { padding-left: 26px; font: 500 14px/1.2 var(--f-body); opacity: .55; }
.app-shell .hd-saver:has(.hd-saver__agenda) .hd-saver__hint { bottom: calc(40px + env(safe-area-inset-bottom, 0px)); }

/* Separators inside a list group: inset like the rows. A separator inside an edited list (a room's
   rows on Home) neither jiggles nor blocks its title field, whatever grid it sits in. */
.app-shell .ls-group .hd-sections { gap: 0; }
.app-shell .ls-group .hd-sections > .hd-item--section { margin: 0; padding: calc(var(--u)*1.6) calc(var(--u)*1.8) calc(var(--u)*.8) calc(var(--u)*1.6); }
.app-shell .ls-group .hd-sections > .hd-item--section + .ls-rows, .app-shell .ls-group .hd-sections > .ls-rows + .hd-item--section { border-top: 1px solid rgba(255,255,255,.07); }
.app-shell .hd-grid--editing .hd-item--section, .app-shell .hd-sections--editing .hd-item--section { animation: none; }
.app-shell .hd-grid--editing .hd-item--section > :first-child, .app-shell .hd-sections--editing .hd-item--section > :first-child { pointer-events: auto; }
.app-shell .hd-section__input { user-select: text; -webkit-user-select: text; cursor: text; touch-action: auto; }
.app-shell .ls-group .hd-sections > .hd-item--section .hd-item__badge--remove { left: calc(var(--u)*.6); }
/* Doorbell pop-up (Pro): above everything, the screensaver included. */
.app-shell .st-actions--end { justify-content: flex-end; }
/* Settings menu: with many sections it scrolls on its own on short screens instead of running off the bottom. */
@media (min-width: 721px) { .app-shell .st-nav .room-selector__list { max-height: calc(100dvh - var(--u)*4); overflow-y: auto; scrollbar-width: none; } }
/* An action at the end of a group sits in its own row, with the rows' divider and breathing room. */
/* Rows with a select breathe like the others: the select no longer touches the dividers. */
.app-shell .st-sub__row:has(.hdx-select) { padding: calc(var(--u)*.8) 0; }
.app-shell .st-sub > .st-actions--end { margin: 0; padding: calc(var(--u)*1.2) 0 calc(var(--u)*.8); border-top: 1px solid rgba(255,255,255,.07); }
.app-shell .st-sub > .st-actions--end .hd-pill { min-height: calc(var(--u)*4.4); padding-inline: calc(var(--u)*2); }
.app-shell .hd-doorbell { position: fixed; inset: 0; z-index: 900; display: grid; place-items: center; padding: calc(var(--u)*3); background: rgba(8,6,10,.72); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); animation: hd-doorbell-in .25s ease-out; }
.app-shell .hd-doorbell__panel { width: min(100%, 1100px); display: grid; gap: calc(var(--u)*1.6); padding: calc(var(--u)*2); border-radius: calc(var(--u)*3*var(--hd-r,1)); background: rgba(30,24,34,.92); border: 1px solid rgba(255,255,255,.1); box-shadow: 0 30px 90px rgba(0,0,0,.55); }
.app-shell .hd-doorbell__panel > header { display: flex; align-items: center; gap: calc(var(--u)*1.4); }
.app-shell .hd-doorbell__panel > header > div { flex: 1; min-width: 0; display: grid; gap: 2px; }
.app-shell .hd-doorbell__panel strong { font: 500 calc(var(--u)*2.8)/1.1 var(--f-display); color: var(--ink); }
.app-shell .hd-doorbell__panel small { color: var(--ink-2); font: 500 calc(var(--u)*1.6)/1.2 var(--f-body); }
.app-shell .hd-doorbell__icon { width: calc(var(--u)*5); height: calc(var(--u)*5); flex: none; display: grid; place-items: center; border-radius: 50%; background: var(--on); color: var(--on-ink, #2a2110); animation: hd-doorbell-ring 1.2s ease-in-out 3; }
.app-shell .hd-doorbell__panel > header > button { width: calc(var(--u)*4.6); height: calc(var(--u)*4.6); flex: none; display: grid; place-items: center; border: 0; border-radius: 50%; background: rgba(255,255,255,.1); color: var(--ink); cursor: pointer; }
.app-shell .hd-doorbell .hd-camera { max-height: calc(100dvh - var(--u)*16); }
.app-shell .hd-doorbell__none { margin: 0; padding: calc(var(--u)*4) 0; text-align: center; color: var(--ink-2); }
@keyframes hd-doorbell-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes hd-doorbell-ring { 0%, 100% { transform: rotate(0); } 15% { transform: rotate(14deg); } 30% { transform: rotate(-12deg); } 45% { transform: rotate(8deg); } 60% { transform: rotate(-4deg); } }

/* A protected device: a small lock on its tile, and the second-tap prompt over it. */
.app-shell .device-tile__guard { position: absolute; top: calc(var(--u)*1.6); right: calc(var(--u)*1.6); width: calc(var(--u)*2.8); height: calc(var(--u)*2.8); display: grid; place-items: center; border-radius: 50%; background: rgba(0,0,0,.18); color: inherit; opacity: .8; }
.app-shell .device-tile__confirm { position: absolute; inset: 0; z-index: 3; display: grid; place-items: center; padding: calc(var(--u)*1.4); border-radius: inherit; background: rgba(18,12,16,.8); color: #fff; outline: 2px solid var(--on); outline-offset: -2px; text-align: center; font: 600 calc(var(--u)*1.8)/1.25 var(--f-body); animation: hd-confirm-in .15s ease-out; pointer-events: none; }
@keyframes hd-confirm-in { from { opacity: 0; transform: scale(.97); } to { opacity: 1; transform: none; } }
.app-shell .device-tile__icon .hd-ha-icon { color: inherit; }
/* Device options in the details: a quiet button, then the icon picker and the confirmation switch. */
.app-shell .hd-detail__options-toggle { justify-self: center; display: inline-flex; align-items: center; gap: calc(var(--u)*.7); margin-top: calc(var(--u)*1.4); padding: calc(var(--u)*.8) calc(var(--u)*1.6); border: 0; border-radius: var(--hd-pill,99px); background: rgba(255,255,255,.07); color: var(--ink-2); font: 600 calc(var(--u)*1.5)/1 var(--f-body); cursor: pointer; }
.app-shell .hd-detail__options { margin: calc(var(--u)*1.6) 0 0; }
.app-shell .hd-detail__confirm { display: flex; align-items: center; justify-content: space-between; gap: calc(var(--u)*2); cursor: pointer; }
.app-shell .hd-detail__confirm b { display: block; color: var(--ink); font: 600 calc(var(--u)*1.7)/1.25 var(--f-body); }
.app-shell .hd-detail__confirm small { display: block; margin-top: 2px; color: var(--ink-2); font: 500 calc(var(--u)*1.45)/1.3 var(--f-body); }

/* Special dates: the animation layer behind the cards, the badge by the clock and the saver greeting. */
.app-shell .hd-season-layer { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
.app-shell .hd-season-layer canvas { position: absolute; inset: 0; width: 100%; height: 100%; }
.app-shell .hd-season-bunting { position: absolute; top: 0; left: 0; width: 100%; height: calc(var(--u)*3.4); opacity: .85; }
.app-shell .hd-season-badge { display: inline-flex; align-items: center; gap: 4px; margin-left: calc(var(--u)*1.2); padding: calc(var(--u)*.55) calc(var(--u)*1.5); line-height: 1.2; border-radius: var(--hd-pill,99px); background: rgba(255,255,255,.12); color: var(--ink); font-weight: 600; letter-spacing: 0; text-transform: none; white-space: nowrap; }
.app-shell .hd-season-badge--day { background: var(--on); color: var(--on-ink, #2a2110); }
.app-shell .hd-saver__season { margin-top: calc(var(--u)*2); color: #fff; font: 500 calc(var(--u)*3.2)/1.2 var(--f-display); text-align: center; }
.app-shell .st-season-actions { display: inline-flex; align-items: center; gap: calc(var(--u)*1); flex: none; }
.app-shell .st-season-see { padding-block: calc(var(--u)*.6); font-size: calc(var(--u)*1.45); }
.app-shell .hd-season-preview { position: fixed; inset: 0; z-index: 700; pointer-events: none; }
.app-shell .hd-season-preview .hd-season-layer { z-index: 0; }
.app-shell .hd-season-preview__chip { position: absolute; left: 50%; bottom: calc(var(--u)*4); transform: translateX(-50%); display: inline-flex; align-items: center; gap: calc(var(--u)*1.2); padding: calc(var(--u)*.8) calc(var(--u)*.8) calc(var(--u)*.8) calc(var(--u)*.8); border: 0; border-radius: var(--hd-pill,99px); background: rgba(20,14,20,.85); color: #fff; font: 600 calc(var(--u)*1.6)/1 var(--f-body); pointer-events: auto; cursor: pointer; backdrop-filter: blur(10px); }
.app-shell .hd-season-preview__chip > span:last-child { padding-right: calc(var(--u)*1); opacity: .8; }
.app-shell .st-season-add { display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr) minmax(0, 1fr) auto; gap: calc(var(--u)*.8); align-items: center; padding: calc(var(--u)*1) 0; border-top: 1px solid rgba(255,255,255,.07); }
.app-shell .st-season-add input { min-width: 0; height: calc(var(--u)*4.4); padding: 0 calc(var(--u)*1.2); border: 1px solid rgba(255,255,255,.2); border-radius: calc(var(--u)*1.4*var(--hd-r,1)); background: rgba(0,0,0,.18); color: var(--ink); font: 500 calc(var(--u)*1.6)/1 var(--f-body); color-scheme: dark; }
@media (max-width: 720px) { .app-shell .st-season-add { grid-template-columns: 1fr 1fr; } }

/* Special-date decorations on the cards and in the empty spaces (above the cards, under the dock, never tappable). */
.app-shell .hd-decor { position: fixed; inset: 0; z-index: 8; pointer-events: none; overflow: hidden; }
.app-shell .hd-decor__at { position: absolute; }
.app-shell .hd-decor__row { display: flex; gap: 3px; align-items: flex-end; }
.app-shell .hd-decor__webclip { width: 64px; height: 64px; overflow: hidden; }
.app-shell .hd-decor__lights { position: absolute; top: 0; left: 0; width: 100%; height: calc(var(--u)*4.2); }
.app-shell .hd-decor__bulb { animation: hd-bulb 2s ease-in-out infinite; }
@keyframes hd-bulb { 0%, 100% { opacity: 1; } 50% { opacity: .35; } }
.app-shell .hd-decor__ghost { position: absolute; top: 55%; left: 0; opacity: .85; animation: hd-ghost 60s linear infinite; animation-delay: 4s; transform: translateX(-80px); }
.app-shell .hd-decor__ghost--now { animation: hd-ghost-now 8s linear 1; }
@keyframes hd-ghost { 0% { transform: translate(-80px, 0); } 8% { transform: translate(30vw, -30px); } 16% { transform: translate(60vw, 20px); } 24% { transform: translate(calc(100vw + 20px), -20px); } 100% { transform: translate(calc(100vw + 20px), -20px); } }
@keyframes hd-ghost-now { 0% { transform: translate(-80px, 0); } 33% { transform: translate(30vw, -30px); } 66% { transform: translate(60vw, 20px); } 100% { transform: translate(calc(100vw + 20px), -20px); } }
.app-shell .hd-decor__ghost-body { animation: hd-ghost-wobble 1.6s ease-in-out infinite alternate; }
@keyframes hd-ghost-wobble { from { transform: rotate(-6deg); } to { transform: rotate(6deg); } }
.app-shell .hd-decor__dangle { transform-origin: top center; animation: hd-dangle 3.2s ease-in-out infinite alternate; }
@keyframes hd-dangle { from { transform: translateY(-34px) scaleY(.9); } to { transform: translateY(0) scaleY(1); } }
.app-shell .hd-decor__peek { width: 64px; overflow: hidden; }
.app-shell .hd-decor__bunny-body { display: block; transform: translateY(100%); animation: hd-peek 6s ease-in-out infinite; }
@keyframes hd-peek { 0%, 100% { transform: translateY(100%); } 18%, 62% { transform: translateY(14%); } 30% { transform: translateY(18%) rotate(-4deg); } 45% { transform: translateY(14%) rotate(4deg); } }
.app-shell .hd-decor__tag { display: grid; justify-items: center; transform-origin: top center; animation: hd-swing 2.4s ease-in-out infinite alternate; }
.app-shell .hd-decor__string { width: 1px; height: 12px; background: rgba(255,255,255,.6); }
@keyframes hd-swing { from { transform: rotate(-9deg); } to { transform: rotate(9deg); } }
.app-shell .hd-decor__speck { display: block; width: 7px; height: 3px; border-radius: 1px; }
.app-shell .hd-decor__balloons { position: absolute; inset: 0; }
.app-shell .hd-decor__balloon { position: absolute; bottom: -110px; animation: hd-balloon 16s linear infinite; }
@keyframes hd-balloon { 0% { transform: translate(0, 0); } 50% { transform: translate(24px, -55vh); } 100% { transform: translate(-10px, calc(-100vh - 140px)); } }
@media (prefers-reduced-motion: reduce) { .app-shell .hd-decor * { animation: none !important; } .app-shell .hd-decor__bunny-body { transform: translateY(14%); } }


/* Notices beside the people: chips like the weather one, only while something needs attention. */
.app-shell .hd-notices { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: calc(var(--u)*.8); min-width: 0; }
.app-shell .hd-notice { display: inline-flex; align-items: center; gap: calc(var(--u)*.8); max-width: calc(var(--u)*30); padding: calc(var(--u)*.9) calc(var(--u)*1.6) calc(var(--u)*.9) calc(var(--u)*1.2); border: 1px solid color-mix(in srgb, var(--on, #ffc94d) 45%, transparent); border-radius: var(--hd-pill, 99px); background: color-mix(in srgb, var(--on, #ffc94d) 16%, rgba(255,255,255,.06)); backdrop-filter: blur(18px); color: var(--ink, #fff); font: 600 calc(var(--u)*1.7)/1.1 var(--f-body); cursor: pointer; }
.app-shell .hd-notice__icon { flex: none; display: inline-flex; color: var(--on, #ffc94d); --mdc-icon-size: 18px; }
.app-shell .hd-notice__name { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.app-shell .hd-notice small { flex: none; font-weight: 500; opacity: .7; }
.app-shell .hd-notice--icon { padding: calc(var(--u)*.9); }
.app-shell .hd-notice--text { padding-left: calc(var(--u)*1.6); }
.app-shell .st-notice-edit { display: flex; align-items: center; gap: calc(var(--u)*.8); min-width: 0; }
.app-shell .st-notice-edit .st-input { width: calc(var(--u)*22); max-width: 100%; }
.app-shell .st-notice-edit { flex-wrap: wrap; justify-content: flex-end; }
.app-shell .hd-pill--set, .app-shell .hd-pill[aria-expanded="true"] { background: var(--on); color: var(--on-ink, #2a2110); }
.app-shell .st-notice-rules { display: grid; gap: calc(var(--u)*1); padding: calc(var(--u)*1) 0 calc(var(--u)*1.6); }
.app-shell .st-notice-rules > small, .app-shell .hd-rules small { color: var(--ink-3); }
.app-shell .hd-rules { display: grid; gap: calc(var(--u)*1.4); min-width: 0; }
.app-shell .hd-rules__row { display: grid; gap: calc(var(--u)*.7); min-width: 0; }
.app-shell .hd-rules__label { font-weight: 600; }
.app-shell .hd-rules__body { display: flex; flex-wrap: wrap; align-items: center; gap: calc(var(--u)*.8); min-width: 0; }
.app-shell .hd-rules__time { flex: none; width: calc(var(--u)*13); color-scheme: dark; }
.app-shell .hd-rules__row > .hd-pill { justify-self: start; }
.app-shell .hd-rules__rule { display: grid; gap: calc(var(--u)*.8); padding: calc(var(--u)*1.1) calc(var(--u)*1.2); border-radius: calc(var(--u)*1.6*var(--hd-r,1)); background: rgba(255,255,255,.06); min-width: 0; }
.app-shell .hd-rules__head { display: flex; align-items: center; gap: calc(var(--u)*1); min-width: 0; }
.app-shell .hd-rules__head small { flex: none; max-width: 45%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.app-shell .hd-rules__value { display: inline-flex; align-items: center; gap: calc(var(--u)*.8); }
.app-shell .hd-rules__value .st-input { width: calc(var(--u)*16); flex: none; }
.app-shell .hd-rules__days button { min-width: calc(var(--u)*5.4); padding: 0 calc(var(--u)*.8); }
:is(.app-shell, .onboarding-screen) .hd-import { display: grid; gap: 12px; min-width: 0; text-align: left; }
:is(.app-shell, .onboarding-screen) .hd-import p { margin: 0; }
:is(.app-shell, .onboarding-screen) .hd-import__note, :is(.app-shell, .onboarding-screen) .hd-import__summary { opacity: .78; }
:is(.app-shell, .onboarding-screen) .hd-import__list { display: grid; gap: 6px; max-height: 260px; overflow-y: auto; }
:is(.app-shell, .onboarding-screen) .hd-import__option { display: flex; align-items: center; gap: 12px; width: 100%; padding: 10px 12px; border: 1px solid rgba(255,255,255,.1); border-radius: 14px; background: rgba(255,255,255,.05); color: inherit; font: inherit; text-align: left; cursor: pointer; }
:is(.app-shell, .onboarding-screen) .hd-import__option span { display: grid; min-width: 0; }
:is(.app-shell, .onboarding-screen) .hd-import__option small { opacity: .6; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
:is(.app-shell, .onboarding-screen) .hd-import__option[aria-checked="true"] { border-color: var(--hd-accent, #f4edd9); background: color-mix(in srgb, var(--hd-accent, #f4edd9) 16%, transparent); }
:is(.app-shell, .onboarding-screen) .hd-import__views { display: grid; gap: 4px; margin: 0; padding: 0; list-style: none; max-height: 180px; overflow-y: auto; }
:is(.app-shell, .onboarding-screen) .hd-import__views li { display: flex; justify-content: space-between; gap: 12px; padding: 6px 2px; border-bottom: 1px solid rgba(255,255,255,.08); }
:is(.app-shell, .onboarding-screen) .hd-import__views span { opacity: .65; }
:is(.app-shell, .onboarding-screen) .hd-import__check { display: flex; align-items: flex-start; gap: 12px; cursor: pointer; }
:is(.app-shell, .onboarding-screen) .hd-import__check input { flex: none; width: 20px; height: 20px; margin: 2px 0 0; accent-color: var(--hd-accent, #f4edd9); }
:is(.app-shell, .onboarding-screen) .hd-import__check span { display: grid; gap: 2px; }
:is(.app-shell, .onboarding-screen) .hd-import__check small { opacity: .7; }
:is(.app-shell, .onboarding-screen) .hd-import__check em { display: inline-flex; align-items: center; gap: 3px; margin-left: 8px; font-style: normal; font-size: .8em; opacity: .75; }
:is(.app-shell, .onboarding-screen) .hd-import__actions { display: flex; justify-content: flex-end; gap: 10px; flex-wrap: wrap; }
:is(.app-shell, .onboarding-screen) .hd-import__done { margin: 10px 0 0; opacity: .85; }
.onboarding-screen .onboarding-import { margin: 14px 0; }
.app-shell .hd-import-sheet { max-width: min(560px, calc(100vw - 32px)); }
.app-shell .hd-condition__name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 600; }

/* Whole picture on camera cards, and the bigger sizes only cameras get. */
.app-shell .room-options__icons button[aria-expanded="true"], .app-shell button.st-item__icon[aria-expanded="true"] { background: var(--on); color: var(--on-ink, #2a2110); }
.app-shell button.st-item__icon { border: 0; padding: 0; color: inherit; cursor: pointer; }
.app-shell .camera-tile--whole .camera-tile__image { object-fit: contain; }
.app-shell .hd-item--x6 { grid-column: span 3; grid-row: span 2; }
.app-shell .hd-item--x8 { grid-column: span 4; grid-row: span 2; }
.app-shell .hd-grid--halves > .hd-item--x6, .app-shell .hd-grid--halves > .hd-item--x8 { grid-row: span 4; }
.app-shell .hd-grid[data-cols="3"] > .hd-item--x8 { grid-column: span 3; }
.app-shell .hd-grid:is([data-cols="1"], [data-cols="2"]) > :is(.hd-item--x6, .hd-item--x8) { grid-column: 1 / -1; }
@media (max-width: 720px) { .app-shell .hd-item--x6, .app-shell .hd-item--x8 { grid-column: 1 / -1; } }

/* Camera pages: 16:9 cells whatever the layout, in the columns the page asks for. */
.app-shell .camera-page { --cols: var(--cols-set); container-type: inline-size; width: 100%; }
.app-shell .camera-grid { display: grid; grid-template-columns: repeat(var(--cols), minmax(0, 1fr)); gap: calc(var(--u)*1.4); grid-auto-rows: calc((100cqw - (var(--cols) - 1) * calc(var(--u)*1.4)) / var(--cols) * 9 / 16); grid-auto-flow: row dense; }
.app-shell .camera-grid .hd-item > .camera-tile { width: 100%; height: 100%; min-height: 0; }
.app-shell .camera-grid .hd-item--c4 { grid-column: span 2; grid-row: span 2; }
.app-shell .camera-grid .hd-item--c9 { grid-column: span 3; grid-row: span 3; }
.app-shell .camera-grid .hd-item--c16 { grid-column: span 4; grid-row: span 4; }
@media (max-width: 720px) {
  .app-shell .camera-page { --cols: var(--cols-phone); }
  .app-shell .camera-grid .hd-item:is(.hd-item--c9, .hd-item--c16) { grid-column: span 2; grid-row: span 2; }
}
`;
