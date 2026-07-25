import { useLocation, useNavigate } from "react-router-dom";
import { ArrowUpRight, Mail, Phone } from "lucide-react";
import { YouTubeIcon, FacebookIcon, InstagramIcon, WhatsAppIcon } from "@/components/site/BrandIcons";
import {
  LOGO_URL,
  PHONE_DISPLAY,
  PHONE_TEL,
  EMAIL,
  INSTAGRAM,
  FACEBOOK,
  YOUTUBE,
  whatsappLink,
} from "@/lib/constants";
import { NAV_LINKS } from "@/data/content";
import { BUSINESS_HOURS, SITE_DETAILS } from "@/data/businessContent";
import { OPEN_COOKIE_SETTINGS_EVENT } from "@/components/site/CookieConsent";
import { navigateToHref, scrollToTop } from "@/lib/scrollNavigation";

const LEGAL = [
  { label: "Confidențialitate", to: "/confidentialitate" },
  { label: "Termeni și condiții", to: "/termeni-si-conditii" },
  { label: "Cookies", to: "/cookies" },
];

export const Footer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const phoneHref = PHONE_TEL || PHONE_DISPLAY.replace(/\s/g, "");
  const whatsAppHref = whatsappLink();
  const actionLinks = [
    { label: "Ofertă", href: "/contact", Icon: ArrowUpRight },
    { label: "WhatsApp", href: whatsAppHref, Icon: WhatsAppIcon, external: true },
    { label: "Telefon", href: phoneHref ? `tel:${phoneHref}` : "", Icon: Phone },
    { label: "Email", href: `mailto:${EMAIL}`, Icon: Mail },
    { label: "Instagram", href: INSTAGRAM, Icon: InstagramIcon, external: true },
    { label: "Facebook", href: FACEBOOK, Icon: FacebookIcon, external: true },
    { label: "YouTube", href: YOUTUBE, Icon: YouTubeIcon, external: true },
  ].filter((item) => item.href);

  const navigateTo = (href) => {
    navigateToHref({ href, navigate, pathname: location.pathname });
  };

  const goTop = () => {
    if (location.pathname === "/") {
      navigateToHref({ href: "#acasa", navigate, pathname: location.pathname });
      return;
    }
    scrollToTop();
    navigate("/#acasa");
  };

  return (
    <footer className="site-footer-cinema" data-testid="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-lead">
          <button type="button" className="site-footer-logo" onClick={goTop} aria-label="Mergi sus">
            <img src={LOGO_URL} alt="FireArtRo" width="720" height="311" loading="lazy" decoding="async" />
          </button>
          <h2>Din brief la cer aprins.</h2>
          <p>Drone show-uri, artificii și efecte speciale construite ca o singură experiență.</p>
        </div>

        <nav className="site-footer-column site-footer-nav" aria-label="Navigare footer">
          <span>Navigare</span>
          <div>
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
        </nav>

        <div className="site-footer-column">
          <span>Contact</span>
          {PHONE_DISPLAY && <a href={`tel:${phoneHref}`}><Phone /> {PHONE_DISPLAY}</a>}
          <a href={`mailto:${EMAIL}`}><Mail /> {EMAIL}</a>
          <p>{BUSINESS_HOURS.label}</p>
          <small>{BUSINESS_HOURS.note}</small>
          <small>Sediu principal: {SITE_DETAILS.mainOffice}</small>
        </div>

        <div className="site-footer-column">
          <span>Legal</span>
          {LEGAL.map((item) => (
            <a
              key={item.to}
              href={item.to}
              onClick={(event) => {
                event.preventDefault();
                navigateTo(item.to);
              }}
            >
              {item.label}
            </a>
          ))}
          <button type="button" onClick={() => window.dispatchEvent(new CustomEvent(OPEN_COOKIE_SETTINGS_EVENT))}>
            Setări cookies
          </button>
        </div>
      </div>

      <div className="site-footer-actions" aria-label="Acțiuni rapide FireArtRo">
        {actionLinks.map(({ label, href, Icon, external }) => (
          <a
            key={label}
            href={href}
            aria-label={label}
            title={label}
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            <Icon />
            <span>{label}</span>
          </a>
        ))}
      </div>

      <div className="site-footer-bottom">
        <span>© {new Date().getFullYear()} FireArtRo</span>
        <span>{SITE_DETAILS.legalName} · CUI {SITE_DETAILS.taxId} · {SITE_DETAILS.registrationNumber}</span>
      </div>
    </footer>
  );
};

export default Footer;
