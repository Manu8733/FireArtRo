import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Reveal from "@/components/site/Reveal";
import { SectionHeader } from "@/components/site/cinematic";
import { PORTFOLIO } from "@/data/content";

const DURATION = 5500;
const scrollTo = (href) => document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });

export const Showcase = () => {
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const startX = useRef(null);
  const item = PORTFOLIO[index];

  const go = useCallback(
    (dir) => {
      setIndex((i) => (i + dir + PORTFOLIO.length) % PORTFOLIO.length);
      setProgress(0);
    },
    []
  );

  const goTo = (i) => {
    setIndex(i);
    setProgress(0);
  };

  useEffect(() => {
    if (paused) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const tick = 50;
    const id = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          setIndex((i) => (i + 1) % PORTFOLIO.length);
          return 0;
        }
        return p + (tick / DURATION) * 100;
      });
    }, tick);
    return () => clearInterval(id);
  }, [paused, index]);

  const onPointerDown = (e) => (startX.current = e.clientX);
  const onPointerUp = (e) => {
    if (startX.current == null) return;
    const dx = e.clientX - startX.current;
    if (Math.abs(dx) > 60) go(dx < 0 ? 1 : -1);
    startX.current = null;
  };

  return (
    <section id="spectacole" className="relative py-24 md:py-32 overflow-hidden" data-testid="showcase-section">
      <div className="absolute top-1/3 -right-1/4 w-[50vw] h-[50vw] rounded-full bg-[#3A86FF]/8 blur-[140px]" />
      <div className="relative max-w-7xl mx-auto px-6 md:px-12">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <SectionHeader kicker="Spectacole realizate" title="Showcase cinematic" />
            <div className="flex items-center gap-3">
              <button
                onClick={() => go(-1)}
                data-testid="showcase-prev"
                aria-label="Spectacolul anterior"
                className="h-12 w-12 rounded-full glass flex items-center justify-center text-white hover:bg-[#8338EC] transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => go(1)}
                data-testid="showcase-next"
                aria-label="Spectacolul următor"
                className="h-12 w-12 rounded-full glass flex items-center justify-center text-white hover:bg-[#8338EC] transition-colors"
              >
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div
            className="mt-12 grid lg:grid-cols-[1.6fr_1fr] gap-6"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {/* Featured media */}
            <div
              className="relative h-[440px] md:h-[560px] rounded-3xl overflow-hidden glass cursor-grab active:cursor-grabbing select-none"
              onPointerDown={onPointerDown}
              onPointerUp={onPointerUp}
              data-testid="showcase-stage"
            >
              <AnimatePresence mode="popLayout">
                <motion.img
                  key={item.image}
                  src={item.image}
                  alt={item.title}
                  initial={{ opacity: 0, scale: 1.08 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0 w-full h-full object-cover"
                  draggable={false}
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-[#050308] via-[#050308]/20 to-transparent" />

              <div className="absolute top-6 left-6">
                <span className="glass text-xs font-semibold uppercase tracking-wider text-white px-3 py-1.5 rounded-full">
                  {item.category}
                </span>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-7 md:p-9">
                <AnimatePresence mode="wait">
                  <motion.h3
                    key={item.title}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5 }}
                    className="font-display font-bold text-white text-2xl md:text-4xl"
                  >
                    {item.title}
                  </motion.h3>
                </AnimatePresence>
                <div className="mt-4 flex items-center gap-3">
                  <span className="text-white/50 text-sm font-mono">
                    {String(index + 1).padStart(2, "0")} / {String(PORTFOLIO.length).padStart(2, "0")}
                  </span>
                  <div className="h-px flex-1 bg-white/15 overflow-hidden rounded-full">
                    <div
                      className="h-full bg-gradient-to-r from-[#3A86FF] to-[#8338EC]"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Category list */}
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
              {PORTFOLIO.map((p, i) => (
                <button
                  key={p.title}
                  onClick={() => goTo(i)}
                  data-testid={`showcase-tab-${i}`}
                  className={`group relative text-left rounded-2xl p-4 lg:p-5 overflow-hidden transition-all duration-300 ${
                    i === index ? "glass border-[#8338EC]/50 glow-ring" : "border border-white/8 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="hidden lg:block h-14 w-14 rounded-xl overflow-hidden shrink-0">
                      <img src={p.image} alt="" className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] uppercase tracking-wider text-[#5AA9FF]">{p.category}</div>
                      <div className={`font-display font-semibold truncate transition-colors ${i === index ? "text-white" : "text-white/60 group-hover:text-white"}`}>
                        {p.title}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="mt-10 text-center">
            <button
              onClick={() => scrollTo("#contact")}
              data-testid="showcase-cta"
              className="inline-flex items-center gap-2 glass text-white font-semibold px-7 py-3.5 rounded-full hover:bg-white/10 transition-colors"
            >
              Vreau un spectacol ca acesta
              <ArrowRight className="h-4 w-4 text-[#8338EC]" />
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default Showcase;
