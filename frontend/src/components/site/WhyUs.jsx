import { ArrowRight } from "lucide-react";
import Reveal from "@/components/site/Reveal";
import { Stagger, StaggerItem, TiltCard } from "@/components/site/cinematic";
import { WHY } from "@/data/content";

const scrollTo = (href) => document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });

export const WhyUs = () => {
  return (
    <section id="de-ce-noi" className="relative py-20 sm:py-28 md:py-32 overflow-hidden" data-testid="why-section">
      <div className="absolute -top-1/4 left-1/2 -translate-x-1/2 w-[80vw] h-[40vw] rounded-full bg-[#8338EC]/8 blur-[150px] animate-breathe" />
      <div className="relative max-w-7xl mx-auto px-5 sm:px-6 md:px-12">
        <div className="grid lg:grid-cols-[0.9fr_1.4fr] gap-10 lg:gap-16">
          {/* Intro */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Reveal>
              <span className="cine-kicker text-[11px] sm:text-xs font-semibold text-[#9D7BFF]">
                De ce FIREARTRO
              </span>
              <h2 className="mt-4 font-display font-bold text-white display-md">
                Un partener care îți regizează momentul perfect
              </h2>
              <p className="mt-5 text-white/60 lead font-light">
                Nu livrăm doar efecte. Construim o experiență completă — de la concept și
                siguranță, până la emoția de pe fețele invitaților.
              </p>
              <button
                onClick={() => scrollTo("#contact")}
                className="btn-grad shine mt-8 inline-flex items-center gap-2 text-white font-semibold px-6 py-3.5 rounded-full"
              >
                Hai să vorbim
                <ArrowRight className="h-4 w-4" />
              </button>
            </Reveal>
          </div>

          {/* Reasons grid */}
          <Stagger className="grid grid-cols-2 gap-3 sm:gap-5">
            {WHY.map((w, i) => (
              <StaggerItem key={w.title}>
                <TiltCard className="rounded-2xl" max={6}>
                <div
                  className="group h-full glass rounded-2xl p-4 sm:p-6 shine hover:border-white/20 transition-colors duration-300"
                  data-testid={`why-card-${i}`}
                >
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-br from-[#3A86FF]/20 to-[#8338EC]/20 border border-white/10 flex items-center justify-center group-hover:glow-ring transition-all duration-300">
                    <w.icon className="h-5 w-5 sm:h-6 sm:w-6 text-[#9D7BFF]" />
                  </div>
                  <h3 className="mt-4 font-display font-semibold text-[15px] sm:text-lg text-white leading-snug">
                    {w.title}
                  </h3>
                  <p className="mt-2 text-[13px] sm:text-sm text-white/55 font-light leading-relaxed">
                    {w.desc}
                  </p>
                </div>
                </TiltCard>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  );
};

export default WhyUs;
