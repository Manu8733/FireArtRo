import { ArrowDown, ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1];

export default function InteriorHero({
  eyebrow,
  title,
  accent,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  index,
}) {
  const reduce = useReducedMotion();
  const item = reduce
    ? {}
    : {
        initial: { opacity: 0, y: 22 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.75, ease: EASE },
      };

  return (
    <section className="interior-hero" aria-labelledby="interior-page-title">
      <div className="interior-hero-grid" aria-hidden="true" />
      <div className="interior-hero-orbit" aria-hidden="true">
        <span />
        <span />
      </div>
      <div className="interior-hero-inner">
        <motion.div className="interior-hero-copy" {...item}>
          <span className="interior-hero-eyebrow">{eyebrow}</span>
          <h1 id="interior-page-title">
            {title}
            {accent && <span> {accent}</span>}
          </h1>
          <p>{description}</p>
          {(primaryHref || secondaryHref) && (
            <div className="interior-hero-actions">
              {primaryHref && (
                <a className="btn-grad" href={primaryHref}>
                  {primaryLabel} <ArrowRight />
                </a>
              )}
              {secondaryHref && (
                <a href={secondaryHref}>
                  {secondaryLabel} <ArrowDown />
                </a>
              )}
            </div>
          )}
        </motion.div>
        <motion.div
          className="interior-hero-index"
          initial={reduce ? undefined : { opacity: 0, scale: 0.92 }}
          animate={reduce ? undefined : { opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.18, ease: EASE }}
          aria-hidden="true"
        >
          <span>FIREARTRO</span>
          <strong>{index}</strong>
          <i />
        </motion.div>
      </div>
    </section>
  );
}
