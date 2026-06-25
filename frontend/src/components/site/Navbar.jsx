import { useEffect, useRef, useState } from "react";
import { Menu, X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { NAV_LINKS } from "@/data/content";
import { LOGO_URL } from "@/lib/constants";

const scrollTo = (href, behavior = "smooth") => {
  const el = document.querySelector(href);
  if (el) el.scrollIntoView({ behavior, block: "start" });
};

const publicHref = (href) => (href.startsWith("#") ? `/${href}` : href);

const Logo = ({ onClick }) => (
  <a
    href="/#acasa"
    onClick={(e) => {
      e.preventDefault();
      onClick?.();
    }}
    data-testid="nav-logo"
    className="flex items-center gap-3 shrink-0"
  >
    <img src={LOGO_URL} alt="FIREARTRO" width="720" height="311" className="h-8 w-auto md:h-10 object-contain" />
  </a>
);

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("#acasa");
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const location = useLocation();
  const navigate = useNavigate();

  const goHome = (behavior = "smooth") => {
    if (location.pathname === "/") {
      scrollTo("#acasa", behavior);
      return;
    }
    navigate("/");
    window.setTimeout(() => scrollTo("#acasa", "auto"), 80);
  };

  const goTo = (href, behavior = "smooth") => {
    if (href.startsWith("#")) {
      if (location.pathname === "/") {
        scrollTo(href, behavior);
        return;
      }
      navigate(`/${href}`);
      window.setTimeout(() => scrollTo(href, "auto"), 90);
      return;
    }

    if (location.pathname === href) {
      window.scrollTo({ top: 0, behavior });
      return;
    }
    navigate(href);
  };

  useEffect(() => {
    const updateNavigation = () => {
      const currentY = Math.max(window.scrollY, 0);
      const delta = currentY - lastScrollY.current;

      setScrolled(currentY > 24);
      if (currentY < 72) {
        setVisible(true);
      } else if (Math.abs(delta) > 8) {
        setVisible(delta < 0);
      }

      lastScrollY.current = currentY;
      ticking.current = false;
    };

    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      window.requestAnimationFrame(updateNavigation);
    };

    lastScrollY.current = window.scrollY;
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll-spy: highlight the section currently in view.
  useEffect(() => {
    if (location.pathname !== "/") {
      setActive(location.pathname);
      return;
    }
    const ids = NAV_LINKS.filter((l) => l.href.startsWith("#")).map((l) => l.href.replace("#", ""));
    const sections = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!sections.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(`#${entry.target.id}`);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [location.pathname]);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: visible || open ? 0 : -104, opacity: 1 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      className={`site-navbar fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "site-navbar-scrolled backdrop-blur-xl bg-[#050308]/75 border-b border-white/10 py-2.5"
          : "bg-transparent py-4"
      }`}
      data-testid="main-navbar"
    >
      <nav className="max-w-7xl mx-auto px-5 sm:px-6 md:px-12 flex items-center justify-between gap-6">
        <Logo onClick={goHome} />

        <div className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((l) => {
            const isActive = active === l.href;
            return (
              <a
                key={l.href}
                href={publicHref(l.href)}
                onClick={(e) => {
                  e.preventDefault();
                  goTo(l.href);
                }}
                data-testid={`nav-link-${l.href.replace(/[#/]/g, "") || "home"}`}
                className={`relative text-sm font-medium px-3 py-2 rounded-full transition-colors duration-200 ${
                  isActive ? "text-white" : "text-white/65 hover:text-white"
                }`}
              >
                {l.label}
                {isActive && (
                  <motion.span
                    layoutId="nav-active"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    className="absolute inset-0 -z-10 rounded-full bg-white/8 border border-white/10"
                  />
                )}
              </a>
            );
          })}
        </div>

        <div className="hidden lg:block">
          <button
            onClick={() => goTo("#contact")}
            data-testid="nav-cta-button"
            className="btn-grad shine group inline-flex items-center gap-2 text-white text-sm font-semibold px-5 py-2.5 rounded-full"
          >
            Solicită ofertă
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Mobile */}
        <div className="lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                data-testid="mobile-menu-trigger"
                className="text-white p-2 rounded-xl glass hover:bg-white/10 transition-colors"
                aria-label="Deschide meniul"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="mobile-nav-sheet bg-[#0A0712]/95 backdrop-blur-xl border-white/10 w-[86vw] max-w-[340px] p-0 [&>button]:hidden"
            >
              <div className="flex flex-col h-full">
                <SheetTitle className="sr-only">Meniu de navigare</SheetTitle>
                <SheetDescription className="sr-only">
                  Navighează către secțiunile site-ului FIREARTRO
                </SheetDescription>
                <div className="flex items-center justify-between p-5 border-b border-white/10">
                  <Logo onClick={() => {
                    setOpen(false);
                    window.setTimeout(() => goHome("auto"), 180);
                  }} />
                  <button
                    onClick={() => setOpen(false)}
                    className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                    aria-label="Închide meniul"
                    data-testid="mobile-menu-close"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex flex-col px-5 py-6 gap-0.5 flex-1 overflow-y-auto">
                  {NAV_LINKS.filter((link) => link.href !== "#acasa").map((l, i) => (
                    <motion.a
                      key={l.href}
                      href={publicHref(l.href)}
                      onClick={(e) => {
                        e.preventDefault();
                        setOpen(false);
                        setTimeout(() => goTo(l.href, "auto"), 220);
                      }}
                      data-testid={`mobile-nav-link-${l.href.replace(/[#/]/g, "") || "home"}`}
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                      className="flex items-center justify-between text-[15px] font-medium text-white/80 hover:text-white py-3.5 border-b border-white/5 group"
                    >
                      {l.label}
                      <ArrowRight className="h-4 w-4 text-white/20 group-hover:text-[#5CB7FF] group-hover:translate-x-0.5 transition-all" />
                    </motion.a>
                  ))}
                </div>

                <div className="p-5 border-t border-white/10">
                  <button
                    onClick={() => {
                      setOpen(false);
                      setTimeout(() => goTo("#contact", "auto"), 220);
                    }}
                    data-testid="mobile-nav-cta"
                    className="btn-grad shine w-full inline-flex items-center justify-center gap-2 text-white font-semibold px-6 py-3.5 rounded-full"
                  >
                    Solicită ofertă
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </motion.header>
  );
};

export default Navbar;
