import Reveal from "@/components/site/Reveal";
import { SectionHeader } from "@/components/site/cinematic";
import { STATS_ITEMS } from "@/data/businessContent";

export const Stats = () => (
  <section className="stats-proof" data-testid="stats-section" aria-labelledby="stats-proof-title">
    <div className="stats-proof-inner">
      <SectionHeader
        kicker="Capacitate reală"
        title="Un format potrivit pentru fiecare scară."
        subtitle="Cifrele apar o singură dată, acolo unde ajută la evaluarea capacității FIREARTRO."
      />
      <h2 id="stats-proof-title" className="sr-only">Capacitate și experiență FIREARTRO</h2>
      <div className="stats-proof-grid">
        {STATS_ITEMS.map((item, index) => (
          <Reveal key={item.id} delay={index * 0.05}>
            <article>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </article>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

export default Stats;
