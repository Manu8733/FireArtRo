import { useEffect, useRef, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NAV_LINKS } from "@/data/content";
import { LOGO_URL } from "@/lib/constants";

const scrollTo = (href, behavior = "smooth") => {
  const element = document.querySelector(href);
  if (element) element.scrollIntoView({ behavior, block: "start" });
};

const publicHref = (href) => (href.startsWith("#") ? `/${href}` : href);

const Logo = ({ onClick }) => (
  <a
    href="/#acasa"
    onClick={(event) => {
      event.preventDefault();
      onClick?.();
    }}
    data-testid="nav-logo"
    className="site-navbar-brand"
  >
    <img src={LOGO_URL} alt="FireArtRo" width="720" height="311" />
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

  const desktopLinks = NAV_LINKS.slice(0, 8);
  const leftLinks = desktopLinks.slice(0, 4);
  const rightLinks = desktopLinks.slice(4, 8);

  useEffect(() => {
    const updateNavigation = () => {
      const currentY = Math.max(window.scrollY, 0);
      const delta = currentY - lastScrollY.current;
      setScrolled(currentY > 24);
      if (currentY < 72) setVisible(true);
      else if (Math.abs(delta) > 8) setVisible(delta < 0);
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

  useEffect(() => {
    if (location.pathname !== "/") {
      setActive(location.pathname);
      return;
    }
    const ids = NAV_LINKS.filter((link) => link.href.startsWith("#")).map((link) => link.href.slice(1));
    const sections = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!sections.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(`#${entry.target.id}`);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [location.pathname]);

  const renderDesktopLink = (link) => {
    const isActive = active === link.href;
    return (
      <a
        key={link.href}
        href={publicHref(link.href)}
        onClick={(event) => {
          event.preventDefault();
          goTo(link.href);
        }}
        data-testid={`nav-link-${link.href.replace(/[#/]/g, "") || "home"}`}
        className={isActive ? "is-active" : ""}
      >
        {link.label}
        {isActive && (
          <motion.span
            layoutId="nav-active"
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            aria-hidden="true"
          />
        )}
      </a>
    );
  };

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: visible || open ? 0 : -110, opacity: 1 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      className={`site-navbar ${scrolled ? "site-navbar-scrolled" : ""}`}
      data-testid="main-navbar"
    >
      <nav className="site-navbar-layout" aria-label="Navigare principală">
        <div className="site-navbar-links site-navbar-links-left">
          {leftLinks.map(renderDesktopLink)}
        </div>

        <div className="site-navbar-logo">
          <Logo onClick={goHome} />
        </div>

        <div className="site-navbar-links site-navbar-links-right">
          {rightLinks.map(renderDesktopLink)}
        </div>

        <div className="site-navbar-mobile">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button data-testid="mobile-menu-trigger" className="menu-button" aria-label="Deschide meniul">
                <Menu />
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="mobile-nav-sheet bg-[#06101c]/98 border-white/10 w-[88vw] max-w-[350px] p-0 [&>button]:hidden"
            >
              <div className="flex flex-col min-h-[100dvh]">
                <SheetTitle className="sr-only">Meniu de navigare</SheetTitle>
                <SheetDescription className="sr-only">
                  Navighează către secțiunile site-ului FireArtRo
                </SheetDescription>
                <div className="mobile-nav-head">
                  <Logo onClick={() => {
                    setOpen(false);
                    window.setTimeout(() => goHome("auto"), 180);
                  }} />
                  <button onClick={() => setOpen(false)} aria-label="Închide meniul" data-testid="mobile-menu-close">
                    <X />
                  </button>
                </div>

                <div className="mobile-nav-links">
                  {NAV_LINKS.filter((link) => link.href !== "#acasa").map((link, index) => (
                    <motion.a
                      key={link.href}
                      href={publicHref(link.href)}
                      onClick={(event) => {
                        event.preventDefault();
                        setOpen(false);
                        window.setTimeout(() => goTo(link.href, "auto"), 200);
                      }}
                      data-testid={`mobile-nav-link-${link.href.replace(/[#/]/g, "") || "home"}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.04 + index * 0.035 }}
                    >
                      {link.label}
                      <ArrowRight />
                    </motion.a>
                  ))}
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
