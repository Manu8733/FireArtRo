import Reveal from "@/components/site/Reveal";
import CountUp from "@/components/site/CountUp";
import { STATS } from "@/data/content";

export const Stats = () => {
  return (
    <section className="relative py-20 md:py-24 border-y border-white/5" data-testid="stats-section">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.1}>
              <div className="glass rounded-2xl p-6 md:p-8 text-center hover:border-[#8338EC]/40 transition-colors duration-300 group">
                <div className="font-display font-bold text-4xl md:text-5xl text-gradient">
                  <CountUp end={s.value} suffix={s.suffix} />
                </div>
                <div className="mt-3 text-sm md:text-base text-white/55">{s.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
