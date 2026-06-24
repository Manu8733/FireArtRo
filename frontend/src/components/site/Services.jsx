import { ArrowRight, Check } from "lucide-react";
import Reveal from "@/components/site/Reveal";
import { SERVICES } from "@/data/content";

const scrollTo = (href) => document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });

export const Services = () => {
  return (
    <section id="servicii" className="relative py-24 md:py-32 section-grid-bg" data-testid="services-section">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <Reveal>
          <div className="max-w-2xl">
            <span className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-[#8338EC]">
              Ce oferim
            </span>
            <h2 className="font-display font-bold text-white text-4xl sm:text-5xl mt-4 tracking-tight">
              Servicii premium pentru evenimente memorabile
            </h2>
            <p className="mt-5 text-white/60 text-base sm:text-lg font-light">
              De la drone show-uri futuriste la artificii clasice și efecte de scenă —
              construim spectacolul perfect pentru momentul tău.
            </p>
          </div>
        </Reveal>

        <div className="mt-14 grid md:grid-cols-2 gap-6 md:gap-8">
          {SERVICES.map((s, i) => (
            <Reveal key={s.title} delay={(i % 2) * 0.12}>
              <div
                className="group relative h-full rounded-3xl overflow-hidden glass hover:border-white/20 hover:-translate-y-1.5 transition-all duration-300"
                data-testid={`service-card-${i}`}
              >
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={s.image}
                    alt={s.title}
                    loading="lazy"
                    className="w-full h-full object-cover opacity-80 group-hover:scale-105 group-hover:opacity-100 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0712] via-[#0A0712]/40 to-transparent" />
                  <div className="absolute top-5 left-5 h-12 w-12 rounded-xl glass flex items-center justify-center glow-ring">
                    <s.icon className="h-6 w-6 text-[#9D7BFF]" />
                  </div>
                </div>

                <div className="p-7">
                  <h3 className="font-display font-semibold text-2xl text-white">{s.title}</h3>
                  <p className="mt-3 text-white/60 font-light leading-relaxed">{s.desc}</p>

                  <div className="mt-5 text-xs uppercase tracking-[0.15em] text-[#5AA9FF]">
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
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
