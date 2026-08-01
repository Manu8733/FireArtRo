import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import HeroVideo from "@/components/site/HeroVideo";
import HeroTypingTitle from "@/components/site/HeroTypingTitle";
import NightButton from "@/components/night/NightButton";

const EASE = [0.16, 1, 0.3, 1];

export const Hero = () => {
  const heroRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const mediaScale = useTransform(scrollYProgress, [0, 1], [1, 1.045]);
  const copyY = useTransform(scrollYProgress, [0, 0.72], [0, -42]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.62, 0.88], [1, 1, 0]);

  return (
    <section
      ref={heroRef}
      id="acasa"
      className="nr-hero"
      data-testid="hero-section"
      aria-labelledby="nr-hero-title"
    >
      <motion.div
        className="nr-hero__media"
        style={reduceMotion ? undefined : { scale: mediaScale }}
        aria-hidden="true"
      >
        <HeroVideo />
      </motion.div>
      <div className="nr-hero__veil" aria-hidden="true" />

      <motion.div
        className="nr-hero__content nr-shell"
        data-testid="hero-composition"
        style={reduceMotion ? undefined : { y: copyY, opacity: copyOpacity }}
        initial={reduceMotion ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.9, delay: 0.12, ease: EASE }}
      >
        <p className="nr-hero__eyebrow">Drone · artificii · efecte scenice</p>
        <HeroTypingTitle />
        <p className="nr-hero__description">
          Momente create pentru nunți, festivaluri și evenimente de brand.
        </p>
        <div className="nr-hero__actions">
          <NightButton to="/contact" data-testid="hero-primary-cta">Cere oferta</NightButton>
          <NightButton to="/galerie" variant="secondary" data-testid="hero-secondary-cta">
            Vezi galeria
          </NightButton>
        </div>
      </motion.div>

    </section>
  );
};

export default Hero;
