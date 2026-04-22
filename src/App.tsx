import { useEffect, useState } from "react";
import { getHealth } from "./api/client";
import { TransferApp } from "./transfer/TransferApp";

export default function App() {
  const [api, setApi] = useState<string | null>(null);

  useEffect(() => {
    getHealth()
      .then((h) => setApi(h.stripe === true ? "ok" : "partial"))
      .catch(() => setApi("offline"));
  }, []);

  return (
    <>
      <div className="ambient-orb ambient-orb--1" aria-hidden />
      <div className="ambient-orb ambient-orb--2" aria-hidden />
      <div className="app-inner">
        <div className="buffalo-atmosphere" aria-hidden="true">
          <div className="buffalo-atmosphere__mark buffalo-atmosphere__mark--1" />
          <div className="buffalo-atmosphere__mark buffalo-atmosphere__mark--2" />
        </div>
        <div className="app-shell app-shell--viewport">
          <header className="site-header">
            <a href="/" className="site-header-brand" aria-label="BuffaloMoneySend home">
              <span className="logo-mark" aria-hidden>
                B
              </span>
              <span className="site-header-title__wordmark" translate="no">
                Buffalo<span className="logo-wordmark-mid">Money</span>Send
              </span>
            </a>
            <div className="site-header-crest" aria-hidden="true">
              <div className="site-header-crest__ring">
                <img
                  className="site-header-crest__img"
                  src="/buffalo-hero.png"
                  alt=""
                  width={320}
                  height={320}
                  loading="eager"
                  decoding="async"
                />
              </div>
            </div>
            <div className="site-header-bar">
              <div className="header-meta">
                {api && (
                  <span
                    className={`pill-ghost ${
                      api === "ok" ? "pill-ghost--ok" : api === "offline" ? "pill-ghost--bad" : ""
                    }`}
                  >
                    {api === "ok" ? "API online" : api === "offline" ? "Start backend" : "Stripe not set"}
                  </span>
                )}
                <a
                  className="nav-links"
                  href="https://docs.stripe.com/testing"
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: "0.85rem" }}
                >
                  Test cards
                </a>
              </div>
            </div>
          </header>

          <main className="app-main">
            <div className="hero-landing" aria-labelledby="hero-title">
              <div className="hero-copy">
                <p className="hero-eyebrow">Cross-border · built to stay calm</p>
                <h1 id="hero-title" className="hero-title">
                  <span className="gradient-text">Send money</span> you can count on
                </h1>
                <p className="hero-tagline">Send money today and join the buffalo community</p>
                <p className="hero-sub">
                  <strong>BuffaloMoneySend</strong> is for people who need to support family, friends, and
                  business across borders—upfront numbers, a quiet interface, and card checkout. We keep
                  things calm: the important updates, not a{" "}
                  <span className="hero-sub-wink" title="If you get the name, you get the joke.">
                    notification stampede
                  </span>
                  .
                </p>
                <div className="trust-pills">
                  <span className="trust-pill">
                    <span aria-hidden>✦</span> Steady, secure card checkout
                  </span>
                  <span className="trust-pill">
                    <span aria-hidden>⏱</span> See the route before you pay
                  </span>
                  <span className="trust-pill">
                    <span aria-hidden>·</span> A growing community, not a stampede of email
                  </span>
                </div>
              </div>

              <div id="send" className="hero-panel" style={{ minWidth: 0 }}>
                <TransferApp />
              </div>
            </div>

            <footer className="site-footer">
              <span className="footer-brand" translate="no">
                BuffaloMoneySend
              </span>{" "}
              — demo build. Add compliance, KYC, and a payout provider before live use.
              <span className="footer-motto">
                {" "}
                (The herd is metaphorical. The send is real.)
              </span>
            </footer>
          </main>
        </div>
      </div>
    </>
  );
}
