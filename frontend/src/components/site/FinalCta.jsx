import { MessageCircle, ArrowRight } from "lucide-react";
import Reveal from "@/components/site/Reveal";
import { whatsappLink } from "@/lib/constants";
import { goToContact } from "@/lib/contactNavigation";
import { MEDIA } from "@/data/content";

export const FinalCta = () => {
  return (
    <section className="final-cta-cinema" data-testid="final-cta-section">
      <img src={MEDIA.crowd3} alt="" aria-hidden="true" width="1600" height="1000" loading="lazy" decoding="async" />
      <span className="final-cta-shade" aria-hidden="true" />
      <div className="final-cta-content">
        <Reveal>
          <span>Următorul spectacol poate începe aici</span>
        </Reveal>
        <Reveal delay={0.05}>
          <h2>Spune-ne unde și când. Construim împreună momentul.</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p>Trimite data, locația și tipul evenimentului. Revenim cu întrebările potrivite și o direcție realistă.</p>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="final-cta-actions">
            <button
              onClick={() => goToContact()}
              data-testid="final-cta-primary"
              className="btn-grad"
            >
              Solicită ofertă
              <ArrowRight aria-hidden="true" />
            </button>
            {whatsappLink() && (
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="final-cta-whatsapp"
              >
                <MessageCircle aria-hidden="true" />
                Scrie pe WhatsApp
              </a>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default FinalCta;
