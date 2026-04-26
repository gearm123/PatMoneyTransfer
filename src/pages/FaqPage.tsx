import { Link } from "react-router-dom";
import { ContentPageLayout } from "../components/ContentPageLayout";
import { SeoHead } from "../seo/SeoHead";
import { getSiteOrigin } from "../seo/siteUrl";

const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: "What is a money send with BuffaloMoneySend?",
    a: "You pay with your card in your currency; we help route the transfer so your recipient in Thailand can receive funds to their bank account, typically in THB. You see an estimate before you complete payment.",
  },
  {
    q: "Why is the site called BuffaloMoneySend?",
    a: "“Buffalo” reflects a community-minded brand—clear, steady progress. It is not a bank product name; it is the name of our service experience for international transfer to Thailand.",
  },
  {
    q: "What do I need from my recipient?",
    a: "Their Thai bank, and the account number exactly as on their passbook or banking app. Digit length rules depend on the bank—our flow validates where the API allows before you pay.",
  },
  {
    q: "Where can I read more?",
    a: "See our guides for money send to Thailand and an overview of BuffaloMoneySend, or return to the home page to start a send.",
  },
];

export default function FaqPage() {
  const origin = getSiteOrigin();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
    url: `${origin}/faq`,
  };
  return (
    <>
      <SeoHead
        title="FAQ — BuffaloMoneySend | money send to Thailand"
        description="Answers about money send to Thailand, THB payouts, and the BuffaloMoneySend service. Links to guides and the send flow."
        path="/faq"
        jsonLd={jsonLd}
      />
      <ContentPageLayout kicker="Help">
        <article className="seo-article">
          <h1 className="seo-article__h1">Frequently asked questions</h1>
          <p className="seo-article__lead">
            Quick answers about <strong>money send</strong>, <strong>Thailand (THB)</strong>, and our{" "}
            <Link to="/guides/buffalo-moneysend">buffalo</Link> community brand.
          </p>
          <div className="seo-faq">
            {FAQ_ITEMS.map((item) => (
              <section key={item.q} className="seo-faq__item">
                <h2 className="seo-article__h2">{item.q}</h2>
                <p className="seo-article__p">{item.a}</p>
              </section>
            ))}
          </div>
          <p className="seo-article__foot">
            <Link to="/guides">Guides</Link>
            {" · "}
            <Link to="/">Back to home</Link>
          </p>
        </article>
      </ContentPageLayout>
    </>
  );
}
