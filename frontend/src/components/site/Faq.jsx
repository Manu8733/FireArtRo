import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FAQS } from "@/data/content";
import useManagedContent from "@/hooks/useManagedContent";

const EDITORIAL_ANSWERS = {
  "Cu cât timp înainte trebuie rezervat spectacolul?":
    "Pentru majoritatea evenimentelor, recomandăm să ne contactezi cu 3–4 săptămâni înainte. Pentru date aglomerate sau producții ample, este util un interval de 1–2 luni.",
  "Se pot combina dronele cu artificiile?":
    "Da. Dronele și artificiile pot fi sincronizate într-un singur moment, în funcție de locație și condițiile tehnice.",
  "Ce se întâmplă dacă vremea este nefavorabilă?":
    "Dacă vântul sau alte condiții nu permit desfășurarea în siguranță, adaptăm sau reprogramăm momentul conform variantei stabilite înainte de eveniment.",
  "Sunt necesare autorizații?":
    "Da. Stabilim autorizațiile și responsabilitățile necesare după verificarea locației, conform cerințelor aplicabile fiecărui tip de spectacol.",
  "Se pot face spectacole pentru nunți?":
    "Da. Formatul se poate integra la primul dans, într-un moment intermediar sau la finalul serii.",
  "Se pot face spectacole corporate sau festivaluri?":
    "Da. Configurăm show-uri pentru evenimente corporate, lansări, gale și festivaluri, în funcție de spațiu și public.",
  "Cât durează un spectacol?":
    "De regulă, între 3 și 12 minute. Durata finală depinde de concept, locație și buget.",
  "Ce informații trebuie trimise pentru ofertă?":
    "Avem nevoie de tipul evenimentului, data, locația aproximativă și formatul dorit. Clarificăm restul într-o discuție scurtă.",
  "Sunt disponibile efecte speciale indoor?":
    "Da, dacă spațiul și regulile locației permit. Verificăm distanțele și condițiile tehnice înainte de confirmare.",
  "De ce prețul este personalizat?":
    "Oferta ține cont de locație, durată, numărul de drone, tipul efectelor, cerințele de siguranță și logistică.",
};

const DEFAULT_ANSWERS = new Map(FAQS.map((item) => [item.q, item.a]));

const getEditorialAnswer = (item) => {
  const isUnmodifiedDefault = DEFAULT_ANSWERS.get(item.q) === item.a;
  return isUnmodifiedDefault ? EDITORIAL_ANSWERS[item.q] || item.a : item.a;
};

export const Faq = () => {
  const managedFaqs = useManagedContent("faqs", FAQS);
  const faqs = managedFaqs.map((item) => ({ ...item, a: getEditorialAnswer(item) }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <section
      id="raspunsuri"
      className="nr-faq"
      data-testid="faq-section"
      aria-labelledby="nr-faq-content-title"
    >
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>

      <div className="nr-shell nr-faq__layout">
        <div className="nr-faq__rail" aria-hidden="true">
          <span>{String(faqs.length).padStart(2, "0")}</span>
          <p>Răspunsuri</p>
        </div>

        <div className="nr-faq__content">
          <h2 id="nr-faq-content-title" className="nr-faq__sr-only">
            Răspunsuri la întrebările frecvente
          </h2>

          <Accordion type="single" collapsible className="nr-faq__questions">
            {faqs.map((item, index) => (
              <AccordionItem
                key={`${item.q}-${index}`}
                value={`faq-${index}`}
                className="nr-faq__question"
                data-testid="faq-question"
              >
                <AccordionTrigger className="nr-faq__trigger">
                  <span className="nr-faq__index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  <span className="nr-faq__question-copy">{item.q}</span>
                </AccordionTrigger>
                <AccordionContent className="nr-faq__answer">
                  <p>{item.a}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <section
            className="nr-faq__contact"
            data-testid="faq-contact-close"
            aria-labelledby="faq-contact-title"
          >
            <div>
              <h2 id="faq-contact-title">Nu ai găsit răspunsul?</h2>
              <p>Spune-ne data și locația.</p>
            </div>
            <Link to="/contact">
              Contactează-ne
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </section>
        </div>
      </div>
    </section>
  );
};

export default Faq;
