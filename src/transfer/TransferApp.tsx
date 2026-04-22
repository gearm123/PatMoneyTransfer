import { Elements } from "@stripe/react-stripe-js";
import { loadStripe, type StripeElementsOptions } from "@stripe/stripe-js";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createTransfer, getQuote, getTransferConfig, type Transfer } from "./api";
import { CheckoutForm } from "./CheckoutForm";

const FROM = [
  { code: "USA", label: "United States" },
  { code: "GBR", label: "United Kingdom" },
  { code: "DEU", label: "Germany" },
  { code: "FRA", label: "France" },
  { code: "AUS", label: "Australia" },
  { code: "CAN", label: "Canada" },
];

const CCY = ["USD", "EUR", "GBP"] as const;
const DESTINATIONS = [{ code: "THA", label: "Thailand", sub: "THB" }] as const;

const STEP_LABELS = ["Amount", "Recipient", "Your details", "Pay"] as const;

const defaultPk = (import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined) || "";

type Step = 1 | 2 | 3 | 4 | 5;

function StepTracker({ current }: { current: 1 | 2 | 3 | 4 }) {
  return (
    <div className="step-tracker" aria-hidden>
      {STEP_LABELS.map((label, i) => {
        const n = (i + 1) as 1 | 2 | 3 | 4;
        const isActive = n === current;
        const isDone = n < current;
        return (
          <div key={label} className={`step-pill ${isActive ? "is-active" : ""} ${isDone ? "is-done" : ""}`}>
            {isDone ? "✓" : i + 1} {label}
          </div>
        );
      })}
    </div>
  );
}

export function TransferApp() {
  const [configOk, setConfigOk] = useState<boolean | null>(null);
  const [bankList, setBankList] = useState<{ code: string; name: string }[]>([]);
  const [step, setStep] = useState<Step>(1);
  const [fromCountry, setFromCountry] = useState("USA");
  const [toCountry, setToCountry] = useState("THA");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [amountStr, setAmountStr] = useState("100");
  const [localEst, setLocalEst] = useState<number | null>(null);
  const [recipientName, setRecipientName] = useState("");
  const [localBank, setLocalBank] = useState("BBL");
  const [localAccount, setLocalAccount] = useState("");
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [activePk, setActivePk] = useState<string>(defaultPk);
  const [doneTransfer, setDoneTransfer] = useState<Transfer | null>(null);
  const [err, setErr] = useState("");

  const destLabel = useMemo(
    () => DESTINATIONS.find((d) => d.code === toCountry)?.label ?? "Destination",
    [toCountry]
  );
  const localCcy = useMemo(
    () => DESTINATIONS.find((d) => d.code === toCountry)?.sub ?? "THB",
    [toCountry]
  );

  const stripePromise = useMemo(() => {
    if (!activePk) return null;
    return loadStripe(activePk);
  }, [activePk]);

  useEffect(() => {
    getTransferConfig()
      .then((c) => {
        setConfigOk(c.stripe);
        if (c.thaiBanks?.length) setBankList(c.thaiBanks);
      })
      .catch(() => setConfigOk(false));
  }, []);

  const refreshQuote = useCallback(() => {
    const n = Number.parseFloat(amountStr);
    if (Number.isNaN(n) || n <= 0) {
      setLocalEst(null);
      return;
    }
    void getQuote(n, fromCurrency).then(
      (q) => setLocalEst(q.thbReceive),
      () => setLocalEst(null)
    );
  }, [amountStr, fromCurrency]);

  useEffect(() => {
    const t = setTimeout(refreshQuote, 300);
    return () => clearTimeout(t);
  }, [refreshQuote]);

  const can1 = () => {
    const n = Number.parseFloat(amountStr);
    return n >= 1 && n <= 15000;
  };
  const can2 = () =>
    recipientName.trim().length > 1 &&
    localAccount.replace(/\D/g, "").length >= 8 &&
    localAccount.replace(/\D/g, "").length <= 20;
  const can3 = () => senderName.trim().length > 1 && senderEmail.includes("@");

  const goPreparePayment = async () => {
    setErr("");
    const n = Number.parseFloat(amountStr);
    try {
      const { clientSecret: cs, publishableKey, transfer } = await createTransfer({
        fromCountry,
        fromCurrency,
        amount: n,
        senderName: senderName.trim(),
        senderEmail: senderEmail.trim(),
        recipientName: recipientName.trim(),
        thaiBankCode: localBank,
        thaiAccountNumber: localAccount.trim(),
      });
      setActivePk(publishableKey || defaultPk);
      setClientSecret(cs);
      setDoneTransfer(transfer);
      setStep(4);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not start payment");
    }
  };

  const onPaid = (t: Transfer) => {
    setDoneTransfer(t);
    setStep(5);
  };

  const options: StripeElementsOptions | undefined = clientSecret
    ? {
        clientSecret,
        appearance: {
          theme: "night",
          variables: { colorPrimary: "#6366f1", colorBackground: "#0f172a", borderRadius: "12px" },
        },
      }
    : undefined;

  if (configOk === false) {
    return (
      <div className="card-panel config-empty">
        <h2>Connect payments</h2>
        <p className="hero-sub" style={{ maxWidth: "32rem", margin: "0.5rem auto 0" }}>
          Add <code className="mono">STRIPE_SECRET_KEY</code> in <code className="mono">server/.env</code>{" "}
          and <code className="mono">VITE_STRIPE_PUBLISHABLE_KEY</code> in the project <code className="mono">.env</code> (from the Stripe
          dashboard, e.g. pk_test_...).
        </p>
        <p className="disclaimer" style={{ marginTop: "1rem" }}>
          Run the API on port 4000; Vite proxies <code className="mono">/api</code>.
        </p>
      </div>
    );
  }

  if (configOk === null) {
    return (
      <div className="card-panel" style={{ padding: "2.5rem", textAlign: "center" }}>
        <p style={{ margin: 0, color: "var(--muted)" }}>Preparing your transfer…</p>
      </div>
    );
  }

  if (step === 5 && doneTransfer) {
    return (
      <div className="card-panel success-panel">
        <div className="success-icon" aria-hidden>
          ✓
        </div>
        <h2>Transfer received</h2>
        <p>
          Reference <span className="mono">{doneTransfer.id}</span> — you sent{" "}
          <span className="mono">
            {doneTransfer.amountSend} {doneTransfer.fromCurrency}
          </span>
          {localCcy && (
            <>
              . Estimated for your recipient:{" "}
              <span className="mono">
                {doneTransfer.thbReceiveEstimate} {localCcy}
              </span>{" "}
              (indicative).
            </>
          )}
        </p>
        <p className="disclaimer" style={{ maxWidth: "36rem" }}>
          Payout to the local bank is simulated in this demo. For production, connect a regulated payout
          rail (e.g. Global Payouts, network partner).
        </p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setStep(1);
            setClientSecret(null);
            setDoneTransfer(null);
          }}
        >
          New transfer
        </button>
      </div>
    );
  }

  return (
    <div className="card-panel" style={{ overflow: "hidden" }}>
      <div className="send-flow">
        <div className="send-flow-top">
          <p className="send-flow-eyebrow">Transfer</p>
          <h2 className="send-flow-title">Start your send</h2>
          {step >= 1 && step <= 4 && <StepTracker current={step as 1 | 2 | 3 | 4} />}
        </div>
        {err && (
          <div className="error-banner" role="alert">
            {err}
          </div>
        )}

        {step === 1 && (
          <div className="flow-step">
            <h3>How much and where</h3>
            <div className="field">
              <label htmlFor="fc">You send from</label>
              <select id="fc" value={fromCountry} onChange={(e) => setFromCountry(e.target.value)}>
                {FROM.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="dest">They receive in</label>
              <select id="dest" value={toCountry} onChange={(e) => setToCountry(e.target.value)}>
                {DESTINATIONS.map((d) => (
                  <option key={d.code} value={d.code}>
                    {d.label} ({d.sub})
                  </option>
                ))}
              </select>
            </div>
            <p className="disclaimer" style={{ margin: "0 0 0.5rem" }}>
              Additional corridors can be enabled in the product as you expand.
            </p>
            <div className="field-row">
              <div className="field">
                <label htmlFor="am">Amount</label>
                <input
                  id="am"
                  inputMode="decimal"
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="ccy">Your currency</label>
                <select id="ccy" value={fromCurrency} onChange={(e) => setFromCurrency(e.target.value)}>
                  {CCY.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="rate-strip">
              {localEst != null ? (
                <span>
                  ≈ <strong className="mono">{localEst.toFixed(2)} {localCcy}</strong> to your recipient
                  <br />
                  <span className="disclaimer" style={{ margin: "0.35rem 0 0", display: "inline-block" }}>
                    Indicative rate for {destLabel}; final settlement set by your payout provider.
                  </span>
                </span>
              ) : (
                <span style={{ color: "var(--muted)" }}>Enter an amount to see an estimate in local currency.</span>
              )}
            </div>
            <button type="button" className="btn btn-primary" onClick={() => can1() && setStep(2)} disabled={!can1()}>
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="flow-step">
            <h3>Recipient &amp; account</h3>
            <p className="disclaimer" style={{ margin: "0 0 0.9rem" }}>
              Account details for {destLabel}. Enter exactly as on the bank record.
            </p>
            <div className="field">
              <label htmlFor="rn">Account holder</label>
              <input id="rn" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="bk">Bank</label>
              <select id="bk" value={localBank} onChange={(e) => setLocalBank(e.target.value)}>
                {(bankList.length
                  ? bankList
                  : [
                      { code: "BBL", name: "Bangkok Bank" },
                      { code: "KBANK", name: "Kasikorn Bank" },
                    ]
                ).map((b) => (
                  <option key={b.code} value={b.code}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="acc">Account number</label>
              <input
                id="acc"
                inputMode="numeric"
                value={localAccount}
                onChange={(e) => setLocalAccount(e.target.value)}
                placeholder="Local account / IBAN format as required"
              />
            </div>
            <p className="disclaimer">Incorrect account details can delay or fail transfers; always double-check.</p>
            <div className="flow-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setStep(1)}>
                Back
              </button>
              <button type="button" className="btn btn-primary" onClick={() => can2() && setStep(3)} disabled={!can2()}>
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flow-step">
            <h3>Your details</h3>
            <p className="disclaimer" style={{ margin: "0 0 0.9rem" }}>
              For your receipt and account notices.
            </p>
            <div className="field">
              <label htmlFor="sn">Full name</label>
              <input id="sn" value={senderName} onChange={(e) => setSenderName(e.target.value)} autoComplete="name" />
            </div>
            <div className="field">
              <label htmlFor="se">Email</label>
              <input
                id="se"
                type="email"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div className="flow-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setStep(2)}>
                Back
              </button>
              <button type="button" className="btn btn-primary" onClick={() => void goPreparePayment()} disabled={!can3()}>
                Continue to pay
              </button>
            </div>
          </div>
        )}

        {step === 4 && clientSecret && options && stripePromise && (
          <div className="flow-step">
            <h3>Secure card payment</h3>
            <p className="disclaimer" style={{ margin: "0 0 0.75rem" }}>
              Test: <span className="mono">4242 4242 4242 4242</span>, any future date, any CVC.
            </p>
            <Elements key={clientSecret} stripe={stripePromise} options={options}>
              <CheckoutForm onError={(m) => setErr(m)} onDone={onPaid} />
            </Elements>
            <div className="flow-actions" style={{ marginTop: "0.5rem" }}>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setStep(3);
                  setClientSecret(null);
                }}
              >
                Back
              </button>
            </div>
          </div>
        )}

        {step === 4 && clientSecret && !stripePromise && (
          <p className="error-banner">Set <span className="mono">VITE_STRIPE_PUBLISHABLE_KEY</span> in your <span className="mono">.env</span> file.</p>
        )}
      </div>
    </div>
  );
}
