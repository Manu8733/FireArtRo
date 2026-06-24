import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MessageCircle } from "lucide-react";
import Reveal from "@/components/site/Reveal";
import { SectionHeader } from "@/components/site/cinematic";
import { FAQS } from "@/data/content";
import { whatsappLink } from "@/lib/constants";

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
    <section id="intrebari" className="relative py-20 sm:py-28 md:py-32" data-testid="faq-section">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="max-w-3xl mx-auto px-5 sm:px-6 md:px-12">
        <SectionHeader center kicker="Întrebări frecvente" title="Tot ce trebuie să știi" />

        <Reveal delay={0.1}>
          <Accordion type="single" collapsible className="mt-10 sm:mt-12 space-y-3" data-testid="faq-accordion">
            {FAQS.map((f, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="glass rounded-2xl px-5 sm:px-6 border-white/10"
                data-testid={`faq-item-${i}`}
              >
                <AccordionTrigger className="text-left font-display font-medium text-white text-[15px] sm:text-lg hover:no-underline py-5">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-white/60 text-sm sm:text-[15px] font-light leading-relaxed pb-5">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="mt-10 text-center">
            <p className="text-white/55 text-sm">Nu ai găsit răspunsul căutat?</p>
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 glass text-white font-semibold px-6 py-3 rounded-full hover:bg-white/10 transition-colors"
            >
              <MessageCircle className="h-4 w-4 text-[#25D366]" />
              Întreabă-ne pe WhatsApp
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default Faq;
