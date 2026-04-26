import { createPortal } from "react-dom";

/**
 * Dignified, fixed in-viewport line. Portals to <body> so #root { overflow: hidden } does not clip it on refresh.
 */
export function MemorialBanner() {
  if (typeof document === "undefined") return null;
  return createPortal(
    <aside
      className="memorial"
      role="complementary"
      aria-label="In memory of Sasithon Wangyangnok, our mother. This site is in her honor."
    >
      <p className="memorial__line">
        <span className="memorial__pre">In memory of</span>
        <wbr />
        <span className="memorial__name" translate="no">
          Sasithon Wangyangnok
        </span>
      </p>
      <p className="memorial__sub">Our mother — this place is in her honor</p>
    </aside>,
    document.body
  );
}
