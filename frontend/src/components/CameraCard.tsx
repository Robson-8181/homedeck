import { useEffect, useState } from "react";
import { cameraSnapshot } from "../devices";
import type { TranslationKey } from "../i18n";
import type { DiscoveredEntity } from "../types/discovery";
import type { HomeAssistant } from "../types/home-assistant";
import { useWideTile } from "./EditableGrid";
import { HDIcon } from "./HDIcon";

const REFRESH_MS = 10_000;

/** A camera as a card: its latest still fills the card and refreshes every few seconds; a tap opens
 * the live view. */
export function CameraCard({ entity, hass, onOpen, t }: { entity: DiscoveredEntity; hass: HomeAssistant; onOpen: (entity: DiscoveredEntity) => void; t: (key: TranslationKey) => string }) {
  const wide = useWideTile();
  const state = hass.states[entity.entity_id];
  const [tick, setTick] = useState(() => Date.now());
  const [failed, setFailed] = useState(false);
  const offline = !state || ["unavailable", "unknown"].includes(state.state);
  const snapshot = offline ? null : cameraSnapshot(state, tick);

  useEffect(() => {
    // Only while the panel is on screen: a hidden tablet doesn't keep pulling images.
    const timer = window.setInterval(() => { if (document.visibilityState === "visible") setTick(Date.now()); }, REFRESH_MS);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => { setFailed(false); }, [state?.attributes.entity_picture]);

  return (
    <button aria-label={`${entity.name}: ${t("cameraTapLive")}`} className={`device-tile camera-tile ${wide ? "device-tile--wide camera-tile--wide" : ""} ${offline ? "device-tile--unavailable" : ""}`} onClick={() => onOpen(entity)} type="button">
      {snapshot && !failed
        ? <img alt="" className="camera-tile__image" onError={() => setFailed(true)} src={snapshot} />
        : <span className="camera-tile__empty"><HDIcon name="camera" size={30} /></span>}
      <span className="camera-tile__shade" />
      <span className="camera-tile__badge">{offline ? t("cameraOffline") : <><HDIcon name="play" size={11} />{t("cameraWatch")}</>}</span>
      <span className="camera-tile__name">{entity.name}</span>
    </button>
  );
}
