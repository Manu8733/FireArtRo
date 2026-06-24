import { Star, Quote } from "lucide-react";
import Reveal from "@/components/site/Reveal";
import { SectionHeader } from "@/components/site/cinematic";
import { TESTIMONIALS, PARTNERS } from "@/data/content";

const Card = ({ t, i }) => (
  <div
    className="h-full glass border-gradient rounded-2xl p-6 sm:p-8 hover:border-white/20 transition-colors duration-300"
    data-testid={`testimonial-card-${i}`}
  >
    <Quote className="h-7 w-7 text-[#8338EC]/60" />
    <div className="mt-3 flex gap-1">
      {Array.from({ length: t.rating }).map((_, s) => (
        <Star key={s} className="h-4 w-4 fill-[#FFB703] text-[#FFB703]" />
      ))}
    </div>
    <p className="mt-4 text-white/80 body-sm font-light leading-relaxed">“{t.text}”</p>
    <div className="mt-6 flex items-center gap-3">
      <div className="h-11 w-11 rounded-full bg-gradient-to-br from-[#3A86FF] to-[#8338EC] flex items-center justify-center font-display font-semibold text-white">
        {t.name.charAt(0)}
      </div>
      <div>
        <div className="text-white font-medium text-sm">{t.name}</div>
        <div className="text-white/45 text-xs">{t.role}</div>
      </div>
    </div>
  </div>
);

export const Testimonials = () => {
  return (
    <section className="relative py-20 sm:py-28 md:py-32 section-grid-bg" data-testid="testimonials-section">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 md:px-12">
        <SectionHeader center kicker="Testimoniale" title="Ce spun clienții noștri" />

        {/* Mobile swipe · Desktop grid */}
        <div className="mt-12 flex md:grid md:grid-cols-3 gap-5 overflow-x-auto md:overflow-visible snap-x snap-mandatory hide-scrollbar -mx-5 px-5 md:mx-0 md:px-0 pb-1">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.08} className="snap-center shrink-0 w-[85%] md:w-auto">
              <Card t={t} i={i} />
            </Reveal>
          ))}
        </div>

        {/* Partner marquee */}
        <Reveal delay={0.1}>
          <div className="mt-16">
            <p className="text-center text-xs uppercase tracking-[0.2em] text-white/35 mb-8">
              Au avut încredere în noi
            </p>
            <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
              <div className="flex w-max animate-marquee gap-12 sm:gap-16">
                {[...PARTNERS, ...PARTNERS].map((p, i) => (
                  <span
                    key={i}
                    className="font-display font-semibold text-base sm:text-xl text-white/40 whitespace-nowrap"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default Testimonials;
