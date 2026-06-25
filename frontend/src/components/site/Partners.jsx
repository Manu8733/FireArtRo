import Reveal from "@/components/site/Reveal";
import { PARTNER_ITEMS } from "@/data/businessContent";
import useManagedContent from "@/hooks/useManagedContent";

export default function Partners() {
  const partners = useManagedContent("partners", PARTNER_ITEMS);

  return (
    <section className="partners-strip" aria-labelledby="partners-title">
      <div className="partners-strip-inner">
        <Reveal>
          <div className="partners-strip-heading">
            <span>Colaborări</span>
            <h2 id="partners-title">Un spațiu pregătit pentru partenerii reali.</h2>
            <p>Logo-urile se publică numai după confirmarea colaboratorilor.</p>
          </div>
        </Reveal>
        <div className="partners-logo-grid">
          {partners.map((partner, index) => (
            <Reveal key={partner.id} delay={index * 0.04}>
              {partner.website ? (
                <a href={partner.website} target="_blank" rel="noopener noreferrer" aria-label={partner.name}>
                  {partner.logo ? <img src={partner.logo} alt={partner.name} loading="lazy" /> : partner.logoPlaceholder}
                </a>
              ) : (
                <div title={partner.replaceable ? "Placeholder de înlocuit" : partner.name}>
                  {partner.logo ? <img src={partner.logo} alt={partner.name} loading="lazy" /> : partner.logoPlaceholder}
                </div>
              )}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
