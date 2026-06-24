import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import Reveal from "@/components/site/Reveal";
import { SectionHeader } from "@/components/site/cinematic";
import { SERVICES } from "@/data/content";

const EASE = [0.22, 1, 0.36, 1];
const scrollTo = (href) => document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });

export const Services = () => {
  const [active, setActive] = useState(0);
  const service = SERVICES[active];
  const Icon = service.icon;

  return (
    <section className="relative overflow-hidden py-20 sm:py-24 md:py-28" data-testid="services-section">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 md:px-12">
        <SectionHeader
          kicker="Ce poți construi"
          title="Patru instrumente. Un singur scenariu vizual."
          subtitle="Alegi direcția, iar combinația finală se adaptează evenimentului și locației."
        />

        <div className="mt-10 grid overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#08050f] lg:grid-cols-[1.08fr_0.92fr]">
          <div className="relative min-h-[420px] overflow-hidden sm:min-h-[520px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={service.image}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 1.08, clipPath: "inset(8% 8% 8% 8% round 24px)" }}
                animate={{ opacity: 1, scale: 1, clipPath: "inset(0% 0% 0% 0% round 0px)" }}
                exit={{ opacity: 0, scale: 0.985 }}
                transition={{ duration: 0.72, ease: EASE }}
              >
                <img src={service.image} alt={service.title} width="1280" height="853" loading="lazy" decoding="async" className="h-full w-full object-cover" />
              </motion.div>
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-[#050308] via-[#050308]/15 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#050308]/40" />

            <AnimatePresence mode="wait">
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="absolute bottom-0 left-0 right-0 p-6 sm:p-8"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/12 bg-black/35 backdrop-blur-md">
                  <Icon className="h-5 w-5 text-[#9D7BFF]" />
                </span>
                <h3 className="mt-4 max-w-lg font-display text-[clamp(1.45rem,2.7vw,2.5rem)] font-semibold leading-tight text-white">
                  {service.title}
                </h3>
                <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/64">{service.desc}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {service.benefits.map((benefit) => (
                    <span key={benefit} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-[11px] text-white/68 backdrop-blur-md">
                      <Check className="h-3 w-3 text-[#9D7BFF]" />
                      {benefit}
                    </span>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex flex-col">
            {SERVICES.map((item, index) => (
              <button
                type="button"
                key={item.title}
                onClick={() => setActive(index)}
                onMouseEnter={() => setActive(index)}
                data-testid={`service-card-${index}`}
                className={`group flex flex-1 items-start gap-4 border-b border-white/8 p-5 text-left transition-colors last:border-b-0 sm:p-6 ${
                  index === active ? "bg-white/[0.065]" : "bg-transparent hover:bg-white/[0.035]"
                }`}
              >
                <span className={`mt-0.5 font-mono text-[10px] transition-colors ${index === active ? "text-[#9D7BFF]" : "text-white/28"}`}>
                  0{index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-base font-semibold text-white sm:text-lg">{item.title}</span>
                  <span className="mt-1.5 block text-xs leading-relaxed text-white/65 sm:text-sm">{item.ideal}</span>
                </span>
                <ArrowRight className={`mt-1 h-4 w-4 transition-all ${index === active ? "translate-x-0 text-[#9D7BFF]" : "-translate-x-1 text-white/20"}`} />
              </button>
            ))}

            <div className="p-5 sm:p-6">
              <button
                type="button"
                onClick={() => scrollTo("#contact")}
                className="btn-grad inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white"
              >
                Configurează spectacolul
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
