import type { TransferConfig } from "./api";

const KEY = "bms_transfer_config_v2";
const TTL_MS = 15 * 60 * 1000;

type Cached = TransferConfig & { savedAt: number };

export function readTransferConfigCache(): Cached | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Cached;
    if (
      !p ||
      typeof p.savedAt !== "number" ||
      (typeof p.stripe !== "boolean" && typeof p.checkoutReady !== "boolean")
    ) {
      sessionStorage.removeItem(KEY);
      return null;
    }
    if (Date.now() - p.savedAt > TTL_MS) {
      sessionStorage.removeItem(KEY);
      return null;
    }
    return p;
  } catch {
    return null;
  }
}

export function writeTransferConfigCache(c: TransferConfig) {
  if (typeof sessionStorage === "undefined") return;
  try {
    const payload: Cached = {
      ...c,
      savedAt: Date.now(),
    };
    sessionStorage.setItem(KEY, JSON.stringify(payload));
  } catch {
    /* quota / private mode */
  }
}
