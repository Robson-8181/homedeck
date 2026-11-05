# Changelog

## 0.16.0

Everything is optional: if you don't turn anything on, the panel looks as before.

- History in the details of numeric sensors (temperature, power, prices…): a 6 h, 24 h or 7-day chart with the lowest and highest value and the value under your finger.
- Camera full screen: a button in the camera details. It uses the browser's full screen and, where there is none (some apps and webviews), covers the whole panel.
- Cameras that only stream over WebRTC or HLS (such as newer Google Nest models): when a camera has no MJPEG stream, the live view uses Home Assistant's own camera player. Cameras that already worked are unchanged.
- More cards on Home, in Settings → Home → More cards on Home, all off by default:
  - Weather: temperature, condition, high and low; at double size, the next hours; a tap opens the forecast.
  - Sun: next sunrise or sunset and elevation; at double size, the sun's path through the day.
  - Energy (Pro): home consumption, solar, grid (importing or exporting), battery and today's production. Sensors are suggested the first time and can be changed; each line opens the sensor with its history; at large size, a chart of the last 24 h.
- Large size (Pro): the size badge in Edit mode now goes from normal to double, large (two columns and two rows) and back to normal.
- Animations (Pro), in Appearance → Card style, off by default: running fans spin, lit lights glow, and washing machines, dryers and dishwashers shake while they run (recognized by name).
- Screensaver (Pro) with today's agenda: under the clock, today's upcoming events (in each calendar's color) and the reminders due, overdue ones in red. Each part is turned on separately in Settings → Appearance → Screensaver and uses the same calendars and list as the agenda.
- No scroll bars: while HomeDeck is open, the panel's and the page's scroll bars are hidden (scrolling works as before, by touch, wheel or keyboard); they come back when you leave.
- Home without the small scroll: when it is only a little taller than the screen (a separator, one more row), everything shrinks by up to 15% to fit; much bigger homes still scroll, and phones don't change.
- List layout: a separator inside a room is inset like the rows instead of touching the edges; in Home's Edit mode it no longer jiggles and its name can be selected and edited.

## 0.15.0

Everything is optional: if you don't change anything, the panel looks exactly as before.

- Nicknames: in a device's details, the pencil beside the name renames it in HomeDeck only (Home Assistant keeps its own name). It applies to every screen and layout; leaving it empty goes back to the Home Assistant name, shown right under the field.
- Rename rooms in Settings → Rooms: the pencil beside each one gives it another name in HomeDeck only (the area's name in Home Assistant shows beside it, in gray). It applies to every screen and layout once saved.
- Room options in Edit mode: pick the icon (Automatic, as before, the area's icon from Home Assistant, or one of HomeDeck's icons, with new ones for dining, laundry, pool, games, stairs and plants) and the sensor that gives the temperature on the room card (Automatic still uses the climate device).
- Alarm panels (`alarm_control_panel`): a card with the state (disarmed, armed home, away, night, triggered…), lit while armed; in the details, arm in the modes the panel supports and disarm, with a code field when the panel asks for one. It never shows up on its own: it waits under Hidden in the room's and the Security page's Edit mode until you add it.
- Plants (`plant`, from the Plant integration and Plant Monitor/OpenPlantbook): a card that says "Doing well" or "Needs attention" (red); in the details and at double size, soil moisture, temperature, light and fertility, with out-of-range readings marked. It also shows up only once added.
- Alarm panels and plants don't count toward the free plan's limit.
- Player cards (Spotify and others at double size) no longer show volume buttons: the volume lives in the details, one tap away.

## 0.14.1

- The Spotify card now just says "Spotify": a speaker name on two lines made the row taller and pushed the cards against the bottom bar (the name still shows in the player).
- Today card at double size: up to 3 items and the full weekday, without stretching the row.
- Double-size camera: the name is back under the picture instead of behind the "Watch live" badge.

## 0.14.0

- Settings → System now says HomeDeck is designed by people and built with AI, like the README and the website.
- Bottom bar: in Edit mode, drag the tabs to reorder them (Home always stays first). This includes the pages you created, which used to sit at the end, and the links of the Sidebar layout.
- Media volume uses − and + buttons (on double-size cards and in the details) instead of a slider. This also works on TVs that can only step the volume up and down, like many Samsung and LG models, where the slider did nothing.
- Media artwork: what an Apple TV, Sonos, Chromecast or other player is playing shows on its card (instead of the icon), on the Media card on Home and large in its details.
- Favorites and sources: a player's details list the sources it offers, such as saved favorites and playlists on Sonos, apps on Apple TV and inputs on a TV. One tap switches.
- Today card on Home: turn it on in Settings → Home → Calendar and reminders. It shows the day's upcoming events (in each calendar's color) and the reminders due, without opening the calendar; events that have ended drop off. At normal size, the next timed event and how many more there are; at double size, the day's list. A tap opens the calendar, and a reminder in the list opens the reminders. It uses the calendars and list chosen for the buttons beside the clock.
- German: the whole dashboard (Home, rooms, layouts, Edit mode, Settings, the Free and Pro plans, feedback, weather, calendar, cameras and vacuums) and the integration setup in Home Assistant. Like the other languages, it follows the user's language in Home Assistant.

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
