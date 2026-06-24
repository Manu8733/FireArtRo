import { useRef } from "react";
import { motion, useScroll, useTransform, useInView, useReducedMotion } from "framer-motion";
import { useIsMobile, getScrollDir } from "@/hooks/useMediaQuery";

export const EASE = [0.22, 1, 0.36, 1];

const useReveal = (amount = 0.2) => {
  const ref = useRef(null);
  const inView = useInView(ref, { amount, margin: "-6% 0px -6% 0px" });
  return [ref, inView];
};

/* ---------------- Reversible scale-up (camera focusing in) ---------------- */
export const ScaleIn = ({ children, delay = 0, from = 0.94, className }) => {
  const reduce = useReducedMotion();
  const mobile = useIsMobile();
  const [ref, inView] = useReveal(0.2);
  if (reduce) return <div ref={ref} className={className}>{children}</div>;
  const scaleFrom = mobile ? 0.98 : from;
  const yFrom = mobile ? 12 : 0;
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, scale: scaleFrom, y: yFrom }}
      animate={inView ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: scaleFrom, y: yFrom }}
      transition={{ duration: mobile ? 0.5 : 0.8, delay: inView ? (mobile ? 0 : delay) : 0, ease: EASE }}
    >
      {children}
    </motion.div>
  );
};

/* ---------------- Reversible slide-in (camera pan) ---------------- */
export const SlideIn = ({ children, delay = 0, x = -36, className }) => {
  const reduce = useReducedMotion();
  const mobile = useIsMobile();
  const [ref, inView] = useReveal(0.2);
  if (reduce) return <div ref={ref} className={className}>{children}</div>;
  const xFrom = mobile ? 0 : x;
  const yFrom = mobile ? 12 : 0;
  const b = mobile ? 0 : 8;
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, x: xFrom, y: yFrom, filter: `blur(${b}px)` }}
      animate={
        inView
          ? { opacity: 1, x: 0, y: 0, filter: "blur(0px)" }
          : { opacity: 0, x: xFrom, y: yFrom, filter: `blur(${b}px)` }
      }
      transition={{ duration: mobile ? 0.5 : 0.85, delay: inView ? (mobile ? 0 : delay) : 0, ease: EASE }}
    >
      {children}
    </motion.div>
  );
};

/* ---------------- Reversible staggered container + item ---------------- */
export const Stagger = ({ children, className, amount = 0.18, gap = 0.08 }) => {
  const [ref, inView] = useReveal(amount);
  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap } } }}
    >
      {children}
    </motion.div>
  );
};

export const fadeUpVariant = {
  hidden: { opacity: 0, y: 22, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease: EASE } },
};

export const StaggerItem = ({ children, className }) => {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} variants={fadeUpVariant}>
      {children}
    </motion.div>
  );
};

/* ---------------- Reversible word-by-word headline reveal ---------------- */
export const RevealText = ({ text, className, as: Tag = "span", delay = 0 }) => {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.4, margin: "-8% 0px -8% 0px" });
  const words = String(text).split(" ");
  if (reduce) return <Tag ref={ref} className={className}>{text}</Tag>;
  return (
    <Tag ref={ref} className={className} style={{ display: "inline" }}>
      {words.map((w, i) => (
        <span key={i} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top" }}>
          <motion.span
            style={{ display: "inline-block" }}
            initial={{ y: "110%" }}
            animate={inView ? { y: 0 } : { y: "110%" }}
            transition={{ duration: 0.75, delay: inView ? delay + i * 0.05 : 0, ease: EASE }}
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

/* ---------------- Reversible cinematic section header ---------------- */
const headerVariants = (dy, b, down) => ({
  initial: { opacity: 0, y: dy, filter: `blur(${b}px)` },
  in: { opacity: 1, y: 0, filter: "blur(0px)" },
  out: { opacity: 0, y: down ? -dy : dy, filter: `blur(${b}px)` },
});

const HeaderLine = ({ inView, reduce, mobile, delay = 0, dy = 22, className, children }) => {
  if (reduce) return <div className={className}>{children}</div>;
  const v = headerVariants(mobile ? Math.min(dy, 14) : dy, mobile ? 0 : 8, getScrollDir() === "down");
  return (
    <motion.div
      className={className}
      initial={v.initial}
      animate={inView ? v.in : v.out}
      transition={{ duration: mobile ? 0.5 : 0.7, delay: inView ? (mobile ? 0 : delay) : 0, ease: EASE }}
    >
      {children}
    </motion.div>
  );
};

export const SectionHeader = ({ kicker, title, subtitle, center, className, light }) => {
  const reduce = useReducedMotion();
  const mobile = useIsMobile();
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.3, margin: "-6% 0px -6% 0px" });

  return (
    <div ref={ref} className={`${center ? "text-center mx-auto" : ""} max-w-2xl ${className || ""}`}>
      {kicker && (
        <HeaderLine inView={inView} reduce={reduce} mobile={mobile} dy={16}>
          <span className={`inline-flex items-center gap-2 cine-kicker text-[10px] sm:text-[11px] font-semibold ${light ? "text-white/70" : "text-[#9D7BFF]"}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-[#3A86FF] to-[#8338EC]" />
            {kicker}
          </span>
        </HeaderLine>
      )}
      <HeaderLine inView={inView} reduce={reduce} mobile={mobile} delay={0.06}>
        <h2 className="font-display font-bold text-white display-md mt-4">{title}</h2>
      </HeaderLine>
      {subtitle && (
        <HeaderLine inView={inView} reduce={reduce} mobile={mobile} delay={0.12}>
          <p className="mt-4 text-white/60 lead font-light">{subtitle}</p>
        </HeaderLine>
      )}
    </div>
  );
};
