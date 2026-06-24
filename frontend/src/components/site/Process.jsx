import { motion } from "framer-motion";
import Reveal from "@/components/site/Reveal";
import { PROCESS } from "@/data/content";

export const Process = () => {
  return (
    <section className="relative py-24 md:py-32" data-testid="process-section">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <Reveal>
          <div className="max-w-2xl">
            <span className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-[#8338EC]">
              Cum lucrăm
            </span>
            <h2 className="font-display font-bold text-white text-4xl sm:text-5xl mt-4 tracking-tight">
              De la idee la spectacol
            </h2>
            <p className="mt-5 text-white/60 text-base sm:text-lg font-light">
              Un proces clar, transparent și fără stres — tu te bucuri de eveniment, noi ne
              ocupăm de tot.
            </p>
          </div>
        </Reveal>

        <div className="mt-16 relative">
          {/* vertical glowing line */}
          <div className="absolute left-[27px] md:left-1/2 top-2 bottom-2 w-px bg-gradient-to-b from-[#3A86FF] via-[#8338EC] to-transparent md:-translate-x-1/2" />

          <div className="space-y-10 md:space-y-0">
            {PROCESS.map((p, i) => (
              <Reveal key={p.step} delay={i * 0.08}>
                <div
                  className={`relative flex items-start gap-6 md:gap-0 md:grid md:grid-cols-2 md:items-center ${
                    i % 2 === 1 ? "md:[direction:rtl]" : ""
                  }`}
                  data-testid={`process-step-${i}`}
                >
                  {/* node */}
                  <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 z-10">
                    <motion.div
                      whileInView={{ scale: [0.6, 1.15, 1] }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6 }}
                      className="h-14 w-14 rounded-full bg-[#0A0712] border border-[#8338EC]/50 flex items-center justify-center glow-ring"
                    >
                      <span className="font-display font-bold text-[#9D7BFF]">{p.step}</span>
                    </motion.div>
                  </div>

                  {/* spacer for the side opposite the card on desktop */}
                  <div className="hidden md:block" />

                  <div
                    className={`ml-20 md:ml-0 md:[direction:ltr] ${
                      i % 2 === 1 ? "md:pr-16 md:text-right" : "md:pl-16"
                    } py-2 md:py-12`}
                  >
                    <h3 className="font-display font-semibold text-2xl text-white">{p.title}</h3>
                    <p className="mt-2 text-white/60 font-light leading-relaxed max-w-md md:inline-block">
                      {p.desc}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Process;
