import { MessageCircle, ArrowRight } from "lucide-react";
import Particles from "@/components/site/Particles";
import Reveal from "@/components/site/Reveal";
import { whatsappLink } from "@/lib/constants";
import { useIsMobile } from "@/hooks/useMediaQuery";

const scrollTo = (href) => document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });

export const FinalCta = () => {
  const mobile = useIsMobile();
  return (
    <section className="relative py-20 sm:py-28 md:py-36 overflow-hidden noise-overlay" data-testid="final-cta-section">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(131,56,236,0.25),_transparent_60%)]" />
      {!mobile && <Particles density={50} className="absolute inset-0 w-full h-full pointer-events-none" />}
      <div className="aurora opacity-60" />

      <div className="relative z-10 max-w-4xl mx-auto px-5 sm:px-6 md:px-12 text-center">
        <Reveal>
          <span className="cine-kicker text-[11px] sm:text-xs font-semibold text-[#9D7BFF]">Ultimul pas</span>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-5 font-display font-bold text-white display-lg">
            Transformă-ți evenimentul într-un{" "}
            <span className="text-gradient">spectacol memorabil</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-6 text-white/65 lead font-light max-w-2xl mx-auto">
            Spune-ne câteva detalii despre eveniment și primești o ofertă personalizată rapid.
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="mt-10 flex flex-col xs:flex-row gap-3 sm:gap-4 justify-center">
            <button
              onClick={() => scrollTo("#contact")}
              data-testid="final-cta-primary"
              className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#3A86FF] to-[#8338EC] text-white font-semibold px-8 py-4 rounded-full hover:shadow-[0_0_32px_rgba(131,56,236,0.55)] transition-all duration-300"
            >
              Trimite brief-ul evenimentului
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="final-cta-whatsapp"
              className="inline-flex items-center justify-center gap-2 glass text-white font-semibold px-8 py-4 rounded-full hover:bg-white/10 transition-all duration-300"
            >
              <MessageCircle className="h-4 w-4 text-[#25D366]" />
              Contact rapid pe WhatsApp
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default FinalCta;
