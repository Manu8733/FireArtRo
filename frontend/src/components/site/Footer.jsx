import { OPEN_COOKIE_SETTINGS_EVENT } from "@/components/site/CookieConsent";
import { CONTACT_SETTINGS_DEFAULT, SITE_DETAILS, SOCIAL_LINKS } from "@/data/businessContent";
import useManagedContent from "@/hooks/useManagedContent";
import { LOGO_URL } from "@/lib/constants";
import "@/styles/night-footer.css";

const EXPLORE_LINKS = [
  { label: "Despre noi", href: "/#intro" },
  { label: "Servicii", href: "/#spectacole" },
  { label: "Pachete", href: "/pachete" },
  { label: "Galerie", href: "/galerie" },
  { label: "Întrebări", href: "/intrebari-frecvente" },
  { label: "Contact", href: "/contact" },
];

const LEGAL_LINKS = [
  { label: "Confidențialitate", href: "/confidentialitate" },
  { label: "Termeni", href: "/termeni-si-conditii" },
  { label: "Cookies", href: "/cookies" },
];

export const Footer = () => {
  const siteDetails = useManagedContent("siteDetails", SITE_DETAILS);
  const contactSettings = useManagedContent("contactSettings", CONTACT_SETTINGS_DEFAULT);
  const socialLinks = useManagedContent("socialLinks", SOCIAL_LINKS).filter((item) => item.href);
  const phoneDisplay = contactSettings.phoneDisplay || "";
  const phoneHref = contactSettings.phoneTel || phoneDisplay.replace(/\s/g, "");
  const email = siteDetails.email || "contact@fireart.ro";

  return (
    <footer className="fa-footer" data-testid="night-runway-footer">
      <div className="fa-footer__frame nr-shell">
        <div className="fa-footer__mast">
          <a className="fa-footer__brand" href="/#acasa" aria-label="FireArtRo, pagina principală">
            <img src={LOGO_URL} alt="FireArtRo" width="720" height="311" loading="lazy" decoding="async" />
          </a>
          <p>Scriem noaptea în lumină.</p>
        </div>

        <div className="fa-footer__directory">
          <nav className="fa-footer__column" aria-label="Explorează">
            <p>Explorează</p>
            {EXPLORE_LINKS.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
          </nav>

          <div className="fa-footer__column fa-footer__contact">
            <p>Contact</p>
            <a href={`mailto:${email}`}>{email}</a>
            {phoneDisplay && <a href={`tel:${phoneHref}`}>{phoneDisplay}</a>}
          </div>

          <nav className="fa-footer__column" aria-label="Urmărește">
            <p>Urmărește</p>
            {socialLinks.map((item) => (
              <a key={item.id} href={item.href} target="_blank" rel="noopener noreferrer">{item.label}</a>
            ))}
          </nav>
        </div>

        <div className="fa-footer__bottom">
          <span>© {new Date().getFullYear()} FireArtRo</span>
          <nav className="fa-footer__legal" aria-label="Informații legale">
            {LEGAL_LINKS.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
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
