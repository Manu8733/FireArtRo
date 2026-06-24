import { ArrowRight, Check, Info } from "lucide-react";
import Reveal from "@/components/site/Reveal";
import { SectionHeader } from "@/components/site/cinematic";
import { PACKAGES, PRICING_FACTORS } from "@/data/content";

const scrollTo = (href) => document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
const selectPackage = (name) => {
  window.dispatchEvent(new CustomEvent("prefill-package", { detail: name }));
  scrollTo("#contact");
};

export const Packages = () => (
  <section className="relative py-20 sm:py-24 md:py-28" data-testid="packages-section">
    <div className="mx-auto max-w-7xl px-5 sm:px-6 md:px-12">
      <SectionHeader
        kicker="Direcții de ofertă"
        title="Alegi tipul de impact. Noi configurăm producția."
        subtitle="Prețul final se construiește după locație, durată, complexitate și logistică."
      />

      <div className="mt-10 overflow-hidden rounded-[1.75rem] border border-white/10">
        {PACKAGES.map((item, index) => {
          const Icon = item.icon;
          return (
            <Reveal key={item.name} y={24} delay={index * 0.04}>
              <article
                className={`group grid gap-5 border-b border-white/10 p-5 last:border-b-0 sm:p-6 lg:grid-cols-[64px_0.85fr_1.2fr_auto] lg:items-center ${
                  item.popular ? "bg-gradient-to-r from-[#8338EC]/14 via-[#0A0712] to-[#3A86FF]/8" : "bg-[#08050f]"
                }`}
                data-testid={`package-card-${index}`}
              >
                <div className="flex items-center gap-3 lg:block">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                    <Icon className="h-5 w-5 text-[#9D7BFF]" />
                  </span>
                  <span className="font-mono text-[10px] text-white/30 lg:mt-3 lg:block">0{index + 1}</span>
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-base font-semibold text-white sm:text-lg">{item.name}</h3>
                    {item.popular && <span className="rounded-full bg-[#8338EC]/18 px-2.5 py-1 text-[9px] uppercase tracking-wider text-[#C77DFF]">Recomandat</span>}
                  </div>
                  <p className="mt-1 text-xs text-[#9D7BFF]">{item.best}</p>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-white/52">{item.desc}</p>
                </div>

                <ul className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
                  {item.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-xs text-white/62 sm:text-sm">
                      <Check className="h-3.5 w-3.5 shrink-0 text-[#9D7BFF]" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => selectPackage(item.name)}
                  className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold ${
                    item.popular ? "btn-grad text-white" : "border border-white/12 bg-white/[0.035] text-white"
                  }`}
                >
                  Cere ofertă
                  <ArrowRight className="h-4 w-4" />
                </button>
              </article>
            </Reveal>
          );
        })}
      </div>

      <Reveal>
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 text-xs text-white/42">
            <Info className="h-3.5 w-3.5 text-[#9D7BFF]" />
            Oferta depinde de:
          </span>
          {PRICING_FACTORS.map((factor) => (
            <span key={factor} className="rounded-full border border-white/8 px-3 py-1.5 text-[11px] text-white/52">{factor}</span>
          ))}
        </div>
      </Reveal>
    </div>
  </section>
);

export default Packages;
