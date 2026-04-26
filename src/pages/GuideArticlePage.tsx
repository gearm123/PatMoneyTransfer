import { Link, useParams } from "react-router-dom";
import { getGuideOrNull } from "../content/guides";
import { ContentPageLayout } from "../components/ContentPageLayout";
import { SeoHead } from "../seo/SeoHead";
import { getSiteOrigin } from "../seo/siteUrl";
import NotFoundPage from "./NotFoundPage";

export default function GuideArticlePage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const article = getGuideOrNull(slug);
  if (!article) {
    return <NotFoundPage />;
  }
  const origin = getSiteOrigin();
  const path = `/guides/${article.slug}`;
  const url = `${origin}${path}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    url,
    author: { "@type": "Organization", name: "BuffaloMoneySend" },
    publisher: { "@type": "Organization", name: "BuffaloMoneySend" },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };

  return (
    <>
      <SeoHead title={article.title} description={article.description} path={path} jsonLd={jsonLd} />
      <ContentPageLayout kicker="Guides">
        <article className="seo-article">
          <nav className="seo-breadcrumb" aria-label="Breadcrumb">
            <Link to="/guides">Guides</Link>
            <span aria-hidden> / </span>
            <span>{article.title.split(" | ")[0]}</span>
          </nav>
          <h1 className="seo-article__h1">{article.title.split(" | ")[0]}</h1>
          <p className="seo-article__lead">{article.description}</p>
          {article.sections.map((s) => (
            <section key={s.heading} className="seo-article__section">
              <h2 className="seo-article__h2">{s.heading}</h2>
              <p className="seo-article__p">{s.body}</p>
            </section>
          ))}
          <p className="seo-article__foot">
            <Link to="/guides">← All guides</Link>
            {" · "}
            <Link to="/">Start a send</Link>
          </p>
        </article>
      </ContentPageLayout>
    </>
  );
}
