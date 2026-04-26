import { Helmet } from "react-helmet-async";
import { getSiteOrigin } from "./siteUrl";

type Props = {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
  jsonLd?: Record<string, unknown>;
};

/**
 * Per-route title, description, canonical, and Open Graph so crawlers (and social) see unique pages.
 */
export function SeoHead({ title, description, path, noIndex, jsonLd }: Props) {
  const origin = getSiteOrigin();
  const pathNorm = path === "/" || path === "" ? "/" : path.startsWith("/") ? path : `/${path}`;
  const canonical = `${origin}${pathNorm === "/" ? "/" : pathNorm}`;

  return (
    <Helmet htmlAttributes={{ lang: "en" }}>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      {noIndex ? <meta name="robots" content="noindex, nofollow" /> : <meta name="robots" content="index, follow" />}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="BuffaloMoneySend" />
      <meta property="og:locale" content="en_US" />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {jsonLd ? (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      ) : null}
    </Helmet>
  );
}
