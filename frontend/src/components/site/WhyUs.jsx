import { ArrowRight, ShieldCheck } from "lucide-react";
import Reveal from "@/components/site/Reveal";
import { TECH } from "@/data/content";

const scrollTo = (href) => document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });

export const WhyUs = () => (
  <section id="de-ce-noi" className="relative overflow-hidden py-20 sm:py-24 md:py-28" data-testid="why-section">
    <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-6 md:px-12 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16">
      <Reveal>
        <div className="lg:sticky lg:top-28">
          <span className="cine-kicker text-[10px] font-semibold text-[#5CB7FF]">Control înainte de impact</span>
          <h2 className="mt-5 max-w-lg font-display text-[clamp(1.6rem,3vw,2.8rem)] font-bold leading-[1.08] text-white">
            Tehnologia rămâne în culise. Siguranța nu.
          </h2>
          <p className="mt-5 max-w-lg text-sm leading-relaxed text-white/58 sm:text-base">
            Fiecare decizie vizuală este legată de locație, logistică, sincronizare și condițiile reale ale evenimentului.
          </p>
          <button type="button" onClick={() => scrollTo("#contact")} className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-white">
            Discută locația evenimentului
            <ArrowRight className="h-4 w-4 text-[#5CB7FF]" />
          </button>

          <div className="relative mt-10 hidden aspect-square max-w-[320px] items-center justify-center lg:flex">
            <div className="absolute inset-[4%] rounded-full border border-white/7" />
            <div className="absolute inset-[18%] rounded-full border border-dashed border-[#176BFF]/25 animate-[spin_28s_linear_infinite]" />
            <div className="absolute inset-[31%] rounded-full bg-[#176BFF]/12 blur-2xl" />
            <span className="relative flex h-24 w-24 items-center justify-center rounded-full border border-white/12 bg-[#0A0712] shadow-[0_0_60px_rgba(23, 107, 255,0.25)]">
              <ShieldCheck className="h-10 w-10 text-[#5CB7FF]" />
            </span>
          </div>
        </div>
      </Reveal>

      <div className="border-t border-white/10">
        {TECH.map((item, index) => (
          <Reveal key={item.title} delay={(index % 3) * 0.05}>
            <article className="group grid grid-cols-[auto_1fr] gap-4 border-b border-white/10 py-5 sm:grid-cols-[54px_0.75fr_1.25fr] sm:items-center sm:gap-6 sm:py-6">
              <span className="font-mono text-[10px] text-white/28">0{index + 1}</span>
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/9 bg-white/[0.035] transition-colors group-hover:border-[#176BFF]/35">
                  <item.icon className="h-4 w-4 text-[#5CB7FF]" />
                </span>
                <h3 className="font-display text-sm font-semibold text-white sm:text-base">{item.title}</h3>
              </div>
              <p className="col-start-2 text-xs leading-relaxed text-white/48 sm:col-start-auto sm:text-sm">{item.desc}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

export default WhyUs;
