/**
 * Vite bakes VITE_API_BASE at build time. If Netlify (or a local `vite build`) runs without
 * it, a static site would call `/api/...` on the Netlify host and fail — the flow looks
 * "broken" or stuck on the offline/loading state. `netlify.toml` sets the default below;
 * override anytime with VITE_API_BASE in the build environment.
 */
const DEFAULT_PROD_API = "https://buffalo-money-send-backend.onrender.com";
const fromEnv = (import.meta.env.VITE_API_BASE as string | undefined)?.trim() ?? "";
const base = (fromEnv || (import.meta.env.PROD ? DEFAULT_PROD_API : ""))
  .replace(/\/$/, "")
  .replace(/\/api$/i, "");

/** Resolved API origin (empty in dev when using Vite’s `/api` proxy). */
export const resolvedApiBase = base;

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public payload: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${base}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    if (res.status === 404) {
      const origin = typeof globalThis === "object" && globalThis && "location" in globalThis
        ? String((globalThis as { location: { origin: string } }).location.origin)
        : "";
      const display =
        base
          ? `${String(base).replace(/\/$/, "")}${path}`
          : origin
            ? `${origin}${path}`
            : path;
      throw new ApiError(
        `Payment API not found (404): ${display}. ` +
          `A static site (e.g. Netlify) has no /api by itself. Set VITE_API_BASE in your build to your live API (e.g. https://api.example.com) and trigger a new build, or proxy /api in netlify.toml to that server. ` +
          `For local use: in server/ set Stripe in .env, run the API on port 4000, and run the app with npm run dev (not the built files alone).`,
        404,
        data
      );
    }
    const fullUrl = `${base || "(same origin)"}${path}`;
    let msg: string;
    if (typeof data === "object" && data !== null && "error" in data) {
      msg = String((data as { error: unknown }).error);
    } else if (typeof data === "object" && data !== null && "errors" in data) {
      msg = JSON.stringify((data as { errors: unknown }).errors);
    } else {
      msg = `HTTP ${res.status}`;
    }
    throw new ApiError(`${msg} (${fullUrl})`, res.status, data);
  }

  return data as T;
}

export function getHealth() {
  return apiFetch<{
    ok: boolean;
    thunesMode: string;
    hasBaseUrl: boolean;
    stripe?: boolean;
  }>("/api/health");
}
