export const PRIVACY_POLICY_URL =
  import.meta.env.VITE_PRIVACY_POLICY_URL?.trim() ||
  "https://startrussia.alabuga.ru/policy.html";

const base = import.meta.env.BASE_URL || "/";

export const COOKIE_CONSENT_URL = `${base}legal/cookie-consent.html`;
export const APPLICATION_CONSENT_URL = `${base}legal/application-consent.html`;
