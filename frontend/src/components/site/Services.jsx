import { ArrowRight, Check } from "lucide-react";
import Reveal from "@/components/site/Reveal";
import { SectionHeader, Floating, TiltCard } from "@/components/site/cinematic";
import { SERVICES } from "@/data/content";

const scrollTo = (href) => document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });

export const Services = () => {
  return (
    <section id="servicii" className="relative py-20 sm:py-28 md:py-32 section-grid-bg" data-testid="services-section">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 md:px-12">
        <SectionHeader
          kicker="Ce oferim"
          title="Servicii premium pentru evenimente memorabile"
          subtitle="De la drone show-uri futuriste la artificii clasice și efecte de scenă — construim spectacolul perfect pentru momentul tău."
        />

        {/* Mobile: swipeable row · Desktop: 2-col grid */}
        <div className="mt-10 sm:mt-14 flex md:grid md:grid-cols-2 gap-5 md:gap-7 overflow-x-auto md:overflow-visible snap-x snap-mandatory hide-scrollbar -mx-5 px-5 md:mx-0 md:px-0 pb-1">
          {SERVICES.map((s, i) => (
            <Reveal key={s.title} delay={(i % 2) * 0.1} className="snap-center shrink-0 w-[84%] xs:w-[78%] md:w-auto">
              <TiltCard className="rounded-3xl" max={7}>
              <div
                className="group relative h-full rounded-3xl overflow-hidden glass border-gradient shine hover:border-white/20 transition-colors duration-300"
                data-testid={`service-card-${i}`}
              >
                <div className="relative h-44 sm:h-52 overflow-hidden">
                  <img
                    src={s.image}
                    alt={s.title}
                    loading="lazy"
                    className="w-full h-full object-cover opacity-80 group-hover:scale-105 group-hover:opacity-100 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0712] via-[#0A0712]/40 to-transparent" />
                  <Floating delay={i * 0.3} className="absolute top-4 left-4 sm:top-5 sm:left-5">
                    <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl glass flex items-center justify-center glow-ring">
                      <s.icon className="h-5 w-5 sm:h-6 sm:w-6 text-[#9D7BFF]" />
                    </div>
                  </Floating>
                </div>

                <div className="p-6 sm:p-7">
                  <h3 className="font-display font-semibold title-card text-white">{s.title}</h3>
                  <p className="mt-3 text-white/60 text-sm sm:text-base font-light leading-relaxed">{s.desc}</p>

                  <div className="mt-5 text-[10px] uppercase tracking-[0.2em] text-[#5AA9FF]">
                    Ideal pentru
                  </div>
                  <p className="mt-1 text-sm text-white/70">{s.ideal}</p>

                  <ul className="mt-5 space-y-2">
                    {s.benefits.map((b) => (
                      <li key={b} className="flex items-center gap-2.5 text-sm text-white/70">
                        <Check className="h-4 w-4 text-[#8338EC] shrink-0" />
                        {b}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => scrollTo("#contact")}
                    data-testid={`service-cta-${i}`}
                    className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-white group/btn"
                  >
                    Solicită acest show
                    <ArrowRight className="h-4 w-4 text-[#8338EC] group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>

        {/* mobile swipe hint */}
        <div className="mt-4 flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/30 md:hidden">
          <span className="h-px w-5 bg-white/15" /> Glisează <ArrowRight className="h-3 w-3" />
        </div>
      </div>
    </section>
  );
};

export default Services;
