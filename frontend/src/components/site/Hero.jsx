import { motion } from "framer-motion";
import { ArrowRight, Play, Sparkles, Plane, Zap, Clock } from "lucide-react";
import HeroVideo from "@/components/site/HeroVideo";
import Particles from "@/components/site/Particles";

const scrollTo = (href) => document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });

const BADGES = [
  { icon: Plane, label: "Drone show & artificii" },
  { icon: Sparkles, label: "Spectacole personalizate" },
  { icon: Zap, label: "Efecte speciale pentru evenimente" },
  { icon: Clock, label: "Ofertă rapidă" },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.11, delayChildren: 0.25 } },
};
const item = {
  hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
};

export const Hero = () => {
  return (
    <section
      id="acasa"
      className="relative min-h-[100svh] flex items-center overflow-hidden"
      data-testid="hero-section"
    >
      <HeroVideo />
      <Particles density={70} className="absolute inset-0 z-10 w-full h-full pointer-events-none" />

      {/* Aurora light trails */}
      <div className="absolute -top-1/4 -right-1/4 w-[60vw] h-[60vw] rounded-full bg-[#8338EC]/10 blur-[120px] z-[5] animate-glow-pulse" />
      <div className="absolute bottom-0 -left-1/4 w-[50vw] h-[50vw] rounded-full bg-[#3A86FF]/10 blur-[120px] z-[5]" />

      <div className="relative z-20 max-w-7xl mx-auto px-6 md:px-12 w-full pt-32 pb-24">
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-4xl">
          <motion.div variants={item} className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-7">
            <span className="h-2 w-2 rounded-full bg-[#8338EC] animate-glow-pulse" />
            <span className="text-xs sm:text-sm font-medium tracking-wide text-white/80">
              Drone Shows · Artificii · Efecte Speciale
            </span>
          </motion.div>

          <motion.h1
            variants={item}
            className="font-display font-bold text-white text-[2.6rem] leading-[1.04] sm:text-6xl lg:text-7xl tracking-tight"
          >
            Spectacole de drone și artificii create pentru{" "}
            <span className="text-gradient">momente imposibil de uitat</span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-7 text-base sm:text-lg text-white/70 font-light leading-relaxed max-w-2xl"
          >
            FIREARTRO transformă nunți, evenimente corporate, festivaluri și lansări în
            experiențe vizuale cinematice, cu drone show-uri, artificii și efecte speciale
            sincronizate.
          </motion.p>

          <motion.div variants={item} className="mt-9 flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => scrollTo("#contact")}
              data-testid="hero-primary-cta"
              className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#3A86FF] to-[#8338EC] text-white font-semibold px-8 py-4 rounded-full hover:shadow-[0_0_36px_rgba(131,56,236,0.6)] transition-all duration-300"
            >
              Solicită ofertă
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => scrollTo("#spectacole")}
              data-testid="hero-secondary-cta"
              className="inline-flex items-center justify-center gap-2 glass text-white font-semibold px-8 py-4 rounded-full hover:bg-white/10 transition-all duration-300"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
                <Play className="h-3 w-3 fill-white" />
              </span>
              Vezi spectacolele
            </button>
          </motion.div>

          <motion.div variants={item} className="mt-12 flex flex-wrap gap-x-7 gap-y-3">
            {BADGES.map((b) => (
              <div key={b.label} className="flex items-center gap-2 text-white/55">
                <b.icon className="h-4 w-4 text-[#5AA9FF]" />
                <span className="text-xs sm:text-sm font-medium">{b.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      <motion.button
        onClick={() => scrollTo("#intro")}
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
