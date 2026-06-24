import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/site/Reveal";
import { INTRO_BULLETS } from "@/data/content";

const scrollTo = (href) => document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });

export const Intro = () => {
  return (
    <section id="intro" className="relative py-24 md:py-36 overflow-hidden" data-testid="intro-section">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[40vw] rounded-full bg-[#8338EC]/8 blur-[140px]" />
      <div className="relative max-w-5xl mx-auto px-6 md:px-12 text-center">
        <Reveal>
          <span className="text-xs sm:text-sm font-semibold uppercase tracking-[0.25em] text-[#8338EC]">
            FIREARTRO
          </span>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-6 font-display font-bold text-white text-3xl sm:text-5xl lg:text-6xl leading-[1.08] tracking-tight">
            Nu organizăm doar artificii.{" "}
            <span className="text-gradient">Regizăm emoții pe cer.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="mt-8 text-white/65 text-lg font-light leading-relaxed max-w-2xl mx-auto">
            Fiecare spectacol este o poveste vizuală construită în jurul momentului tău — cu
            tehnologie de top, design original și o execuție impecabilă, de la prima scânteie
            până la ultimul drone aprins.
          </p>
        </Reveal>

        <motion.ul
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12 } } }}
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-3 flex-wrap"
        >
          {INTRO_BULLETS.map((b) => (
            <motion.li
              key={b}
              variants={{
                hidden: { opacity: 0, y: 16 },
                show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
              }}
              className="glass rounded-full px-5 py-3 text-sm text-white/80 flex items-center gap-2"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-[#3A86FF] to-[#8338EC]" />
              {b}
            </motion.li>
          ))}
        </motion.ul>

        <Reveal delay={0.2}>
          <button
            onClick={() => scrollTo("#spectacole")}
            data-testid="intro-cta"
            className="mt-12 inline-flex items-center gap-2 text-white font-semibold group"
          >
            Descoperă spectacolele noastre
            <ArrowRight className="h-4 w-4 text-[#8338EC] group-hover:translate-x-1 transition-transform" />
          </button>
        </Reveal>
      </div>
    </section>
  );
};

export default Intro;
