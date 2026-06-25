import Navbar from "@/components/site/Navbar";
import ScrollProgress from "@/components/site/ScrollProgress";
import InteriorHero from "@/components/site/InteriorHero";
import Packages from "@/components/site/Packages";
import Footer from "@/components/site/Footer";
import usePageMeta from "@/hooks/usePageMeta";
import { PACKAGE_ITEMS, SITE_DETAILS } from "@/data/businessContent";

export default function PackagesPage() {
  usePageMeta({
    title: "Pachete spectacole cu drone și artificii — FireArtRo",
    description:
      "Compară pachetele FireArtRo pentru artificii profesionale, drone show, spectacole combinate și efecte speciale. Solicită o configurație adaptată evenimentului.",
    path: "/pachete",
    schema: {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Pachete FireArtRo",
      url: `${SITE_DETAILS.siteUrl}/pachete`,
      itemListElement: PACKAGE_ITEMS.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Service",
          name: item.title,
          serviceType: item.category,
          description: item.shortDescription,
        },
      })),
    },
  });

  return (
    <main className="interior-page min-h-screen overflow-x-clip bg-[#050308] text-white">
      <ScrollProgress />
      <Navbar />
      <InteriorHero
        eyebrow="Pachete FireArtRo"
        title="Un punct de plecare clar."
        accent="Un spectacol construit pentru tine."
        description="Alegi direcția vizuală, iar noi adaptăm durata, tehnologia, logistica și intensitatea la locația și momentul evenimentului."
        primaryHref="/contact"
        primaryLabel="Solicită configurația"
        secondaryHref="#optiuni"
        secondaryLabel="Compară opțiunile"
      />
      <div id="optiuni" className="interior-section-anchor">
        <Packages full />
      </div>
      <Footer />
    </main>
  );
}
