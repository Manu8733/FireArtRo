import { useRef, useState, useCallback } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { ArrowRight } from "lucide-react";
import { STORY } from "@/data/content";
import { useIsMobile } from "@/hooks/useMediaQuery";

const EASE = [0.22, 1, 0.36, 1];
const scrollTo = (href) => document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

/* ---------------- Drone-dot constellation (desktop, cheap) ---------------- */
const DOTS = [
  [12, 22], [20, 38], [9, 64], [28, 16], [33, 52], [24, 78],
  [70, 20], [80, 40], [66, 66], [88, 28], [76, 80], [92, 58], [58, 34], [84, 14],
];
const LINES = [[0, 1], [1, 2], [0, 3], [1, 4], [4, 5], [6, 7], [7, 8], [6, 9], [9, 13], [7, 11], [8, 10], [6, 12]];
const Constellation = () => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.5]" aria-hidden="true">
    {LINES.map(([a, b], i) => (
      <line
        key={i}
        x1={`${DOTS[a][0]}%`} y1={`${DOTS[a][1]}%`}
        x2={`${DOTS[b][0]}%`} y2={`${DOTS[b][1]}%`}
        stroke="rgba(131,56,236,0.18)" strokeWidth="1"
      />
    ))}
    {DOTS.map(([x, y], i) => (
      <circle
        key={i} cx={`${x}%`} cy={`${y}%`} r={i % 4 === 0 ? 2.4 : 1.4}
        fill={i % 3 === 0 ? "#5AA9FF" : "#9D7BFF"}
        className="animate-twinkle"
        style={{ animationDelay: `${(i % 6) * 0.5}s` }}
      />
    ))}
  </svg>
);

/* ---------------- Vertical scroll-progress rail ---------------- */
const RailSeg = ({ progress, index, total, active, onClick, no }) => {
  const fill = useTransform(progress, (v) => `${clamp(v * total - index, 0, 1) * 100}%`);
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={`chapter-dot-${index}`}
      aria-label={`Scena ${index + 1}`}
      className="group flex items-center gap-2"
    >
      <span className={`font-mono text-[10px] tabular-nums transition-colors ${active ? "text-white" : "text-white/30 group-hover:text-white/60"}`}>{no}</span>
      <span className={`relative rounded-full overflow-hidden bg-white/12 transition-[height] duration-500 w-1 ${active ? "h-9" : "h-5"}`}>
        <motion.span className="absolute inset-x-0 top-0 rounded-full bg-gradient-to-b from-[#3A86FF] to-[#8338EC]" style={{ height: fill }} />
      </span>
    </button>
  );
};

/* ---------------- Mobile: one scene per screen (reversible) ---------------- */
const MobileStory = () => {
  const reduce = useReducedMotion();
  return (
    <section id="povestea" className="relative bg-[#050308] py-16" data-testid="chapters-section">
      <div className="aurora opacity-50" />
      <div className="relative max-w-md mx-auto px-5 text-center">
        <span className="cine-kicker text-[10px] font-semibold text-[#9D7BFF]">Călătoria FIREARTRO</span>
        <h2 className="mt-3 font-display font-bold text-white display-md">De la idee la momentul de neuitat</h2>
      </div>

      <div className="relative mt-6">
        {STORY.map((s, i) => (
          <motion.article
            key={s.no}
            data-testid={`chapter-media-${i}`}
            className="relative min-h-[78vh] flex flex-col justify-center px-5 max-w-md mx-auto"
            initial={reduce ? false : { opacity: 0, y: 24, filter: "blur(8px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ amount: 0.35, margin: "-4% 0px -4% 0px" }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <div className="relative rounded-3xl overflow-hidden glass">
              <div className="relative h-56 overflow-hidden">
                <img src={s.image} alt={s.title} loading="lazy" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0712] via-[#0A0712]/30 to-transparent" />
                <div className="absolute top-4 left-4 font-display font-bold text-white/90 text-3xl text-bloom">{s.no}</div>
                <div className="absolute bottom-4 left-4 glass-strong rounded-full px-3 py-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-white">{s.kicker}</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-display font-semibold title-card text-white">{s.title}</h3>
                <p className="mt-2.5 text-white/60 body-sm font-light">{s.text}</p>
              </div>
            </div>
            <div className="mt-3 text-center text-[11px] font-mono text-white/30">{s.no} / 0{STORY.length}</div>
          </motion.article>
        ))}
      </div>

      <div className="text-center mt-2">
        <button onClick={() => scrollTo("#contact")} className="inline-flex items-center gap-2 bg-gradient-to-r from-[#3A86FF] to-[#8338EC] text-white font-semibold px-6 py-3.5 rounded-full">
          Hai să scriem povestea ta <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
};

/* ---------------- Desktop: pinned cinematic journey ---------------- */
const DesktopStory = () => {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setActive(clamp(Math.floor(v * STORY.length), 0, STORY.length - 1));
  });

  const goTo = useCallback((i) => {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const total = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + ((i + 0.5) / STORY.length) * total, behavior: "smooth" });
  }, []);

  const onMove = (e) => {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ x: -py * 8, y: px * 12 });
  };
  const onLeave = () => setTilt({ x: 0, y: 0 });

  const sc = STORY[active];

  return (
    <section
      ref={ref}
      id="povestea"
      className="relative bg-[#050308]"
      style={{ height: `${STORY.length * 85}vh` }}
      data-testid="chapters-section"
    >
      <div className="sticky top-0 h-screen overflow-hidden flex items-center">
        {/* Scene-tinted layered background */}
        <motion.div
          className="absolute inset-0"
          animate={{
            background: `radial-gradient(60% 60% at 75% 30%, ${sc.glow}22, transparent 60%), radial-gradient(55% 55% at 20% 80%, ${sc.glow}14, transparent 55%)`,
          }}
          transition={{ duration: 1.1, ease: EASE }}
        />
        <Constellation />

        {/* Floating light trails */}
        <div className="absolute left-[8%] top-1/4 h-40 w-px bg-gradient-to-b from-transparent via-[#5AA9FF]/40 to-transparent animate-trail" />
        <div className="absolute right-[14%] top-1/3 h-56 w-px bg-gradient-to-b from-transparent via-[#9D7BFF]/40 to-transparent animate-trail" style={{ animationDelay: "1.5s" }} />
        <div className="absolute left-1/3 bottom-1/4 h-32 w-px bg-gradient-to-b from-transparent via-[#C77DFF]/40 to-transparent animate-trail" style={{ animationDelay: "0.8s" }} />

        {/* Progress rail */}
        <div className="absolute right-5 lg:right-8 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2.5">
          {STORY.map((s, i) => (
            <RailSeg key={s.no} progress={scrollYProgress} index={i} total={STORY.length} active={i === active} no={s.no} onClick={() => goTo(i)} />
          ))}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left — text */}
          <div className="relative order-2 md:order-1">
            <span className="cine-kicker text-[11px] sm:text-xs font-semibold text-[#9D7BFF]">Călătoria FIREARTRO</span>
            <AnimatePresence mode="wait">
              <motion.div
                key={sc.no}
                initial={{ opacity: 0, y: 34, filter: "blur(12px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -28, filter: "blur(12px)" }}
                transition={{ duration: 0.55, ease: EASE }}
              >
                <div className="font-display font-bold text-white leading-[0.85] text-[4.5rem] xl:text-[6.5rem] text-bloom mt-2">{sc.no}</div>
                <div className="cine-kicker text-[#9D7BFF] label-xs mt-3">{sc.kicker}</div>
                <h3 className="font-display font-semibold text-white display-md mt-3 max-w-md">{sc.title}</h3>
                <p className="mt-3.5 text-white/60 lead font-light max-w-sm">{sc.text}</p>
              </motion.div>
            </AnimatePresence>
            <div className="mt-8 font-mono text-sm text-white/40 tabular-nums">
              <span className="text-white">{sc.no}</span> / 0{STORY.length}
            </div>
          </div>

          {/* Right — 3D media card */}
          <div className="relative order-1 md:order-2 perspective" onMouseMove={onMove} onMouseLeave={onLeave}>
            <motion.div
              className="relative h-[360px] lg:h-[480px] preserve-3d"
              animate={{ rotateX: tilt.x, rotateY: tilt.y }}
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
            >
              <div className="absolute -inset-6 rounded-[2rem] blur-3xl opacity-60" style={{ background: `radial-gradient(circle, ${sc.glow}55, transparent 70%)` }} />
              {STORY.map((s, i) => (
                <motion.div
                  key={s.no}
                  className="absolute inset-0 rounded-[1.6rem] overflow-hidden glass backface-hidden"
                  data-testid={`chapter-media-${i}`}
                  style={{ transform: "translateZ(40px)", zIndex: i === active ? 2 : 1 }}
                  animate={{ opacity: i === active ? 1 : 0, scale: i === active ? 1 : 1.05 }}
                  transition={{ duration: 0.9, ease: EASE }}
                >
                  <img src={s.image} alt={s.title} loading="lazy" className={`w-full h-full object-cover ${i === active ? "animate-ken-burns" : ""}`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050308] via-[#050308]/10 to-transparent" />
                  <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-[1.6rem] pointer-events-none" />
                  <div className="absolute bottom-5 left-5 glass-strong rounded-full px-4 py-2" style={{ transform: "translateZ(60px)" }}>
                    <span className="text-xs font-semibold uppercase tracking-wider text-white">{s.kicker}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.25em] text-white/30 flex items-center gap-2">
          <span className="inline-block w-5 h-px bg-white/20" />
          Derulează pentru a trăi povestea
          <span className="inline-block w-5 h-px bg-white/20" />
        </div>
      </div>
    </section>
  );
};

export const Chapters = () => {
  const mobile = useIsMobile();
  return mobile ? <MobileStory /> : <DesktopStory />;
};

export default Chapters;
