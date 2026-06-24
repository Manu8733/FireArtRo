import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Reveal from "@/components/site/Reveal";
import { SectionHeader } from "@/components/site/cinematic";
import { PORTFOLIO } from "@/data/content";

const DURATION = 5800;
const EASE = [0.22, 1, 0.36, 1];
const scrollTo = (href) => document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });

export const Showcase = () => {
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();
  const startX = useRef(null);
  const item = PORTFOLIO[index];

  const go = useCallback((dir) => {
    setIndex((i) => (i + dir + PORTFOLIO.length) % PORTFOLIO.length);
    setProgress(0);
  }, []);

  const goTo = (i) => {
    setIndex(i);
    setProgress(0);
  };

  useEffect(() => {
    if (paused || reduce) return;
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
  }, [paused, index, reduce]);

  const onPointerDown = (e) => (startX.current = e.clientX);
  const onPointerUp = (e) => {
    if (startX.current == null) return;
    const dx = e.clientX - startX.current;
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
    startX.current = null;
  };

  return (
    <section id="spectacole" className="relative py-20 sm:py-28 md:py-32 overflow-hidden" data-testid="showcase-section">
      <div className="absolute top-1/3 -right-1/4 w-[50vw] h-[50vw] rounded-full bg-[#3A86FF]/8 blur-[140px]" />
      <div className="relative max-w-7xl mx-auto px-5 sm:px-6 md:px-12">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <SectionHeader
              kicker="Spectacole realizate"
              title="Experiențe vizuale, pe categorii"
              subtitle="Nunți, corporate, festivaluri, lansări și evenimente private — fiecare cu propriul scenariu vizual."
            />
            <div className="hidden md:flex items-center gap-3 shrink-0">
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

        {/* Category pills */}
        <Reveal delay={0.05}>
          <div className="mt-7 flex gap-2 overflow-x-auto hide-scrollbar -mx-5 px-5 md:mx-0 md:px-0 md:flex-wrap">
            {PORTFOLIO.map((p, i) => (
              <button
                key={p.category}
                onClick={() => goTo(i)}
                className={`shrink-0 text-xs sm:text-sm font-medium px-4 py-2 rounded-full transition-all duration-300 ${
                  i === index
                    ? "bg-gradient-to-r from-[#3A86FF] to-[#8338EC] text-white"
                    : "glass text-white/65 hover:text-white"
                }`}
              >
                {p.category}
              </button>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div
            className="mt-6 grid lg:grid-cols-[1.7fr_1fr] gap-5"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {/* Featured media */}
            <div
              className="relative h-[380px] sm:h-[480px] lg:h-[560px] rounded-3xl overflow-hidden glass cursor-grab active:cursor-grabbing select-none"
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
                  transition={{ duration: 0.8, ease: EASE }}
                  className="absolute inset-0 w-full h-full object-cover"
                  draggable={false}
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-[#050308] via-[#050308]/25 to-transparent" />

              <div className="absolute top-5 left-5">
                <span className="glass-strong text-[11px] font-semibold uppercase tracking-wider text-white px-3 py-1.5 rounded-full">
                  {item.category}
                </span>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 md:p-9">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h3 className="font-display font-bold text-white text-xl sm:text-3xl">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-white/70 text-sm sm:text-base font-light max-w-md">
                      {item.desc}
                    </p>
                  </motion.div>
                </AnimatePresence>
                <div className="mt-5 flex items-center gap-3">
                  <span className="text-white/50 text-sm font-mono tabular-nums">
                    {String(index + 1).padStart(2, "0")} / {String(PORTFOLIO.length).padStart(2, "0")}
                  </span>
                  <div className="h-px flex-1 bg-white/15 overflow-hidden rounded-full">
                    <div
                      className="h-full bg-gradient-to-r from-[#3A86FF] to-[#8338EC]"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  {/* mobile arrows */}
                  <div className="flex md:hidden items-center gap-2">
                    <button
                      onClick={() => go(-1)}
                      aria-label="Anterior"
                      className="h-9 w-9 rounded-full glass-strong flex items-center justify-center text-white"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => go(1)}
                      aria-label="Următor"
                      className="h-9 w-9 rounded-full glass-strong flex items-center justify-center text-white"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Category list (desktop) */}
            <div className="hidden lg:flex flex-col gap-3">
              {PORTFOLIO.map((p, i) => (
                <button
                  key={p.title}
                  onClick={() => goTo(i)}
                  data-testid={`showcase-tab-${i}`}
                  className={`group relative text-left rounded-2xl p-4 overflow-hidden transition-all duration-300 ${
                    i === index ? "glass border-[#8338EC]/50 glow-ring" : "border border-white/8 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-xl overflow-hidden shrink-0">
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

        {/* mobile dots */}
        <div className="mt-5 flex lg:hidden items-center justify-center gap-2" data-testid="showcase-dots">
          {PORTFOLIO.map((p, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Mergi la ${p.category}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? "w-7 bg-gradient-to-r from-[#3A86FF] to-[#8338EC]" : "w-1.5 bg-white/25"}`}
            />
          ))}
        </div>

        <Reveal delay={0.15}>
          <div className="mt-9 text-center">
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
