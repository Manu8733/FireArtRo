import Navbar from "@/components/site/Navbar";
import ScrollProgress from "@/components/site/ScrollProgress";
import Faq from "@/components/site/Faq";
import PageEnd from "@/components/site/PageEnd";
import usePageMeta from "@/hooks/usePageMeta";
import "@/styles/night-faq.css";

export default function FaqPage() {
  usePageMeta({
    title: "Întrebări frecvente despre drone show și artificii — FireArtRo",
    description:
      "Răspunsuri despre rezervare, autorizații, vreme, siguranță, durată și costuri pentru spectacole cu drone, artificii și efecte speciale.",
    path: "/intrebari-frecvente",
  });

  return (
    <div className="nr-faq-route">
      <ScrollProgress />
      <Navbar />

      <main className="nr-faq-page" data-design="night-runway">
        <header className="nr-faq-hero">
          <div className="nr-shell nr-faq-hero__inner">
            <div>
              <p className="nr-faq-hero__eyebrow">Întrebări</p>
              <h1>Întrebări.</h1>
            </div>
            <p className="nr-faq-hero__description">
              Ce contează înainte de rezervare.
            </p>
          </div>
        </header>

        <Faq />
      </main>

      <PageEnd />
    </div>
  );
}
