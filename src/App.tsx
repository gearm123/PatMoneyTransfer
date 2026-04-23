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
          <main className="app-main app-main--thailand-hub" id="main">
            <section className="hub-crest" aria-labelledby="hub-title">
              <div className="hub-crest__media" aria-hidden="true">
                <div className="hub-crest__ring">
                  <img
                    className="hub-crest__img"
                    src="/buffalo-hero.png"
                    alt=""
                    width={400}
                    height={400}
                    loading="eager"
                    decoding="async"
                  />
                </div>
              </div>
              <a href="/" className="hub-crest__brand" aria-label="BuffaloMoneySend home">
                <span className="logo-mark" aria-hidden>
                  B
                </span>
                <span className="hub-crest__wordmark" translate="no">
                  Buffalo<span className="logo-wordmark-mid">Money</span>Send
                </span>
              </a>
              <h1 id="hub-title" className="hub-crest__title">
                <span className="gradient-text">Send to Thailand</span>{" "}
                <span className="hub-crest__thb">(THB)</span>
              </h1>
              <p className="hub-crest__one">
                Calm, cross-border sends—see the rate before you pay. One herd, not a stampede of noise.
              </p>
            </section>

            <section className="thailand-workspace" aria-label="Transfer">
              <div className="payment-slab">
                <header className="payment-slab__header payment-slab__header--tight">
                  <h2 className="payment-slab__title">Start your send</h2>
                  <div className="payment-slab__badge" title="Payout in Thai Baht (THB)">
                    <span className="payment-slab__badge-flag" aria-hidden>
                      🇹🇭
                    </span>
                    <span className="payment-slab__badge-value">Thailand · THB</span>
                  </div>
                </header>
                <div className="flow-page-send__card hub-send" id="send">
                  <TransferApp layout="hub" />
                </div>
              </div>
            </section>

            <footer className="site-footer site-footer--thailand">
              <span className="footer-brand" translate="no">
                BuffaloMoneySend
              </span>
              <span className="footer-motto"> — The herd is metaphorical. The send is real.</span>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}
