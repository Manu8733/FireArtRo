import { Check, Star, ArrowRight, Info } from "lucide-react";
import Reveal from "@/components/site/Reveal";
import { SectionHeader, TiltCard } from "@/components/site/cinematic";
import { PACKAGES, PRICING_FACTORS } from "@/data/content";

const scrollTo = (href) => document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });

const selectPackage = (name) => {
  window.dispatchEvent(new CustomEvent("prefill-package", { detail: name }));
  scrollTo("#contact");
};

export const Packages = () => {
  return (
    <section id="pachete" className="relative py-20 sm:py-28 md:py-32 section-grid-bg" data-testid="packages-section">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 md:px-12">
        <SectionHeader
          center
          kicker="Pachete"
          title="Alege experiența potrivită"
          subtitle="Nu lucrăm cu prețuri fixe — fiecare show este construit pentru evenimentul tău. Spune-ne ce îți dorești, iar noi pregătim oferta personalizată."
        />

        {/* Pricing factors */}
        <Reveal delay={0.05}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-2 text-xs text-white/45">
              <Info className="h-3.5 w-3.5 text-[#9D7BFF]" /> Prețul depinde de:
            </span>
            {PRICING_FACTORS.map((f) => (
              <span key={f} className="text-xs text-white/70 glass rounded-full px-3 py-1.5">
                {f}
              </span>
            ))}
          </div>
        </Reveal>

        {/* Mobile: swipe row · Desktop: 4-col grid */}
        <div className="mt-12 flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-5 overflow-x-auto sm:overflow-visible snap-x snap-mandatory hide-scrollbar -mx-5 px-5 sm:mx-0 sm:px-0 pb-1">
          {PACKAGES.map((p, i) => {
            const Icon = p.icon;
            return (
              <Reveal key={p.name} delay={(i % 4) * 0.08} className="snap-center shrink-0 w-[80%] xs:w-[72%] sm:w-auto">
                <TiltCard className="rounded-3xl" max={7}>
                <div
                  className={`relative h-full rounded-3xl p-6 sm:p-7 flex flex-col shine transition-colors duration-300 ${
                    p.popular
                      ? "conic-border bg-gradient-to-b from-[#8338EC]/22 to-[#0A0712] border border-[#8338EC]/50 glow-ring"
                      : "glass hover:border-white/20"
                  }`}
                  data-testid={`package-card-${i}`}
                >
                  {p.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1 bg-gradient-to-r from-[#3A86FF] to-[#8338EC] text-white text-[11px] font-semibold px-3 py-1 rounded-full">
                        <Star className="h-3 w-3 fill-white" /> Cel mai ales
                      </span>
                    </div>
                  )}

                  <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#3A86FF]/20 to-[#8338EC]/25 border border-white/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-[#9D7BFF]" />
                  </div>

                  <h3 className="mt-4 font-display font-semibold title-card text-white">{p.name}</h3>
                  <p className="mt-1 text-sm text-[#9D7BFF]">{p.tagline}</p>
                  <p className="mt-3 text-sm text-white/55 font-light leading-relaxed">{p.desc}</p>

                  <div className="mt-5 text-xs">
                    <span className="text-white/45">Recomandat pentru </span>
                    <span className="text-white/80">{p.best}</span>
                  </div>

                  <ul className="mt-4 space-y-2.5 flex-1">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-white/70">
                        <Check className="h-4 w-4 text-[#8338EC] shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 text-[10px] uppercase tracking-[0.18em] text-[#5AA9FF]">
                    {p.impact}
                  </div>

                  <button
                    onClick={() => selectPackage(p.name)}
                    data-testid={`package-cta-${i}`}
                    className={`mt-4 inline-flex items-center justify-center gap-2 w-full font-semibold px-5 py-3 rounded-full shine transition-all duration-300 ${
                      p.popular
                        ? "btn-grad text-white"
                        : "glass text-white hover:bg-white/10"
                    }`}
                  >
                    Cere ofertă
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
                </TiltCard>
              </Reveal>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/30 sm:hidden">
          <span className="h-px w-5 bg-white/15" /> Glisează <ArrowRight className="h-3 w-3" />
        </div>
      </div>
    </section>
  );
};

export default Packages;
