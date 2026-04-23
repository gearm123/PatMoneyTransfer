import { apiFetch } from "../api/client";

export type TransferConfig = {
  /** Legacy: true when using Stripe. Prefer checkoutReady. */
  stripe: boolean;
  paymentProvider: "stripe" | "thunes";
  /** Card checkout (Stripe or Thunes Accept) is configured on the server. */
  checkoutReady: boolean;
  /** ISO 3166-1 alpha-3 — same values Thunes MT sends as `source.country_iso_code`. */
  thailandTransferRail?: string;
  sourceCountries?: { code: string; label: string }[];
  thaiBanks: { code: string; name: string }[];
  receiveToCountry: string;
};

export type Transfer = {
  id: string;
  createdAt: string;
  fromCountry: string;
  toCountry: string;
  fromCurrency: string;
  amountSend: number;
  /** Service fee you take (same currency as amountSend). Omitted if API is older. */
  platformFee?: number;
  /** Card is charged this (amountSend + platformFee). */
  totalCharged?: number;
  thbReceiveEstimate: number;
  fxRateUsed: number;
  sender: { fullName: string; email: string };
  thaiRecipient: { fullName: string; bankCode: string; accountNumber: string };
  paymentIntentId: string | null;
  status: string;
  /** Set when Thunes payout fails (card may still have succeeded). */
  lastError?: string;
  /** Thunes Money Transfer API — present after a successful quotation / transaction flow. */
  thunesQuotationId?: number;
  thunesTransactionId?: number;
  collectionOrderId?: string | null;
  /** Which server rail handled this transfer (`thunes_e2e`, `stripe_thunes_payout`, …). */
  railId?: string;
};

export type QuoteResponse = {
  thbReceive: number;
  rate: number;
  fromCurrency: string;
  amount: number;
  platformFee: number;
  totalCharged: number;
};

export function getTransferConfig() {
  return apiFetch<TransferConfig>("/api/transfer/config");
}

export function createTransfer(body: {
  fromCountry: string;
  fromCurrency: string;
  amount: number;
  senderName: string;
  senderEmail: string;
  recipientName: string;
  thaiBankCode: string;
  thaiAccountNumber: string;
}) {
  return apiFetch<{
    transfer: Transfer;
    paymentProvider: "stripe" | "thunes";
    thunesOrderId: string;
    paymentUrl: string | null;
    orderStatus: string;
    clientSecret: string;
    publishableKey: string;
  }>("/api/transfer/create", {
    method: "POST",
    body: JSON.stringify({ ...body, toCountry: "THA" }),
  });
}

export function completeTransfer(params: { paymentIntentId: string } | { transferId: string }) {
  return apiFetch<{ ok: true; transfer: Transfer }>("/api/transfer/complete", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export function getQuote(amount: number, fromCurrency: string) {
  return apiFetch<QuoteResponse>("/api/transfer/quote", {
    method: "POST",
    body: JSON.stringify({ amount, fromCurrency }),
  });
}

/** Per-bank digit length check before payment (same rules as the API on create). */
export function validateThaiBankAccountInput(body: { thaiBankCode: string; thaiAccountNumber: string }) {
  return apiFetch<{ ok: true } | { ok: false; error: string }>("/api/transfer/validate-bank", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
