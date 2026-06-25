import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowUpRight, Mail, Phone } from "lucide-react";
import { YouTubeIcon, FacebookIcon, InstagramIcon, WhatsAppIcon } from "@/components/site/BrandIcons";
import { LOGO_URL, PHONE_DISPLAY, EMAIL, INSTAGRAM, FACEBOOK, YOUTUBE, whatsappLink } from "@/lib/constants";
import { NAV_LINKS } from "@/data/content";
import { BUSINESS_HOURS } from "@/data/businessContent";
import { OPEN_COOKIE_SETTINGS_EVENT } from "@/components/site/CookieConsent";

const LEGAL = [
  { label: "Confidențialitate", to: "/confidentialitate" },
  { label: "Termeni și condiții", to: "/termeni-si-conditii" },
  { label: "Cookies", to: "/cookies" },
];

export const Footer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const socialLinks = [
    { label: "WhatsApp", href: whatsappLink(), Icon: WhatsAppIcon, external: true },
    { label: "Instagram", href: INSTAGRAM, Icon: InstagramIcon, external: true },
    { label: "Facebook", href: FACEBOOK, Icon: FacebookIcon, external: true },
    { label: "YouTube", href: YOUTUBE, Icon: YouTubeIcon, external: true },
  ].filter((item) => item.href);

  const navigateTo = (href) => {
    if (!href.startsWith("#")) {
      navigate(href);
      return;
    }
    if (location.pathname !== "/") {
      navigate(`/${href}`);
      return;
    }
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="site-footer-cinema" data-testid="site-footer">
      <div className="site-footer-wordmark" aria-hidden="true">FireArtRo</div>
      <div className="site-footer-inner">
        <div className="site-footer-lead">
          <img src={LOGO_URL} alt="FireArtRo" width="720" height="311" loading="lazy" decoding="async" />
          <h2>Din primul brief până la ultimul semnal luminos.</h2>
          <p>Drone show, artificii și efecte speciale proiectate ca o singură experiență.</p>
          <a href="/contact">Solicită o ofertă <ArrowUpRight /></a>
        </div>

        <div className="site-footer-column">
          <span>Navigare</span>
          {NAV_LINKS.map((item) => (
            <a
              key={item.href}
              href={item.href.startsWith("#") ? `/${item.href}` : item.href}
              onClick={(event) => {
                event.preventDefault();
                navigateTo(item.href);
              }}
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="site-footer-column">
          <span>Contact</span>
          {PHONE_DISPLAY && <a href={`tel:${PHONE_DISPLAY.replace(/\s/g, "")}`}><Phone /> {PHONE_DISPLAY}</a>}
          <a href={`mailto:${EMAIL}`}><Mail /> {EMAIL}</a>
          <p>{BUSINESS_HOURS.label}</p>
          <small>{BUSINESS_HOURS.note}</small>
        </div>

        <div className="site-footer-column">
          <span>Legal & social</span>
          {LEGAL.map((item) => <Link key={item.to} to={item.to}>{item.label}</Link>)}
          <button type="button" onClick={() => window.dispatchEvent(new CustomEvent(OPEN_COOKIE_SETTINGS_EVENT))}>
            Setări cookies
          </button>
          <div className="site-footer-socials">
            {socialLinks.map(({ label, href, Icon, external }) => (
              <a key={label} href={href} aria-label={label} title={label} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                <Icon />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="site-footer-bottom">
        <span>© {new Date().getFullYear()} FireArtRo</span>
        <span>România · Drone shows · Artificii profesionale</span>
      </div>
    </footer>
  );
};

export default Footer;
