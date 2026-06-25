import { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Home from "@/pages/Home";
import LegalPage from "@/pages/LegalPage";
import GalleryPage from "@/pages/GalleryPage";
import PackagesPage from "@/pages/PackagesPage";
import FaqPage from "@/pages/FaqPage";
import AdminPage from "@/pages/AdminPage";
import CookieConsent from "@/components/site/CookieConsent";

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
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/galerie" element={<GalleryPage />} />
          <Route path="/pachete" element={<PackagesPage />} />
          <Route path="/intrebari-frecvente" element={<FaqPage />} />
          <Route path="/confidentialitate" element={<LegalPage type="confidentialitate" />} />
          <Route path="/termeni-si-conditii" element={<LegalPage type="termeni" />} />
          <Route path="/cookies" element={<LegalPage type="cookies" />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/legal/confidentialitate" element={<Navigate to="/confidentialitate" replace />} />
          <Route path="/legal/termeni" element={<Navigate to="/termeni-si-conditii" replace />} />
          <Route path="/legal/cookies" element={<Navigate to="/cookies" replace />} />
        </Routes>
      </BrowserRouter>
      <CookieConsent />
      <Toaster position="top-center" richColors />
    </div>
  );
}

export default App;
