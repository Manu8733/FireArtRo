import { useMemo, useState } from "react";
import { ArrowRight, Check, Flame, MoonStar, Plane, Sparkles, Sun, Wand2 } from "lucide-react";
import Reveal from "@/components/site/Reveal";
import { SectionHeader } from "@/components/site/cinematic";
import { PACKAGE_CATEGORIES, PACKAGE_ITEMS } from "@/data/businessContent";
import useManagedContent from "@/hooks/useManagedContent";

const scrollTo = (href) => document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });

const categoryIcons = {
  "Artificii de zi": Sun,
  "Artificii de noapte": MoonStar,
  "Show drone": Plane,
  "Drone + artificii": Sparkles,
  "Efecte speciale": Wand2,
  "Corporate / Festival": Flame,
};

const selectPackage = (item) => {
  window.dispatchEvent(new CustomEvent("prefill-package", { detail: item }));
  scrollTo("#contact");
};

export const Packages = ({ full = false }) => {
  const packages = useManagedContent("packages", PACKAGE_ITEMS);
  const [category, setCategory] = useState(full ? "Toate" : "Drone + artificii");
  const [expanded, setExpanded] = useState(false);

  const filtered = useMemo(
    () => packages.filter((item) => category === "Toate" || item.category === category),
    [category, packages]
  );
  const shown = full && !expanded && category === "Toate" ? filtered.slice(0, 6) : filtered;

  return (
    <section className="package-system" data-testid="packages-section" aria-labelledby="packages-title">
      <div className="package-system-inner">
        <SectionHeader
          kicker="Direcții de ofertă"
          title="Pachete clare, configurate pentru context."
          subtitle="Alege o categorie. Durata, tehnologia și logistica se adaptează după locație și obiectiv."
        />
        <h2 id="packages-title" className="sr-only">Pachete FIREARTRO</h2>

        <div className="package-filter-row" aria-label="Categorii pachete">
          {PACKAGE_CATEGORIES.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={category === item}
              className={category === item ? "is-active" : ""}
              onClick={() => {
                setCategory(item);
                setExpanded(false);
              }}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="package-compact-grid">
          {shown.map((item, index) => {
            const Icon = categoryIcons[item.category] || Sparkles;
            return (
              <Reveal key={item.id} delay={Math.min(index * 0.035, 0.18)}>
                <article className={`package-compact-card package-tone-${item.category.toLowerCase().replace(/[^a-z]+/g, "-")}`}>
                  <div className="package-compact-top">
                    <span><Icon /></span>
                    {item.badge && <small>{item.badge}</small>}
                  </div>
                  <p className="package-compact-category">{item.category}</p>
                  <h3>{item.title}</h3>
                  <p>{item.shortDescription}</p>
                  <dl>
                    <div><dt>Potrivit pentru</dt><dd>{item.bestFor}</dd></div>
                    <div><dt>Impact</dt><dd>{item.visualImpact}</dd></div>
                    {item.duration && <div><dt>Durată</dt><dd>{item.duration}</dd></div>}
                    {item.droneCount && <div><dt>Drone</dt><dd>până la {item.droneCount}</dd></div>}
                    {item.effectsCount && <div><dt>Configurație</dt><dd>{item.effectsCount} grupe de efecte</dd></div>}
                  </dl>
                  <button type="button" onClick={() => selectPackage(item)}>
                    {item.cta || "Cere ofertă"} <ArrowRight />
                  </button>
                </article>
              </Reveal>
            );
          })}
        </div>

        {full && category === "Toate" && filtered.length > 6 && (
          <button type="button" className="package-expand" onClick={() => setExpanded((value) => !value)}>
            {expanded ? "Arată selecția compactă" : `Vezi toate cele ${filtered.length} pachete`}
          </button>
        )}

        <div className="package-pricing-note">
          <Check />
          <p>
            Prețul final depinde de locație, durată, complexitatea designului, numărul de drone, tipul efectelor,
            cerințele de siguranță și logistica evenimentului.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Packages;
