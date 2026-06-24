import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1];

// Scroll-triggered scale-up (camera focusing in)
export const ScaleIn = ({ children, delay = 0, from = 0.85, className }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, scale: from }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: false, margin: "-70px" }}
    transition={{ duration: 0.95, delay, ease: EASE }}
  >
    {children}
  </motion.div>
);

// Staggered translateX entry (camera pan)
export const SlideIn = ({ children, delay = 0, x = -44, className }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, x, filter: "blur(8px)" }}
    whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
    viewport={{ once: false, margin: "-70px" }}
    transition={{ duration: 1, delay, ease: EASE }}
  >
    {children}
  </motion.div>
);

// Ambient floating wrapper
export const Floating = ({ children, delay = 0, className }) => (
  <div className={`animate-float-eff ${className || ""}`} style={{ animationDelay: `${delay}s` }}>
    {children}
  </div>
);

// Scroll parallax (foreground/background depth)
export const Parallax = ({ children, range = 60, className }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [-range / 2, range / 2]);
  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
};

// Standardized cinematic section header
export const SectionHeader = ({ kicker, title, subtitle, center, className }) => (
  <div className={`${center ? "text-center mx-auto" : ""} max-w-2xl ${className || ""}`}>
    {kicker && (
      <SlideIn x={center ? 0 : -30}>
        <span className="cine-kicker text-xs sm:text-sm font-semibold text-[#8338EC]">{kicker}</span>
      </SlideIn>
    )}
    <ScaleIn from={0.9} delay={0.05}>
      <h2 className="font-display font-bold text-white text-4xl sm:text-5xl mt-4 tracking-tight">
        {title}
      </h2>
    </ScaleIn>
    {subtitle && (
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, margin: "-60px" }}
        transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
        className="mt-5 text-white/60 text-base sm:text-lg font-light"
      >
        {subtitle}
      </motion.p>
    )}
  </div>
);
