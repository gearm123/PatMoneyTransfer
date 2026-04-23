import { TransferApp } from "./transfer/TransferApp";

export default function App() {
  return (
    <div className="app-thailand-hub">
      <div className="gearm-watermark" aria-hidden="true">
        <img className="gearm-watermark__img" src="/gearm-signature.png" alt="" width={240} height={80} />
      </div>
      <div className="ambient-orb ambient-orb--1" aria-hidden />
      <div className="ambient-orb ambient-orb--2" aria-hidden />
      <div className="app-inner app-inner--thailand-hub">
        <div className="buffalo-atmosphere" aria-hidden="true">
          <div className="buffalo-atmosphere__mark buffalo-atmosphere__mark--1" />
          <div className="buffalo-atmosphere__mark buffalo-atmosphere__mark--2" />
        </div>
        <div className="app-shell app-shell--viewport app-shell--thailand">
          <header className="site-header site-header--stacked">
            <a href="/" className="site-header-brand" aria-label="BuffaloMoneySend home">
              <span className="logo-mark" aria-hidden>
                B
              </span>
              <span className="site-header-title__wordmark" translate="no">
                Buffalo<span className="logo-wordmark-mid">Money</span>Send
              </span>
            </a>
            <p className="site-header-strap">Send in THB from many countries</p>
          </header>

          <main className="app-main app-main--thailand-hub" id="main">
            <section className="thailand-hero" aria-labelledby="thailand-hero-title">
              <div className="thailand-hero__figure" aria-hidden="true">
                <div className="thailand-hero__ring">
                  <img
                    className="thailand-hero__img"
                    src="/buffalo-hero.png"
                    alt=""
                    width={400}
                    height={400}
                    loading="eager"
                    decoding="async"
                  />
                </div>
                <p className="thailand-hero__caption">The herd is the theme—the send is the product.</p>
              </div>
              <p className="hero-eyebrow thailand-hero__eyebrow">Cross-border · built to stay calm</p>
              <h1 id="thailand-hero-title" className="thailand-hero__title">
                <span className="gradient-text">Send to Thailand</span>{" "}
                <span className="thailand-hero__title-rest">— from your country, in a few steps</span>
              </h1>
              <p className="thailand-hero__lede">
                <strong>BuffaloMoneySend</strong> is for people who need to support family, friends, and business
                in <strong>Thailand (THB)</strong> from the US, UK, Europe, Australia, Canada, and more—upfront
                numbers, a quiet interface, and card checkout. We keep things calm: the important updates, not a{" "}
                <span className="hero-sub-wink" title="If you get the name, you get the joke.">
                  notification stampede
                </span>
                .
              </p>
              <ul className="thailand-hero__points" role="list">
                <li>
                  <span className="thailand-hero__point-ic" aria-hidden>
                    ✦
                  </span>{" "}
                  Steady, secure card checkout
                </li>
                <li>
                  <span className="thailand-hero__point-ic" aria-hidden>
                    ⏱
                  </span>{" "}
                  See the route before you pay
                </li>
                <li>
                  <span className="thailand-hero__point-ic" aria-hidden>
                    ·
                  </span>{" "}
                  A growing community, not a stampede of email
                </li>
              </ul>
            </section>

            <section className="thailand-workspace" aria-label="Payment and transfer">
              <div className="payment-slab">
                <header className="payment-slab__header">
                  <div className="payment-slab__intro">
                    <p className="payment-slab__eyebrow">Your payment &amp; send</p>
                    <h2 className="payment-slab__title">Start here — this is the transfer flow</h2>
                    <p className="payment-slab__hint">
                      Amount → recipient in Thailand → your details → pay by card. Everything below is the live flow.
                    </p>
                  </div>
                  <div className="payment-slab__badge" title="Payout in Thai Baht (THB)">
                    <span className="payment-slab__badge-flag" aria-hidden>
                      🇹🇭
                    </span>
                    <div>
                      <span className="payment-slab__badge-label">Receives in</span>
                      <span className="payment-slab__badge-value">Thailand · THB</span>
                    </div>
                  </div>
                </header>
                <div className="flow-page-send__card" id="send">
                  <TransferApp />
                </div>
              </div>
            </section>

            <footer className="site-footer site-footer--thailand">
              <span className="footer-brand" translate="no">
                BuffaloMoneySend
              </span>{" "}
              <span className="footer-motto">(The herd is metaphorical. The send is real.)</span>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}
