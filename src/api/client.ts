/* Origin only, e.g. https://xxx.onrender.com — paths already include /api/... */
const base = (import.meta.env.VITE_API_BASE ?? "")
  .trim()
  .replace(/\/$/, "")
  .replace(/\/api$/i, "");

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
