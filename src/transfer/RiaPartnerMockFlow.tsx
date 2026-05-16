import { useEffect, useMemo, useState } from "react";
import {
  completePartnerTransfer,
  createPartnerTransfer,
  getPartnerTransferConfig,
  getQuote,
  validateThaiBankAccountInput,
  type Transfer,
} from "./api";

const FALLBACK_SOURCE_COUNTRIES = [
  { code: "USA", label: "United States" },
  { code: "GBR", label: "United Kingdom" },
  { code: "DEU", label: "Germany" },
  { code: "FRA", label: "France" },
  { code: "AUS", label: "Australia" },
  { code: "CAN", label: "Canada" },
] as const;

const FALLBACK_THAI_BANKS = [
  { code: "BBL", name: "Bangkok Bank" },
  { code: "KBANK", name: "Kasikornbank" },
  { code: "SCB", name: "Siam Commercial Bank" },
  { code: "KTB", name: "Krung Thai Bank" },
] as const;

const FROM_CURRENCIES = ["USD", "EUR", "GBP"] as const;
const STEP_LABELS = ["Amount", "Recipient", "Billing", "Pay"] as const;

type Step = 1 | 2 | 3 | 4 | 5;

type RiaPartnerMockFlowProps = {
  layout?: "default" | "hub";
};

function StepTracker({ current }: { current: 1 | 2 | 3 | 4 }) {
  return (
    <nav className="step-tracker" aria-label="Transfer steps">
      <ol className="step-tracker__list">
        {STEP_LABELS.map((label, index) => {
          const stepNumber = (index + 1) as 1 | 2 | 3 | 4;
          const isActive = stepNumber === current;
          const isDone = stepNumber < current;
          const bridgeComplete = index > 0 && current > index;
          return (
            <li key={label} className="step-tracker__segment" aria-current={isActive ? "step" : undefined}>
              {index > 0 ? (
                <div className={`step-tracker__bridge ${bridgeComplete ? "is-done" : ""}`} aria-hidden />
              ) : null}
              <div
                className={`step-pill ${isActive ? "is-active" : ""} ${isDone ? "is-done" : ""} ${
                  !isActive && !isDone ? "is-todo" : ""
                }`}
                title={label}
              >
                <span className="step-pill__num">{isDone ? "✓" : stepNumber}</span>
                <span className="step-pill__label">{label}</span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function RiaPartnerMockFlow({ layout = "default" }: RiaPartnerMockFlowProps) {
  const isHub = layout === "hub";
  const [step, setStep] = useState<Step>(1);
  const [configReady, setConfigReady] = useState(false);
  const [configLoading, setConfigLoading] = useState(true);
  const [riaMode, setRiaMode] = useState<"mock" | "live">("mock");
  const [sourceCountries, setSourceCountries] = useState<{ code: string; label: string }[]>([
    ...FALLBACK_SOURCE_COUNTRIES,
  ]);
  const [bankList, setBankList] = useState<{ code: string; name: string }[]>([...FALLBACK_THAI_BANKS]);

  const [fromCountry, setFromCountry] = useState("USA");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [amountStr, setAmountStr] = useState("100");

  const [recipientName, setRecipientName] = useState("");
  const [localBank, setLocalBank] = useState("BBL");
  const [localAccount, setLocalAccount] = useState("");

  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [billingAddress1, setBillingAddress1] = useState("");
  const [billingAddress2, setBillingAddress2] = useState("");
  const [billingCity, setBillingCity] = useState("");
  const [billingState, setBillingState] = useState("");
  const [billingPostalCode, setBillingPostalCode] = useState("");

  const [feePreview, setFeePreview] = useState<{ platformFee: number; totalCharged: number } | null>(null);
  const [localEst, setLocalEst] = useState<number | null>(null);
  const [err, setErr] = useState("");
  const [creating, setCreating] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [validatingBank, setValidatingBank] = useState(false);
  const [doneTransfer, setDoneTransfer] = useState<Transfer | null>(null);

  const accountDigits = localAccount.replace(/\D/g, "");
  const selectedBank = useMemo(() => bankList.find((bank) => bank.code === localBank) ?? bankList[0], [bankList, localBank]);
  const amountNumber = Number.parseFloat(amountStr);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const config = await getPartnerTransferConfig();
        if (cancelled) return;
        setConfigReady(Boolean(config.checkoutReady));
        setRiaMode(config.riaMode === "live" ? "live" : "mock");
        if (config.sourceCountries?.length) setSourceCountries(config.sourceCountries);
        if (config.thaiBanks?.length) {
          setBankList(config.thaiBanks);
          setLocalBank((current) =>
            config.thaiBanks.some((bank) => bank.code === current) ? current : config.thaiBanks[0]?.code || current
          );
        }
      } catch (error) {
        if (cancelled) return;
        setErr(error instanceof Error ? error.message : "Could not load partner transfer configuration.");
      } finally {
        if (!cancelled) setConfigLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const n = Number.parseFloat(amountStr);
    if (Number.isNaN(n) || n <= 0) {
      setLocalEst(null);
      setFeePreview(null);
      return;
    }
    const timeoutId = window.setTimeout(() => {
      void getQuote(n, fromCurrency).then(
        (quote) => {
          setLocalEst(quote.thbReceive);
          setFeePreview({ platformFee: quote.platformFee ?? 0, totalCharged: quote.totalCharged ?? n });
        },
        () => {
          setLocalEst(null);
          setFeePreview(null);
        }
      );
    }, 250);
    return () => window.clearTimeout(timeoutId);
  }, [amountStr, fromCurrency]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const transferId = params.get("transferId");

    if (params.get("transferReturn") === "1" && transferId) {
      setCompleting(true);
      setErr("");
      setStep(4);
      void completePartnerTransfer({ transferId })
        .then((result) => {
          setDoneTransfer(result.transfer);
          setStep(5);
        })
        .catch((error) => {
          setErr(error instanceof Error ? error.message : "Could not complete partner transfer.");
        })
        .finally(() => {
          setCompleting(false);
          const path = window.location.pathname + window.location.hash;
          window.history.replaceState({}, "", path);
        });
      return;
    }

    if (params.get("transferAborted") === "1") {
      setErr(transferId ? `Payment was cancelled for transfer ${transferId}.` : "Payment was cancelled.");
      const path = window.location.pathname + window.location.hash;
      window.history.replaceState({}, "", path);
      return;
    }

    if (params.get("transferError") === "1") {
      setErr(transferId ? `Payment failed for transfer ${transferId}.` : "Payment failed.");
      const path = window.location.pathname + window.location.hash;
      window.history.replaceState({}, "", path);
    }
  }, []);

  const can1 = Number.isFinite(amountNumber) && amountNumber >= 1 && amountNumber <= 15000;
  const can2 = recipientName.trim().length >= 2 && accountDigits.length >= 6 && accountDigits.length <= 16;
  const can3 =
    senderName.trim().length >= 2 &&
    senderEmail.includes("@") &&
    senderPhone.trim().length >= 6 &&
    billingAddress1.trim().length >= 4 &&
    billingCity.trim().length >= 2 &&
    billingPostalCode.trim().length >= 3;

  const validateBankAndContinue = async () => {
    if (!can2) return;
    setErr("");
    setValidatingBank(true);
    try {
      const result = await validateThaiBankAccountInput({
        thaiBankCode: localBank,
        thaiAccountNumber: localAccount.trim(),
      });
      if (!result.ok) {
        setErr(result.error);
        return;
      }
      setStep(3);
    } catch (error) {
      setErr(error instanceof Error ? error.message : "Could not validate the recipient account.");
    } finally {
      setValidatingBank(false);
    }
  };

  const startPartnerCheckout = async () => {
    if (!can3 || !configReady) return;
    setCreating(true);
    setErr("");
    try {
      const result = await createPartnerTransfer({
        fromCountry,
        fromCurrency,
        amount: amountNumber,
        senderName: senderName.trim(),
        senderEmail: senderEmail.trim(),
        senderPhone: senderPhone.trim(),
        billingAddress1: billingAddress1.trim(),
        billingAddress2: billingAddress2.trim(),
        billingCity: billingCity.trim(),
        billingState: billingState.trim(),
        billingPostalCode: billingPostalCode.trim(),
        recipientName: recipientName.trim(),
        recipientBankName: selectedBank?.name || "",
        thaiBankCode: localBank,
        thaiAccountNumber: localAccount.trim(),
        deliveryMethod: "bank",
      });
      setDoneTransfer(result.transfer);
      if (result.paymentUrl) {
        window.location.assign(result.paymentUrl);
        return;
      }
      setCompleting(true);
      const completed = await completePartnerTransfer({ transferId: result.transfer.id });
      setDoneTransfer(completed.transfer);
      setStep(5);
    } catch (error) {
      setErr(error instanceof Error ? error.message : "Could not start the partner transfer.");
    } finally {
      setCreating(false);
      setCompleting(false);
    }
  };

  const resetFlow = () => {
    setStep(1);
    setErr("");
    setDoneTransfer(null);
    setAmountStr("100");
    setRecipientName("");
    setLocalAccount("");
    setSenderName("");
    setSenderEmail("");
    setSenderPhone("");
    setBillingAddress1("");
    setBillingAddress2("");
    setBillingCity("");
    setBillingState("");
    setBillingPostalCode("");
  };

  return (
    <div className={isHub ? "tf" : "tf tf--full"}>
      <div className="send-flow send-flow--no-scroll">
        {isHub ? (
          <div className="send-flow-top send-flow-top--hub">
            <StepTracker current={step > 4 ? 4 : (step as 1 | 2 | 3 | 4)} />
          </div>
        ) : (
          <div className="send-flow-top">
            <p className="send-flow-eyebrow" translate="no">
              BuffaloMoneySend
            </p>
            <h2 className="send-flow-title">Ria partner mock checkout</h2>
            <p className="send-flow-motto">
              This route behaves like the future direct integration and runs against the backend Ria mock flow.
            </p>
            <StepTracker current={step > 4 ? 4 : (step as 1 | 2 | 3 | 4)} />
          </div>
        )}

        <div className="send-flow-body">
          <div className="buffalo-hero-banner" role="banner">
            <div className="buffalo-hero-banner__glow" aria-hidden />
            <p className="buffalo-hero-banner__text">
              Experience the full <span className="buffalo-hero-banner__em">Ria partner mock</span> transfer flow
            </p>
          </div>

          {configLoading ? (
            <div className="rate-strip rate-strip--tight ria-flow-strip" aria-live="polite">
              <div className="rate-strip__stack">
                <div className="rate-strip__row">
                  <span className="rate-strip__k">Loading</span>
                  <span>Loading partner transfer configuration...</span>
                </div>
              </div>
            </div>
          ) : null}

          {err ? (
            <div className="error-banner error-banner--flow" role="alert">
              {err}
            </div>
          ) : null}

          {step === 1 ? (
            <div className="flow-step">
              <div className="flow-step-lead ria-flow-lead">
                <h3 className="flow-step-title">Route & amount</h3>
                <p className="ria-flow-desc">
                  Start the mock partner transfer with the same corridor, amount, and quote preparation the backend stores.
                </p>
              </div>
              <div className="flow-step-main">
                <div className="flow-fields" aria-label="Route and amount">
                  <div className="field field--tight">
                    <label htmlFor="partner-from-country">You send from</label>
                    <select
                      id="partner-from-country"
                      value={fromCountry}
                      onChange={(e) => {
                        setFromCountry(e.target.value);
                        setErr("");
                      }}
                    >
                      {sourceCountries.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.label} ({country.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field field--tight">
                    <label htmlFor="partner-destination">They receive in</label>
                    <input id="partner-destination" value="Thailand (THB)" readOnly />
                  </div>
                  <div className="field-row field-row--tight">
                    <div className="field field--tight">
                      <label htmlFor="partner-amount">Amount</label>
                      <input
                        id="partner-amount"
                        inputMode="decimal"
                        value={amountStr}
                        onChange={(e) => {
                          setAmountStr(e.target.value);
                          setErr("");
                        }}
                      />
                    </div>
                    <div className="field field--tight">
                      <label htmlFor="partner-currency">Your currency</label>
                      <select
                        id="partner-currency"
                        value={fromCurrency}
                        onChange={(e) => {
                          setFromCurrency(e.target.value);
                          setErr("");
                        }}
                      >
                        {FROM_CURRENCIES.map((currency) => (
                          <option key={currency} value={currency}>
                            {currency}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="rate-strip rate-strip--tight ria-flow-strip" aria-label="Quote preview">
                  <div className="rate-strip__stack">
                    <div className="rate-strip__row">
                      <span className="rate-strip__k">Estimated receive</span>
                      <strong>{localEst != null ? `${localEst.toFixed(2)} THB` : "Calculating..."}</strong>
                    </div>
                    <div className="rate-strip__row">
                      <span className="rate-strip__k">Platform fee</span>
                      <span>{feePreview ? `${feePreview.platformFee.toFixed(2)} ${fromCurrency}` : "Calculating..."}</span>
                    </div>
                    <div className="rate-strip__row">
                      <span className="rate-strip__k">Checkout total</span>
                      <strong>{feePreview ? `${feePreview.totalCharged.toFixed(2)} ${fromCurrency}` : "Calculating..."}</strong>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flow-actions flow-step-actions">
                <button type="button" className="btn btn-primary" onClick={() => can1 && setStep(2)} disabled={!can1}>
                  Continue
                </button>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="flow-step">
              <div className="flow-step-lead ria-flow-lead">
                <h3 className="flow-step-title">Recipient details</h3>
                <p className="ria-flow-desc">
                  The mock partner flow currently completes as a Thailand bank-deposit transfer and stores these payout details in the backend.
                </p>
              </div>
              <div className="flow-step-main">
                <div className="flow-fields" aria-label="Recipient details">
                  <div className="field field--tight">
                    <label htmlFor="partner-recipient-name">Recipient full name</label>
                    <input
                      id="partner-recipient-name"
                      value={recipientName}
                      onChange={(e) => {
                        setRecipientName(e.target.value);
                        setErr("");
                      }}
                    />
                  </div>
                  <div className="field field--tight">
                    <label htmlFor="partner-bank">Thai bank</label>
                    <select
                      id="partner-bank"
                      value={localBank}
                      onChange={(e) => {
                        setLocalBank(e.target.value);
                        setErr("");
                      }}
                    >
                      {bankList.map((bank) => (
                        <option key={bank.code} value={bank.code}>
                          {bank.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field field--tight">
                    <label htmlFor="partner-account">Thai account number</label>
                    <input
                      id="partner-account"
                      inputMode="numeric"
                      value={localAccount}
                      onChange={(e) => {
                        setLocalAccount(e.target.value);
                        setErr("");
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="flow-actions flow-step-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setStep(1)}>
                  Back
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => void validateBankAndContinue()}
                  disabled={!can2 || validatingBank}
                >
                  {validatingBank ? "Validating..." : "Continue"}
                </button>
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="flow-step">
              <div className="flow-step-lead ria-flow-lead">
                <h3 className="flow-step-title">Billing & sender details</h3>
                <p className="ria-flow-desc">
                  These fields are posted to the backend so the partner route behaves like a full online checkout instead of a redirect-only teaser.
                </p>
              </div>
              <div className="flow-step-main">
                <div className="flow-fields" aria-label="Billing and sender details">
                  <div className="field field--tight">
                    <label htmlFor="partner-sender-name">Full name</label>
                    <input
                      id="partner-sender-name"
                      value={senderName}
                      onChange={(e) => {
                        setSenderName(e.target.value);
                        setErr("");
                      }}
                      autoComplete="name"
                    />
                  </div>
                  <div className="field field--tight">
                    <label htmlFor="partner-sender-email">Email</label>
                    <input
                      id="partner-sender-email"
                      type="email"
                      value={senderEmail}
                      onChange={(e) => {
                        setSenderEmail(e.target.value);
                        setErr("");
                      }}
                      autoComplete="email"
                    />
                  </div>
                  <div className="field field--tight">
                    <label htmlFor="partner-sender-phone">Phone</label>
                    <input
                      id="partner-sender-phone"
                      value={senderPhone}
                      onChange={(e) => {
                        setSenderPhone(e.target.value);
                        setErr("");
                      }}
                      autoComplete="tel"
                    />
                  </div>
                  <div className="field field--tight">
                    <label htmlFor="partner-billing-address1">Billing address</label>
                    <input
                      id="partner-billing-address1"
                      value={billingAddress1}
                      onChange={(e) => {
                        setBillingAddress1(e.target.value);
                        setErr("");
                      }}
                      autoComplete="address-line1"
                    />
                  </div>
                  <div className="field field--tight">
                    <label htmlFor="partner-billing-address2">Address line 2 (optional)</label>
                    <input
                      id="partner-billing-address2"
                      value={billingAddress2}
                      onChange={(e) => {
                        setBillingAddress2(e.target.value);
                        setErr("");
                      }}
                      autoComplete="address-line2"
                    />
                  </div>
                  <div className="field-row field-row--tight">
                    <div className="field field--tight">
                      <label htmlFor="partner-billing-city">City</label>
                      <input
                        id="partner-billing-city"
                        value={billingCity}
                        onChange={(e) => {
                          setBillingCity(e.target.value);
                          setErr("");
                        }}
                        autoComplete="address-level2"
                      />
                    </div>
                    <div className="field field--tight">
                      <label htmlFor="partner-billing-state">State / region</label>
                      <input
                        id="partner-billing-state"
                        value={billingState}
                        onChange={(e) => {
                          setBillingState(e.target.value);
                          setErr("");
                        }}
                        autoComplete="address-level1"
                      />
                    </div>
                  </div>
                  <div className="field field--tight">
                    <label htmlFor="partner-billing-postal">Postal code</label>
                    <input
                      id="partner-billing-postal"
                      value={billingPostalCode}
                      onChange={(e) => {
                        setBillingPostalCode(e.target.value);
                        setErr("");
                      }}
                      autoComplete="postal-code"
                    />
                  </div>
                </div>
              </div>
              <div className="flow-actions flow-step-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setStep(2)}>
                  Back
                </button>
                <button type="button" className="btn btn-primary" onClick={() => can3 && setStep(4)} disabled={!can3}>
                  Continue
                </button>
              </div>
            </div>
          ) : null}

          {step === 4 ? (
            <div className="flow-step flow-step--pay">
              <div className="flow-step-lead flow-step-lead--pay">
                <span className="flow-step-kicker">Ria partner mock</span>
                <h3 className="flow-step-title">Review and open mock checkout</h3>
                <p className="flow-step-desc">
                  This sends the full partner payload to the backend, creates a mock Ria hosted payment page, and returns to `/partner` to finalize the transfer.
                </p>
              </div>

              <div className="flow-step-main flow-step-main--pay">
                <div className="flow-pay-thunes ria-flow-shell">
                  <div className="thunes-pay-shell">
                    <div className="thunes-pay-card ria-flow-card" aria-hidden>
                      <div className="thunes-pay-card__chip" />
                      <div className="thunes-pay-card__brand">Ria partner</div>
                      <div className="thunes-pay-card__amount mono">
                        {amountStr || "0"} {fromCurrency}
                      </div>
                      <div className="thunes-pay-card__meta">
                        <span>Recipient</span>
                        <strong>{recipientName || "Pending recipient"}</strong>
                      </div>
                    </div>

                    <div className="thunes-pay-panel ria-flow-panel">
                      <div className="thunes-pay-panel__topline">
                        <span className="thunes-pay-badge thunes-pay-badge--live">{riaMode === "mock" ? "Mock API mode" : "Live API mode"}</span>
                        <span className="thunes-pay-lock">{configReady ? "Backend connected" : "Backend not ready"}</span>
                      </div>

                      <div className="thunes-pay-hero ria-flow-hero">
                        <div>
                          <p className="thunes-pay-eyebrow">Partner checkout</p>
                          <h4 className="thunes-pay-heading">Start the full partner-style transfer flow</h4>
                          <p className="thunes-pay-copy">
                            The backend stores sender, billing, and recipient banking details, then launches the hosted mock Ria checkout and completes the transfer after return.
                          </p>
                        </div>
                      </div>

                      <div className="thunes-pay-summary-grid">
                        <div className="thunes-pay-summary-card">
                          <span>Route</span>
                          <strong className="mono">{fromCountry} to THA</strong>
                        </div>
                        <div className="thunes-pay-summary-card">
                          <span>Recipient bank</span>
                          <strong>{selectedBank?.name || localBank}</strong>
                        </div>
                        <div className="thunes-pay-summary-card">
                          <span>Sender</span>
                          <strong>{senderName}</strong>
                        </div>
                        <div className="thunes-pay-summary-card">
                          <span>Email</span>
                          <strong>{senderEmail}</strong>
                        </div>
                        <div className="thunes-pay-summary-card thunes-pay-summary-card--wide">
                          <span>Checkout total</span>
                          <strong className="mono">
                            {feePreview ? `${feePreview.totalCharged.toFixed(2)} ${fromCurrency}` : `${amountStr} ${fromCurrency}`}
                          </strong>
                        </div>
                      </div>

                      <button
                        type="button"
                        className={`thunes-pay-cta ria-flow-cta ${!configReady ? "is-disabled" : ""}`}
                        onClick={() => void startPartnerCheckout()}
                        disabled={!configReady || creating || completing}
                      >
                        {creating ? "Creating transfer..." : completing ? "Completing transfer..." : "Open mock Ria checkout"}
                      </button>
                      <p className="thunes-pay-note">
                        Hosted mock payment returns to `/partner`, then the backend finalizes the transfer using the same mock Ria rail.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flow-actions flow-step-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setStep(3)} disabled={creating || completing}>
                  Back
                </button>
              </div>
            </div>
          ) : null}

          {step === 5 && doneTransfer ? (
            <div className="flow-step flow-step--pay">
              <div className="flow-step-lead flow-step-lead--pay">
                <span className="flow-step-kicker">Transfer complete</span>
                <h3 className="flow-step-title">Mock Ria partner flow finished</h3>
                <p className="flow-step-desc">
                  The partner route successfully created, paid, and completed a full mock transfer through the backend.
                </p>
              </div>
              <div className="flow-step-main flow-step-main--pay">
                <div className="rate-strip rate-strip--tight ria-flow-strip">
                  <div className="rate-strip__stack">
                    <div className="rate-strip__row">
                      <span className="rate-strip__k">Transfer id</span>
                      <strong className="mono">{doneTransfer.id}</strong>
                    </div>
                    <div className="rate-strip__row">
                      <span className="rate-strip__k">Collection order</span>
                      <strong className="mono">{doneTransfer.collectionOrderId || "Not available"}</strong>
                    </div>
                    <div className="rate-strip__row">
                      <span className="rate-strip__k">Status</span>
                      <strong>{doneTransfer.status}</strong>
                    </div>
                    <div className="rate-strip__row">
                      <span className="rate-strip__k">Payout reference</span>
                      <span className="mono">
                        {doneTransfer.riaTransferId != null ? String(doneTransfer.riaTransferId) : "Created in mock collection flow"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flow-actions flow-step-actions">
                <button type="button" className="btn btn-primary" onClick={resetFlow}>
                  Start another mock transfer
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
