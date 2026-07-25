import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import Reveal from "@/components/site/Reveal";
import { FAQS } from "@/data/content";
import { whatsappLink } from "@/lib/constants";

export const Faq = () => {
  const directContactHref = whatsappLink();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <section className="faq-editorial" data-testid="faq-section" aria-labelledby="faq-editorial-title">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <div className="faq-editorial-inner">
        <Reveal>
          <aside className="faq-editorial-intro">
            <span>Întrebări frecvente</span>
            <h2 id="faq-editorial-title">
              Răspunsuri clare înainte de primul plan.
            </h2>
            <p>
              Fiecare locație vine cu alte condiții. Am adunat aici informațiile care te ajută să pregătești o discuție utilă.
            </p>
            <a
              href={directContactHref || "/contact"}
              {...(directContactHref ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              <MessageCircle aria-hidden="true" />
              Întreabă echipa
              <ArrowUpRight aria-hidden="true" />
            </a>
          </aside>
        </Reveal>

        <Reveal delay={0.08}>
          <Accordion type="single" collapsible className="faq-editorial-list" data-testid="faq-accordion">
            {FAQS.map((item, index) => (
              <AccordionItem
                key={item.q}
                value={`item-${index}`}
                className="faq-editorial-item"
                data-testid={`faq-item-${index}`}
              >
                <AccordionTrigger className="faq-editorial-trigger">
                  <span>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <span>{item.q}</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="faq-editorial-answer">
                  {item.a}
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
