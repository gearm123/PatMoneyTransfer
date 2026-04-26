import { Link, useLocation } from "react-router-dom";
import { ContentPageLayout } from "../components/ContentPageLayout";
import { SeoHead } from "../seo/SeoHead";

export default function NotFoundPage() {
  const { pathname } = useLocation();
  return (
    <>
      <SeoHead
        title="Page not found — BuffaloMoneySend"
        description="The page you requested is not available. Go home or open guides and FAQ."
        path={pathname}
        noIndex
      />
      <ContentPageLayout>
        <article className="seo-article">
          <h1 className="seo-article__h1">Page not found</h1>
          <p className="seo-article__lead">That link does not match a guide, FAQ, or the send page.</p>
          <p className="seo-article__foot">
            <Link to="/">Home</Link>
            {" · "}
            <Link to="/guides">Guides</Link>
            {" · "}
            <Link to="/faq">FAQ</Link>
          </p>
        </article>
      </ContentPageLayout>
    </>
  );
}
