# HomeDeck

A beautiful, local dashboard for Home Assistant that builds itself. HomeDeck reads your
`Areas → Devices → Entities`, organizes your home by room and keeps every setting and
command inside Home Assistant. No YAML, no cards to configure.

**Website:** [homedeck.pro](https://homedeck.pro) · English, Português, Español

[![Open in HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=rodrigo-wa&repository=homedeck&category=integration)

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
- **Edit mode like an iPhone:** drag to reorder, tap − to hide, add devices from any room,
  double the size of a card. Nothing is ever deleted from Home Assistant.
- **Calendar and reminders** beside the clock, with a full-screen month view and a
  reminders list.
- **Full weather forecast:** next hours and next 7 days, using your Home Assistant weather
  service, with Open-Meteo as a fallback for your home's location.
- **Big cards** with brightness, colors, a vertical cover control and a climate ring.
- **Spotify player**, screensaver, scene strip, and an option to hide the Home Assistant
  sidebar on a wall tablet.
- **English, Portuguese and Spanish**, following Home Assistant's language.

## Plans

- **Free:** up to 4 rooms and 10 controllable devices (lights, switches, fans, covers,
  climate, media and locks). Sensors and scenes don't count. Grid and List layouts.
- **Pro:** unlimited rooms and devices, all four layouts, big cards, your own pages, the
  Spotify player, the screensaver and every background and color. US$ 14.99 once or
  US$ 7.99 per year, per home.

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

- **No temperature or forecast:** check **Settings → Home → Weather**, pick a weather
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

HomeDeck is source-available under the [HomeDeck License](LICENSE): free to install and use
at home, not to copy, redistribute or modify to unlock Pro. Changes: [CHANGELOG.md](CHANGELOG.md).

HomeDeck is an independent project, not affiliated with Home Assistant, Nabu Casa or the
Open Home Foundation.
