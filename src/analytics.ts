/**
 * GA4 (gtag) — only loads when VITE_GA_MEASUREMENT_ID is set (e.g. in Netlify).
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
  if (!MEASUREMENT_ID) return;
  if (import.meta.env.DEV) return;

  window.dataLayer = window.dataLayer ?? [];
  // https://developers.google.com/tag-platform/gtagjs — `dataLayer.push(arguments)`
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gtag: any = function () {
    (window as any).dataLayer.push(arguments);
  };
  window.gtag = gtag;
  gtag("js", new Date());
  gtag("config", MEASUREMENT_ID, { send_page_view: true });

  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(MEASUREMENT_ID)}`;
  document.head.appendChild(s);

  initialized = true;
}

export function analyticsEvent(action: string, params?: Record<string, unknown>): void {
  if (!MEASUREMENT_ID || !import.meta.env.PROD) return;
  const g = window.gtag;
  if (typeof g !== "function") return;
  (g as (cmd: "event", a: string, p?: Record<string, unknown>) => void)("event", action, params);
}
