import { Link } from "react-router-dom";
import { MessageCircle, Mail, Phone, Instagram } from "lucide-react";
import { LOGO_URL, PHONE_DISPLAY, EMAIL, INSTAGRAM, whatsappLink } from "@/lib/constants";
import { NAV_LINKS } from "@/data/content";

const scrollTo = (href) => document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });

const LEGAL = [
  { label: "Politica de confidențialitate", to: "/legal/confidentialitate" },
  { label: "Termeni și condiții", to: "/legal/termeni" },
  { label: "Politica de cookie-uri", to: "/legal/cookies" },
];

export const Footer = () => {
  return (
    <footer className="relative border-t border-white/10 pt-16 sm:pt-20 pb-10" data-testid="site-footer">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 md:px-12">
        <div className="grid md:grid-cols-12 gap-10 md:gap-12">
          <div className="md:col-span-5">
            <img src={LOGO_URL} alt="FIREARTRO" className="h-12 w-auto object-contain" />
            <p className="mt-6 text-white/55 font-light leading-relaxed max-w-sm">
              Spectacole de drone, artificii și efecte speciale create pentru momente
              imposibil de uitat. Premium, sigur și cinematic.
            </p>
            <div className="mt-6 flex gap-3">
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="footer-whatsapp"
                className="h-10 w-10 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="h-5 w-5 text-[#25D366]" />
              </a>
              <a
                href={INSTAGRAM}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="footer-instagram"
                className="h-10 w-10 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5 text-[#9D7BFF]" />
              </a>
              <a
                href={`mailto:${EMAIL}`}
                data-testid="footer-email"
                className="h-10 w-10 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5 text-[#5AA9FF]" />
              </a>
            </div>
          </div>

          <div className="md:col-span-3">
            <h4 className="font-display font-semibold text-white">Navigare</h4>
            <ul className="mt-5 space-y-3">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollTo(l.href);
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
            <h4 className="font-display font-semibold text-white">Contact</h4>
            <ul className="mt-5 space-y-3 text-sm">
              <li className="flex items-center gap-3 text-white/55">
                <Phone className="h-4 w-4 text-[#9D7BFF]" /> {PHONE_DISPLAY}
              </li>
              <li className="flex items-center gap-3 text-white/55">
                <Mail className="h-4 w-4 text-[#9D7BFF]" /> {EMAIL}
              </li>
            </ul>
            <h4 className="font-display font-semibold text-white mt-8">Legal</h4>
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
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">
            © {new Date().getFullYear()} FIREARTRO. Toate drepturile rezervate.
          </p>
          <p className="text-white/30 text-xs">
            Drone Shows · Artificii Profesionale · Efecte Speciale
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
