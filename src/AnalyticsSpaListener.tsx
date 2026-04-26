import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { sendGtagPageView } from "./analytics";

/**
 * Fires a GA4 page_view on client-side navigations. The initial load is already covered by gtag("config", …, { send_page_view: true }).
 */
export function AnalyticsSpaListener() {
  const location = useLocation();
  const skipFirst = useRef(true);
  useEffect(() => {
    if (skipFirst.current) {
      skipFirst.current = false;
      return;
    }
    const path = location.pathname + location.search;
    sendGtagPageView(path, document.title);
  }, [location.pathname, location.search]);
  return null;
}
