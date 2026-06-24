import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Play, Sparkles, Plane, Zap, Clock } from "lucide-react";
import HeroVideo from "@/components/site/HeroVideo";
import Particles from "@/components/site/Particles";
import FloatingLogos from "@/components/site/FloatingLogos";

const scrollTo = (href) => document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });

const BADGES = [
  { icon: Plane, label: "Drone show & artificii" },
  { icon: Sparkles, label: "Spectacole personalizate" },
  { icon: Zap, label: "Efecte speciale pentru evenimente" },
  { icon: Clock, label: "Ofertă rapidă" },
];

const EASE = [0.22, 1, 0.36, 1];
const container = { hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.25 } } };
const slideItem = {
  hidden: { opacity: 0, x: -50, filter: "blur(12px)" },
  show: { opacity: 1, x: 0, filter: "blur(0px)", transition: { duration: 1, ease: EASE } },
};
const fadeItem = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
};

export const Hero = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section
      ref={ref}
      id="acasa"
      className="relative min-h-[100svh] flex items-center overflow-hidden"
      data-testid="hero-section"
    >
      <HeroVideo />
      <FloatingLogos />
      <Particles density={70} className="absolute inset-0 z-10 w-full h-full pointer-events-none" />

      {/* Floating aurora trails */}
      <div className="absolute -top-1/4 -right-1/4 w-[60vw] h-[60vw] rounded-full bg-[#8338EC]/12 blur-[120px] z-[5] animate-float-eff" />
      <div className="absolute bottom-0 -left-1/4 w-[50vw] h-[50vw] rounded-full bg-[#3A86FF]/12 blur-[120px] z-[5] animate-float-eff" style={{ animationDelay: "2s" }} />

      <motion.div style={{ y, opacity }} className="relative z-20 max-w-7xl mx-auto px-6 md:px-12 w-full pt-32 pb-24">
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-4xl">
          <motion.div variants={fadeItem} className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-7">
            <span className="h-2 w-2 rounded-full bg-[#8338EC] animate-glow-pulse" />
            <span className="cine-kicker text-[10px] sm:text-xs font-medium text-white/80">
              Drone Shows · Artificii · Efecte Speciale
            </span>
          </motion.div>

          <h1 className="font-display font-bold text-white text-[2.6rem] leading-[1.04] sm:text-6xl lg:text-7xl tracking-tight">
            <motion.span variants={slideItem} className="block">
              Spectacole de drone și artificii
            </motion.span>
            <motion.span variants={slideItem} className="block">
              create pentru{" "}
              <span className="text-gradient text-bloom">momente imposibil de uitat</span>
            </motion.span>
          </h1>

          <motion.p
            variants={fadeItem}
            className="mt-7 text-base sm:text-lg text-white/70 font-light leading-relaxed max-w-2xl"
          >
            FIREARTRO transformă nunți, evenimente corporate, festivaluri și lansări în
            experiențe vizuale cinematice, cu drone show-uri, artificii și efecte speciale
            sincronizate.
          </motion.p>

          <motion.div variants={fadeItem} className="mt-9 flex flex-col sm:flex-row gap-4">
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              transition={{ duration: 0.3, ease: EASE }}
              onClick={() => scrollTo("#contact")}
              data-testid="hero-primary-cta"
              className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#3A86FF] to-[#8338EC] text-white font-semibold px-8 py-4 rounded-full hover:shadow-[0_0_36px_rgba(131,56,236,0.6)]"
            >
              Solicită ofertă
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              transition={{ duration: 0.3, ease: EASE }}
              onClick={() => scrollTo("#spectacole")}
              data-testid="hero-secondary-cta"
              className="inline-flex items-center justify-center gap-2 glass text-white font-semibold px-8 py-4 rounded-full hover:bg-white/10"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
                <Play className="h-3 w-3 fill-white" />
              </span>
              Vezi spectacolele
            </motion.button>
          </motion.div>

          <motion.div variants={fadeItem} className="mt-12 flex flex-wrap gap-x-7 gap-y-3">
            {BADGES.map((b) => (
              <div key={b.label} className="flex items-center gap-2 text-white/55">
                <b.icon className="h-4 w-4 text-[#5AA9FF]" />
                <span className="text-xs sm:text-sm font-medium">{b.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.button
        onClick={() => scrollTo("#intro")}
        style={{ opacity }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 hidden md:flex flex-col items-center gap-2"
        aria-label="Scroll în jos"
        data-testid="hero-scroll-indicator"
      >
        <span className="text-[10px] uppercase tracking-[0.25em] text-white/40">Scroll</span>
        <div className="h-10 w-6 rounded-full border border-white/20 flex justify-center pt-2">
          <motion.span
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.6 }}
            className="h-1.5 w-1.5 rounded-full bg-white/60"
          />
        </div>
      </motion.button>
    </section>
  );
};

export default Hero;
