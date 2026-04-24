/**
 * Top-of-page notice: under construction, coming soon.
 * Diamond sign is an asset in /public (white background removed in build asset).
 */
export function ConstructionBanner() {
  return (
    <aside className="shell__uc" aria-label="Site status" role="status">
      <div className="shell__uc-sheen" aria-hidden />
      <div className="shell__uc-stripe" aria-hidden />
      <div className="shell__uc-row">
        <span className="shell__uc-icon" aria-hidden>
          <img
            className="shell__uc-sign"
            src="/under-construction-sign.png"
            width={225}
            height={225}
            alt=""
            decoding="async"
          />
        </span>
        <p className="shell__uc-copy">
          <span className="shell__uc-line shell__uc-title">Under construction</span>
          <span className="shell__uc-line shell__uc-sub">Coming soon</span>
        </p>
      </div>
    </aside>
  );
}
