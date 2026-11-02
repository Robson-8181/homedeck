import type { DiscoveryResponse } from "../types/discovery";
import type { HomeAssistant } from "../types/home-assistant";

export async function discoverRooms(
  hass: HomeAssistant,
): Promise<DiscoveryResponse> {
  return hass.connection.sendMessagePromise<DiscoveryResponse>({
    type: "homedeck/rooms",
  });
}

