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
        <div className="app-shell">
          <header className="site-header">
            <a href="/" className="logo">
              <span className="logo-mark" aria-hidden>
                ∞
              </span>
              GlobalSend
            </a>
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
          </header>

          <main>
            <div className="hero-landing" aria-labelledby="hero-title">
              <div>
                <p className="hero-eyebrow">Global transfers</p>
                <h1 id="hero-title" className="hero-title">
                  <span className="gradient-text">Move money</span> with clarity
                </h1>
                <p className="hero-sub">
                  A focused checkout for international sends: you choose the corridor, we keep the
                  experience calm and the numbers transparent. Bank-grade card handling when you connect
                  your keys.
                </p>
                <div className="trust-pills">
                  <span className="trust-pill">
                    <span aria-hidden>✦</span> Encrypted checkout
                  </span>
                  <span className="trust-pill">
                    <span aria-hidden>⏱</span> Upfront estimate
                  </span>
                  <span className="trust-pill">
                    <span aria-hidden>🌐</span> Built to add corridors
                  </span>
                </div>
              </div>

              <div id="send" style={{ minWidth: 0 }}>
                <TransferApp />
              </div>
            </div>

            <footer className="site-footer">
              Demo for development. Add your own compliance, KYC, and payout provider before any live
              use.
            </footer>
          </main>
        </div>
      </div>
    </>
  );
}
