/**
 * Single source of truth for public URLs in sitemap.xml (vite) and in-app routing.
 * Add new static pages here so builds include them in the sitemap for Google.
 */
export type SitemapEntry = {
  path: string;
  changefreq: "weekly" | "monthly" | "yearly";
  /** 0.0–1.0 */
  priority: number;
};

export const SITEMAP_PATHS: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: 1 },
  { path: "/guides", changefreq: "weekly", priority: 0.85 },
  { path: "/guides/send-money-to-thailand", changefreq: "monthly", priority: 0.8 },
  { path: "/guides/buffalo-moneysend", changefreq: "monthly", priority: 0.8 },
  { path: "/faq", changefreq: "monthly", priority: 0.75 },
];
