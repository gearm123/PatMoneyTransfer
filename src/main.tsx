import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

/* One-line check in production: open DevTools → Console. If empty, Netlify build has no VITE_API_BASE. */
if (import.meta.env.PROD) {
  const b = import.meta.env.VITE_API_BASE;
  console.info(
    "[BuffaloMoneySend] VITE_API_BASE:",
    b && String(b).length > 0 ? b : "(empty — API calls use this site’s /api; set VITE_API_BASE in Netlify and redeploy)"
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
