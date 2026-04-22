import { apiFetch } from "./client";

export type PayerSummary = {
  id: number;
  name: string;
  currency: string;
  country_iso_code: string;
  service: { id: number; name: string };
  transaction_types?: Record<string, unknown>;
};

export type Quotation = {
  id: number;
  external_id: string;
  payer: {
    id: number;
    name: string;
    currency: string;
    country_iso_code: string;
    service: { id: number; name: string };
  };
  mode: string;
  transaction_type: string;
  source: {
    country_iso_code: string;
    currency: string;
    amount: number;
  };
  destination: {
    currency: string;
    amount: number;
  };
  sent_amount?: { currency: string; amount: number };
  fee: { currency: string; amount: number };
  wholesale_fx_rate?: number;
  creation_date?: string;
  expiration_date?: string;
};

export type Transaction = {
  id: number;
  status?: string;
  status_message?: string;
  external_id?: string;
  payer_transaction_reference?: string | null;
};

export async function listPayers(params: { country_iso_code: string }) {
  const q = new URLSearchParams({
    country_iso_code: params.country_iso_code,
    per_page: "100",
    page: "1",
  });
  return apiFetch<PayerSummary[]>(`/api/payers?${q.toString()}`);
}

export type CreateQuotationBody = {
  external_id: string;
  payer_id: number;
  mode: "SOURCE_AMOUNT" | "DESTINATION_AMOUNT";
  transaction_type: "C2C";
  source: {
    amount: string;
    currency: string;
    country_iso_code: string;
  };
  destination: {
    amount: string | null;
    currency: string;
  };
};

export function createQuotation(body: CreateQuotationBody) {
  return apiFetch<Quotation>("/api/quotations", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export type CreateTransactionBody = {
  credit_party_identifier: Record<string, string>;
  sender: Record<string, string | undefined>;
  beneficiary: Record<string, string | undefined>;
  external_id: string;
  purpose_of_remittance: string;
  callback_url?: string;
};

export function createTransaction(quotationId: number, body: CreateTransactionBody) {
  return apiFetch<Transaction>(`/api/quotations/${quotationId}/transactions`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function confirmTransaction(transactionId: number) {
  return apiFetch<unknown>(`/api/transactions/${transactionId}/confirm`, {
    method: "POST",
    body: "{}",
  });
}
