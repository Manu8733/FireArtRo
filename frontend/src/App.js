import { lazy, Suspense, useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Home from "@/pages/Home";
import CookieConsent from "@/components/site/CookieConsent";

const GalleryPage = lazy(() => import("@/pages/GalleryPage"));
const PackagesPage = lazy(() => import("@/pages/PackagesPage"));
const FaqPage = lazy(() => import("@/pages/FaqPage"));
const ContactPage = lazy(() => import("@/pages/ContactPage"));
const LegalPage = lazy(() => import("@/pages/LegalPage"));
const AdminPage = lazy(() => import("@/pages/AdminPage"));

function App() {
  useEffect(() => {
    let stableWidth = window.innerWidth;

    const setViewportUnit = () => {
      document.documentElement.style.setProperty("--stable-vh", `${window.innerHeight * 0.01}px`);
      stableWidth = window.innerWidth;
    };

    const onResize = () => {
      if (Math.abs(window.innerWidth - stableWidth) > 2) setViewportUnit();
    };

    setViewportUnit();
    window.addEventListener("orientationchange", setViewportUnit);
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      window.removeEventListener("orientationchange", setViewportUnit);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className="App">
      <BrowserRouter>
        <Suspense fallback={<div className="route-loading" aria-label="Se încarcă pagina" />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/galerie" element={<GalleryPage />} />
            <Route path="/pachete" element={<PackagesPage />} />
            <Route path="/intrebari-frecvente" element={<FaqPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/confidentialitate" element={<LegalPage type="confidentialitate" />} />
            <Route path="/termeni-si-conditii" element={<LegalPage type="termeni" />} />
            <Route path="/cookies" element={<LegalPage type="cookies" />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/legal/confidentialitate" element={<Navigate to="/confidentialitate" replace />} />
            <Route path="/legal/termeni" element={<Navigate to="/termeni-si-conditii" replace />} />
            <Route path="/legal/cookies" element={<Navigate to="/cookies" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      <CookieConsent />
      <Toaster position="top-center" richColors />
    </div>
  );
}

export default App;
