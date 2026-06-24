import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { ArrowRight, Play, Sparkles, Plane, Zap, ShieldCheck, Star } from "lucide-react";
import HeroVideo from "@/components/site/HeroVideo";
import Particles from "@/components/site/Particles";
import FloatingLogos from "@/components/site/FloatingLogos";
import { MagneticButton } from "@/components/site/cinematic";
import { useIsMobile } from "@/hooks/useMediaQuery";

const scrollTo = (href) => document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });

const BADGES = [
  { icon: Plane, label: "Drone show & artificii" },
  { icon: Sparkles, label: "Concept personalizat" },
  { icon: ShieldCheck, label: "Echipă autorizată" },
  { icon: Zap, label: "Ofertă în 24h" },
];

const EASE = [0.22, 1, 0.36, 1];
const container = { hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } } };
const slideItem = {
  hidden: { opacity: 0, y: 34, filter: "blur(10px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 1, ease: EASE } },
};
const fadeItem = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
};

export const Hero = () => {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const mobile = useIsMobile();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, mobile ? 70 : 180]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, mobile ? 1.08 : 1.22]);
  const bgY = useTransform(scrollYProgress, [0, 1], [0, mobile ? 30 : 80]);
  const trailY1 = useTransform(scrollYProgress, [0, 1], [0, -140]);
  const trailY2 = useTransform(scrollYProgress, [0, 1], [0, 120]);

  return (
    <section
      ref={ref}
      id="acasa"
      className="relative min-h-[100svh] flex items-center overflow-hidden"
      data-testid="hero-section"
    >
      {/* Background depth layer (cinematic zoom-in on scroll) */}
      <motion.div
        className="absolute inset-0 z-0"
        style={reduce ? undefined : { scale: bgScale, y: bgY }}
      >
        <HeroVideo />
      </motion.div>
      {!mobile && <FloatingLogos />}
      {!mobile && (
        <Particles density={60} className="absolute inset-0 z-10 w-full h-full pointer-events-none" />
      )}

      {/* Floating + parallax aurora trails */}
      <motion.div
        style={reduce ? undefined : { y: trailY1 }}
        className="absolute -top-1/4 -right-1/4 w-[60vw] h-[60vw] rounded-full bg-[#8338EC]/12 blur-[120px] z-[5] animate-float-eff"
      />
      <motion.div
        style={reduce ? undefined : { y: trailY2 }}
        className="absolute bottom-0 -left-1/4 w-[50vw] h-[50vw] rounded-full bg-[#3A86FF]/12 blur-[120px] z-[5] animate-float-eff"
      />

      <motion.div
        style={reduce ? undefined : { y, opacity }}
        className="relative z-20 max-w-7xl mx-auto px-5 sm:px-6 md:px-12 w-full pt-28 pb-20 md:pt-32 md:pb-24"
      >
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-4xl">
          <motion.div variants={fadeItem} className="inline-flex items-center gap-2 glass rounded-full px-3.5 py-1.5 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-[#8338EC] animate-glow-pulse" />
            <span className="cine-kicker text-[9px] sm:text-[11px] font-semibold text-white/80">
              Drone Shows · Artificii · Efecte Speciale
            </span>
          </motion.div>

          <h1 className="font-display font-extrabold text-white display-xl">
            <motion.span variants={slideItem} className="block">
              Spectacole de drone și artificii
            </motion.span>
            <motion.span variants={slideItem} className="block">
              pentru{" "}
              <span className="text-gradient text-bloom">momente imposibil de uitat</span>
            </motion.span>
          </h1>

          <motion.p
            variants={fadeItem}
            className="mt-5 text-sm sm:text-base text-white/70 font-light leading-relaxed max-w-xl"
          >
            Drone show-uri, artificii și efecte speciale sincronizate — pentru nunți,
            evenimente corporate, festivaluri și lansări de neuitat.
          </motion.p>

          <motion.div variants={fadeItem} className="mt-8 flex flex-col xs:flex-row gap-3 sm:gap-4">
            <MagneticButton
              onClick={() => scrollTo("#contact")}
              data-testid="hero-primary-cta"
              className="btn-grad shine group inline-flex items-center justify-center gap-2 text-white font-semibold px-7 py-3.5 sm:px-8 sm:py-4 rounded-full"
            >
              Solicită ofertă
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </MagneticButton>
            <MagneticButton
              onClick={() => scrollTo("#spectacole")}
              data-testid="hero-secondary-cta"
              className="shine inline-flex items-center justify-center gap-2 glass text-white font-semibold px-7 py-3.5 sm:px-8 sm:py-4 rounded-full hover:bg-white/10"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
                <Play className="h-3 w-3 fill-white" />
              </span>
              Vezi spectacolele
            </MagneticButton>
          </motion.div>

          {/* Trust strip */}
          <motion.div variants={fadeItem} className="mt-9 flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-[#FFB703] text-[#FFB703]" />
              ))}
              <span className="ml-1.5 text-sm text-white/65">150+ spectacole regizate</span>
            </div>
          </motion.div>

          <motion.div variants={fadeItem} className="mt-5 flex flex-wrap gap-x-5 gap-y-2.5">
            {BADGES.map((b, i) => (
              <div
                key={b.label}
                className={`${i > 1 ? "hidden sm:flex" : "flex"} items-center gap-2 text-white/55`}
              >
                <b.icon className="h-4 w-4 text-[#5AA9FF]" />
                <span className="text-xs sm:text-sm font-medium">{b.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.button
        onClick={() => scrollTo("#intro")}
        style={reduce ? undefined : { opacity }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="absolute bottom-7 left-1/2 -translate-x-1/2 z-20 hidden md:flex flex-col items-center gap-2"
        aria-label="Scroll în jos"
        data-testid="hero-scroll-indicator"
      >
        <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">Scroll</span>
        <div className="h-10 w-6 rounded-full border border-white/20 flex justify-center pt-2">
          <motion.span
            animate={reduce ? undefined : { y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.6 }}
            className="h-1.5 w-1.5 rounded-full bg-white/60"
          />
        </div>
      </motion.button>
    </section>
  );
};

export default Hero;
