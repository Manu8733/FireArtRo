import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import HeroVideo from "@/components/site/HeroVideo";
import Particles from "@/components/site/Particles";
import FloatingLogos from "@/components/site/FloatingLogos";
import { MagneticButton } from "@/components/site/cinematic";
import { useIsAppleWebKit, useIsMobile, useIsTouchDevice } from "@/hooks/useMediaQuery";
import { TRUST_BADGES } from "@/data/businessContent";
import { goToContact } from "@/lib/contactNavigation";

const scrollTo = (href) => document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });

const EASE = [0.22, 1, 0.36, 1];
const container = { hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } } };
const fadeItem = {
  hidden: { opacity: 1, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } },
};

export const Hero = () => {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const mobile = useIsMobile();
  const touch = useIsTouchDevice();
  const appleWebKit = useIsAppleWebKit();
  const constrainedMotion = mobile || touch;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const trailY1 = useTransform(scrollYProgress, [0, 1], [0, -140]);
  const trailY2 = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const frameScale = useTransform(scrollYProgress, [0, 0.68, 1], [1, 1, 0.94]);
  const frameY = useTransform(scrollYProgress, [0, 0.68, 1], [0, 0, -34]);
  const frameRadius = useTransform(scrollYProgress, [0, 0.7, 1], ["0px", "0px", "34px"]);
  const frameClip = useTransform(
    scrollYProgress,
    [0, 0.72, 1],
    [
      "inset(0% 0% 0% 0% round 0px)",
      "inset(0% 0% 0% 0% round 0px)",
      "inset(2.5% 2% 2.5% 2% round 34px)",
    ]
  );

  return (
    <section
      ref={ref}
      id="acasa"
      className="relative h-[108svh] md:h-[112svh]"
      data-testid="hero-section"
    >
      <motion.div
        className="apple-viewport-height sticky top-0 h-[100svh] flex items-center overflow-hidden cinema-hero-frame"
        style={
          reduce || constrainedMotion
            ? undefined
            : {
                scale: frameScale,
                y: frameY,
                borderRadius: frameRadius,
                clipPath: frameClip,
              }
        }
      >
      {/* Background depth layer (cinematic zoom-in on scroll) */}
      <div className="hero-media-shell absolute inset-0 z-0">
        <HeroVideo />
      </div>
      {!constrainedMotion && <FloatingLogos />}
      {!constrainedMotion && (
        <Particles density={appleWebKit ? 38 : 60} className="absolute inset-0 z-10 w-full h-full pointer-events-none" />
      )}

      {/* Floating + parallax aurora trails */}
      <motion.div
        style={reduce || constrainedMotion ? undefined : { y: trailY1 }}
        className="hero-aurora hero-aurora-top absolute -top-1/4 -right-1/4 z-[5] h-[60vw] w-[60vw] rounded-full animate-float-eff"
      />
      <motion.div
        style={reduce || constrainedMotion ? undefined : { y: trailY2 }}
        className="hero-aurora hero-aurora-bottom absolute bottom-0 -left-1/4 z-[5] h-[50vw] w-[50vw] rounded-full animate-float-eff"
      />

      <div className="relative z-20 max-w-7xl mx-auto px-5 sm:px-6 md:px-12 w-full pt-28 pb-20 md:pt-28 md:pb-20">
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-3xl">
          <h1 className="max-w-[14ch] font-display text-[clamp(1.75rem,3.7vw,3.45rem)] font-extrabold leading-[1.07] tracking-[-0.04em] text-white">
            Spectacole de drone și artificii pentru
            <span className="text-gradient text-bloom"> momente imposibil de uitat</span>
          </h1>

          <motion.p
            variants={fadeItem}
            className="mt-5 text-sm sm:text-base text-white/70 font-light leading-relaxed max-w-xl"
          >
            FireArtRo transformă evenimentele în experiențe vizuale cinematice, cu drone show-uri, artificii și efecte speciale sincronizate.
          </motion.p>

          <motion.div variants={fadeItem} className="mt-8 flex flex-col xs:flex-row gap-3 sm:gap-4">
            <MagneticButton
              onClick={() => goToContact()}
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

          <motion.ul variants={fadeItem} className="hero-trust-badges" aria-label="Avantaje FireArtRo">
            {TRUST_BADGES.map((badge) => (
              <li key={badge}>{badge}</li>
            ))}
          </motion.ul>
        </motion.div>
      </div>

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
      </motion.div>
    </section>
  );
};

export default Hero;
