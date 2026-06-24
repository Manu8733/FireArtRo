import { motion, useReducedMotion } from "framer-motion";
import { useIsMobile } from "@/hooks/useMediaQuery";

const EASE = [0.22, 1, 0.36, 1];

// Premium scroll reveal — lighter on mobile, disabled for reduced-motion.
export const Reveal = ({ children, delay = 0, y = 26, className, blur = true }) => {
  const reduce = useReducedMotion();
  const mobile = useIsMobile();

  if (reduce) return <div className={className}>{children}</div>;

  const dy = mobile ? Math.min(y, 16) : y;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: dy, filter: blur && !mobile ? "blur(6px)" : "blur(0px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: mobile ? 0.5 : 0.8,
        delay: mobile ? Math.min(delay, 0.12) : delay,
        ease: EASE,
      }}
    >
      {children}
    </motion.div>
  );
};

export default Reveal;
