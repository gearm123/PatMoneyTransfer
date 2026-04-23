import { Elements } from "@stripe/react-stripe-js";
import { loadStripe, type StripeElementsOptions } from "@stripe/stripe-js";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  completeTransfer,
  createTransfer,
  getQuote,
  getTransferConfig,
  validateThaiBankAccountInput,
  type Transfer,
} from "./api";
import { readTransferConfigCache, writeTransferConfigCache } from "./configCache";
import { CheckoutForm } from "./CheckoutForm";

/** Fallback if API not loaded yet — must match server `sourceCountries` (Thunes `country_iso_code` alpha-3). */
const FALLBACK_SOURCE_COUNTRIES = [
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

function thunesPayoutSummary(t: Transfer): { kind: "ok" | "err" | "pending" | "unknown"; line: string; sub?: string } {
  const s = t.status;
  if (s === "payout_error") {
    return {
      kind: "err",
      line: "The bank transfer step did not complete.",
      sub: t.lastError,
    };
  }
  if (s === "payout_completed" || s === "payout_queued_simulation") {
    return {
      kind: "ok",
      line: "Payout to the Thai account was submitted via Thunes.",
      sub:
        t.thunesTransactionId != null
          ? `Thunes transaction id: ${t.thunesTransactionId}`
          : t.thunesQuotationId != null
            ? `Thunes quotation id: ${t.thunesQuotationId}`
            : undefined,
    };
  }
  if (s === "payout_processing") {
    return { kind: "pending", line: "Bank transfer is being processed…" };
  }
  return { kind: "unknown", line: "Transfer status: " + s };
}

function initialConfigState(): {
  ok: boolean | null;
  banks: { code: string; name: string }[];
  sourceCountries: { code: string; label: string }[];
} {
  const cached = readTransferConfigCache();
  if (cached) {
    const ready = "checkoutReady" in cached && typeof cached.checkoutReady === "boolean" ? cached.checkoutReady : cached.stripe;
    return {
      ok: ready,
      banks: cached.thaiBanks?.length ? cached.thaiBanks : [],
      sourceCountries:
        cached.sourceCountries && cached.sourceCountries.length > 0 ? cached.sourceCountries : FALLBACK_SOURCE_COUNTRIES,
    };
  }
  // Publishable key present ⇒ assume checkout is available while API cold-starts (Render, etc.)
  if (defaultPk) {
    return { ok: true, banks: [], sourceCountries: FALLBACK_SOURCE_COUNTRIES };
  }
  return { ok: null, banks: [], sourceCountries: FALLBACK_SOURCE_COUNTRIES };
}

type Step = 1 | 2 | 3 | 4 | 5;

function StepTracker({ current }: { current: 1 | 2 | 3 | 4 }) {
  return (
    <nav className="step-tracker" aria-label="Transfer steps">
      <ol className="step-tracker__list">
        {STEP_LABELS.map((label, i) => {
          const n = (i + 1) as 1 | 2 | 3 | 4;
          const isActive = n === current;
          const isDone = n < current;
          const bridgeComplete = i > 0 && current > i;
          return (
            <li key={label} className="step-tracker__segment" aria-current={isActive ? "step" : undefined}>
              {i > 0 ? (
                <div
                  className={`step-tracker__bridge ${bridgeComplete ? "is-done" : ""}`}
                  aria-hidden
                />
              ) : null}
              <div
                className={`step-pill ${isActive ? "is-active" : ""} ${isDone ? "is-done" : ""} ${!isActive && !isDone ? "is-todo" : ""}`}
                title={label}
              >
                <span className="step-pill__num">{isDone ? "✓" : n}</span>
                <span className="step-pill__label">{label}</span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

type TransferAppProps = {
  /** Tighter copy and header; used on the main marketing shell */
  layout?: "default" | "hub";
};

export function TransferApp({ layout = "default" }: TransferAppProps) {
  const isHub = layout === "hub";
  const [configOk, setConfigOk] = useState<boolean | null>(() => initialConfigState().ok);
  const [bankList, setBankList] = useState<{ code: string; name: string }[]>(() => initialConfigState().banks);
  const [sourceCountries, setSourceCountries] = useState<{ code: string; label: string }[]>(
    () => initialConfigState().sourceCountries
  );
  const [step, setStep] = useState<Step>(1);
  const [fromCountry, setFromCountry] = useState("USA");
  const [toCountry, setToCountry] = useState("THA");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [amountStr, setAmountStr] = useState("100");
  const [localEst, setLocalEst] = useState<number | null>(null);
  const [feePreview, setFeePreview] = useState<{ platformFee: number; totalCharged: number } | null>(null);
  const [recipientName, setRecipientName] = useState("");
  const [localBank, setLocalBank] = useState("BBL");
  const [localAccount, setLocalAccount] = useState("");
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [activePk, setActivePk] = useState<string>(defaultPk);
  const [doneTransfer, setDoneTransfer] = useState<Transfer | null>(null);
  const [payMode, setPayMode] = useState<"stripe" | "thunes" | null>(null);
  const [thunesPaymentUrl, setThunesPaymentUrl] = useState<string | null>(null);
  const [thunesCompleting, setThunesCompleting] = useState(false);
  const [err, setErr] = useState("");
  const [step2Validating, setStep2Validating] = useState(false);

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
    let cancelled = false;
    const run = async () => {
      const maxTries = 4;
      for (let t = 0; t < maxTries; t++) {
        if (t > 0) {
          await new Promise((r) => setTimeout(r, 500 * t));
        }
        if (cancelled) return;
        try {
          const c = await getTransferConfig();
          if (cancelled) return;
          setConfigOk(c.checkoutReady ?? c.stripe);
          if (c.thaiBanks?.length) setBankList(c.thaiBanks);
          if (c.sourceCountries?.length) setSourceCountries(c.sourceCountries);
          writeTransferConfigCache(c);
          return;
        } catch {
          /* retry — helps with cold start (e.g. Render) */
        }
      }
      if (cancelled) return;
      setConfigOk((prev) => (defaultPk ? prev : false));
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  /** Thunes redirect return (live Accept): complete payout after the payer returns from the hosted pay page. */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const p = new URLSearchParams(window.location.search);
    if (p.get("transferReturn") !== "1") return;
    const id = p.get("transferId");
    if (!id) return;
    setThunesCompleting(true);
    setErr("");
    void completeTransfer({ transferId: id })
      .then((c) => {
        setDoneTransfer(c.transfer);
        setStep(5);
      })
      .catch((e) => {
        setErr(e instanceof Error ? e.message : "Could not complete transfer");
      })
      .finally(() => {
        setThunesCompleting(false);
        const path = window.location.pathname + window.location.hash;
        window.history.replaceState({}, "", path);
      });
  }, []);

  const refreshQuote = useCallback(() => {
    const n = Number.parseFloat(amountStr);
    if (Number.isNaN(n) || n <= 0) {
      setLocalEst(null);
      setFeePreview(null);
      return;
    }
    void getQuote(n, fromCurrency).then(
      (q) => {
        setLocalEst(q.thbReceive);
        const pf = q.platformFee ?? 0;
        const tot = q.totalCharged ?? n;
        setFeePreview({ platformFee: pf, totalCharged: tot });
      },
      () => {
        setLocalEst(null);
        setFeePreview(null);
      }
    );
  }, [amountStr, fromCurrency]);

  useEffect(() => {
    const t = setTimeout(refreshQuote, 300);
    return () => clearTimeout(t);
  }, [refreshQuote]);

  const accountDigits = localAccount.replace(/\D/g, "");

  const can1 = () => {
    const n = Number.parseFloat(amountStr);
    return n >= 1 && n <= 15000;
  };
  const can2 = () =>
    recipientName.trim().length >= 2 &&
    accountDigits.length >= 6 &&
    accountDigits.length <= 16;
  const can3 = () => senderName.trim().length > 1 && senderEmail.includes("@");

  const goStep2Next = async () => {
    if (!can2()) return;
    setErr("");
    setStep2Validating(true);
    try {
      const r = await validateThaiBankAccountInput({
        thaiBankCode: localBank,
        thaiAccountNumber: localAccount.trim(),
      });
      if (!r.ok) {
        setErr(r.error);
        return;
      }
      setStep(3);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not validate account");
    } finally {
      setStep2Validating(false);
    }
  };

  const goPreparePayment = async () => {
    setErr("");
    const n = Number.parseFloat(amountStr);
    try {
      const r = await createTransfer({
        fromCountry,
        fromCurrency,
        amount: n,
        senderName: senderName.trim(),
        senderEmail: senderEmail.trim(),
        recipientName: recipientName.trim(),
        thaiBankCode: localBank,
        thaiAccountNumber: localAccount.trim(),
      });
      setPayMode(r.paymentProvider);
      setDoneTransfer(r.transfer);
      if (r.paymentProvider === "thunes") {
        setClientSecret(null);
        setThunesPaymentUrl(r.paymentUrl);
        if (!r.paymentUrl) {
          setThunesCompleting(true);
          try {
            const c = await completeTransfer({ transferId: r.transfer.id });
            setDoneTransfer(c.transfer);
            setStep(5);
          } catch (e) {
            setErr(e instanceof Error ? e.message : "Could not complete Thunes payment and payout");
          } finally {
            setThunesCompleting(false);
          }
          return;
        }
        setStep(4);
        return;
      }
      setActivePk(r.publishableKey || defaultPk);
      setClientSecret(r.clientSecret);
      setThunesPaymentUrl(null);
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
          variables: {
            colorPrimary: "#c45c26",
            colorBackground: "#14161f",
            colorText: "#f4f1ea",
            colorDanger: "#f87171",
            borderRadius: "12px",
            fontFamily: "Plus Jakarta Sans, system-ui, sans-serif",
            spacingUnit: "3px",
          },
        },
      }
    : undefined;

  if (configOk === false) {
    return (
      <div className="tf-offline" role="status">
        <div className="tf-offline__icon" aria-hidden>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>
        <h2 className="tf-offline__title">Checkout not connected</h2>
        <p className="tf-offline__text">
          Configure <strong>Thunes</strong> (Accept + Money Transfer) or <strong>Stripe</strong> on the API—see <code className="mono">PAYMENT_PROVIDER</code> in server env.
        </p>
        <p className="tf-offline__steps" aria-label="Steps">
          1 Amount · 2 Thai account · 3 You · 4 Card
        </p>
        <details className="tf-offline__dev">
          <summary>Developer</summary>
          <p>
            Thunes: <code className="mono">PAYMENT_PROVIDER=thunes</code>, <code className="mono">THUNES_USE_MOCK=true</code> (dev), or live keys + <code className="mono">THUNES_ACCEPT_MERCHANT_ID</code> and{" "}
            <code className="mono">THUNES_ACCEPT_PAYMENT_PAGE_ID</code>. Stripe: <code className="mono">PAYMENT_PROVIDER=stripe</code>, <code className="mono">STRIPE_SECRET_KEY</code> and <code className="mono">VITE_STRIPE_PUBLISHABLE_KEY</code> for
            embedded pay.
          </p>
        </details>
      </div>
    );
  }

  if (configOk === null) {
    return <div className="tf-loading">{isHub ? "Preparing…" : "Loading…"}</div>;
  }

  if (thunesCompleting) {
    return <div className="tf-loading">{isHub ? "Processing payment & payout…" : "Finishing your send…"}</div>;
  }

  if (step === 5 && doneTransfer) {
    return (
      <div className="tf-success">
        <div className="tf-success__party" aria-hidden>
          <span className="tf-success__confetti" />
        </div>
        <h2 className="tf-success__welcome">Welcome buffalo</h2>
        <p className="tf-success__paidline">Payment received</p>
        {(() => {
          const ps = thunesPayoutSummary(doneTransfer);
          if (ps.kind === "err") {
            return (
              <div className="tf-success__payout tf-success__payout--err" role="status">
                <p className="tf-success__payout-line">{ps.line}</p>
                {ps.sub ? <p className="tf-success__payout-sub mono">{ps.sub}</p> : null}
                <p className="tf-success__fine">Your card charge may still have succeeded. Keep this reference and contact support with your transfer id.</p>
              </div>
            );
          }
          return (
            <div
              className={
                ps.kind === "pending" ? "tf-success__payout tf-success__payout--pending" : "tf-success__payout tf-success__payout--ok"
              }
              role="status"
            >
              <p className="tf-success__payout-line">{ps.line}</p>
              {ps.sub ? <p className="tf-success__payout-sub mono">{ps.sub}</p> : null}
              {ps.kind === "ok" ? (
                <p className="tf-success__fine">Settlement to your Thunes float and bank cut-off times are separate from this confirmation.</p>
              ) : null}
            </div>
          );
        })()}
        <h3 className="tf-success__h3">Details</h3>
        <p className="tf-success__body">
          <span className="mono">{doneTransfer.id}</span>
          {typeof doneTransfer.totalCharged === "number" ? (
            <>
              {" "}
              · charged{" "}
              <span className="mono">
                {doneTransfer.totalCharged.toFixed(2)} {doneTransfer.fromCurrency}
              </span>
            </>
          ) : (
            <>
              {" "}
              · sent{" "}
              <span className="mono">
                {doneTransfer.amountSend} {doneTransfer.fromCurrency}
              </span>
            </>
          )}
          {typeof doneTransfer.platformFee === "number" && doneTransfer.platformFee > 0 ? (
            <span>
              {" "}
              (incl. service fee <span className="mono">{doneTransfer.platformFee.toFixed(2)}</span>)
            </span>
          ) : null}
          {localCcy ? (
            <>
              {" "}
              · ≈ <span className="mono">{doneTransfer.thbReceiveEstimate}</span> {localCcy} est.
            </>
          ) : null}
        </p>
        <button
          type="button"
          className="tf-success__btn"
          onClick={() => {
            setStep(1);
            setClientSecret(null);
            setPayMode(null);
            setThunesPaymentUrl(null);
            setDoneTransfer(null);
          }}
        >
          New send
        </button>
      </div>
    );
  }

  return (
    <div className={isHub ? "tf" : "tf tf--full"}>
      <div className="send-flow send-flow--no-scroll">
        {isHub ? (
          <div className="send-flow-top send-flow-top--hub">
            {step >= 1 && step <= 4 && <StepTracker current={step as 1 | 2 | 3 | 4} />}
          </div>
        ) : (
          <div className="send-flow-top">
            <p className="send-flow-eyebrow" translate="no">
              BuffaloMoneySend
            </p>
            <h2 className="send-flow-title">Start your send</h2>
            <p className="send-flow-motto">The community grows one send at a time. Yours is next.</p>
            {step >= 1 && step <= 4 && <StepTracker current={step as 1 | 2 | 3 | 4} />}
          </div>
        )}
        <div className="send-flow-body">
          {err && (
            <div className="error-banner error-banner--flow" role="alert">
              {err}
            </div>
          )}

          {step === 1 && (
            <div className="flow-step" key="step-1">
              <div className="flow-step-lead">
                <h3 className="flow-step-title">{isHub ? "Route & amount" : "How much and where"}</h3>
                <p className="flow-step-desc">
                  {isHub
                    ? "Your country, amount, and currency. Estimate in THB below."
                    : "You send from your country, your recipient is paid in "}
                  {!isHub && (
                    <>
                      <strong>Thailand (THB)</strong>. Enter the
                      amount to see a THB estimate before the next step.
                    </>
                  )}
                </p>
                {!isHub && <p className="flow-step-note">Thailand is the first corridor in this app—more can follow later.</p>}
              </div>
              <div className="flow-step-main">
                <div className="flow-fields" aria-label="Send amount and route">
                  <div className="field field--tight">
                    <label htmlFor="fc">You send from</label>
                    <select id="fc" value={fromCountry} onChange={(e) => setFromCountry(e.target.value)}>
                      {sourceCountries.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.label} ({c.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field field--tight">
                    <label htmlFor="dest">They receive in</label>
                    <select id="dest" value={toCountry} onChange={(e) => setToCountry(e.target.value)}>
                      {DESTINATIONS.map((d) => (
                        <option key={d.code} value={d.code}>
                          {d.label} ({d.sub})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field-row field-row--tight">
                    <div className="field field--tight">
                      <label htmlFor="am">Amount</label>
                      <input
                        id="am"
                        inputMode="decimal"
                        value={amountStr}
                        onChange={(e) => setAmountStr(e.target.value)}
                      />
                    </div>
                    <div className="field field--tight">
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
                </div>
                <div className="rate-strip rate-strip--tight" aria-label="Send amount and fees">
                  {localEst != null && feePreview != null ? (
                    <div className="rate-strip__stack">
                      {feePreview.platformFee > 0 ? (
                        <>
                          <div className="rate-strip__row">
                            <span className="rate-strip__k">Service fee</span>
                            <span className="mono">
                              {feePreview.platformFee.toFixed(2)} {fromCurrency}
                            </span>
                          </div>
                          <div className="rate-strip__row rate-strip__row--strong">
                            <span className="rate-strip__k">Card will charge</span>
                            <span className="mono">
                              {feePreview.totalCharged.toFixed(2)} {fromCurrency}
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="rate-strip__row rate-strip__row--strong">
                          <span className="rate-strip__k">You pay (card)</span>
                          <span className="mono">
                            {feePreview.totalCharged.toFixed(2)} {fromCurrency}
                          </span>
                        </div>
                      )}
                      <div className="rate-strip__row">
                        <span className="rate-strip__k">Recipient ≈</span>
                        <strong className="mono">
                          {localEst.toFixed(2)} {localCcy}
                        </strong>
                      </div>
                      {!isHub && (
                        <p className="rate-strip__foot">Indicative rate for {destLabel}. Payout in production uses live pricing.</p>
                      )}
                    </div>
                  ) : (
                    <span className="rate-strip__empty">Enter an amount to see an estimate in local currency.</span>
                  )}
                </div>
              </div>
              <div className="flow-actions flow-step-actions">
                <button type="button" className="btn btn-primary" onClick={() => can1() && setStep(2)} disabled={!can1()}>
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flow-step" key="step-2">
              <div className="flow-step-lead">
                <h3 className="flow-step-title">Recipient &amp; account</h3>
                <p className="flow-step-desc">
                  {isHub ? (
                    <>
                      <strong className="flow-step-desc-strong">Thailand</strong> account — as on the bank book.
                    </>
                  ) : (
                    <>
                      <strong className="flow-step-desc-strong">{destLabel}</strong> account details only—type them
                      exactly as on the bank book or app.
                    </>
                  )}
                </p>
              </div>
              <div className="flow-step-main">
                <div className="flow-fields" aria-label="Recipient bank details">
                  <div className="field field--tight">
                    <label htmlFor="rn">Account holder</label>
                    <input id="rn" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} />
                  </div>
                  <div className="field field--tight">
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
                  <div className="field field--tight">
                    <label htmlFor="acc">Account number</label>
                    <input
                      id="acc"
                      inputMode="numeric"
                      value={localAccount}
                      onChange={(e) => setLocalAccount(e.target.value)}
                      autoComplete="off"
                      placeholder="Digits only as on the passbook (length depends on bank)"
                    />
                  </div>
                </div>
                {!can2() && (
                  <p className="form-hint form-hint--step2 form-hint--compact" role="status">
                    {recipientName.trim().length < 2 && <span>Account holder: full name, at least 2 letters. </span>}
                    {recipientName.trim().length >= 2 && accountDigits.length < 6 && (
                      <span>
                        Digits: need <strong>6</strong>+ — <strong className="mono">{accountDigits.length}</strong> so far
                        {accountDigits.length > 0 ? " (non-digits ignored)." : ". Try 1234567890 for tests."}
                      </span>
                    )}
                    {recipientName.trim().length >= 2 && accountDigits.length > 16 && <span>At most 16 digits.</span>}
                  </p>
                )}
                {!isHub && (
                  <p className="flow-step-foot">Wrong details can delay or fail the transfer—double-check before you continue.</p>
                )}
              </div>
              <div className="flow-actions flow-step-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setStep(1)}>
                  Back
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => void goStep2Next()}
                  disabled={!can2() || step2Validating}
                >
                  {step2Validating ? "Checking…" : "Continue"}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flow-step" key="step-3">
              <div className="flow-step-lead">
                <h3 className="flow-step-title">Your details</h3>
                <p className="flow-step-desc">
                  {isHub ? "Receipt and important updates only." : "We use this for your receipt and any important send updates—nothing spammy."}
                </p>
              </div>
              <div className="flow-step-main">
                <div className="flow-fields" aria-label="Your contact details">
                  <div className="field field--tight">
                    <label htmlFor="sn">Full name</label>
                    <input id="sn" value={senderName} onChange={(e) => setSenderName(e.target.value)} autoComplete="name" />
                  </div>
                  <div className="field field--tight">
                    <label htmlFor="se">Email</label>
                    <input
                      id="se"
                      type="email"
                      value={senderEmail}
                      onChange={(e) => setSenderEmail(e.target.value)}
                      autoComplete="email"
                    />
                  </div>
                </div>
              </div>
              <div className="flow-actions flow-step-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setStep(2)}>
                  Back
                </button>
                <button type="button" className="btn btn-primary" onClick={() => void goPreparePayment()} disabled={!can3()}>
                  Continue to pay
                </button>
              </div>
            </div>
          )}

          {step === 4 && payMode === "thunes" && thunesPaymentUrl && doneTransfer && (
            <div className="flow-step flow-step--pay" key="step-4-thunes">
              <div className="flow-step-lead flow-step-lead--pay">
                <span className="flow-step-kicker">Thunes</span>
                <h3 className="flow-step-title">Complete your card payment</h3>
                <p className="pay-total" aria-label="Total to charge">
                  <span className="pay-total__label">Total to charge</span>{" "}
                  <span className="mono pay-total__value">
                    {typeof doneTransfer.totalCharged === "number"
                      ? doneTransfer.totalCharged.toFixed(2)
                      : doneTransfer.amountSend}{" "}
                    {doneTransfer.fromCurrency}
                  </span>
                  {typeof doneTransfer.platformFee === "number" && doneTransfer.platformFee > 0 ? (
                    <span className="pay-total__sub"> (incl. {doneTransfer.platformFee.toFixed(2)} service fee)</span>
                  ) : null}
                </p>
                <p className="flow-step-desc">You are redirected to a secure Thunes page to pay. You will return here to confirm your send to Thailand.</p>
              </div>
              <div className="flow-step-main">
                <a className="btn btn-primary" href={thunesPaymentUrl} rel="noreferrer" target="_self">
                  Open secure payment
                </a>
              </div>
              <div className="flow-actions flow-step-actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setStep(3);
                    setThunesPaymentUrl(null);
                    setPayMode(null);
                    setClientSecret(null);
                  }}
                >
                  Back
                </button>
              </div>
            </div>
          )}

          {step === 4 && payMode === "stripe" && clientSecret && options && stripePromise && doneTransfer && (
            <div className="flow-step flow-step--pay" key="step-4">
              <div className="flow-step-lead flow-step-lead--pay">
                <span className="flow-step-kicker">Secure checkout</span>
                <h3 className="flow-step-title">Pay with your card</h3>
                <p className="pay-total" aria-label="Total to charge">
                  <span className="pay-total__label">Total to charge</span>{" "}
                  <span className="mono pay-total__value">
                    {typeof doneTransfer.totalCharged === "number"
                      ? doneTransfer.totalCharged.toFixed(2)
                      : doneTransfer.amountSend}{" "}
                    {doneTransfer.fromCurrency}
                  </span>
                  {typeof doneTransfer.platformFee === "number" && doneTransfer.platformFee > 0 ? (
                    <span className="pay-total__sub">
                      {" "}
                      (incl. {doneTransfer.platformFee.toFixed(2)} service fee)
                    </span>
                  ) : null}
                </p>
                <p className="flow-step-desc">
                  {isHub ? (
                    <>
                      Stripe. Test: <span className="mono pay-hilite">4242 4242 4242 4242</span> · future exp · any CVC
                    </>
                  ) : (
                    <>
                      Your details are processed by Stripe. For testing, use card{" "}
                      <span className="mono pay-hilite">4242 4242 4242 4242</span>, a future
                      date, and any CVC.
                    </>
                  )}
                </p>
              </div>
              <div className="flow-step-main flow-step-main--pay">
                <div className="flow-pay-stripe">
                  <Elements key={clientSecret} stripe={stripePromise} options={options}>
                    <CheckoutForm onError={(m) => setErr(m)} onDone={onPaid} />
                  </Elements>
                </div>
              </div>
              <div className="flow-actions flow-step-actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setStep(3);
                    setClientSecret(null);
                    setPayMode(null);
                  }}
                >
                  Back
                </button>
              </div>
            </div>
          )}

          {step === 4 && payMode === "stripe" && clientSecret && !stripePromise && (
            <p className="error-banner error-banner--flow">Set <span className="mono">VITE_STRIPE_PUBLISHABLE_KEY</span> in your <span className="mono">.env</span> file.</p>
          )}
        </div>
      </div>
    </div>
  );
}
