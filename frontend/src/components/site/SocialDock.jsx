import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Phone } from "lucide-react";
import {
  FacebookIcon,
  InstagramIcon,
  WhatsAppIcon,
  YouTubeIcon,
} from "@/components/site/BrandIcons";
import { useIsMobile } from "@/hooks/useMediaQuery";
import {
  FACEBOOK,
  INSTAGRAM,
  PHONE_TEL,
  YOUTUBE,
  whatsappLink,
} from "@/lib/constants";

const EASE = [0.22, 1, 0.36, 1];
const whatsappHref = whatsappLink();

const ITEMS = [
  { key: "youtube", label: "YouTube", href: YOUTUBE, Icon: YouTubeIcon, color: "#ff1744", external: true },
  { key: "facebook", label: "Facebook", href: FACEBOOK, Icon: FacebookIcon, color: "#1877f2", external: true },
  { key: "instagram", label: "Instagram", href: INSTAGRAM, Icon: InstagramIcon, color: "#e1306c", external: true },
  { key: "whatsapp", label: "WhatsApp", href: whatsappHref || "/contact", Icon: WhatsAppIcon, color: "#25d366", external: Boolean(whatsappHref) },
  { key: "phone", label: "Telefon", href: PHONE_TEL ? `tel:${PHONE_TEL}` : "/contact", Icon: Phone, color: "#5cb7ff", external: false },
].filter((item) => item.href);

const DockButton = ({ item, mobile = false }) => {
  const { label, href, Icon, color, external } = item;
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      aria-label={label}
      title={label}
      className="social-dock-link"
      style={{ "--social-color": color }}
    >
      <Icon className={mobile ? "social-dock-icon-mobile" : "social-dock-icon"} />
      {!mobile && <span>{label}</span>}
    </a>
  );
};

const DesktopDock = () => (
  <motion.aside
    initial={{ opacity: 0, x: 28 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 20 }}
    transition={{ duration: 0.6, delay: 0.35, ease: EASE }}
    className="desktop-social-dock"
    data-testid="social-dock"
    aria-label="Rețele sociale și contact"
  >
    {ITEMS.map((item) => <DockButton key={item.key} item={item} />)}
  </motion.aside>
);

const MobileDock = () => (
  <motion.aside
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 18 }}
    transition={{ duration: 0.45, ease: EASE }}
    className="mobile-social-dock"
    data-testid="social-dock"
    aria-label="Rețele sociale și contact"
  >
    {ITEMS.map((item) => <DockButton key={item.key} item={item} mobile />)}
  </motion.aside>
);

export const SocialDock = () => {
  const mobile = useIsMobile();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const hero = document.getElementById("acasa");
    if (!hero) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.08 },
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <AnimatePresence>
      {visible && (mobile ? <MobileDock key="mobile" /> : <DesktopDock key="desktop" />)}
    </AnimatePresence>
  );
};

export default SocialDock;
