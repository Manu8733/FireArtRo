import { useRef, useState } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/site/Reveal";
import { PROCESS } from "@/data/content";
import { useIsMobile } from "@/hooks/useMediaQuery";

const EASE = [0.22, 1, 0.36, 1];
const scrollTo = (href) => document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });

/* ---------------- Mobile: vertical glowing timeline ---------------- */
const MobileProcess = () => (
  <section id="proces" className="relative py-20 bg-[#050308] section-grid-bg" data-testid="process-section">
    <div className="relative max-w-xl mx-auto px-5">
      <span className="cine-kicker text-[11px] font-semibold text-[#9D7BFF]">Cum lucrăm</span>
      <h2 className="mt-4 font-display font-bold text-white display-md">De la idee la spectacol</h2>

      <div className="relative mt-10 pl-12">
        {/* glowing vertical line */}
        <div className="absolute left-[18px] top-2 bottom-2 w-px bg-gradient-to-b from-[#3A86FF] via-[#8338EC] to-transparent" />
        <div className="space-y-7">
          {PROCESS.map((p, i) => {
            const Icon = p.icon;
            return (
              <Reveal key={p.step} delay={i * 0.05}>
                <div className="relative" data-testid={`process-step-${i}`}>
                  <div className="absolute -left-12 top-0 h-9 w-9 rounded-full bg-gradient-to-br from-[#3A86FF] to-[#8338EC] flex items-center justify-center font-display font-bold text-xs text-white shadow-[0_0_18px_rgba(131,56,236,0.6)]">
                    {p.step}
                  </div>
                  <div className="glass rounded-2xl p-5">
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-[#9D7BFF]" />
                      <h3 className="font-display font-semibold text-lg text-white">{p.title}</h3>
                    </div>
                    <p className="mt-2 text-sm text-white/60 font-light leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>

      <button
        onClick={() => scrollTo("#contact")}
        data-testid="process-cta"
        className="mt-9 inline-flex items-center gap-2 bg-gradient-to-r from-[#3A86FF] to-[#8338EC] text-white font-semibold px-6 py-3.5 rounded-full"
      >
        Începe-ți proiectul
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  </section>
);

/* ---------------- Desktop: pinned scroll-driven stepper ---------------- */
const DesktopProcess = () => {
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
          <div className="cine-kicker text-[#9D7BFF] text-xs sm:text-sm font-semibold">Cum lucrăm</div>
          <h2 className="font-display font-bold text-white display-md mt-3">De la idee la spectacol</h2>

          <div className="mt-10">
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
                  className={`relative z-10 h-12 w-12 rounded-full flex items-center justify-center font-display font-bold text-sm transition-all duration-500 ${
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

          <div className="mt-14 grid lg:grid-cols-2 gap-16 items-center">
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
                  <h3 className="font-display font-bold text-white text-5xl xl:text-6xl text-bloom">
                    {step.title}
                  </h3>
                  <p className="mt-4 text-white/60 lead font-light max-w-md">{step.desc}</p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="relative h-[320px] flex items-center justify-center">
              <div className="absolute font-display font-bold text-white/[0.04] text-[13rem] leading-none pointer-events-none select-none">
                {step.step}
              </div>
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-[#8338EC]/20 blur-3xl animate-glow-pulse" />
                <div className="relative h-56 w-56 rounded-full glass flex items-center justify-center glow-ring">
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
                      <Icon className="h-20 w-20 text-[#9D7BFF]" />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12">
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

export const Process = () => {
  const mobile = useIsMobile();
  return mobile ? <MobileProcess /> : <DesktopProcess />;
};

export default Process;
