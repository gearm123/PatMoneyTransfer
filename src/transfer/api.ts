import { apiFetch } from "../api/client";

export type TransferConfig = {
  stripe: boolean;
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
    clientSecret: string;
    publishableKey: string;
  }>("/api/transfer/create", {
    method: "POST",
    body: JSON.stringify({ ...body, toCountry: "THA" }),
  });
}

export function completeTransfer(paymentIntentId: string) {
  return apiFetch<{ ok: true; transfer: Transfer }>("/api/transfer/complete", {
    method: "POST",
    body: JSON.stringify({ paymentIntentId }),
  });
}

export function getQuote(amount: number, fromCurrency: string) {
  return apiFetch<QuoteResponse>("/api/transfer/quote", {
    method: "POST",
    body: JSON.stringify({ amount, fromCurrency }),
  });
}
