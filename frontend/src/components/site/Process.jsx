import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/site/Reveal";
import { SectionHeader } from "@/components/site/cinematic";
import { PROCESS } from "@/data/content";

const scrollTo = (href) => document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });

export const Process = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 75%", "end 55%"],
  });
  const fill = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section className="relative py-24 md:py-32 section-grid-bg" data-testid="process-section">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <SectionHeader
          kicker="Cum lucrăm"
          title="De la idee la spectacol"
          subtitle="Un proces clar și fără stres — tu te bucuri de eveniment, noi ne ocupăm de tot."
        />

        <div ref={ref} className="mt-16 relative">
          {/* Desktop horizontal */}
          <div className="hidden md:block relative">
            <div className="absolute top-7 left-0 right-0 h-px bg-white/10" />
            <motion.div
              style={{ width: fill }}
              className="absolute top-7 left-0 h-px bg-gradient-to-r from-[#3A86FF] to-[#8338EC] shadow-[0_0_12px_rgba(131,56,236,0.7)]"
            />
            <div className="relative grid grid-cols-5 gap-4">
              {PROCESS.map((p, i) => (
                <Reveal key={p.step} delay={i * 0.1}>
                  <div data-testid={`process-step-${i}`} className="flex flex-col items-start">
                    <div className="h-14 w-14 rounded-full bg-[#0A0712] border border-[#8338EC]/50 flex items-center justify-center glow-ring relative z-10">
                      <span className="font-display font-bold text-[#9D7BFF]">{p.step}</span>
                    </div>
                    <h3 className="mt-6 font-display font-semibold text-xl text-white">{p.title}</h3>
                    <p className="mt-2 text-white/55 font-light leading-relaxed text-sm pr-4">{p.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Mobile vertical */}
          <div className="md:hidden relative">
            <div className="absolute left-7 top-2 bottom-2 w-px bg-white/10" />
            <motion.div
              style={{ height: fill }}
              className="absolute left-7 top-2 w-px bg-gradient-to-b from-[#3A86FF] to-[#8338EC] shadow-[0_0_12px_rgba(131,56,236,0.7)]"
            />
            <div className="space-y-10">
              {PROCESS.map((p, i) => (
                <Reveal key={p.step} delay={i * 0.06}>
                  <div data-testid={`process-step-m-${i}`} className="relative flex items-start gap-5">
                    <div className="h-14 w-14 rounded-full bg-[#0A0712] border border-[#8338EC]/50 flex items-center justify-center glow-ring relative z-10 shrink-0">
                      <span className="font-display font-bold text-[#9D7BFF]">{p.step}</span>
                    </div>
                    <div className="pt-1">
                      <h3 className="font-display font-semibold text-xl text-white">{p.title}</h3>
                      <p className="mt-2 text-white/55 font-light leading-relaxed">{p.desc}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>

        <Reveal delay={0.15}>
          <div className="mt-14">
            <button
              onClick={() => scrollTo("#contact")}
              data-testid="process-cta"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#3A86FF] to-[#8338EC] text-white font-semibold px-8 py-4 rounded-full hover:shadow-[0_0_28px_rgba(131,56,236,0.5)] transition-all duration-300"
            >
              Începe-ți proiectul
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default Process;
