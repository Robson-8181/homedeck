import { useMemo, useState } from "react";
import type { TranslationKey } from "../i18n";
import type { HomeDeckConfig } from "../types/config";
import type { DiscoveryResponse } from "../types/discovery";
import type { HomeAssistant } from "../types/home-assistant";
import { HDIcon } from "./HDIcon";

interface HomeStatusProps {
  config: HomeDeckConfig;
  data: DiscoveryResponse;
  hass: HomeAssistant;
  t: (key: TranslationKey) => string;
}

export function HomeStatus({ config, data, hass, t }: HomeStatusProps) {
  const [busy, setBusy] = useState(false);
  const lightIds = useMemo(() => Array.from(new Set(data.rooms.flatMap((room) => room.entities.filter((entity) => entity.domain === "light").map((entity) => entity.entity_id)))), [data.rooms]);
  const activeLights = lightIds.filter((id) => hass.states[id]?.state === "on").length;

  const setLights = async (service: "turn_on" | "turn_off") => {
    if (busy || lightIds.length === 0) return;
    setBusy(true);
    try {
      await hass.callService("light", service, { entity_id: lightIds });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="home-status" aria-label={t("homeStatus")}>
      <div>
        <span className="eyebrow">{t("homeStatus")}</span>
        <h1>{activeLights === 1 ? t("oneLightOn") : t("lightsOn").replace("{count}", String(activeLights))}</h1>
        <p>{data.counts.rooms} {t("rooms")} · {data.counts.devices} {t("devices")}</p>
      </div>
      <div className="global-actions">
        {config.global_actions.lights_on && <button disabled={busy || lightIds.length === 0} onClick={() => void setLights("turn_on")} type="button"><HDIcon name="light" size={18} />{t("turnAllOn")}</button>}
        {config.global_actions.lights_off && <button disabled={busy || lightIds.length === 0} onClick={() => void setLights("turn_off")} type="button"><HDIcon name="power" size={18} />{t("turnAllOff")}</button>}
      </div>
    </section>
  );
}
