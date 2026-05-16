import { useMemo, useState } from "react";
import { RiaTransferMoneyLogo } from "../components/RiaTransferMoneyLogo";

const SOURCE_COUNTRIES = [
  { code: "USA", label: "United States" },
  { code: "GBR", label: "United Kingdom" },
  { code: "DEU", label: "Germany" },
  { code: "FRA", label: "France" },
  { code: "AUS", label: "Australia" },
  { code: "CAN", label: "Canada" },
] as const;

const FROM_CURRENCIES = ["USD", "EUR", "GBP"] as const;

const DESTINATIONS = [
  { code: "THA", label: "Thailand", currency: "THB", slug: "thailand" },
  { code: "PHL", label: "Philippines", currency: "PHP", slug: "philippines" },
  { code: "MEX", label: "Mexico", currency: "MXN", slug: "mexico" },
  { code: "COL", label: "Colombia", currency: "COP", slug: "colombia" },
] as const;

const DELIVERY_METHODS = [
  { code: "bank", label: "Bank deposit" },
  { code: "cash", label: "Cash pickup" },
  { code: "wallet", label: "Mobile wallet" },
] as const;

const STEP_LABELS = ["Info", "Continue"] as const;

const DEFAULT_RIA_AFFILIATE_URL =
  (import.meta.env.VITE_RIA_AFFILIATE_URL as string | undefined) ||
  "https://www.riamoneytransfer.com/en-us/become-an-affiliate/";
const RIA_AFFILIATE_DEEP_LINK = (import.meta.env.VITE_RIA_AFFILIATE_DEEP_LINK as string | undefined)?.trim();
const RIA_AFFILIATE_SHARED_ID = (import.meta.env.VITE_RIA_AFFILIATE_SHARED_ID as string | undefined)?.trim();
const DEFAULT_RIA_SEND_PAGE = "https://www.riamoneytransfer.com/en-us/send-money-online/";

type Step = 1 | 2;

type RiaFrontDoorFlowProps = {
  layout?: "default" | "hub";
  mode: "affiliate" | "partner";
};

type AffiliateLead = {
  sourceCountry: string;
  destinationCountry: string;
  amount: string;
  fromCurrency: string;
  deliveryMethod: string;
};

function sanitizeTrackingValue(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

function StepTracker({ current }: { current: Step }) {
  return (
    <nav className="step-tracker" aria-label="Transfer steps">
      <ol className="step-tracker__list">
        {STEP_LABELS.map((label, index) => {
          const stepNumber = (index + 1) as Step;
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

function buildRiaDeepLink(payload: AffiliateLead) {
  if (RIA_AFFILIATE_DEEP_LINK) return RIA_AFFILIATE_DEEP_LINK;
  const destination = DESTINATIONS.find((item) => item.code === payload.destinationCountry);
  if (!destination) return DEFAULT_RIA_SEND_PAGE;
  return `https://www.riamoneytransfer.com/en-us/send-money-to-${destination.slug}/`;
}

function buildAffiliateRedirectUrl(payload: AffiliateLead) {
  const target = new URL(DEFAULT_RIA_AFFILIATE_URL);
  target.searchParams.set("subid1", "buffalomoneysend");
  target.searchParams.set("subid2", sanitizeTrackingValue(`${payload.sourceCountry}-${payload.destinationCountry}`));
  target.searchParams.set("subid3", sanitizeTrackingValue(payload.deliveryMethod));
  if (RIA_AFFILIATE_SHARED_ID) target.searchParams.set("sharedid", RIA_AFFILIATE_SHARED_ID);
  target.searchParams.set("u", buildRiaDeepLink(payload));
  return target.toString();
}

function summaryDelivery(deliveryMethod: string) {
  return DELIVERY_METHODS.find((item) => item.code === deliveryMethod)?.label ?? "Delivery";
}

function summaryCountry(code: string) {
  return DESTINATIONS.find((item) => item.code === code)?.label ?? code;
}

function summarySourceCountry(code: string) {
  return SOURCE_COUNTRIES.find((item) => item.code === code)?.label ?? code;
}

export function RiaFrontDoorFlow({ layout = "default" }: RiaFrontDoorFlowProps) {
  const isHub = layout === "hub";
  const [step, setStep] = useState<Step>(1);
  const [fromCountry, setFromCountry] = useState("USA");
  const [toCountry, setToCountry] = useState("THA");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [amountStr, setAmountStr] = useState("100");
  const [deliveryMethod, setDeliveryMethod] = useState("bank");
  const [err, setErr] = useState("");

  const amountNumber = Number.parseFloat(amountStr);
  const redirectUrl = useMemo(
    () =>
      buildAffiliateRedirectUrl({
        sourceCountry: fromCountry,
        destinationCountry: toCountry,
        amount: amountStr,
        fromCurrency,
        deliveryMethod,
      }),
    [amountStr, deliveryMethod, fromCountry, fromCurrency, toCountry]
  );

  const canContinue = Number.isFinite(amountNumber) && amountNumber >= 1 && deliveryMethod.length > 0;

  const onRedirect = () => {
    try {
      sessionStorage.setItem(
        "bms_ria_affiliate_handoff",
        JSON.stringify({
          sourceCountry: fromCountry,
          destinationCountry: toCountry,
          amount: amountStr,
          fromCurrency,
          deliveryMethod,
          savedAt: new Date().toISOString(),
        })
      );
      window.location.assign(redirectUrl);
    } catch (error) {
      setErr(error instanceof Error ? error.message : "Could not prepare the redirect.");
    }
  };

  return (
    <div className={isHub ? "tf" : "tf tf--full"}>
      <div className="send-flow send-flow--no-scroll">
        {isHub ? (
          <div className="send-flow-top send-flow-top--hub">
            <StepTracker current={step} />
          </div>
        ) : (
          <div className="send-flow-top">
            <p className="send-flow-eyebrow" translate="no">
              BuffaloMoneySend
            </p>
            <h2 className="send-flow-title">Continue transfer</h2>
            <StepTracker current={step} />
          </div>
        )}

        <div className="send-flow-body">
          {err ? (
            <div className="error-banner error-banner--flow" role="alert">
              {err}
            </div>
          ) : null}

          {step === 1 ? (
            <div className="flow-step">
              <div className="flow-step-lead ria-flow-lead">
                <h3 className="flow-step-title">Transfer details</h3>
                <p className="ria-flow-desc">Enter the transfer details you want to continue with.</p>
              </div>
              <div className="flow-step-main">
                <div className="flow-fields" aria-label="Transfer details">
                  <div className="field field--tight">
                    <label htmlFor="ria-from-country">You send from</label>
                    <select id="ria-from-country" value={fromCountry} onChange={(e) => setFromCountry(e.target.value)}>
                      {SOURCE_COUNTRIES.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.label} ({country.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field field--tight">
                    <label htmlFor="ria-to-country">They receive in</label>
                    <select id="ria-to-country" value={toCountry} onChange={(e) => setToCountry(e.target.value)}>
                      {DESTINATIONS.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.label} ({country.currency})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field field--tight">
                    <label htmlFor="ria-delivery-method">Delivery method</label>
                    <select id="ria-delivery-method" value={deliveryMethod} onChange={(e) => setDeliveryMethod(e.target.value)}>
                      {DELIVERY_METHODS.map((item) => (
                        <option key={item.code} value={item.code}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field-row field-row--tight">
                    <div className="field field--tight">
                      <label htmlFor="ria-amount">Amount</label>
                      <input id="ria-amount" inputMode="decimal" value={amountStr} onChange={(e) => setAmountStr(e.target.value)} />
                    </div>
                    <div className="field field--tight">
                      <label htmlFor="ria-currency">Your currency</label>
                      <select id="ria-currency" value={fromCurrency} onChange={(e) => setFromCurrency(e.target.value)}>
                        {FROM_CURRENCIES.map((currency) => (
                          <option key={currency} value={currency}>
                            {currency}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="rate-strip rate-strip--tight ria-flow-strip" aria-label="Transfer summary">
                  <div className="rate-strip__stack">
                    <div className="rate-strip__row">
                      <span className="rate-strip__k">Route</span>
                      <span className="mono">
                        {summarySourceCountry(fromCountry)} to {summaryCountry(toCountry)}
                      </span>
                    </div>
                    <div className="rate-strip__row">
                      <span className="rate-strip__k">Delivery</span>
                      <strong>{summaryDelivery(deliveryMethod)}</strong>
                    </div>
                    <div className="rate-strip__row">
                      <span className="rate-strip__k">Amount</span>
                      <strong className="mono">
                        {amountStr || "0"} {fromCurrency}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flow-actions flow-step-actions">
                <button type="button" className="btn btn-primary" onClick={() => canContinue && setStep(2)} disabled={!canContinue}>
                  Continue
                </button>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="flow-step flow-step--pay">
              <div className="flow-step-main flow-step-main--pay">
                <div className="flow-pay-thunes ria-flow-shell">
                  <div className="thunes-pay-shell">
                    <div className="thunes-pay-panel ria-flow-panel ria-flow-panel--centered">
                      <div className="ria-flow-logo-wrap">
                        <RiaTransferMoneyLogo className="ria-flow-logo" />
                      </div>
                      <div className="thunes-pay-summary-grid">
                        <div className="thunes-pay-summary-card">
                          <span>Route</span>
                          <strong className="mono">
                            {summarySourceCountry(fromCountry)} to {summaryCountry(toCountry)}
                          </strong>
                        </div>
                        <div className="thunes-pay-summary-card">
                          <span>Delivery</span>
                          <strong>{summaryDelivery(deliveryMethod)}</strong>
                        </div>
                        <div className="thunes-pay-summary-card">
                          <span>Amount</span>
                          <strong className="mono">
                            {amountStr} {fromCurrency}
                          </strong>
                        </div>
                      </div>
                      <button type="button" className="thunes-pay-cta ria-flow-cta" onClick={onRedirect}>
                        Continue to Ria
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flow-actions flow-step-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setStep(1)}>
                  Back
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
