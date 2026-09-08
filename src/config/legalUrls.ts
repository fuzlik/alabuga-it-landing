import { PRIVACY_POLICY_URL } from "./privacyPolicyUrl";

const base = import.meta.env.BASE_URL || "/";

export { PRIVACY_POLICY_URL };

export const COOKIE_CONSENT_URL = `${base}legal/cookie-consent.html`;
export const APPLICATION_CONSENT_URL = `${base}legal/application-consent.html`;
