import { createContext, useContext, useEffect, useRef, useState } from "react";
import { BLANK_IMAGE, useCamerasPaused } from "../cameraPause";
import { cameraIsWebRtcOnly, cameraSnapshot, cameraStream, loadCameraPlayer } from "../devices";
import type { TranslationKey } from "../i18n";
import type { DiscoveredEntity } from "../types/discovery";
import type { HomeAssistant } from "../types/home-assistant";
import { useWideTile } from "./EditableGrid";
import { HaCameraPlayer } from "./EntityModal";
import { HDIcon } from "./HDIcon";

const REFRESH_MS = 10_000;

/** Whether camera cards play their live video (Settings → Home → Cameras; on unless turned off). */
export const LiveCamerasContext = createContext(true);
/** Whether camera cards show the whole picture (Settings → Cameras; off fills the card). */
export const CameraWholeContext = createContext(false);

/** True while the element is on screen and the panel is visible, so off-screen cards stop streaming. */
function useOnScreen(element: Element | null): boolean {
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(() => document.visibilityState === "visible");
  useEffect(() => {
    if (!element) return;
    if (typeof IntersectionObserver === "undefined") { setInView(true); return; }
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.1 });
    observer.observe(element);
    return () => observer.disconnect();
  }, [element]);
  useEffect(() => {
    const update = () => setPageVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  return inView && pageVisible;
}

/** A live MJPEG picture; when it goes away the connection is closed on purpose, since browsers can keep
 * downloading the stream (and Home Assistant keep producing it) after the element is removed. */
export function MjpegImage({ alt = "", className, onError, src }: { alt?: string; className?: string; onError?: () => void; src: string }) {
  const image = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const element = image.current;
    return () => { if (element) element.src = BLANK_IMAGE; };
  }, []); // only when it leaves: a new src (Home Assistant rotates the camera token) replaces the stream by itself
  return <img alt={alt} className={className} onError={onError} ref={image} src={src} />;
}

/** A camera as a card: the live video while it's on screen (MJPEG, or Home Assistant's player for
 * WebRTC-only cameras like newer Nest); with live video off, or if it fails, the latest still every
 * 10 seconds. A tap opens the details. */
export function CameraCard({ entity, hass, onOpen, t, whole }: { entity: DiscoveredEntity; hass: HomeAssistant; onOpen: (entity: DiscoveredEntity) => void; t: (key: TranslationKey) => string; whole?: boolean }) {
  const wide = useWideTile();
  const wholeSetting = useContext(CameraWholeContext);
  const showWhole = whole ?? wholeSetting;
  const live = useContext(LiveCamerasContext);
  // The card itself (a callback ref, so the observer follows it if the card is drawn again).
  const [card, setCard] = useState<HTMLButtonElement | null>(null);
  const onScreen = useOnScreen(card);
  const state = hass.states[entity.entity_id];
  const [tick, setTick] = useState(() => Date.now());
  const [failed, setFailed] = useState(false);
  const [streamFailed, setStreamFailed] = useState(false);
  /** null while unknown; true when the camera needs Home Assistant's player (and it loaded). */
  const [usePlayer, setUsePlayer] = useState<boolean | null>(null);
  const offline = !state || ["unavailable", "unknown"].includes(state.state);
  const paused = useCamerasPaused();
  const playing = live && onScreen && !offline && !paused;

  useEffect(() => {
    if (!live) return;
    let cancelled = false;
    void cameraIsWebRtcOnly(hass, entity.entity_id)
      .then((only) => (only ? loadCameraPlayer() : false))
      .then((player) => { if (!cancelled) setUsePlayer(player); });
    return () => { cancelled = true; };
  }, [live, entity.entity_id]);

  const stream = cameraStream(state);
  const mjpeg = playing && usePlayer === false && stream && !streamFailed ? stream : null;
  const player = playing && usePlayer === true && state;
  const snapshot = offline || mjpeg || player ? null : cameraSnapshot(state, tick);

  useEffect(() => {
    // Stills only while the panel is on screen and no video is playing.
    const timer = window.setInterval(() => { if (document.visibilityState === "visible") setTick(Date.now()); }, REFRESH_MS);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => { setFailed(false); setStreamFailed(false); }, [state?.attributes.entity_picture]);

  return (
    <button aria-label={`${entity.name}: ${t("cameraTapLive")}`} className={`device-tile camera-tile ${showWhole ? "camera-tile--whole" : ""} ${wide ? "device-tile--wide camera-tile--wide" : ""} ${offline ? "device-tile--unavailable" : ""}`} onClick={() => onOpen(entity)} ref={setCard} type="button">
      {player ? <span className="camera-tile__image camera-tile__player"><HaCameraPlayer fit={showWhole ? "contain" : "cover"} hass={hass} state={state} /></span>
        : mjpeg ? <MjpegImage className="camera-tile__image" onError={() => setStreamFailed(true)} src={mjpeg} />
          : snapshot && !failed ? <img alt="" className="camera-tile__image" onError={() => setFailed(true)} src={snapshot} />
            : <span className="camera-tile__empty"><HDIcon name="camera" size={30} /></span>}
      <span className="camera-tile__shade" />
      <span className={mjpeg || player ? "camera-tile__badge camera-tile__badge--live" : "camera-tile__badge"}>{offline ? t("cameraOffline") : mjpeg || player ? <><i />{t("cameraLive")}</> : <><HDIcon name="play" size={11} />{t("cameraWatch")}</>}</span>
      <span className="camera-tile__name">{entity.name}</span>
    </button>
  );
}
