# HomeDeck

<p align="center"><img src="https://raw.githubusercontent.com/rodrigo-wa/homedeck/main/images/home.jpg" alt="HomeDeck Home screen on a wall tablet with energy, weather, sun and room cards"></p>

<p align="center"><b>A beautiful, local dashboard for Home Assistant that builds itself.</b><br>
No YAML, no cards to configure: add a light to an area and it shows up in the right room.</p>

<p align="center">
<a href="https://my.home-assistant.io/redirect/hacs_repository/?owner=rodrigo-wa&repository=homedeck&category=integration"><img src="https://my.home-assistant.io/badges/hacs_repository.svg" alt="Open in HACS"></a>
</p>

<p align="center"><a href="https://homedeck.pro">Website</a> · <a href="https://homedeck.pro/video/homedeck-en.mp4">1-minute video</a> · <a href="https://github.com/rodrigo-wa/homedeck/blob/main/CHANGELOG.md">What's new</a></p>

HomeDeck reads your `Areas → Devices → Entities`, organizes your home by room and keeps every
setting and command inside Home Assistant.

**Designed by people, built with AI.** HomeDeck is designed, tested and maintained by an attentive,
committed team led by Rodrigo, who decide every feature, listen to the community and answer support.
The code is written with the help of AI (Claude), which speeds the work up a lot: with people
operating everything up close, fixes and new features ship much faster, often just days after
someone suggests them.

## A look inside

### Four layouts, one home

| Grid | Sidebar |
|:---:|:---:|
| <img src="https://raw.githubusercontent.com/rodrigo-wa/homedeck/main/images/grid.jpg" alt="Grid layout"> | <img src="https://raw.githubusercontent.com/rodrigo-wa/homedeck/main/images/sidebar.jpg" alt="Sidebar layout"> |
| **List** | **Focus** |
| <img src="https://raw.githubusercontent.com/rodrigo-wa/homedeck/main/images/list.jpg" alt="List layout"> | <img src="https://raw.githubusercontent.com/rodrigo-wa/homedeck/main/images/focus.jpg" alt="Focus layout"> |

### Arrange it your way

| Edit mode | Big cards |
|:---:|:---:|
| <img src="https://raw.githubusercontent.com/rodrigo-wa/homedeck/main/images/edit.jpg" alt="Edit mode with hide buttons and size arrows"> | <img src="https://raw.githubusercontent.com/rodrigo-wa/homedeck/main/images/room.jpg" alt="Room with double-size light, cover and climate cards"> |

### More than switches

| Sensor charts | Plants and readings |
|:---:|:---:|
| <img src="https://raw.githubusercontent.com/rodrigo-wa/homedeck/main/images/sensor-charts.jpg" alt="Sensor cards with 24-hour charts"> | <img src="https://raw.githubusercontent.com/rodrigo-wa/homedeck/main/images/plants.jpg" alt="Plant card with soil moisture, temperature, light and fertility"> |
| **Calendar and reminders** | **Forecast** |
| <img src="https://raw.githubusercontent.com/rodrigo-wa/homedeck/main/images/calendar.jpg" alt="Full-screen month calendar with today's agenda"> | <img src="https://raw.githubusercontent.com/rodrigo-wa/homedeck/main/images/forecast.jpg" alt="Forecast with the next hours and 7 days"> |

### Screensaver and phone

<p align="center"><img src="https://raw.githubusercontent.com/rodrigo-wa/homedeck/main/images/screensaver.jpg" alt="Screensaver clock with today's events and reminders" width="62%"> <img src="https://raw.githubusercontent.com/rodrigo-wa/homedeck/main/images/phone.jpg" alt="HomeDeck on a phone" width="17%"> <img src="https://raw.githubusercontent.com/rodrigo-wa/homedeck/main/images/phone-list.jpg" alt="List layout on a phone" width="17%"></p>

## Install with HACS

1. In Home Assistant, open **HACS**.
2. From the **⋮** menu, choose **Custom repositories**.
3. Enter `https://github.com/rodrigo-wa/homedeck` with the category **Integration**.
4. Search for **HomeDeck**, open it and tap **Download**.
5. Restart Home Assistant.
6. Go to **Settings → Devices & services → Add integration** and add **HomeDeck**.
7. Open **HomeDeck** in the sidebar and finish the first-run setup.

Requires Home Assistant 2024.7 or newer. Works on Home Assistant OS, Supervised, Container
and Core.

### Manual install

1. Download `homedeck.zip` from the [latest release](https://github.com/rodrigo-wa/homedeck/releases/latest).
2. Extract it into `/config/custom_components/homedeck`.
3. Restart Home Assistant and add the integration as in step 6 above.

### Updates

HACS shows new versions. Download the update and restart Home Assistant. If the old
interface still shows, do a full browser refresh (`Ctrl + Shift + R`, or `Cmd + Shift + R`
on macOS). Your rooms, backgrounds and preferences are kept.

## What you get

- **Four layouts:** Grid, Sidebar, List and Focus. Every screen, including Media,
  Security, Scenes and your own pages, follows the one you pick.
- **Edit mode, arranged your way:** drag to reorder, tap − to hide, add devices from any room,
  make a card double or large, split a screen into groups with separators and reorder the bottom
  bar. Nothing is ever deleted from Home Assistant.
- **Your names and icons:** rename devices and rooms inside HomeDeck, pick each room's icon and
  the sensor that shows its temperature. Home Assistant keeps its own names.
- **Calendar and reminders** beside the clock, with a full-screen month view and a
  reminders list, plus an optional **Today card** on Home.
- **Full weather forecast:** next hours and next 7 days, using your Home Assistant weather
  service, with Open-Meteo as a fallback for your home's location.
- **Big cards** with brightness, colors, a vertical cover control and a climate ring.
- **Media artwork** for Apple TV, Sonos, Chromecast and other players, with their favorites
  and sources one tap away.
- **Cameras** with live video right on the card and a full live view, **vacuums** with their controls, and **scripts, buttons and
  selects** (like a washing machine program) right on the dashboard.
- **Alarm panels** to arm and disarm (with the code when the panel asks for one) and **plants**
  from Plant Monitor/OpenPlantbook with their moisture, light and more. Both appear only once
  you add them in Edit mode.
- **History charts** in sensor details (and, optionally, right on double and large sensor cards),
  **camera full screen** including WebRTC-only cameras like newer Nest, and optional **weather, sun
  and energy cards** on Home (consumption, solar, grid and battery).
- Optional **animations:** fans spin, lights glow and washing machines shake while they run.
- **Doorbell pop-up:** when the doorbell rings, its camera shows up over the panel, even on the
  screensaver.
- **Spotify player** (with a default speaker per device), a screensaver with today's events and reminders, scene strip,
  and, for a wall tablet, options to hide the Home Assistant sidebar and lock editing.
- **English, Portuguese, Spanish, German and Polish**, following Home Assistant's language.

## Plans

- **Free:** up to 4 rooms and 10 controllable devices (lights, switches, fans, covers,
  climate, media and locks). Sensors and scenes don't count. Grid and List layouts.
- **Pro:** unlimited rooms and devices, all four layouts, double and large cards, your own pages,
  the energy card, animations, sensor charts on cards, the doorbell pop-up, the Spotify player, the screensaver with
  today's agenda, every background and color, the style (corners, frame and glass) and feedback
  straight to support. US$ 14.99 once or
  US$ 7.99 per year, per home (R$ 59.90 or R$ 29.90 per year in Brazil).

Buy Pro from **Settings → Plan** in the dashboard. The license is checked locally and
covers one Home Assistant installation; an online check every 7 days looks for renewals,
with 30 days of grace without internet. If your home outgrows Free, you choose what stays
on the dashboard; nothing is deleted, and everything comes back with Pro.

## Privacy

HomeDeck stores only interface choices, in `.storage/homedeck.config`. States, history,
cameras, passwords and tokens are never saved. The dashboard talks only to your Home
Assistant, plus the license server at `homedeck.pro` when you buy or renew Pro, and
Open-Meteo when no weather service is available.

## Troubleshooting

- **No temperature or forecast:** check **Settings → Weather**, pick a weather
  entity, and make sure it offers a forecast.
- **Long press doesn't open details:** keep your finger on the body of the card, not on a
  button or slider.
- **Old interface after updating:** do a full browser refresh.

## Development

```bash
cd frontend
npm install
npm run typecheck
npm run build
```

The build writes `custom_components/homedeck/frontend/homedeck-panel.js`, which is
committed. The **Validate** workflow fails if it doesn't match the source.

## Support and license

Questions, moving to a new home or refunds: [suporte@homedeck.pro](mailto:suporte@homedeck.pro).
Bugs: [issues](https://github.com/rodrigo-wa/homedeck/issues).

HomeDeck is source-available under the [HomeDeck License](LICENSE): free to install, use,
fork and change for your own home, not to redistribute, sell or modify to unlock Pro.
Changes: [CHANGELOG.md](CHANGELOG.md).

HomeDeck is an independent project, not affiliated with Home Assistant, Nabu Casa or the
Open Home Foundation.
