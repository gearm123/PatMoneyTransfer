import { useState } from "react";
import { recordReferral } from "../transfer/api";

const INITIAL_REFERRAL_OPTIONS = ["Gearm"] as const;

export function ReferrerWidget() {
  const [referralName, setReferralName] = useState<string>(INITIAL_REFERRAL_OPTIONS[0] ?? "Gearm");
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
      <label className="home-referrer__field" htmlFor="home-referrer-select">
        <span className="home-referrer__label">Referrer</span>
        <select
          id="home-referrer-select"
          value={referralName}
          onChange={(e) => {
            setReferralName(e.target.value);
            setNotice(null);
          }}
        >
          {INITIAL_REFERRAL_OPTIONS.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </label>
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
