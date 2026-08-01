import { ArrowUpRight } from "lucide-react";
import { YouTubeIcon, FacebookIcon, InstagramIcon, WhatsAppIcon } from "@/components/site/BrandIcons";
import { OPEN_COOKIE_SETTINGS_EVENT } from "@/components/site/CookieConsent";
import FacebookReviews from "@/components/site/FacebookReviews";
import { CONTACT_SETTINGS_DEFAULT, SITE_DETAILS, SOCIAL_LINKS, TESTIMONIAL_ITEMS } from "@/data/businessContent";
import useManagedContent from "@/hooks/useManagedContent";
import { LOGO_URL, buildWhatsappLink } from "@/lib/constants";
import "@/styles/night-footer.css";

const PAGES = [
  { label: "Pachete", href: "/pachete" },
  { label: "Galerie", href: "/galerie" },
  { label: "Întrebări", href: "/intrebari-frecvente" },
  { label: "Contact", href: "/contact" },
];

const LEGAL = [
  { label: "Confidențialitate", href: "/confidentialitate" },
  { label: "Termeni", href: "/termeni-si-conditii" },
  { label: "Cookies", href: "/cookies" },
];

export const Footer = () => {
  const siteDetails = useManagedContent("siteDetails", SITE_DETAILS);
  const contactSettings = useManagedContent("contactSettings", CONTACT_SETTINGS_DEFAULT);
  const socialLinks = useManagedContent("socialLinks", SOCIAL_LINKS);
  const testimonials = useManagedContent("testimonials", TESTIMONIAL_ITEMS);
  const socialMap = Object.fromEntries(socialLinks.map((item) => [item.id, item.href]));
  const phoneDisplay = contactSettings.phoneDisplay || "";
  const phoneHref = contactSettings.phoneTel || phoneDisplay.replace(/\s/g, "");
  const email = siteDetails.email || "contact@fireart.ro";

  const socials = [
    { label: "Instagram", href: socialMap.instagram, Icon: InstagramIcon },
    { label: "Facebook", href: socialMap.facebook, Icon: FacebookIcon },
    { label: "YouTube", href: socialMap.youtube, Icon: YouTubeIcon },
    { label: "WhatsApp", href: buildWhatsappLink(contactSettings.whatsappNumber), Icon: WhatsAppIcon },
  ].filter((item) => item.href);

  return (
    <footer className="fa-footer" data-testid="night-runway-footer">
      <div className="fa-footer__frame nr-shell">
        <FacebookReviews facebookHref={socialMap.facebook} testimonials={testimonials} />

        <section className="fa-footer__lead" aria-labelledby="fa-footer-title">
          <p>Drone show · Artificii · Efecte scenice</p>
          <div className="fa-footer__lead-row">
            <h2 id="fa-footer-title">Planifică spectacolul.</h2>
            <a className="fa-footer__cta" href="/contact">
              <span>Trimite brief-ul</span>
              <ArrowUpRight aria-hidden="true" />
            </a>
          </div>
        </section>

        <div className="fa-footer__directory">
          <a className="fa-footer__brand" href="/#acasa" aria-label="FireArtRo, pagina principală">
            <img src={LOGO_URL} alt="FireArtRo" width="720" height="311" loading="lazy" decoding="async" />
          </a>

          <nav className="fa-footer__pages" aria-label="Pagini principale">
            {PAGES.map((item, index) => (
              <a key={item.href} href={item.href}>
                <span>0{index + 1}</span>{item.label}
              </a>
            ))}
          </nav>

          <div className="fa-footer__contact">
            <a href={`mailto:${email}`}>{email}</a>
            {phoneDisplay && <a href={`tel:${phoneHref}`}>{phoneDisplay}</a>}
          </div>

          <div className="fa-footer__social" aria-label="Rețele sociale">
            {socials.map(({ label, href, Icon }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={label}>
                <Icon aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>

        <div className="fa-footer__bottom">
          <span>© {new Date().getFullYear()} FireArtRo</span>
          <nav className="fa-footer__legal" aria-label="Informații legale">
            {LEGAL.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
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
