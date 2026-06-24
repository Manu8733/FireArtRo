import Reveal from "@/components/site/Reveal";
import { TECH } from "@/data/content";

export const Technology = () => {
  return (
    <section className="relative py-24 md:py-32" data-testid="technology-section">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <Reveal>
          <div className="max-w-2xl">
            <span className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-[#8338EC]">
              Tehnologie & încredere
            </span>
            <h2 className="font-display font-bold text-white text-4xl sm:text-5xl mt-4 tracking-tight">
              Spectacol impecabil, fără compromisuri
            </h2>
            <p className="mt-5 text-white/60 text-base sm:text-lg font-light">
              În spatele fiecărui moment „wow” stau planificare, tehnologie și o echipă care nu
              lasă nimic la voia întâmplării.
            </p>
          </div>
        </Reveal>

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-px rounded-3xl overflow-hidden glass">
          {TECH.map((t, i) => (
            <Reveal key={t.title} delay={(i % 3) * 0.08}>
              <div
                className="group relative h-full bg-[#0A0712]/60 p-8 hover:bg-[#0E0A1A] transition-colors duration-300"
                data-testid={`tech-card-${i}`}
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#8338EC]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#3A86FF]/20 to-[#8338EC]/20 border border-white/10 flex items-center justify-center shrink-0 group-hover:glow-ring transition-all duration-300">
                    <t.icon className="h-6 w-6 text-[#9D7BFF]" />
                  </div>
                  <h3 className="font-display font-semibold text-lg text-white">{t.title}</h3>
                </div>
                <p className="mt-4 text-white/55 font-light leading-relaxed">{t.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Technology;
