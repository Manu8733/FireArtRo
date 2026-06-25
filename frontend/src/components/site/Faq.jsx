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
    <section className="relative py-20 sm:py-24 md:py-28" data-testid="faq-section">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-6 md:px-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
        <Reveal>
          <div className="lg:sticky lg:top-28">
            <span className="cine-kicker text-[10px] font-semibold text-[#5CB7FF]">Obiecții, clarificate</span>
            <h2 className="mt-5 max-w-md font-display text-[clamp(1.6rem,3vw,2.8rem)] font-bold leading-[1.08] text-white">
              Ce trebuie să știi înainte să ridicăm privirile spre cer.
            </h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-white/56 sm:text-base">
              Detaliile tehnice se schimbă de la o locație la alta. Aici găsești răspunsurile care te ajută să începi brief-ul corect.
            </p>
            <a
              href={directContactHref || "#contact"}
              {...(directContactHref ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-white"
            >
              <MessageCircle className="h-4 w-4 text-[#25D366]" />
              Întreabă direct
              <ArrowUpRight className="h-3.5 w-3.5 text-white/40" />
            </a>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <Accordion type="single" collapsible className="border-t border-white/10" data-testid="faq-accordion">
            {FAQS.map((item, index) => (
              <AccordionItem
                key={item.q}
                value={`item-${index}`}
                className="border-b border-white/10"
                data-testid={`faq-item-${index}`}
              >
                <AccordionTrigger className="py-5 text-left font-display text-sm font-medium text-white hover:no-underline sm:py-6 sm:text-base">
                  <span className="flex items-start gap-4">
                    <span className="mt-0.5 font-mono text-[9px] text-[#5CB7FF]">{String(index + 1).padStart(2, "0")}</span>
                    <span>{item.q}</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-6 pl-9 text-sm font-light leading-relaxed text-white/58">
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
