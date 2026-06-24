import { Check, Star, ArrowRight } from "lucide-react";
import Reveal from "@/components/site/Reveal";
import { PACKAGES } from "@/data/content";

const scrollTo = (href) => document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });

const selectPackage = (name) => {
  window.dispatchEvent(new CustomEvent("prefill-package", { detail: name }));
  scrollTo("#contact");
};

export const Packages = () => {
  return (
    <section id="pachete" className="relative py-24 md:py-32 section-grid-bg" data-testid="packages-section">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-[#8338EC]">
              Pachete
            </span>
            <h2 className="font-display font-bold text-white text-4xl sm:text-5xl mt-4 tracking-tight">
              Alege experiența potrivită
            </h2>
            <p className="mt-5 text-white/60 text-base sm:text-lg font-light">
              Preț personalizat în funcție de locație, durată și complexitate. Spune-ne ce îți
              dorești, iar noi construim oferta.
            </p>
          </div>
        </Reveal>

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PACKAGES.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.1}>
              <div
                className={`relative h-full rounded-3xl p-7 flex flex-col transition-all duration-300 hover:-translate-y-1.5 ${
                  p.popular
                    ? "bg-gradient-to-b from-[#8338EC]/20 to-[#0A0712] border border-[#8338EC]/50 glow-ring"
                    : "glass hover:border-white/20"
                }`}
                data-testid={`package-card-${i}`}
              >
                {p.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 bg-gradient-to-r from-[#3A86FF] to-[#8338EC] text-white text-xs font-semibold px-3 py-1 rounded-full">
                      <Star className="h-3 w-3 fill-white" /> Popular
                    </span>
                  </div>
                )}

                <h3 className="font-display font-semibold text-xl text-white">{p.name}</h3>
                <p className="mt-1 text-sm text-[#9D7BFF]">{p.tagline}</p>

                <div className="mt-5 space-y-1.5 text-sm">
                  <div className="text-white/45">Recomandat pentru</div>
                  <div className="text-white/80">{p.best}</div>
                </div>

                <ul className="mt-5 space-y-2.5 flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-white/70">
                      <Check className="h-4 w-4 text-[#8338EC] shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>

                <div className="mt-6 text-xs uppercase tracking-[0.15em] text-[#5AA9FF]">
                  {p.impact}
                </div>

                <button
                  onClick={() => selectPackage(p.name)}
                  data-testid={`package-cta-${i}`}
                  className={`mt-5 inline-flex items-center justify-center gap-2 w-full font-semibold px-5 py-3 rounded-full transition-all duration-300 ${
                    p.popular
                      ? "bg-gradient-to-r from-[#3A86FF] to-[#8338EC] text-white hover:shadow-[0_0_24px_rgba(131,56,236,0.5)]"
                      : "glass text-white hover:bg-white/10"
                  }`}
                >
                  Solicită ofertă
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Packages;
