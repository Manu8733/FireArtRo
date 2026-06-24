import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Plus } from "lucide-react";
import { YouTubeIcon, FacebookIcon, InstagramIcon, WhatsAppIcon } from "@/components/site/BrandIcons";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { whatsappLink, INSTAGRAM, FACEBOOK, YOUTUBE, PHONE_TEL } from "@/lib/constants";

const EASE = [0.22, 1, 0.36, 1];

const ITEMS = [
  { key: "youtube", label: "YouTube", href: YOUTUBE, Icon: YouTubeIcon, color: "#FF0033", external: true },
  { key: "facebook", label: "Facebook", href: FACEBOOK, Icon: FacebookIcon, color: "#1877F2", external: true },
  { key: "instagram", label: "Instagram", href: INSTAGRAM, Icon: InstagramIcon, color: "#E1306C", external: true },
  { key: "whatsapp", label: "WhatsApp", href: whatsappLink(), Icon: WhatsAppIcon, color: "#25D366", external: true },
  { key: "phone", label: "Sună acum", href: `tel:${PHONE_TEL}`, Icon: Phone, color: "#5AA9FF", external: false },
].filter((item) => item.href && !item.href.endsWith("tel:"));

const DockButton = ({ item, size = "md", showTooltip = true }) => {
  const { label, href, Icon, color, external } = item;
  const dim = size === "sm" ? "h-10 w-10" : "h-11 w-11";
  const icon = size === "sm" ? "h-[18px] w-[18px]" : "h-5 w-5";
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      aria-label={label}
      title={label}
      className="group relative outline-none"
    >
      <span
        className={`${dim} relative flex items-center justify-center rounded-full glass-strong text-white/85 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:text-white group-hover:scale-110 group-focus-visible:scale-110 focus-visible:ring-2 focus-visible:ring-white/70`}
        style={{ ["--g"]: color }}
      >
        <Icon className={icon} />
        {/* brand-tinted glow on hover/focus */}
        <span
          className="pointer-events-none absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-300"
          style={{ boxShadow: `0 0 18px 2px ${color}99, 0 0 0 1px ${color}66 inset` }}
        />
      </span>
      {showTooltip && (
        <span className="pointer-events-none absolute right-full top-1/2 -translate-y-1/2 mr-3 whitespace-nowrap rounded-lg glass-strong px-3 py-1.5 text-xs font-medium text-white opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
          {label}
        </span>
      )}
    </a>
  );
};

/* ---------------- Desktop: always-visible vertical dock ---------------- */
const DesktopDock = () => (
  <motion.div
    initial={{ opacity: 0, x: 36 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 28 }}
    transition={{ duration: 0.7, delay: 0.6, ease: EASE }}
    className="fixed right-4 lg:right-5 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-center gap-3"
    data-testid="social-dock"
    aria-label="Rețele sociale și contact"
  >
    <span className="h-10 w-px bg-gradient-to-b from-transparent to-white/20" />
    {ITEMS.map((item, i) => (
      <motion.div
        key={item.key}
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.7 + i * 0.07, ease: EASE }}
      >
        <DockButton item={item} />
      </motion.div>
    ))}
    <span className="h-10 w-px bg-gradient-to-t from-transparent to-white/20" />
  </motion.div>
);

/* ---------------- Mobile: compact expandable FAB ---------------- */
const MobileDock = () => {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, x: 18 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      className="fixed right-4 bottom-24 z-40 md:hidden flex flex-col items-center gap-3"
      data-testid="social-dock"
    >
      <AnimatePresence>
        {open && (
          <motion.div
            initial="hidden"
            animate="show"
            exit="hidden"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
            className="flex flex-col items-center gap-2.5"
          >
            {ITEMS.map((item) => (
              <motion.div
                key={item.key}
                variants={{
                  hidden: { opacity: 0, y: 14, scale: 0.8 },
                  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.32, ease: EASE } },
                }}
              >
                <DockButton item={item} size="sm" showTooltip={false} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Închide contactele" : "Deschide contactele"}
        aria-expanded={open}
        data-testid="social-dock-toggle"
        className="h-12 w-12 rounded-full bg-gradient-to-br from-[#3A86FF] to-[#8338EC] text-white flex items-center justify-center shadow-[0_8px_30px_rgba(131,56,236,0.5)] focus-visible:ring-2 focus-visible:ring-white/70 outline-none"
      >
        <motion.span animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.3, ease: EASE }}>
          <Plus className="h-6 w-6" />
        </motion.span>
      </button>
    </motion.div>
  );
};

export const SocialDock = () => {
  const mobile = useIsMobile();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const hero = document.getElementById("acasa");
    if (!hero) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.08 }
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <AnimatePresence>
      {visible && (mobile ? <MobileDock key="mobile-dock" /> : <DesktopDock key="desktop-dock" />)}
    </AnimatePresence>
  );
};

export default SocialDock;
