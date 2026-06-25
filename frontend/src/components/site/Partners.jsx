import { motion, useReducedMotion } from "framer-motion";
import { PARTNER_ITEMS } from "@/data/businessContent";
import useManagedContent from "@/hooks/useManagedContent";

const EASE = [0.16, 1, 0.3, 1];

export default function Partners() {
  const partners = useManagedContent("partners", PARTNER_ITEMS);
  const reduce = useReducedMotion();

  return (
    <section className="partners-marquee" aria-labelledby="partners-title">
      <div className="partners-marquee-heading">
        <motion.span
          initial={reduce ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.7 }}
          transition={{ duration: 0.55, ease: EASE }}
        >
          Ecosistem de producție
        </motion.span>
        <motion.h2
          id="partners-title"
          initial={reduce ? false : { opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.65 }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          Spații pregătite pentru partenerii confirmați.
        </motion.h2>
        <p>Identitățile de mai jos sunt demonstrative și vor fi înlocuite cu partenerii aprobați.</p>
      </div>

      <div className="partners-marquee-window">
        <motion.div
          className="partners-marquee-reveal"
          initial={reduce ? false : { opacity: 0, x: 80 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.9, ease: EASE }}
        >
          <div className="partners-marquee-track">
            {[...partners, ...partners].map((partner, index) => (
              <article key={`${partner.id}-${index}`} className="partner-demo-card">
                <span>{String((index % partners.length) + 1).padStart(2, "0")}</span>
                {partner.logo ? (
                  <img src={partner.logo} alt={partner.name} loading="lazy" />
                ) : (
                  <strong>{partner.logoPlaceholder || partner.name}</strong>
                )}
                <small>Identitate demonstrativă</small>
              </article>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
