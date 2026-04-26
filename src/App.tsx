import { Route, Routes } from "react-router-dom";
import { AnalyticsSpaListener } from "./AnalyticsSpaListener";
import { MemorialBanner } from "./MemorialBanner";
import HomePage from "./pages/HomePage";
import GuidesIndexPage from "./pages/GuidesIndexPage";
import GuideArticlePage from "./pages/GuideArticlePage";
import FaqPage from "./pages/FaqPage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  return (
    <>
      <AnalyticsSpaListener />
      <MemorialBanner />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/guides" element={<GuidesIndexPage />} />
        <Route path="/guides/:slug" element={<GuideArticlePage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}
