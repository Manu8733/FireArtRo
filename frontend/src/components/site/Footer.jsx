import { ArrowUpRight, Mail, Phone } from "lucide-react";
import { OPEN_COOKIE_SETTINGS_EVENT } from "@/components/site/CookieConsent";
import { WhatsAppIcon } from "@/components/site/BrandIcons";
import { CONTACT_SETTINGS_DEFAULT, SITE_DETAILS, SOCIAL_LINKS } from "@/data/businessContent";
import useManagedContent from "@/hooks/useManagedContent";
import { buildWhatsappLink, LOGO_URL } from "@/lib/constants";
import "@/styles/night-footer.css";

const EXPLORE_LINKS = [
  { label: "Despre noi", href: "/#intro" },
  { label: "Servicii", href: "/#spectacole" },
  { label: "Pachete", href: "/pachete" },
  { label: "Galerie", href: "/galerie" },
  { label: "Blog", href: "/blog" },
  { label: "Întrebări", href: "/intrebari-frecvente" },
  { label: "Contact", href: "/contact" },
];

const LEGAL_LINKS = [
  { label: "Confidențialitate", href: "/confidentialitate" },
  { label: "Termeni și condiții", href: "/termeni-si-conditii" },
  { label: "Cookies", href: "/cookies" },
  { label: "ANPC", href: "https://eservicii.anpc.ro/", external: true },
  { label: "SAL", href: "https://reclamatiisal.anpc.ro/", external: true },
];

export const Footer = () => {
  const siteDetails = useManagedContent("siteDetails", SITE_DETAILS);
  const managedContactSettings = useManagedContent("contactSettings", CONTACT_SETTINGS_DEFAULT);
  const socialLinks = useManagedContent("socialLinks", SOCIAL_LINKS).filter((item) => item.href);
  const phoneDisplay = managedContactSettings.phoneDisplay || CONTACT_SETTINGS_DEFAULT.phoneDisplay;
  const phoneHref = managedContactSettings.phoneTel
    || CONTACT_SETTINGS_DEFAULT.phoneTel
    || phoneDisplay.replace(/\s/g, "");
  const whatsAppHref = buildWhatsappLink(
    managedContactSettings.whatsappNumber || CONTACT_SETTINGS_DEFAULT.whatsappNumber,
  );
  const email = siteDetails.email || "contact@fireart.ro";
  const phoneTarget = phoneDisplay && phoneHref ? `tel:${phoneHref}` : "/contact";
  const whatsappTarget = whatsAppHref || "/contact";

  return (
    <footer className="fa-footer" data-testid="night-runway-footer">
      <div className="fa-footer__frame nr-shell">
        <div className="fa-footer__upper">
          <div className="fa-footer__mast">
            <a className="fa-footer__brand" href="/#acasa" aria-label="FireArtRo, pagina principală">
              <img src={LOGO_URL} alt="FireArtRo" width="720" height="311" loading="lazy" decoding="async" />
            </a>
            <p>Drone show, artificii și efecte construite pentru momentul potrivit.</p>
          </div>

          <div className="fa-footer__directory">
            <nav className="fa-footer__column" aria-label="Explorează">
              <p>Explorează</p>
              {EXPLORE_LINKS.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
            </nav>

            <div className="fa-footer__column fa-footer__contact">
              <p>Contact direct</p>
              <a href={`mailto:${email}`}>
                <Mail aria-hidden="true" />
                <span>{email}</span>
              </a>
              <a href={phoneTarget} aria-label={phoneDisplay ? `Sună la ${phoneDisplay}` : "Telefon"}>
                <Phone aria-hidden="true" />
                <span>{phoneDisplay || "Telefon"}</span>
              </a>
              <a
                href={whatsappTarget}
                {...(whatsAppHref ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                aria-label="WhatsApp"
              >
                <WhatsAppIcon aria-hidden="true" />
                <span>WhatsApp</span>
                {whatsAppHref && <ArrowUpRight className="fa-footer__external" aria-hidden="true" />}
              </a>
            </div>

            <nav className="fa-footer__column" aria-label="Urmărește">
              <p>Urmărește</p>
              {socialLinks.map((item) => (
                <a key={item.id} href={item.href} target="_blank" rel="noopener noreferrer">{item.label}</a>
              ))}
            </nav>
          </div>
        </div>

        <div className="fa-footer__bottom">
          <span>© {new Date().getFullYear()} FireArtRo</span>
          <nav className="fa-footer__legal" aria-label="Informații legale">
            {LEGAL_LINKS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {item.label}
                {item.external && <ArrowUpRight aria-hidden="true" />}
              </a>
            ))}
            <button type="button" onClick={() => window.dispatchEvent(new CustomEvent(OPEN_COOKIE_SETTINGS_EVENT))}>
              Setări cookies
            </button>
          </nav>
          <span>{siteDetails.legalName} · CUI {siteDetails.taxId}</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
