import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Reveal from "@/components/site/Reveal";
import { FAQS } from "@/data/content";

export const Faq = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <section id="intrebari" className="relative py-24 md:py-32" data-testid="faq-section">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="max-w-3xl mx-auto px-6 md:px-12">
        <Reveal>
          <div className="text-center">
            <span className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-[#8338EC]">
              Întrebări frecvente
            </span>
            <h2 className="font-display font-bold text-white text-4xl sm:text-5xl mt-4 tracking-tight">
              Tot ce trebuie să știi
            </h2>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <Accordion type="single" collapsible className="mt-12 space-y-3" data-testid="faq-accordion">
            {FAQS.map((f, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="glass rounded-2xl px-6 border-white/10"
                data-testid={`faq-item-${i}`}
              >
                <AccordionTrigger className="text-left font-display font-medium text-white text-base sm:text-lg hover:no-underline py-5">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-white/60 font-light leading-relaxed pb-5">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
};

export default Faq;
