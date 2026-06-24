import { useRef, useState, useCallback } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
  useTransform,
} from "framer-motion";
import { CHAPTERS } from "@/data/content";

const EASE = [0.22, 1, 0.36, 1];

/* Smooth scroll-linked progress segment for the story rail */
const Segment = ({ progress, index, total, active, onClick, label }) => {
  const fill = useTransform(progress, (v) => {
    const local = v * total - index;
    return `${Math.max(0, Math.min(1, local)) * 100}%`;
  });
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Capitolul ${index + 1}: ${label}`}
      data-testid={`chapter-dot-${index}`}
      className={`group relative h-1.5 rounded-full overflow-hidden bg-white/12 transition-[width] duration-500 ${
        active ? "w-14 sm:w-16" : "w-7 sm:w-8"
      }`}
    >
      <motion.span
        className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#3A86FF] to-[#8338EC]"
        style={{ width: fill }}
      />
    </button>
  );
};

export const Chapters = () => {
  const ref = useRef(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const idx = Math.max(0, Math.min(CHAPTERS.length - 1, Math.floor(v * CHAPTERS.length)));
    setActive(idx);
  });

  const goTo = useCallback((i) => {
    const el = ref.current;
    if (!el) return;
    const sectionTop = el.getBoundingClientRect().top + window.scrollY;
    const total = el.offsetHeight - window.innerHeight;
    const target = sectionTop + ((i + 0.5) / CHAPTERS.length) * total;
    window.scrollTo({ top: target, behavior: "smooth" });
  }, []);

  const ch = CHAPTERS[active];

  return (
    <section
      ref={ref}
      id="povestea"
      className="relative bg-[#050308]"
      style={{ height: `${CHAPTERS.length * 100}vh` }}
      data-testid="chapters-section"
    >
      <div className="sticky top-0 h-screen flex items-center overflow-hidden py-16 sm:py-20">
        {/* Aurora depth */}
        <div className="absolute -top-1/4 right-0 w-[55vw] h-[55vw] rounded-full bg-[#8338EC]/10 blur-[140px]" />
        <div className="absolute bottom-0 -left-1/4 w-[45vw] h-[45vw] rounded-full bg-[#3A86FF]/10 blur-[140px]" />

        <div className="relative max-w-7xl mx-auto px-6 md:px-12 w-full grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left: pinned giant number + copy */}
          <div className="relative order-last lg:order-none">
            <div className="flex items-center justify-between gap-4">
              <span className="cine-kicker text-xs sm:text-sm font-semibold text-[#8338EC]">
                Povestea unui spectacol
              </span>
              <span className="font-display text-sm text-white/40 tabular-nums">
                <span className="text-white">{ch.no}</span> / 0{CHAPTERS.length}
              </span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={ch.no}
                initial={{ opacity: 0, y: 36, filter: "blur(12px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -28, filter: "blur(12px)" }}
                transition={{ duration: 0.55, ease: EASE }}
              >
                <div className="font-display font-bold text-white leading-[0.8] text-[5.5rem] sm:text-[11rem] text-bloom mt-1">
                  {ch.no}
                </div>
                <div className="cine-kicker text-[#9D7BFF] text-xs sm:text-sm mt-2">{ch.kicker}</div>
                <h3 className="font-display font-semibold text-2xl sm:text-5xl text-white mt-3 sm:mt-4 tracking-tight">
                  {ch.title}
                </h3>
                <p className="mt-4 text-white/60 font-light leading-relaxed max-w-md text-sm sm:text-base">
                  {ch.text}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Smooth scroll-linked progress rail (clickable) */}
            <div className="mt-8 sm:mt-10 flex items-center gap-3" data-testid="chapters-rail">
              {CHAPTERS.map((c, i) => (
                <Segment
                  key={c.no}
                  progress={scrollYProgress}
                  index={i}
                  total={CHAPTERS.length}
                  active={i === active}
                  label={c.kicker}
                  onClick={() => goTo(i)}
                />
              ))}
            </div>
          </div>

          {/* Right: stacked crossfading media with Ken-Burns */}
          <div className="relative h-[260px] sm:h-[420px] lg:h-[460px]">
            {CHAPTERS.map((c, i) => (
              <motion.div
                key={c.no}
                className="absolute inset-0 rounded-3xl overflow-hidden glass"
                animate={{
                  opacity: i === active ? 1 : 0,
                  scale: i === active ? 1 : 1.04,
                }}
                transition={{ duration: 0.9, ease: EASE }}
                style={{ zIndex: i === active ? 2 : 1 }}
                data-testid={`chapter-media-${i}`}
              >
                <img
                  key={i === active ? `${c.no}-on` : `${c.no}-off`}
                  src={c.image}
                  alt={c.title}
                  loading="lazy"
                  className={`w-full h-full object-cover ${i === active ? "animate-ken-burns" : ""}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050308] via-[#050308]/10 to-transparent" />
                <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-3xl pointer-events-none" />
                <div className="absolute bottom-4 left-4 sm:bottom-5 sm:left-5 glass rounded-full px-4 py-2">
                  <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-white">
                    {c.kicker}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.25em] text-white/30 hidden md:flex items-center gap-2">
          <span className="inline-block w-5 h-px bg-white/20" />
          Derulează pentru a continua povestea
          <span className="inline-block w-5 h-px bg-white/20" />
        </div>
      </div>
    </section>
  );
};

export default Chapters;
