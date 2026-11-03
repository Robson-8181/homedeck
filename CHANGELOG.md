# Changelog

## 0.13.0

- Separators: in Edit mode, **Add separator** adds a title with a thin line that splits a screen into groups (for example "Waste" or "Kitchen"). Drag, rename or remove it. Works on Home, in rooms (every layout) and on your pages.
- More text on cards: the state now takes up to two lines (four on a double-size card, two on List rows) instead of being cut after the first, which helps with waste collection, alerts and text sensors.
- Reordering rooms in the List, Sidebar or Focus layout no longer moves the other items on Home.
- Fixed "Error setting up entry HomeDeck" on Home Assistant older than 2026.5: the integration used a frontend function that only exists from that version on. It works again from 2024.7, the minimum listed in HACS.

## 0.12.0

- Style (Pro), in Settings → Appearance, previewed live on the dashboard: corners from square to very round across the whole interface (cards, buttons, pills, menus, sheets and controls), the cards' frame on or off, and glass from solid (in the background's tone) to see-through. Profile pictures stay round; **Restore defaults** brings back the original look.
- Send feedback (Pro), in Settings → Plan: your e-mail, a type (problem, idea or praise) and a message. It reaches support with the HomeDeck and Home Assistant versions, and the reply goes straight to your e-mail.

## 0.11.0

- Cameras: the latest still fills the card and refreshes every 10 seconds while the dashboard is on screen; a tap opens the live view. Cameras also appear on the Security page.
- Vacuums: status and battery on the card, with start or pause and back to dock; stop too at double size and in the details. The card lights up and its icon moves while it cleans.
- Scripts and buttons run with one tap, like scenes.
- Selects (`select` and `input_select`), such as a washing machine program: the current option in a picker on the card, every option in the details and at double size.
- Rooms with a light on show their power button lit in the highlight color.
- Cameras, vacuums, scripts, buttons and selects don't count toward the Free plan limit.

## 0.10.3

First public release.

- Dashboard that builds itself from Home Assistant areas, devices and entities, with a
  first-run setup that finds your home and lets you pick the rooms.
- Four layouts (Grid, Sidebar, List and Focus) followed by every screen, including Media,
  Security, Scenes and your own pages.
- Edit mode on every screen: drag, hide, add devices from other rooms and double-size cards.
- Calendar and reminders beside the clock, with a full-screen month and a reminders list.
- Full weather forecast with fallbacks: chosen weather entity, any working `weather.*`,
  outdoor temperature sensors and Open-Meteo for the home's location.
- Big cards with brightness, colors, vertical cover control and climate ring; Spotify
  player; screensaver; editable scene strip.
- Option to hide the Home Assistant sidebar on each device.
- Free and Pro plans, with Pro bought from the dashboard (Stripe, with a QR code to pay on
  your phone) and activated automatically.
- English, Portuguese and Spanish; Pro priced in US dollars, or in Brazilian reais in Brazil.
