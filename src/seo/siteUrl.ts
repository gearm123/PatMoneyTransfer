/**
 * Public HTTPS origin, no trailing slash. Bakes from VITE_PUBLIC_SITE_URL or falls back.
 */
export function getSiteOrigin(): string {
  const fromEnv = (import.meta.env.VITE_PUBLIC_SITE_URL as string | undefined)?.trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (typeof window !== "undefined") return window.location.origin;
  return "https://buffalomoneysend.com";
}
