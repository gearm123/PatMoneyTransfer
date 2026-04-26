import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type Props = {
  children: ReactNode;
  /** e.g. "Guides" for breadcrumb feel */
  kicker?: string;
};

/**
 * Scrollable, readable layout for SEO guides & FAQ. Same night theme, lighter content column.
 */
export function ContentPageLayout({ children, kicker }: Props) {
  return (
    <div className="content-shell">
      <div className="content-shell__bg" aria-hidden />
      <div className="content-shell__glow" aria-hidden />
      <a href="#content-main" className="content-shell__skip">
        Skip to content
      </a>
      <header className="content-shell__head">
        <div className="content-shell__brand">
          <Link to="/" className="content-shell__home">
            <span className="content-shell__mark">B</span> Buffalo<span className="content-shell__accent">Money</span>Send
          </Link>
          {kicker ? <span className="content-shell__kicker">{kicker}</span> : null}
        </div>
        <nav className="content-shell__nav" aria-label="Site">
          <Link to="/">Send money</Link>
          <Link to="/guides">Guides</Link>
          <Link to="/faq">FAQ</Link>
        </nav>
      </header>
      <main id="content-main" className="content-shell__main">
        {children}
      </main>
      <footer className="content-shell__foot" translate="no">
        <p>BuffaloMoneySend</p>
      </footer>
    </div>
  );
}
