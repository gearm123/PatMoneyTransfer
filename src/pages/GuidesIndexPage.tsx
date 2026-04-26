import { Link } from "react-router-dom";
import { listGuidesForMenu } from "../content/guides";
import { ContentPageLayout } from "../components/ContentPageLayout";
import { SeoHead } from "../seo/SeoHead";
import { getSiteOrigin } from "../seo/siteUrl";

export default function GuidesIndexPage() {
  const guides = listGuidesForMenu();
  const origin = getSiteOrigin();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Guides — BuffaloMoneySend",
    url: `${origin}/guides`,
    description: "Guides for sending money to Thailand, THB payouts, and what BuffaloMoneySend is about.",
    isPartOf: { "@type": "WebSite", name: "BuffaloMoneySend", url: `${origin}/` },
  };
  return (
    <>
      <SeoHead
        title="Guides — money send to Thailand & BuffaloMoneySend"
        description="Read our guides: send money to Thailand in THB, what money send means here, and what the BuffaloMoneySend community is about."
        path="/guides"
        jsonLd={jsonLd}
      />
      <ContentPageLayout kicker="Guides">
        <article className="seo-article">
          <h1 className="seo-article__h1">Guides</h1>
          <p className="seo-article__lead">
            Practical articles on <strong>money send</strong> to Thailand, Thai bank payouts, and our <strong>buffalo</strong> brand and
            community—written for people who want a clear path from card to recipient.
          </p>
          <ul className="seo-article__list">
            {guides.map((g) => (
              <li key={g.slug}>
                <Link to={`/guides/${g.slug}`}>{g.title}</Link>
                <span className="seo-article__meta"> — {g.short}</span>
              </li>
            ))}
          </ul>
        </article>
      </ContentPageLayout>
    </>
  );
}
