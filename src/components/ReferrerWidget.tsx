import { useEffect, useState } from "react";
import { recordReferral } from "../transfer/api";

const INITIAL_REFERRAL_OPTIONS = ["Gearm"] as const;
const DEFAULT_REFERRER_LABEL = "Select a referrer";

export function ReferrerWidget() {
  const [referralName, setReferralName] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    if (!successToast) return;
    const timeoutId = window.setTimeout(() => setSuccessToast(null), 2200);
    return () => window.clearTimeout(timeoutId);
  }, [successToast]);

  const sendReferral = async () => {
    if (!referralName) return;
    setSending(true);
    setErrorNotice(null);
    try {
      const result = await recordReferral(referralName);
      setSuccessToast(`${result.referral.name} sent successfully.`);
    } catch (e) {
      setErrorNotice(e instanceof Error ? e.message : "Could not record referral");
    } finally {
      setSending(false);
    }
  };

  return (
    <aside className="home-referrer" aria-label="Referrer widget">
      <p className="home-referrer__eyebrow">Referral</p>
      <div className="home-referrer__field">
        <span className="home-referrer__label">Referrer</span>
        <button
          type="button"
          className={`home-referrer__select ${referralName ? "" : "is-placeholder"}`}
          aria-expanded={isOpen}
          aria-controls="home-referrer-options"
          onClick={() => setIsOpen((open) => !open)}
        >
          <span>{referralName || DEFAULT_REFERRER_LABEL}</span>
          <span className="home-referrer__caret" aria-hidden>
            v
          </span>
        </button>
        {isOpen ? (
          <div className="home-referrer__menu" id="home-referrer-options" role="listbox" aria-label="Referrer options">
            {INITIAL_REFERRAL_OPTIONS.map((name) => (
              <button
                key={name}
                type="button"
                className={`home-referrer__option ${name === referralName ? "is-selected" : ""}`}
                role="option"
                aria-selected={name === referralName}
                onClick={() => {
                  setReferralName(name);
                  setErrorNotice(null);
                  setIsOpen(false);
                }}
              >
                {name}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <button type="button" className="home-referrer__button" onClick={() => void sendReferral()} disabled={!referralName || sending}>
        {sending ? "Sending..." : "Send"}
      </button>
      {errorNotice ? (
        <p className="home-referrer__status home-referrer__status--err" role="alert">
          {errorNotice}
        </p>
      ) : null}
      {successToast ? (
        <div className="home-referrer__toast" role="status" aria-live="polite">
          {successToast}
        </div>
      ) : null}
    </aside>
  );
}
