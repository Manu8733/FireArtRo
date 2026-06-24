import { useRef, useState } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { PROCESS } from "@/data/content";

const EASE = [0.22, 1, 0.36, 1];
const scrollTo = (href) => document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });

export const Process = () => {
  const ref = useRef(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const fillWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const idx = Math.min(PROCESS.length - 1, Math.floor(v * PROCESS.length));
    setActive(idx < 0 ? 0 : idx);
  });

  const step = PROCESS[active];
  const Icon = step.icon;

  return (
    <section
      ref={ref}
      id="proces"
      className="relative bg-[#050308] section-grid-bg"
      style={{ height: `${PROCESS.length * 78}vh` }}
      data-testid="process-section"
    >
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden py-14">
        <div className="absolute top-0 right-0 w-[45vw] h-[45vw] rounded-full bg-[#8338EC]/8 blur-[140px]" />
        <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] rounded-full bg-[#3A86FF]/8 blur-[140px]" />

        <div className="relative max-w-7xl mx-auto px-6 md:px-12 w-full">
          <div className="cine-kicker text-[#8338EC] text-xs sm:text-sm font-semibold">Cum lucrăm</div>
          <h2 className="font-display font-bold text-white text-2xl sm:text-5xl mt-3 tracking-tight">
            De la idee la spectacol
          </h2>

          {/* Stepper rail */}
          <div className="mt-7 sm:mt-10">
            <div className="relative flex items-center justify-between">
              <div className="absolute left-0 right-0 top-1/2 h-px bg-white/10 -translate-y-1/2" />
              <motion.div
                style={{ width: fillWidth }}
                className="absolute left-0 top-1/2 h-px bg-gradient-to-r from-[#3A86FF] to-[#8338EC] -translate-y-1/2 shadow-[0_0_12px_rgba(131,56,236,0.7)]"
              />
              {PROCESS.map((p, i) => (
                <div
                  key={p.step}
                  data-testid={`process-dot-${i}`}
                  className={`relative z-10 h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center font-display font-bold text-xs sm:text-sm transition-all duration-500 ${
                    i <= active
                      ? "bg-gradient-to-br from-[#3A86FF] to-[#8338EC] text-white"
                      : "bg-[#0A0712] border border-white/15 text-white/40 scale-90"
                  }`}
                >
                  {p.step}
                </div>
              ))}
            </div>
          </div>

          {/* Active step */}
          <div className="mt-9 sm:mt-14 grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="relative min-h-[180px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, x: -40, filter: "blur(8px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, x: 30, filter: "blur(8px)" }}
                  transition={{ duration: 0.5, ease: EASE }}
                  data-testid={`process-step-${active}`}
                >
                  <div className="cine-kicker text-[#9D7BFF] text-xs mb-2">Pasul {step.step}</div>
                  <h3 className="font-display font-bold text-white text-3xl sm:text-6xl text-bloom">
                    {step.title}
                  </h3>
                  <p className="mt-4 text-white/60 font-light leading-relaxed max-w-md text-sm sm:text-base">
                    {step.desc}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Glowing visual */}
            <div className="relative h-[170px] sm:h-[320px] flex items-center justify-center order-first lg:order-none">
              <div className="absolute font-display font-bold text-white/[0.04] text-[7rem] sm:text-[13rem] leading-none pointer-events-none select-none">
                {step.step}
              </div>
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-[#8338EC]/20 blur-3xl animate-glow-pulse" />
                <div className="relative h-32 w-32 sm:h-56 sm:w-56 rounded-full glass flex items-center justify-center glow-ring">
                  <div className="absolute inset-3 rounded-full border border-white/10" />
                  <div className="absolute inset-5 rounded-full border border-dashed border-[#8338EC]/30 animate-[spin_20s_linear_infinite]" />
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={step.step}
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.6 }}
                      transition={{ duration: 0.4, ease: EASE }}
                    >
                      <Icon className="h-14 w-14 sm:h-20 sm:w-20 text-[#9D7BFF]" />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-9 sm:mt-12">
            <button
              onClick={() => scrollTo("#contact")}
              data-testid="process-cta"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#3A86FF] to-[#8338EC] text-white font-semibold px-7 py-3.5 rounded-full hover:shadow-[0_0_28px_rgba(131,56,236,0.5)] transition-all duration-300"
            >
              Începe-ți proiectul
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Process;
