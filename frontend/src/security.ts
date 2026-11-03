import type { DiscoveredEntity } from "./types/discovery";
import type { HassEntity } from "./types/home-assistant";

// Only these binary_sensor classes describe the safety of the home. Battery,
// connectivity, update, problem and similar sensors stay out of Security.
const SECURITY_CLASSES = new Set([
  "carbon_monoxide",
  "door",
  "garage_door",
  "gas",
  "lock",
  "moisture",
  "motion",
  "occupancy",
  "opening",
  "safety",
  "smoke",
  "tamper",
  "vibration",
  "window",
]);

const ALERT_CLASSES = new Set([
  "carbon_monoxide",
  "door",
  "garage_door",
  "gas",
  "moisture",
  "motion",
  "opening",
  "safety",
  "smoke",
  "tamper",
  "window",
]);

export function isSecurityEntity(entity: DiscoveredEntity, state?: HassEntity): boolean {
  if (entity.domain === "lock" || entity.domain === "camera") return true;
  if (entity.domain !== "binary_sensor") return false;
  return SECURITY_CLASSES.has(String(state?.attributes.device_class ?? entity.device_class ?? ""));
}

export function isSecurityAlert(state?: HassEntity): boolean {
  if (!state) return false;
  if (state.entity_id.startsWith("lock.")) return ["unlocked", "open", "jammed"].includes(state.state);
  return state.state === "on" && ALERT_CLASSES.has(String(state.attributes.device_class));
}

export function availableSections(entities: DiscoveredEntity[]) {
  return {
    hasMedia: entities.some((entity) => entity.domain === "media_player"),
    hasScenes: entities.some((entity) => entity.domain === "scene"),
    hasSecurity: entities.some((entity) => isSecurityEntity(entity)),
  };
}
