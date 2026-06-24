import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useIsMobile, getScrollDir } from "@/hooks/useMediaQuery";

// Dramatic easeOutExpo-style curve for a cinematic, expensive feel.
const EASE = [0.16, 1, 0.3, 1];

/**
 * Reversible cinematic reveal: enters with opacity+translate+scale+blur,
 * exits the same way (direction-aware) so content appears AND disappears
 * smoothly while scrolling both directions. Lighter on mobile, reduced-motion safe.
 */
export const Reveal = ({ children, delay = 0, y = 30, className, blur = true, amount = 0.18 }) => {
  const reduce = useReducedMotion();
  const mobile = useIsMobile();
  const ref = useRef(null);
  const inView = useInView(ref, { amount, margin: "-6% 0px -6% 0px" });

  if (reduce) return <div ref={ref} className={className}>{children}</div>;

  const dy = mobile ? Math.min(y, 16) : y;
  const b = blur && !mobile ? 10 : 0;
  const sFrom = mobile ? 1 : 0.96;
  const exitY = getScrollDir() === "down" ? -dy : dy;

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: dy, scale: sFrom, filter: `blur(${b}px)` }}
      animate={
        inView
          ? { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }
          : { opacity: 0, y: exitY, scale: mobile ? 1 : 0.985, filter: `blur(${b}px)` }
      }
      transition={{
        duration: mobile ? 0.55 : 0.85,
        delay: inView ? (mobile ? 0 : delay) : 0,
        ease: EASE,
      }}
    >
      {children}
    </motion.div>
  );
};

export default Reveal;
