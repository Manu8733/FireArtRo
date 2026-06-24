import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useIsMobile } from "@/hooks/useMediaQuery";

export const EASE = [0.22, 1, 0.36, 1];

/* ---------------- Scroll reveal: scale-up (camera focusing in) ---------------- */
export const ScaleIn = ({ children, delay = 0, from = 0.92, className }) => {
  const reduce = useReducedMotion();
  const mobile = useIsMobile();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: mobile ? 0.97 : from, y: mobile ? 14 : 0 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: mobile ? 0.55 : 0.9, delay: mobile ? 0 : delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
};

/* ---------------- Scroll reveal: slide-in (camera pan) ---------------- */
export const SlideIn = ({ children, delay = 0, x = -40, className }) => {
  const reduce = useReducedMotion();
  const mobile = useIsMobile();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x: mobile ? 0 : x, y: mobile ? 14 : 0, filter: mobile ? "blur(0px)" : "blur(8px)" }}
      whileInView={{ opacity: 1, x: 0, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: mobile ? 0.5 : 0.95, delay: mobile ? 0 : delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
};

/* ---------------- Staggered container + item ---------------- */
export const Stagger = ({ children, className, amount = 0.2, gap = 0.09 }) => (
  <motion.div
    className={className}
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, margin: "-60px", amount }}
    variants={{ hidden: {}, show: { transition: { staggerChildren: gap } } }}
  >
    {children}
  </motion.div>
);

export const fadeUpVariant = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

export const StaggerItem = ({ children, className }) => (
  <motion.div className={className} variants={fadeUpVariant}>
    {children}
  </motion.div>
);

/* ---------------- Word-by-word headline reveal ---------------- */
export const RevealText = ({ text, className, as: Tag = "span", delay = 0 }) => {
  const reduce = useReducedMotion();
  const words = String(text).split(" ");
  if (reduce) return <Tag className={className}>{text}</Tag>;
  return (
    <Tag className={className} style={{ display: "inline" }}>
      {words.map((w, i) => (
        <span key={i} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top" }}>
          <motion.span
            style={{ display: "inline-block" }}
            initial={{ y: "110%" }}
            whileInView={{ y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.85, delay: delay + i * 0.05, ease: EASE }}
          >
            {w}
          </motion.span>
          {i < words.length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </Tag>
  );
};

/* ---------------- Ambient floating wrapper (CSS, reduced-motion safe) ---------------- */
export const Floating = ({ children, delay = 0, className }) => (
  <div className={`animate-float-eff ${className || ""}`} style={{ animationDelay: `${delay}s` }}>
    {children}
  </div>
);

/* ---------------- Scroll parallax (disabled on mobile / reduced-motion) ---------------- */
export const Parallax = ({ children, range = 60, className }) => {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const mobile = useIsMobile();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [-range / 2, range / 2]);
  if (reduce || mobile) return <div className={className}>{children}</div>;
  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
};

/* ---------------- Standardized cinematic section header ---------------- */
export const SectionHeader = ({ kicker, title, subtitle, center, className, light }) => (
  <div className={`${center ? "text-center mx-auto" : ""} max-w-2xl ${className || ""}`}>
    {kicker && (
      <SlideIn x={center ? 0 : -28}>
        <span className={`inline-flex items-center gap-2 cine-kicker text-[11px] sm:text-xs font-semibold ${light ? "text-white/70" : "text-[#9D7BFF]"}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-[#3A86FF] to-[#8338EC]" />
          {kicker}
        </span>
      </SlideIn>
    )}
    <ScaleIn from={0.94} delay={0.05}>
      <h2 className="font-display font-bold text-white display-md mt-4">{title}</h2>
    </ScaleIn>
    {subtitle && (
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7, delay: 0.12, ease: EASE }}
        className="mt-5 text-white/60 lead font-light"
      >
        {subtitle}
      </motion.p>
    )}
  </div>
);
