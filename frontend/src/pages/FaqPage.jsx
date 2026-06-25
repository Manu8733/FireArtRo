import Navbar from "@/components/site/Navbar";
import ScrollProgress from "@/components/site/ScrollProgress";
import InteriorHero from "@/components/site/InteriorHero";
import Faq from "@/components/site/Faq";
import Footer from "@/components/site/Footer";
import usePageMeta from "@/hooks/usePageMeta";

export default function FaqPage() {
  usePageMeta({
    title: "Întrebări frecvente despre drone show și artificii — FireArtRo",
    description:
      "Răspunsuri despre rezervare, autorizații, vreme, siguranță, durată și costuri pentru spectacole cu drone, artificii și efecte speciale.",
    path: "/intrebari-frecvente",
  });

  return (
    <main className="interior-page min-h-screen overflow-x-clip bg-[#050308] text-white">
      <ScrollProgress />
      <Navbar />
      <InteriorHero
        eyebrow="Întrebări frecvente"
        title="Claritate înainte"
        accent="de primul semnal luminos."
        description="Am adunat răspunsurile care scurtează planificarea și te ajută să înțelegi rapid ce este posibil pentru evenimentul tău."
        primaryHref="/contact"
        primaryLabel="Discută evenimentul"
        secondaryHref="#raspunsuri"
        secondaryLabel="Vezi răspunsurile"
      />
      <div id="raspunsuri" className="interior-section-anchor">
        <Faq />
      </div>
      <Footer />
    </main>
  );
}
