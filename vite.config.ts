import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { type Plugin, defineConfig, loadEnv } from "vite";
import { SITEMAP_PATHS } from "./src/seo/sitemapData";

/**
 * Injects the public site origin into `index.html` and writes `sitemap.xml` and `robots.txt` to `outDir` at build time.
 * Set `VITE_PUBLIC_SITE_URL` in the environment (e.g. Netlify) to your canonical HTTPS origin, no trailing slash.
 */
function seoPlugin(siteUrl: string): Plugin {
  const base = siteUrl.replace(/\/$/, "");
  let outDir = "dist";

  return {
    name: "seo-sitemap-robots",
    configResolved(config) {
      outDir = config.build.outDir;
    },
    transformIndexHtml(html) {
      return html.replaceAll("__SITE_URL__", base);
    },
    closeBundle() {
      const out = resolve(process.cwd(), outDir);
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${SITEMAP_PATHS.map((e) => {
  const loc = e.path === "/" ? `${base}/` : `${base}${e.path}`;
  return `  <url>
    <loc>${loc}</loc>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority.toFixed(2)}</priority>
  </url>`;
}).join("\n")}
</urlset>
`;
      const robots = `User-agent: *
Allow: /

Sitemap: ${base}/sitemap.xml
`;
      writeFileSync(resolve(out, "sitemap.xml"), sitemap, "utf8");
      writeFileSync(resolve(out, "robots.txt"), robots, "utf8");
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const defaultSite = mode === "development" ? "http://localhost:5173" : "https://www.example.com";
  const siteUrl = (env.VITE_PUBLIC_SITE_URL || defaultSite).replace(/\/$/, "");

  return {
    plugins: [react(), seoPlugin(siteUrl)],
    server: {
      proxy: {
        "/api": {
          target: "http://localhost:4000",
          changeOrigin: true,
        },
      },
    },
    /* Same proxy for `vite preview` so /api hits the local Express API */
    preview: {
      port: 4173,
      proxy: {
        "/api": {
          target: "http://localhost:4000",
          changeOrigin: true,
        },
      },
    },
  };
});
