import { useRef } from "react";
import { motion, useInView, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { PROCESS } from "@/data/content";

const EASE = [0.16, 1, 0.3, 1];
const scrollTo = (href) => document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
const BURST_RAYS = Array.from({ length: 16 }, (_, index) => index);
const BURST_DOTS = Array.from({ length: 12 }, (_, index) => index);

const ProcessFinale = ({ reduce }) => {
  const ref = useRef(null);
  const visible = useInView(ref, { once: true, amount: 0.58 });

  return (
    <motion.div
      ref={ref}
      className="process-finale"
      initial={reduce ? false : { opacity: 0, y: 24 }}
      animate={visible || reduce ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.7, ease: EASE }}
    >
      <div className={`process-firework ${visible ? "is-active" : ""}`} aria-hidden="true">
        <span className="process-firework-core" />
        {BURST_RAYS.map((ray) => (
          <i key={`ray-${ray}`} className="process-firework-ray" style={{ "--ray": ray }} />
        ))}
        {BURST_DOTS.map((dot) => (
          <b key={`dot-${dot}`} className="process-firework-dot" style={{ "--dot": dot }} />
        ))}
      </div>
      <span>Etapa 05 completă</span>
      <h3>Spectacolul este gata să înceapă.</h3>
      <p>Toate deciziile ajung într-un singur moment coordonat.</p>
      <button type="button" onClick={() => scrollTo("#contact")}>
        Pornește proiectul <ArrowRight />
      </button>
    </motion.div>
  );
};

export const Process = () => {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 64%", "end 54%"],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 95, damping: 28, mass: 0.34 });
  const scaleY = useTransform(progress, [0, 1], [0, 1]);

  return (
    <section
      ref={ref}
      id="proces"
      className="process-story"
      data-testid="process-section"
      aria-labelledby="process-title"
    >
      <header className="process-story-header">
        <span>Cum lucrăm</span>
        <h2 id="process-title">Cinci pași. Un singur fir logic.</h2>
        <p>Fiecare etapă pregătește următoarea, până când conceptul devine spectacol.</p>
      </header>

      <div className="process-story-timeline">
        <div className="process-story-line" aria-hidden="true">
          <motion.span style={reduce ? { scaleY: 1 } : { scaleY }} />
        </div>

        {PROCESS.map((item, index) => {
          const Icon = item.icon;
          const side = index % 2 === 0 ? "left" : "right";
          return (
            <motion.article
              key={item.step}
              className={`process-story-step process-story-step-${side}`}
              data-testid={`process-step-${index}`}
              initial={reduce ? false : { opacity: 0, x: side === "left" ? -32 : 32, y: 18 }}
              whileInView={reduce ? undefined : { opacity: 1, x: 0, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.65, ease: EASE }}
            >
              <div className="process-story-node" aria-hidden="true">
                <Icon />
              </div>
              <div className="process-story-card">
                <span>{item.step}</span>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            </motion.article>
          );
        })}

        <ProcessFinale reduce={reduce} />
      </div>
    </section>
  );
};

export default Process;
