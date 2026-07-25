import { useMemo, useState } from "react";
import { ArrowRight, Check, Flame, MoonStar, Plane, Sparkles, Sun, Wand2 } from "lucide-react";
import Reveal from "@/components/site/Reveal";
import { SectionHeader } from "@/components/site/cinematic";
import { PACKAGE_CATEGORIES, PACKAGE_ITEMS } from "@/data/businessContent";
import { MEDIA } from "@/data/content";
import useManagedContent from "@/hooks/useManagedContent";
import { goToContact } from "@/lib/contactNavigation";

const categoryIcons = {
  "Artificii de zi": Sun,
  "Artificii de noapte": MoonStar,
  "Show drone": Plane,
  "Drone + artificii": Sparkles,
  "Efecte speciale": Wand2,
  "Corporate / Festival": Flame,
};

const categoryVisuals = {
  "Artificii de zi": MEDIA.crowd,
  "Artificii de noapte": MEDIA.fireworksSky,
  "Show drone": MEDIA.droneShow,
  "Drone + artificii": MEDIA.hybrid,
  "Efecte speciale": MEDIA.coldSparks,
  "Corporate / Festival": MEDIA.corporate,
};

const selectPackage = (item) => {
  goToContact({
    package_id: item.id,
    package_title: item.title,
    services: [item.category],
  });
};

export const Packages = ({ full = false, items }) => {
  const managedPackages = useManagedContent("packages", PACKAGE_ITEMS);
  const packages = items || managedPackages;
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
          kicker="Puncte de plecare"
          title="Alege atmosfera. Configurația o construim împreună."
          subtitle="Fiecare opțiune pornește de la un rezultat vizual clar și se adaptează locației, publicului și momentului."
        />
        <h2 id="packages-title" className="sr-only">Pachete FireArtRo</h2>

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

        <div className="package-editorial-grid">
          {shown.map((item, index) => {
            const Icon = categoryIcons[item.category] || Sparkles;
            const visual = categoryVisuals[item.category] || MEDIA.fireworksSky;
            return (
              <Reveal key={item.id} delay={Math.min(index * 0.035, 0.18)}>
                <article className="package-editorial-card">
                  <figure className="package-editorial-media">
                    <img
                      src={visual}
                      alt=""
                      aria-hidden="true"
                      width="900"
                      height="620"
                      loading="lazy"
                      decoding="async"
                    />
                    <span>{item.category}</span>
                  </figure>
                  <div className="package-editorial-copy">
                    <header>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <Icon aria-hidden="true" />
                    </header>
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.shortDescription}</p>
                    </div>
                    <dl>
                      <div><dt>Potrivit pentru</dt><dd>{item.bestFor}</dd></div>
                      <div><dt>Atmosferă</dt><dd>{item.visualImpact}</dd></div>
                      {item.duration && <div><dt>Durată</dt><dd>{item.duration}</dd></div>}
                      {item.droneCount && <div><dt>Drone</dt><dd>aproximativ {item.droneCount}</dd></div>}
                      {item.effectsCount && <div><dt>Configurație</dt><dd>{item.effectsCount} grupe de efecte</dd></div>}
                    </dl>
                    <button type="button" onClick={() => selectPackage(item)}>
                      Configurează opțiunea <ArrowRight aria-hidden="true" />
                    </button>
                  </div>
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
          <Check aria-hidden="true" />
          <p>
            Oferta finală se stabilește după locație, durată, complexitatea designului, tehnologie și cerințele de siguranță.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Packages;
