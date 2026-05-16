/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE?: string;
  readonly VITE_RIA_AFFILIATE_URL?: string;
  readonly VITE_RIA_AFFILIATE_DEEP_LINK?: string;
  readonly VITE_RIA_AFFILIATE_SHARED_ID?: string;
  readonly VITE_STRIPE_PUBLISHABLE_KEY?: string;
  /** GA4 measurement ID, e.g. G-XXXXXXX. Omit in dev or leave unset to disable tracking. */
  readonly VITE_GA_MEASUREMENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
