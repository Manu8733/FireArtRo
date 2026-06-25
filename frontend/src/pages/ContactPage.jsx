import Navbar from "@/components/site/Navbar";
import ScrollProgress from "@/components/site/ScrollProgress";
import InteriorHero from "@/components/site/InteriorHero";
import QuoteForm from "@/components/site/QuoteForm";
import Footer from "@/components/site/Footer";
import usePageMeta from "@/hooks/usePageMeta";

export default function ContactPage() {
  usePageMeta({
    title: "Solicită ofertă pentru drone show și artificii | FireArtRo",
    description:
      "Trimite detaliile evenimentului și primești o direcție clară pentru drone show, artificii de zi sau noapte, cold sparks și efecte speciale.",
    path: "/contact",
  });

  return (
    <main className="contact-page min-h-screen overflow-x-clip bg-[#050308] text-white">
      <ScrollProgress />
      <Navbar />
      <InteriorHero
        eyebrow="Contact FireArtRo"
        title="Spune-ne data."
        accent="Noi construim momentul."
        description="Completează contextul esențial. Echipa revine cu întrebările tehnice și direcția potrivită pentru locație."
        primaryHref="#formular"
        primaryLabel="Completează brief-ul"
        secondaryHref="/pachete"
        secondaryLabel="Vezi pachetele"
      />
      <div id="formular" className="interior-section-anchor">
        <QuoteForm />
      </div>
      <Footer />
    </main>
  );
}
