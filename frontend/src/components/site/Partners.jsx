import { motion, useReducedMotion } from "framer-motion";
import { Building2, CalendarDays, MapPinned, UsersRound } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1];
const COLLABORATIONS = [
  { title: "Organizatori", text: "Proiecte private și publice", icon: CalendarDays },
  { title: "Agenții", text: "Campanii și lansări de brand", icon: UsersRound },
  { title: "Locații", text: "Spații indoor și outdoor", icon: MapPinned },
  { title: "Producții", text: "Scene, festivaluri și city events", icon: Building2 },
];

export default function Partners() {
  const reduce = useReducedMotion();

  return (
    <section className="home-collaboration" aria-labelledby="partners-title">
      <div className="home-collaboration-copy">
        <span>Colaborare</span>
        <h2 id="partners-title">Intrăm firesc în echipa care construiește evenimentul.</h2>
        <p>Lucrăm coordonat cu organizatorii, locațiile și furnizorii tehnici, de la primul plan până la execuția live.</p>
      </div>

      <div className="home-collaboration-grid">
        {COLLABORATIONS.map((item, index) => (
          <motion.article
            key={item.title}
            initial={reduce ? false : { opacity: 0, y: 18 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5, delay: index * 0.05, ease: EASE }}
          >
            <item.icon aria-hidden="true" />
            <strong>{item.title}</strong>
            <span>{item.text}</span>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
