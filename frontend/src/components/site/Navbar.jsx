import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { NAV_LINKS } from "@/data/content";
import { LOGO_URL } from "@/lib/constants";

const scrollTo = (href) => {
  const el = document.querySelector(href);
  if (el) el.scrollIntoView({ behavior: "smooth" });
};

const Logo = () => (
  <a
    href="#acasa"
    onClick={(e) => {
      e.preventDefault();
      scrollTo("#acasa");
    }}
    data-testid="nav-logo"
    className="flex items-center gap-3 shrink-0"
  >
    <img src={LOGO_URL} alt="FIREARTRO" className="h-9 w-auto md:h-10 object-contain" />
  </a>
);

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "backdrop-blur-xl bg-[#050308]/80 border-b border-white/10 py-3"
          : "bg-transparent py-5"
      }`}
      data-testid="main-navbar"
    >
      <nav className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between gap-6">
        <Logo />

        <div className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={(e) => {
                e.preventDefault();
                scrollTo(l.href);
              }}
              data-testid={`nav-link-${l.href.replace("#", "")}`}
              className="text-sm font-medium text-white/70 hover:text-white transition-colors duration-200 relative group"
            >
              {l.label}
              <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-gradient-to-r from-[#3A86FF] to-[#8338EC] group-hover:w-full transition-all duration-300" />
            </a>
          ))}
        </div>

        <div className="hidden lg:block">
          <button
            onClick={() => scrollTo("#contact")}
            data-testid="nav-cta-button"
            className="bg-gradient-to-r from-[#3A86FF] to-[#8338EC] text-white text-sm font-semibold px-6 py-3 rounded-full hover:shadow-[0_0_24px_rgba(131,56,236,0.5)] transition-all duration-300"
          >
            Solicită ofertă
          </button>
        </div>

        {/* Mobile */}
        <div className="lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                data-testid="mobile-menu-trigger"
                className="text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Deschide meniul"
              >
                <Menu className="h-6 w-6" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="bg-[#0A0712] border-white/10 w-[300px] p-0"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                  <Logo />
                  <button
                    onClick={() => setOpen(false)}
                    className="text-white/70 hover:text-white"
                    aria-label="Închide meniul"
                    data-testid="mobile-menu-close"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex flex-col p-6 gap-1">
                  {NAV_LINKS.map((l, i) => (
                    <AnimatePresence key={l.href}>
                      <motion.a
                        href={l.href}
                        onClick={(e) => {
                          e.preventDefault();
                          setOpen(false);
                          setTimeout(() => scrollTo(l.href), 200);
                        }}
                        data-testid={`mobile-nav-link-${l.href.replace("#", "")}`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="text-base font-medium text-white/80 hover:text-white py-3 border-b border-white/5"
                      >
                        {l.label}
                      </motion.a>
                    </AnimatePresence>
                  ))}
                  <button
                    onClick={() => {
                      setOpen(false);
                      setTimeout(() => scrollTo("#contact"), 200);
                    }}
                    data-testid="mobile-nav-cta"
                    className="mt-6 bg-gradient-to-r from-[#3A86FF] to-[#8338EC] text-white font-semibold px-6 py-3.5 rounded-full"
                  >
                    Solicită ofertă
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
