import { Link, useLocation, useNavigate } from "react-router-dom";
import { Mail, Phone } from "lucide-react";
import { YouTubeIcon, FacebookIcon, InstagramIcon, WhatsAppIcon } from "@/components/site/BrandIcons";
import { LOGO_URL, PHONE_DISPLAY, EMAIL, INSTAGRAM, FACEBOOK, YOUTUBE, whatsappLink } from "@/lib/constants";
import { NAV_LINKS } from "@/data/content";
import { BUSINESS_HOURS } from "@/data/businessContent";
import { OPEN_COOKIE_SETTINGS_EVENT } from "@/components/site/CookieConsent";

const scrollTo = (href) => document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
const publicHref = (href) => (href.startsWith("#") ? `/${href}` : href);

const LEGAL = [
  { label: "Politica de confidențialitate", to: "/confidentialitate" },
  { label: "Termeni și condiții", to: "/termeni-si-conditii" },
  { label: "Politica de cookies", to: "/cookies" },
];

export const Footer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const socialLinks = [
    { label: "WhatsApp", href: whatsappLink(), Icon: WhatsAppIcon, color: "#25D366", external: true, testid: "footer-whatsapp" },
    { label: "Instagram", href: INSTAGRAM, Icon: InstagramIcon, color: "#E1306C", external: true, testid: "footer-instagram" },
    { label: "Facebook", href: FACEBOOK, Icon: FacebookIcon, color: "#1877F2", external: true, testid: "footer-facebook" },
    { label: "YouTube", href: YOUTUBE, Icon: YouTubeIcon, color: "#FF0033", external: true, testid: "footer-youtube" },
    { label: "Email", href: `mailto:${EMAIL}`, Icon: Mail, color: "#5AA9FF", external: false, testid: "footer-email" },
  ].filter((item) => item.href);

  return (
    <footer className="relative border-t border-white/10 pt-16 sm:pt-20 pb-10" data-testid="site-footer">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 md:px-12">
        <div className="grid md:grid-cols-12 gap-10 md:gap-12">
          <div className="md:col-span-5">
            <img src={LOGO_URL} alt="FIREARTRO" width="720" height="311" loading="lazy" decoding="async" className="h-12 w-auto object-contain" />
            <p className="mt-6 text-white/55 font-light leading-relaxed max-w-sm">
              Producție vizuală pentru evenimente: concept, planificare și execuție într-un singur flux.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  {...(s.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  data-testid={s.testid}
                  aria-label={s.label}
                  title={s.label}
                  className="group relative h-10 w-10 rounded-full glass flex items-center justify-center text-white/80 transition-all duration-300 hover:-translate-y-0.5 hover:scale-110 hover:text-white focus-visible:ring-2 focus-visible:ring-white/70 outline-none"
                >
                  <s.Icon className="h-[18px] w-[18px]" />
                  <span
                    className="pointer-events-none absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ boxShadow: `0 0 16px 1px ${s.color}88` }}
                  />
                </a>
              ))}
            </div>
          </div>

          <div className="md:col-span-3">
            <h2 className="font-display font-semibold text-white">Navigare</h2>
            <ul className="mt-5 space-y-3">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <a
                    href={publicHref(l.href)}
                    onClick={(e) => {
                      e.preventDefault();
                      if (l.href.startsWith("#")) {
                        if (location.pathname === "/") {
                          scrollTo(l.href);
                        } else {
                          navigate(`/${l.href}`);
                          window.setTimeout(() => scrollTo(l.href), 80);
                        }
                      } else {
                        navigate(l.href);
                      }
                    }}
                    className="text-white/55 hover:text-white text-sm transition-colors"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4">
            <h2 className="font-display font-semibold text-white">Contact</h2>
            <ul className="mt-5 space-y-3 text-sm">
              {PHONE_DISPLAY && (
                <li className="flex items-center gap-3 text-white/55">
                  <Phone className="h-4 w-4 text-[#5CB7FF]" /> {PHONE_DISPLAY}
                </li>
              )}
              <li className="flex items-center gap-3 text-white/55">
                <Mail className="h-4 w-4 text-[#5CB7FF]" /> {EMAIL}
              </li>
              <li className="text-white/55">{BUSINESS_HOURS.label}</li>
              <li className="text-white/42 leading-relaxed">{BUSINESS_HOURS.note}</li>
            </ul>
            <h2 className="font-display font-semibold text-white mt-8">Legal</h2>
            <ul className="mt-5 space-y-3">
              {LEGAL.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    data-testid={`footer-legal-${l.to.split("/").pop()}`}
                    className="text-white/55 hover:text-white text-sm transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent(OPEN_COOKIE_SETTINGS_EVENT))}
                  className="text-white/55 hover:text-white text-sm transition-colors"
                >
                  Setări cookies
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/65 text-sm">
            © {new Date().getFullYear()} FIREARTRO. Toate drepturile rezervate.
          </p>
          <p className="text-white/55 text-xs">
            Drone Shows · Artificii Profesionale · Efecte Speciale
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
