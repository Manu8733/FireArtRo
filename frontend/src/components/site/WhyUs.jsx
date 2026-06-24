import Reveal from "@/components/site/Reveal";
import { WHY } from "@/data/content";

export const WhyUs = () => {
  return (
    <section className="relative py-24 md:py-32 section-grid-bg" data-testid="why-section">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <Reveal>
          <div className="max-w-2xl">
            <span className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-[#8338EC]">
              De ce FIREARTRO
            </span>
            <h2 className="font-display font-bold text-white text-4xl sm:text-5xl mt-4 tracking-tight">
              Încredere, siguranță și efect wow
            </h2>
            <p className="mt-5 text-white/60 text-base sm:text-lg font-light">
              Nu vindem doar artificii — creăm experiențe complete, planificate la milimetru,
              cu o echipă pe care te poți baza.
            </p>
          </div>
        </Reveal>

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {WHY.map((w, i) => (
            <Reveal key={w.title} delay={(i % 3) * 0.1}>
              <div
                className="group h-full glass rounded-2xl p-8 hover:-translate-y-1.5 hover:border-white/20 transition-all duration-300"
                data-testid={`why-card-${i}`}
              >
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#3A86FF]/20 to-[#8338EC]/20 border border-white/10 flex items-center justify-center group-hover:glow-ring transition-all duration-300">
                  <w.icon className="h-7 w-7 text-[#9D7BFF]" />
                </div>
                <h3 className="mt-6 font-display font-semibold text-xl text-white">{w.title}</h3>
                <p className="mt-3 text-white/60 font-light leading-relaxed">{w.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyUs;
