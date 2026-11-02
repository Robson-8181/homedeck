import type { HomeAssistant } from "../types/home-assistant";

export interface LicenseStatus {
  plan: "free" | "pro";
  /** none, active, invalid, expired, wrong_installation, revoked or transferred */
  status: string;
  installation_id: string;
  limits: { rooms: number; devices: number };
  controllable_domains: string[];
  /** The license server is set up, so the panel can sell Pro. */
  can_buy: boolean;
  /** A checkout was started and is waiting for payment. */
  pending: boolean;
  kind?: "lifetime" | "annual";
  email?: string;
  expires_at?: number | null;
  /** The annual plan was cancelled and ends at expires_at. */
  cancels?: boolean;
  /** Bought through Stripe, so it has a customer portal. */
  manage?: boolean;
}

/** `refresh` asks the license server first (renewals, refunds, transfers). */
export function getLicense(hass: HomeAssistant, refresh = false): Promise<LicenseStatus> {
  return hass.connection.sendMessagePromise<LicenseStatus>({ type: "homedeck/license", ...(refresh ? { refresh } : {}) });
}

export function activateLicense(hass: HomeAssistant, key: string): Promise<LicenseStatus> {
  return hass.connection.sendMessagePromise<LicenseStatus>({ type: "homedeck/license/activate", key });
}

export function deactivateLicense(hass: HomeAssistant): Promise<LicenseStatus> {
  return hass.connection.sendMessagePromise<LicenseStatus>({ type: "homedeck/license/deactivate" });
}

export function startCheckout(hass: HomeAssistant, plan: "lifetime" | "annual", locale?: string): Promise<{ url: string }> {
  return hass.connection.sendMessagePromise<{ url: string }>({ type: "homedeck/license/checkout", plan, ...(locale ? { locale } : {}) });
}

/** Activates Pro when the pending checkout was paid; `cancel` forgets it. */
export function claimCheckout(hass: HomeAssistant, cancel = false): Promise<LicenseStatus> {
  return hass.connection.sendMessagePromise<LicenseStatus>({ type: "homedeck/license/claim", cancel });
}

export function openPortal(hass: HomeAssistant, returnUrl: string): Promise<{ url: string }> {
  return hass.connection.sendMessagePromise<{ url: string }>({ type: "homedeck/license/portal", return_url: returnUrl });
}
