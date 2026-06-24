import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useIsMobile, getScrollDir } from "@/hooks/useMediaQuery";

const EASE = [0.22, 1, 0.36, 1];

/**
 * Reversible cinematic reveal.
 * - Enters viewport: opacity 0→1, translateY+→0, blur→0
 * - Leaves viewport: reverses (direction-aware translate) so content
 *   appears and disappears smoothly while scrolling both ways.
 * Lighter on mobile, disabled for prefers-reduced-motion.
 */
export const Reveal = ({ children, delay = 0, y = 28, className, blur = true, amount = 0.18 }) => {
  const reduce = useReducedMotion();
  const mobile = useIsMobile();
  const ref = useRef(null);
  const inView = useInView(ref, { amount, margin: "-6% 0px -6% 0px" });

  if (reduce) return <div ref={ref} className={className}>{children}</div>;

  const dy = mobile ? Math.min(y, 14) : y;
  const b = blur && !mobile ? 8 : 0;
  const exitY = getScrollDir() === "down" ? -dy : dy;

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: dy, filter: `blur(${b}px)` }}
      animate={
        inView
          ? { opacity: 1, y: 0, filter: "blur(0px)" }
          : { opacity: 0, y: exitY, filter: `blur(${b}px)` }
      }
      transition={{
        duration: mobile ? 0.5 : 0.72,
        delay: inView ? (mobile ? 0 : delay) : 0,
        ease: EASE,
      }}
    >
      {children}
    </motion.div>
  );
};

export default Reveal;
