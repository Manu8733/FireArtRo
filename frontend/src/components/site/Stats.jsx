import Reveal from "@/components/site/Reveal";
import CountUp from "@/components/site/CountUp";
import { STATS } from "@/data/content";

export const Stats = () => {
  return (
    <section className="relative py-16 sm:py-20 md:py-24 border-y border-white/5" data-testid="stats-section">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#8338EC]/40 to-transparent" />
      <div className="max-w-7xl mx-auto px-5 sm:px-6 md:px-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08}>
              <div className="group relative glass rounded-2xl p-5 sm:p-7 md:p-8 text-center hover:border-[#8338EC]/40 transition-colors duration-300 overflow-hidden">
                <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="font-display font-bold text-[2.2rem] sm:text-5xl text-gradient">
                  <CountUp end={s.value} suffix={s.suffix} />
                </div>
                <div className="mt-2.5 text-[13px] sm:text-base text-white/55 leading-snug">{s.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
