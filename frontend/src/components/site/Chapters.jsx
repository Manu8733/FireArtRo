import { useRef, useState } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { CHAPTERS } from "@/data/content";

const EASE = [0.22, 1, 0.36, 1];

export const Chapters = () => {
  const ref = useRef(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const idx = Math.min(CHAPTERS.length - 1, Math.floor(v * CHAPTERS.length));
    setActive(idx < 0 ? 0 : idx);
  });

  const ch = CHAPTERS[active];

  return (
    <section
      ref={ref}
      id="povestea"
      className="relative bg-[#050308]"
      style={{ height: `${CHAPTERS.length * 100}vh` }}
      data-testid="chapters-section"
    >
      <div className="sticky top-0 h-screen flex items-center overflow-hidden py-20">
        {/* Aurora depth */}
        <div className="absolute -top-1/4 right-0 w-[55vw] h-[55vw] rounded-full bg-[#8338EC]/10 blur-[140px]" />
        <div className="absolute bottom-0 -left-1/4 w-[45vw] h-[45vw] rounded-full bg-[#3A86FF]/10 blur-[140px]" />

        <div className="relative max-w-7xl mx-auto px-6 md:px-12 w-full grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left: pinned giant number */}
          <div className="relative">
            <div className="cine-kicker text-xs sm:text-sm font-semibold text-[#8338EC] mb-2">
              Povestea unui spectacol
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={ch.no}
                initial={{ opacity: 0, y: 50, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -50, filter: "blur(10px)" }}
                transition={{ duration: 0.6, ease: EASE }}
              >
                <div className="font-display font-bold text-white leading-[0.8] text-[5.5rem] sm:text-[11rem] text-bloom">
                  {ch.no}
                </div>
                <div className="cine-kicker text-[#9D7BFF] text-sm mt-2">{ch.kicker}</div>
                <h3 className="font-display font-semibold text-2xl sm:text-5xl text-white mt-3 sm:mt-4 tracking-tight">
                  {ch.title}
                </h3>
                <p className="mt-4 text-white/60 font-light leading-relaxed max-w-md text-sm sm:text-base">{ch.text}</p>
              </motion.div>
            </AnimatePresence>

            {/* progress rail */}
            <div className="mt-10 flex items-center gap-3" data-testid="chapters-rail">
              {CHAPTERS.map((c, i) => (
                <div
                  key={c.no}
                  className={`h-1 rounded-full transition-all duration-500 ${
                    i === active ? "w-14 bg-gradient-to-r from-[#3A86FF] to-[#8338EC]" : "w-7 bg-white/15"
                  }`}
                  data-testid={`chapter-dot-${i}`}
                />
              ))}
            </div>
          </div>

          {/* Right: stacked crossfading media */}
          <div className="relative h-[220px] sm:h-[460px] order-first lg:order-none">
            {CHAPTERS.map((c, i) => (
              <motion.div
                key={c.no}
                className="absolute inset-0 rounded-3xl overflow-hidden glass"
                animate={{ opacity: i === active ? 1 : 0, scale: i === active ? 1 : 1.06 }}
                transition={{ duration: 0.8, ease: EASE }}
                style={{ zIndex: i === active ? 2 : 1 }}
                data-testid={`chapter-media-${i}`}
              >
                <img src={c.image} alt={c.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050308] via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 glass rounded-full px-4 py-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-white">
                    {c.kicker}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.25em] text-white/30 hidden md:block">
          Derulează pentru a continua povestea
        </div>
      </div>
    </section>
  );
};

export default Chapters;
