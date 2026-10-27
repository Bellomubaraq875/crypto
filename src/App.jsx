import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Navbar, Topbar, Homepage, Cryptocurrencies } from "./Components";
import ErrorBoundary from "./Components/ErrorBoundary";
import NewsPage from "./Components/News";
import { Skeleton } from "./Components/ui";
import { useApp } from "./context/AppContext";
import "./styles/index.css";

// Heavy screens (charts, rich text) load only when opened
const loadDetails = () => import("./Components/CryptoDetails");
const loadPortfolio = () => import("./Components/Portfolio");
const loadConverter = () => import("./Components/Converter");
const loadExchange = () => import("./Components/Exchange");
const CryptoDetails = lazy(loadDetails);
const Portfolio = lazy(loadPortfolio);
const Converter = lazy(loadConverter);
const Exchange = lazy(loadExchange);

const PageFallback = () => (
  <div className="stack">
    <Skeleton w={220} h={36} />
    <Skeleton h={320} r={16} />
  </div>
);

function App() {
  const { toast } = useApp();
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Warm the other screens while the browser is idle so navigation feels instant
  useEffect(() => {
    const idle = window.requestIdleCallback ?? ((fn) => setTimeout(fn, 1500));
    const id = idle(() => [loadDetails, loadPortfolio, loadConverter, loadExchange].forEach((l) => l()));
    return () => (window.cancelIdleCallback ?? clearTimeout)(id);
  }, []);

  return (
    <div className="app">
      <Navbar />
      <div className="shell">
        <Topbar />
        <main className="page">
          <ErrorBoundary resetKey={pathname}>
            <Suspense fallback={<PageFallback />}>
              <Routes>
                <Route path="/" element={<Homepage />} />
                <Route path="/cryptocurrencies" element={<Cryptocurrencies />} />
                <Route path="/crypto/:coinId" element={<CryptoDetails />} />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/convert" element={<Converter />} />
                <Route path="/exchange" element={<Exchange />} />
                <Route path="/news" element={<NewsPage />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
      {toast && (
        <div className="toast" role="status" key={toast.id}>
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default App;