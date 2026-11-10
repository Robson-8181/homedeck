# Changelog

## 0.16.5

- Import a Home Assistant dashboard: during setup or in Settings → Navigation, pick a dashboard you already use. Each tab becomes a HomeDeck screen (Pro) with the same devices, in the same order, with section titles as separators, and the rooms can show only what's in that dashboard. Nothing changes in Home Assistant.
- Header notices: a tap now opens HomeDeck's own details, and in Settings → Home each notice has its own style (icon and text, icon only or text only) and custom text.
- Visibility rules (Pro): show a card only when conditions on entities are met (on or off, equal or not to a state, above or below a value, all or any of them), when someone or nobody is home, by day or night, within a time window and on chosen days. For cards it's in the Edit mode options; for header notices, in Settings → Home → Notices.
- Cameras screen in the bottom bar (optional, in Settings → Navigation): 16:9 cells with no cropping, 1 to 4 cameras per row, drag to reorder and make any camera 4×, 9× or 16× (bigger sizes with Pro).
- Camera pages (Pro): create as many as you like under Your pages, each with its own cameras and layout.
- Icon choices stay closed (pages, rooms and cards): only the current icon shows, and the list opens when you tap it.
- 6× and 8× camera cards (Pro) on the other screens, from the size button in Edit mode.
- Whole picture on camera cards (optional, in Settings → Cameras): shows the full image instead of cutting the edges.
- Lighter cameras: the live video on cards is really closed when you leave the screen or HomeDeck, and pauses during the screensaver or while a camera is open full screen.
- Alarm: when Alarmo doesn't arm because sensors are open, the panel now shows which ones and offers "Arm anyway".
- Who can see (Pro): when editing a card or a room, an administrator picks which people see it; for everyone else it's gone from screens, counts and actions. This controls what shows in HomeDeck and is not a Home Assistant security permission.
- Waste collection card (Pro), in Settings → Home: up to 4 bins with a color and a name, the days until collection and the weekday, from your sensors.
- Devices inside a card (Pro): double and large room and device cards can hold up to 2 extra devices in their free space, each with the right control (cover, light, list, script, button, sensor). In Edit mode, a tap on the card opens the choice, and each one can have its own name on that card. A washer's program and its Start button can share one card.
- Editing cards only in Edit mode: details no longer show those options. In Edit mode, a tap on a card (without dragging) opens its name, icon and options.
- Truer light colors: the buttons look the same on screen but now send the lamp the pure color (green 0,255,0, blue 0,0,255...). The details also have "Other color", with a color wheel to pick any color.
- Highlight follows the light, per card (in the card's options): while it's on, the card's highlight takes the lamp's color.
- On a tablet lying down, the on-screen keyboard no longer resizes the panel, and browser or app bars that come and go no longer change the size of the cards.
- In Edit mode, the cards on Home keep the same size as outside it.
- The brightness control now sits above the name, so the name stays in the same place as on other cards.
- Media cards realigned. With nothing playing, one centered button turns the player on or starts playing, on every player. A TV that is on with nothing playing gets power, volume and, on bigger cards, the source picker, plus the artwork when there is one, and Spotify with no active device opens the choice of where to play, without an error.
- Header notices now come before the forecast.
- Appearance has a new order: colors, background, style and icons.
- Home Assistant icons on rooms too (Appearance → Icons).
- 15 new backgrounds (Pro): 10 fixed with more vivid colors and 5 automatic ones that change with the lights that are on (Orchid, Reef, Berry, Glacier and Citrus).
- Lights with color temperature get Warm, Normal and Cool in their details.
- 31 new icons for cards, rooms and pages, in a grid that shows them all.
- Custom pages have their own icon on the bottom bar: pick it in the page's Edit mode or in Settings → Navigation.
- Date and time sensors in a friendly format ("Today, 23:12", "Oct 21, 20:12").
- input_boolean can now be added to screens in Edit mode.
- Hiding a device takes it off the screen: instead of waiting in a list at the bottom, it goes back to "Add devices".
- Removing the license takes a second tap.
- New Year and birthdays no longer have the details on top of the cards.
- Fixed: the frame didn't apply to the cards in Settings; the screensaver clock sits lower when showing events; empty pages no longer show the message, only the add button.

## 0.16.4

- List layout: the Devices group (the ones added to Home) no longer disappears in Edit mode; each one gets a − to take it off Home.
- Lights hidden from a room (in Edit mode) are left out of the counts ("1 of 3 on", "6 lights on at home") and of Turn all on / Turn all off, in the room and on Home. Handy for Govee segment entities and the like.
- Fixed: in homes set to Fahrenheit, the 7-day forecast (and the hours, when they came from Open-Meteo) showed Celsius. It now follows the weather entity's or Home Assistant's unit, with wind in mph.
- Light effects: lights with effects (Rainbow, Candle, Thanksgiving...) get an Effect selector in their details and on double and large cards, with "No effect" to go back to plain light. It only shows on lights that have effects. Thanks @JEdwards2525!
- Fixed: picking an option from a list inside a card (like a washing machine program) also toggled the card.
- Notices beside the people, in Settings → Home → Notices: pick entities (a mailbox, the garage door, the doorbell...) and each one becomes a chip in the header only when there's something to notice: on, open or detected, a number above zero, or an event in the last 30 minutes ("Doorbell 5 min ago"). A tap opens Home Assistant's details. Nothing shows until you pick them. Thanks @karaspr!
- Choosing a card's size in Edit mode: the size button opens a slim column of round buttons above it (½×, 1×, 2× and 4×), with the current size marked, instead of cycling on each tap.
- Small size for sensors (Pro), in the same menu. The card is half as tall, with the icon, name and value on one line, and small cards fit side by side. Thanks @karaspr!
- Player for every media player (Pro): Apple TV and HomePod (Apple Music), Sonos, Chromecast and other players use the same player as Spotify, with artwork, progress and controls. The card shows the app playing (for example Music), buttons follow what each device supports, and a TV that is off gets a power button. On by default; Settings → Appearance switches back to the previous card.
- Calendar colors: each calendar now uses the color set in Home Assistant (Settings → Entities → calendar → Color). A calendar without one gets a fixed color that no longer changes when other calendars are added or removed. Thanks @carlospparedes!

## 0.16.3

- First-time setup has two new steps: pick the layout (Grid and List on Free, Sidebar and Focus on Pro), and "Going on a wall tablet?", with hiding the Home Assistant sidebar, keeping the screen on and the screensaver. Just tapping Continue gives the same result as before.
- Keep the screen on, in Settings → This device: the Echo Show's Silk browser closes the page after a while. In Automatic mode (the default, only on an Echo Show), a silent sound loops in the background to keep the browser open and the display lit, like the Keep Silk Open project. You can also choose Always (other tablets) or Off.
- Special dates (Pro), in Settings → Calendar → Special dates, off by default: a countdown by the clock, a light animation on the day and a greeting on the screensaver. Christmas (snow), New Year (sparkles, a countdown to midnight on the screensaver and fireworks in the first minutes), Valentine's Day (June 12 in Brazil, February 14 elsewhere), Halloween, Easter, Carnival (Brazil), Thanksgiving (US), birthdays from your calendars ("Happy birthday, Grandma!", with confetti) and your own dates with the animation you pick. Each date has its own switch, follows the country set in Home Assistant, pauses while the panel isn't visible and respects "reduce motion". A See button previews each date's animation for a few seconds in Settings. Decorations live on the cards and in empty spaces: presents on the cards and string lights at Christmas; webs, a dangling spider and a ghost at Halloween; a bunny peeking over the cards and eggs at Easter; hanging hearts on Valentine's Day; streamers at Carnival; leaves on the cards at Thanksgiving; balloons and confetti on birthdays.
- Confirm before toggling, in each device's details (Card options), off by default: the first tap only shows “Tap again to turn off” for 3 seconds and the second one acts. The card gets a small lock. In the List and Focus layouts, a tap opens the details instead.
- Card icon: in Card options, pick Automatic, the Home Assistant icon or one of HomeDeck's icons. In Appearance → Icons, an option (off by default) uses the Home Assistant icon on every card that has one.

## 0.16.2

- Settings reorganized: new Weather, Calendar, Cameras, Screensaver and This device sections (choices that apply only to the device in use). On a phone the menu scrolls sideways to the chosen section.
- Live video on camera cards, on by default (Settings → Cameras): a card plays the live video while it's on screen, Nest cameras included. Turn it off to go back to a still every 10 seconds.
- The panel's address now carries a fingerprint of the file, so browsers always load the new panel after an update instead of a cached copy.
- Google Nest cameras (WebRTC only): the live view now opens straight in Home Assistant's player. Before, Nest served a placeholder picture instead of MJPEG, so no video showed.
- Lock editing on this device, in Settings → This device, off by default: hides the Edit button on that device only, for a wall dashboard.
- Spotify speaker on this device, in Settings → This device: playback started from that device goes to the chosen speaker.
- Doorbell pop-up (Pro), in Settings → Cameras, off by default: when the doorbell rings (a doorbell event entity, or a sensor turning on), the chosen camera's live view pops up over the panel, even on the screensaver, and closes by itself after the time you pick. The doorbell and camera are suggested the first time, and a Test button shows it right away.
- Sensor charts (Pro), in Appearance → Card style, off by default: numeric sensor cards at double size show a line of the last 24 hours, and at large size the chart fills the middle of the card.
- Device details: a long name wraps to up to two lines and the rename pencil stays visible beside it.

## 0.16.1

- Polish: the whole dashboard and the integration setup in Home Assistant. Like the other languages, it follows the user's language in Home Assistant.
- Settings → Navigation: when Scenes, Media or Security is on but its tab doesn't show because the panel's rooms have nothing of that kind (for example, scenes without an area in Home Assistant), a note explains why.

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
