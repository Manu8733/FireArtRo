import { motion, useScroll, useSpring, useReducedMotion } from "framer-motion";

// Thin cinematic scroll-progress bar (movie-launch feel) fixed at the very top.
export default function ScrollProgress() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });
  if (reduce) return null;
  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-[3px] origin-left z-[60] bg-gradient-to-r from-[#29B6F6] via-[#176BFF] to-[#8F6BFF] shadow-[0_0_12px_rgba(23,107,255,0.72)]"
      aria-hidden="true"
      data-testid="scroll-progress"
    />
  );
}
