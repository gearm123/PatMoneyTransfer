/**
 * Top-of-page notice: under construction, coming soon.
 * Hammer is inline SVG to match the fintech color palette.
 */
export function ConstructionBanner() {
  return (
    <aside className="shell__uc" aria-label="Site status" role="status">
      <div className="shell__uc-sheen" aria-hidden />
      <div className="shell__uc-stripe" aria-hidden />
      <div className="shell__uc-row">
        <span className="shell__uc-icon" aria-hidden>
          <svg
            className="shell__uc-hammer"
            viewBox="0 0 40 40"
            width={30}
            height={30}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Head */}
            <rect
              x="4"
              y="10"
              width="22"
              height="12"
              rx="2.5"
              fill="url(#uc-h)"
              transform="rotate(-8 15 16)"
            />
            {/* Bevel */}
            <rect x="6" y="12" width="18" height="3" rx="1" fill="rgba(255,255,255,0.2)" transform="rotate(-8 15 16)" />
            {/* Handle */}
            <rect
              x="22"
              y="18"
              width="6"
              height="18"
              rx="1.2"
              fill="url(#uc-hnd)"
              transform="rotate(-8 25 22)"
            />
            <circle cx="25" cy="34" r="2.2" fill="url(#uc-hnd)" transform="rotate(-8 25 22)" />
            <defs>
              <linearGradient id="uc-h" x1="4" y1="10" x2="26" y2="22" gradientUnits="userSpaceOnUse">
                <stop stopColor="#a5f3fc" />
                <stop offset="0.5" stopColor="#22d3ee" />
                <stop offset="1" stopColor="#6366f1" />
              </linearGradient>
              <linearGradient id="uc-hnd" x1="22" y1="18" x2="32" y2="38" gradientUnits="userSpaceOnUse">
                <stop stopColor="#c2410c" />
                <stop offset="0.5" stopColor="#b4530f" />
                <stop offset="1" stopColor="#78350f" />
              </linearGradient>
            </defs>
          </svg>
        </span>
        <p className="shell__uc-copy">
          <span className="shell__uc-title">Under construction</span>
          <span className="shell__uc-sep" aria-hidden>
            {" "}
            ·{" "}
          </span>
          <span className="shell__uc-sub">Coming soon</span>
        </p>
      </div>
    </aside>
  );
}
