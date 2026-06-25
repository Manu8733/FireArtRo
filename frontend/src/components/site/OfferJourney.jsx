import { useCallback, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { PACKAGE_ITEMS } from "@/data/businessContent";
import useManagedContent from "@/hooks/useManagedContent";
import { goToContact } from "@/lib/contactNavigation";

const EASE = [0.16, 1, 0.3, 1];
const FEATURED_IDS = [
  "day-color",
  "night-signature",
  "drone-100",
  "hybrid-signature",
  "cold-sparks-moment",
];

const PACKAGE_IMAGES = {
  "Artificii de zi": "/media/corporate.webp",
  "Artificii de noapte": "/media/fireworks-sky.webp",
  "Show drone": "/media/drone-show.webp",
  "Drone + artificii": "/media/hybrid.webp",
  "Efecte speciale": "/media/cold-sparks.webp",
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export default function OfferJourney() {
  const sectionRef = useRef(null);
  const reduce = useReducedMotion();
  const packages = useManagedContent("packages", PACKAGE_ITEMS);
  const [active, setActive] = useState(0);
  const featured = useMemo(() => {
    const selected = FEATURED_IDS.map((id) => packages.find((item) => item.id === id)).filter(Boolean);
    return (selected.length >= 3 ? selected : packages.slice(0, 5)).map((item, index) => ({
      ...item,
      no: String(index + 1).padStart(2, "0"),
      image: item.image || PACKAGE_IMAGES[item.category] || "/media/hybrid.webp",
    }));
  }, [packages]);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const next = clamp(Math.floor(value * featured.length), 0, featured.length - 1);
    setActive((current) => (current === next ? current : next));
  });

  const goTo = useCallback((index) => {
    const section = sectionRef.current;
    if (!section) return;
    const top = section.getBoundingClientRect().top + window.scrollY;
    const distance = Math.max(section.offsetHeight - window.innerHeight, 1);
    window.scrollTo({
      top: top + ((index + 0.35) / featured.length) * distance,
      behavior: "smooth",
    });
  }, [featured.length]);

  const item = featured[active] || featured[0];
  if (!item) return null;

  return (
    <section
      ref={sectionRef}
      id="pachete"
      className="package-journey"
      style={{ height: `${Math.max(featured.length * 64, 260)}svh` }}
      aria-labelledby="package-journey-title"
    >
      <div className="package-journey-sticky">
        <header className="package-journey-heading">
          <div>
            <span>Pachete FireArtRo</span>
            <h2 id="package-journey-title">Alege punctul de plecare.</h2>
          </div>
          <p>
            Fiecare pachet este o bază de producție. Îl adaptăm locației, publicului,
            duratei și momentului pe care vrei să îl construiești.
          </p>
          <a href="/pachete">Compară toate pachetele <ArrowRight /></a>
        </header>

        <div className="package-journey-layout">
          <nav className="package-journey-rail" aria-label="Pachete recomandate">
            {featured.map((entry, index) => (
              <button
                key={entry.id}
                type="button"
                className={index === active ? "is-active" : ""}
                onClick={() => goTo(index)}
                aria-current={index === active ? "step" : undefined}
              >
                <span>{entry.no}</span>
                <div>
                  <strong>{entry.title}</strong>
                  <small>{entry.category}</small>
                </div>
              </button>
            ))}
          </nav>

          <div className="package-journey-viewport">
            <AnimatePresence mode="popLayout">
              <motion.article
                key={item.id}
                className="package-journey-card"
                initial={reduce ? false : { opacity: 0, y: 28, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reduce ? undefined : { opacity: 0, y: -18, scale: 0.99 }}
                transition={{ duration: reduce ? 0 : 0.62, ease: EASE }}
              >
                <figure>
                  <motion.img
                    src={item.image}
                    alt={`${item.title} - ${item.category}`}
                    width="1440"
                    height="960"
                    loading="lazy"
                    decoding="async"
                    initial={reduce ? false : { scale: 1.08 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: reduce ? 0 : 1.05, ease: EASE }}
                  />
                  <span aria-hidden="true" />
                </figure>

                <div className="package-journey-copy">
                  <div className="package-journey-meta">
                    <span>{item.category}</span>
                    <strong>{item.no} / {String(featured.length).padStart(2, "0")}</strong>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.shortDescription}</p>
                  <ul>
                    <li><Check /> {item.bestFor}</li>
                    <li><Check /> {item.visualImpact}</li>
                    {item.duration && <li><Check /> {item.duration}</li>}
                  </ul>
                  <button
                    type="button"
                    onClick={() =>
                      goToContact({
                        package_id: item.id,
                        package_title: item.title,
                        services: [item.category],
                      })
                    }
                  >
                    Configurează pachetul <ArrowRight />
                  </button>
                </div>
              </motion.article>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
