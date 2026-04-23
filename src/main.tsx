import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { resolvedApiBase } from "./api/client";
import App from "./App";
import "./index.css";

/* One-line check: DevTools → Console. resolvedApiBase is set in client.ts (env or production default). */
if (import.meta.env.PROD) {
  const fromEnv = (import.meta.env.VITE_API_BASE as string | undefined)?.trim();
  console.info(
    "[BuffaloMoneySend] API origin:",
    resolvedApiBase,
    fromEnv ? `(VITE_API_BASE from env)` : `(VITE_API_BASE unset — using in-bundle default; override in Netlify build env if needed)`
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
