import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { BuffaloHeroImg } from "../BuffaloHeroImg";
import { ConstructionBanner } from "../ConstructionBanner";
import { SeoHead } from "../seo/SeoHead";
import { getSiteOrigin } from "../seo/siteUrl";
import { TransferApp } from "../transfer/TransferApp";

const STRIPE_FLAGS: { flag: string; style: CSSProperties }[] = [
  { flag: "🇺🇸", style: { top: "4%", right: "6%" } },
  { flag: "🇬🇧", style: { top: "12%", right: "3%" } },
  { flag: "🇩🇪", style: { top: "3%", right: "22%" } },
  { flag: "🇫🇷", style: { top: "20%", right: "8%" } },
  { flag: "🇦🇺", style: { bottom: "18%", left: "4%" } },
  { flag: "🇨🇦", style: { bottom: "8%", left: "6%" } },
  { flag: "🇯🇵", style: { bottom: "22%", right: "5%" } },
  { flag: "🇸🇬", style: { top: "28%", left: "3%" } },
  { flag: "🇹🇭", style: { bottom: "12%", right: "18%" } },
  { flag: "🇪🇸", style: { top: "8%", left: "15%" } },
  { flag: "🇮🇹", style: { bottom: "4%", right: "28%" } },
  { flag: "🇳🇱", style: { top: "35%", right: "12%" } },
];

const TAGLINES: { t: string; style: CSSProperties }[] = [
  { t: "Come join our buffalo community.", style: { top: "5%", left: "8%" } },
  { t: "One herd — clear rates, global flow.", style: { top: "20%", right: "6%" } },
  { t: "From your card to their Thai account.", style: { bottom: "15%", right: "8%" } },
  { t: "Real-time estimate. Secure checkout.", style: { bottom: "5%", left: "6%" } },
];

const CURRENCY_DECO: { s: string; style: CSSProperties }[] = [
  { s: "$", style: { top: "10%", right: "18%" } },
  { s: "€", style: { top: "38%", right: "6%" } },
  { s: "£", style: { bottom: "20%", right: "24%" } },
];

/**
 * One viewport: no page scroll. Buffalo centered; payment card fills the rest.
 */
export default function HomePage() {
  const origin = getSiteOrigin();
  const homeJson = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "BuffaloMoneySend",
    url: `${origin}/`,
    description: "Send money to Thailand: pay with your card; recipients receive THB. Clear estimate, secure checkout.",
  };
  return (
    <>
      <SeoHead
        title="BuffaloMoneySend — Send to Thailand in THB"
        description="BuffaloMoneySend — pay from your country with your card; recipients receive in Thailand (THB). Clear estimate, secure checkout."
        path="/"
        jsonLd={homeJson}
      />
      <div className="shell">
        <div className="shell__bg" aria-hidden />
        <div className="shell__fintech" aria-hidden>
          <div className="shell__map" />
          <div className="shell__map shell__map--b" />
          <svg className="shell__arcs" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
            <defs>
              <linearGradient id="shell-arc" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0" />
                <stop offset="40%" stopColor="#22d3ee" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.45" />
              </linearGradient>
            </defs>
            <path
              d="M5 25 Q 35 8 55 18 T 95 22"
              fill="none"
              stroke="url(#shell-arc)"
              strokeWidth="0.35"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d="M8 42 Q 40 32 70 38 T 98 50"
              fill="none"
              stroke="url(#shell-arc)"
              strokeWidth="0.25"
              opacity="0.7"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d="M12 60 Q 45 70 80 55"
              fill="none"
              stroke="url(#shell-arc)"
              strokeWidth="0.2"
              opacity="0.5"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <div className="shell__trail" />
          <div className="shell__chev shell__chev--1" />
          <div className="shell__chev shell__chev--2" />
          <div className="shell__chev shell__chev--3" />
        </div>
        <div className="shell__glow shell__glow--a" aria-hidden />
        <div className="shell__glow shell__glow--b" aria-hidden />
        <div className="shell__glow shell__glow--c" aria-hidden />

        <div className="shell__atmosphere" aria-hidden>
          <div className="shell__flags">
            {STRIPE_FLAGS.map((row, i) => (
              <span key={i} className="shell__flag" style={row.style}>
                {row.flag}
              </span>
            ))}
          </div>
          {CURRENCY_DECO.map((row, i) => (
            <span key={`c${i}`} className="shell__currencymark" style={row.style}>
              {row.s}
            </span>
          ))}
          {TAGLINES.map((row, i) => (
            <p key={i} className="shell__tagline" style={row.style}>
              {row.t}
            </p>
          ))}
        </div>

        <div className="shell__gearm" role="img" aria-label="Gearm">
          <img
            className="shell__gearm-img"
            src="/gearm-logo.png"
            alt=""
            width={180}
            height={72}
            decoding="async"
          />
        </div>

        <header className="shell__hero" id="top">
          <div className="shell__buffalo">
            <div className="shell__ring">
              <BuffaloHeroImg className="shell__img" width={256} height={256} />
            </div>
          </div>
          <p className="shell__name" translate="no">
            <span className="shell__mark" aria-hidden>
              B
            </span>{" "}
            Buffalo<span className="shell__name-accent">Money</span>Send
          </p>
          <h1 className="shell__h1">Send to Thailand in THB</h1>
          <nav className="shell__landing-nav" aria-label="Guides and help">
            <Link to="/guides" className="shell__landing-link">
              Money send &amp; guides
            </Link>
            <span className="shell__landing-sep" aria-hidden>
              ·
            </span>
            <Link to="/faq" className="shell__landing-link">
              FAQ
            </Link>
          </nav>
        </header>

        <div className="shell__work">
          <main className="shell__main" id="main" aria-label="Payment">
            <TransferApp layout="hub" />
          </main>
          <p className="shell__legal" translate="no">
            BuffaloMoneySend
          </p>
        </div>

        <ConstructionBanner />
      </div>
    </>
  );
}
