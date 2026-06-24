import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/site/Reveal";
import { RevealText } from "@/components/site/cinematic";
import { INTRO_BULLETS } from "@/data/content";

const scrollTo = (href) => document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });

export const Intro = () => {
  return (
    <section id="intro" className="relative py-20 sm:py-28 md:py-36 overflow-hidden" data-testid="intro-section">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] h-[44vw] rounded-full bg-[#8338EC]/8 blur-[140px]" />

      <div className="relative max-w-4xl mx-auto px-5 sm:px-6 md:px-12 text-center">
        <Reveal>
          <span className="cine-kicker text-[11px] sm:text-xs font-semibold text-[#9D7BFF]">
            Cine este FIREARTRO
          </span>
        </Reveal>

        <h2 className="mt-6 font-display font-bold text-white display-lg">
          <RevealText text="Nu organizăm doar artificii." className="block" />
          <span className="block mt-1">
            <span className="text-gradient">Regizăm emoții pe cer.</span>
          </span>
        </h2>

        <Reveal delay={0.1}>
          <p className="mt-7 text-white/65 lead font-light max-w-2xl mx-auto">
            Fiecare spectacol este o poveste vizuală construită în jurul momentului tău — cu
            tehnologie de top, design original și o execuție impecabilă, de la prima scânteie
            până la ultima dronă aprinsă.
          </p>
        </Reveal>

        <motion.ul
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
          className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 flex-wrap"
        >
          {INTRO_BULLETS.map((b) => (
            <motion.li
              key={b}
              variants={{
                hidden: { opacity: 0, y: 16 },
                show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
              }}
              className="glass rounded-2xl sm:rounded-full px-5 py-3 text-sm text-white/80 flex items-center justify-center gap-2.5"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-[#3A86FF] to-[#8338EC] shrink-0" />
              {b}
            </motion.li>
          ))}
        </motion.ul>

        <Reveal delay={0.15}>
          <button
            onClick={() => scrollTo("#spectacole")}
            data-testid="intro-cta"
            className="mt-11 inline-flex items-center gap-2 text-white font-semibold group"
          >
            Descoperă spectacolele noastre
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/8 group-hover:bg-[#8338EC] transition-colors">
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </button>
        </Reveal>
      </div>
    </section>
  );
};

export default Intro;
