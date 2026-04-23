import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useState } from "react";
import { completeTransfer } from "./api";

type Props = {
  onDone: (transfer: import("./api").Transfer) => void;
  onError: (m: string) => void;
};

export function CheckoutForm({ onDone, onError }: Props) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    onError("");
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: window.location.href },
        redirect: "if_required",
      });
      if (error) {
        onError(error.message ?? "Payment failed");
        return;
      }
      const piId = paymentIntent?.id;
      if (paymentIntent?.status === "succeeded" && piId) {
        const r = await completeTransfer(piId);
        if (r.ok) onDone(r.transfer);
        else onError("Could not confirm transfer on server");
        return;
      }
      onError("Unexpected payment state");
    } catch (err) {
      onError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={(e) => void handle(e)} className="pay-form pay-form--embedded" aria-busy={loading} data-processing={loading ? "true" : undefined}>
      <div className="pay-form-shell">
        <div className="pay-element-surface">
          <PaymentElement options={{ layout: "tabs" }} />
        </div>
        <button type="submit" className="btn btn-primary pay-form__submit" disabled={!stripe || loading}>
          {loading ? "Processing…" : "Pay securely"}
        </button>
        {loading && (
          <div className="pay-processing" role="status" aria-live="polite" aria-atomic="true">
            <div className="pay-processing__glow" aria-hidden />
            <div className="pay-processing__bar-track">
              <div className="pay-processing__bar-fill" />
            </div>
            <p className="pay-processing__message">
              You&apos;re about to become another happy buffalo.
            </p>
          </div>
        )}
      </div>
    </form>
  );
}
