/**
 * GA4 (gtag) — only loads when `VITE_GA_MEASUREMENT_ID` is set at **build** time (e.g. Netlify env).
 * Requests appear as `google-analytics.com/.../collect` (filter "collect" in Network). Ad blockers hide them.
 */
const MEASUREMENT_ID = (import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined)?.trim();

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

let initialized = false;

export function initGoogleAnalytics(): void {
  if (initialized) return;

  if (!MEASUREMENT_ID) {
    if (import.meta.env.PROD) {
      // eslint-disable-next-line no-console
      console.warn(
        "[BuffaloMoneySend] GA4 is not configured: set VITE_GA_MEASUREMENT_ID in Netlify (or .env) and redeploy / rebuild. No /collect requests will be sent."
      );
    }
    return;
  }

  // Match Google’s snippet: queue calls, then load gtag.js (async) — it processes dataLayer on load
  window.dataLayer = window.dataLayer ?? [];
  // https://developers.google.com/tag-platform/gtagjs — must push `arguments` (not a rest array)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gtag: any = function gtag() {
    (window as any).dataLayer.push(arguments);
  };
  window.gtag = gtag;
  gtag("js", new Date());
  gtag("config", MEASUREMENT_ID, { send_page_view: true });

  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(MEASUREMENT_ID)}`;
  s.addEventListener("load", () => {
    // If you see this but still no "collect" requests, an ad/tracking blocker is likely the cause (try incognito, extensions off).
    // eslint-disable-next-line no-console
    console.info(
      "[BuffaloMoneySend] GA4: gtag.js loaded; stream",
      `…${MEASUREMENT_ID.replace(/^G-/, "").slice(-4)}`
    );
  });
  s.addEventListener("error", () => {
    // eslint-disable-next-line no-console
    console.error("[BuffaloMoneySend] GA4: gtag.js failed to load (network, CSP, or blocked).");
  });
  document.head.appendChild(s);

  initialized = true;
}

export function analyticsEvent(action: string, params?: Record<string, unknown>): void {
  if (!MEASUREMENT_ID) return;
  const g = window.gtag;
  if (typeof g !== "function") return;
  (g as (cmd: "event", a: string, p?: Record<string, unknown>) => void)("event", action, params);
}
