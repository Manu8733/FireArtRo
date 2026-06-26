import { useRef, useState } from "react";
import {
  motion,
  useInView,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowRight } from "lucide-react";
import { PROCESS_ENHANCED } from "@/data/content";
import { goToContact } from "@/lib/contactNavigation";

const EASE = [0.16, 1, 0.3, 1];
const PROCESS_ITEMS = PROCESS_ENHANCED;

const ProcessFinale = ({ reduce }) => {
  const ref = useRef(null);
  const visible = useInView(ref, { once: true, amount: 0.5 });

  return (
    <motion.div
      ref={ref}
      className="process-finale"
      initial={reduce ? false : { opacity: 0, y: 24 }}
      animate={visible || reduce ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.7, ease: EASE }}
    >
      <div className={`process-signal ${visible ? "is-active" : ""}`} aria-hidden="true">
        <span />
        <i />
        <b />
      </div>
      <span>Etapa 05 completă</span>
      <h3>Spectacolul este gata să înceapă.</h3>
      <p>Brief, concept, plan tehnic și execuție live ajung într-un singur moment coordonat.</p>
      <button type="button" onClick={() => goToContact()}>
        Pornește proiectul <ArrowRight />
      </button>
    </motion.div>
  );
};

export const Process = () => {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const [activeStep, setActiveStep] = useState(0);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 68%", "end 44%"],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 95, damping: 28, mass: 0.34 });
  const scaleY = useTransform(progress, [0, 1], [0, 1]);

  useMotionValueEvent(progress, "change", (value) => {
    const next = Math.min(PROCESS_ITEMS.length - 1, Math.max(0, Math.floor(value * PROCESS_ITEMS.length)));
    setActiveStep(next);
  });

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
        <h2 id="process-title">Proces clar pentru drone show-uri, artificii și efecte speciale.</h2>
        <p>De la brief la execuție live, fiecare pas are un rezultat concret și reduce riscul din seara evenimentului.</p>
        <div className="process-scroll-cue" aria-hidden="true">
          <span>Derulează procesul</span>
          <i />
          <strong>{String(activeStep + 1).padStart(2, "0")} / {String(PROCESS_ITEMS.length).padStart(2, "0")}</strong>
        </div>
      </header>

      <div className="process-story-timeline">
        <div className="process-story-line" aria-hidden="true">
          <motion.span style={reduce ? { scaleY: 1 } : { scaleY }} />
        </div>

        {PROCESS_ITEMS.map((item, index) => {
          const Icon = item.icon;
          const side = index % 2 === 0 ? "left" : "right";
          const isActive = index <= activeStep;
          return (
            <motion.article
              key={item.step}
              className={`process-story-step process-story-step-${side} ${isActive ? "is-active" : ""}`}
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
                <div className="process-story-tags" aria-label={`Repere pentru ${item.title}`}>
                  {item.keywords.map((keyword) => <small key={keyword}>{keyword}</small>)}
                </div>
                <strong>{item.result}</strong>
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
