import { useState } from "react";
import { recordReferral } from "../transfer/api";

const INITIAL_REFERRAL_OPTIONS = ["Gearm"] as const;
const DEFAULT_REFERRER_LABEL = "Select a referrer";

export function ReferrerWidget() {
  const [referralName, setReferralName] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const sendReferral = async () => {
    if (!referralName) return;
    setSending(true);
    setNotice(null);
    try {
      const result = await recordReferral(referralName);
      setNotice({
        kind: "ok",
        text: `${result.referral.name} saved. Count is now ${result.referral.value}.`,
      });
    } catch (e) {
      setNotice({
        kind: "err",
        text: e instanceof Error ? e.message : "Could not record referral",
      });
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
                  setNotice(null);
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
      {notice ? (
        <p className={`home-referrer__status home-referrer__status--${notice.kind}`} role="status">
          {notice.text}
        </p>
      ) : null}
    </aside>
  );
}
