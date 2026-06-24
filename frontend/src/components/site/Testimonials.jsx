import { Star, Quote } from "lucide-react";
import Reveal from "@/components/site/Reveal";
import { TESTIMONIALS, PARTNERS } from "@/data/content";

export const Testimonials = () => {
  return (
    <section className="relative py-24 md:py-32 section-grid-bg" data-testid="testimonials-section">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-[#8338EC]">
              Testimoniale
            </span>
            <h2 className="font-display font-bold text-white text-4xl sm:text-5xl mt-4 tracking-tight">
              Ce spun clienții noștri
            </h2>
          </div>
        </Reveal>

        <div className="mt-14 grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.1}>
              <div
                className="h-full glass rounded-2xl p-8 hover:border-white/20 transition-colors duration-300"
                data-testid={`testimonial-card-${i}`}
              >
                <Quote className="h-8 w-8 text-[#8338EC]/60" />
                <div className="mt-4 flex gap-1">
                  {Array.from({ length: t.rating }).map((_, s) => (
                    <Star key={s} className="h-4 w-4 fill-[#FFB703] text-[#FFB703]" />
                  ))}
                </div>
                <p className="mt-4 text-white/75 font-light leading-relaxed">“{t.text}”</p>
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
              <div className="flex w-max animate-marquee gap-16">
                {[...PARTNERS, ...PARTNERS].map((p, i) => (
                  <span
                    key={i}
                    className="font-display font-semibold text-lg md:text-xl text-white/40 whitespace-nowrap"
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
