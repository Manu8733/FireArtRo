import Navbar from "@/components/site/Navbar";
import Hero from "@/components/site/Hero";
import Stats from "@/components/site/Stats";
import ServicesOverview from "@/components/site/ServicesOverview";
import Showcase from "@/components/site/Showcase";
import WhyUs from "@/components/site/WhyUs";
import Process from "@/components/site/Process";
import Partners from "@/components/site/Partners";
import FinalCta from "@/components/site/FinalCta";
import Footer from "@/components/site/Footer";
import SocialDock from "@/components/site/SocialDock";
import ScrollProgress from "@/components/site/ScrollProgress";
import usePageMeta from "@/hooks/usePageMeta";
import { BUSINESS_HOURS, SITE_DETAILS, SOCIAL_LINKS } from "@/data/businessContent";

export default function Home() {
  usePageMeta({
    title: "Spectacole cu drone și artificii pentru evenimente | FireArtRo",
    description:
      "FireArtRo creează drone show-uri, artificii de zi și de noapte, cold sparks și spectacole sincronizate pentru nunți, corporate și festivaluri în România.",
    path: "/",
    schema: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": ["Organization", "LocalBusiness", "ProfessionalService"],
          name: SITE_DETAILS.name,
          legalName: SITE_DETAILS.legalName,
          url: SITE_DETAILS.siteUrl,
          email: SITE_DETAILS.email,
          taxID: SITE_DETAILS.taxId,
          address: {
            "@type": "PostalAddress",
            streetAddress: SITE_DETAILS.mainOffice,
            addressCountry: "RO",
          },
          sameAs: SOCIAL_LINKS.map((profile) => profile.href),
          areaServed: { "@type": "Country", name: SITE_DETAILS.areaServed },
          openingHours: BUSINESS_HOURS.schema,
          description:
            "Producție de spectacole cu drone, artificii profesionale și efecte speciale pentru evenimente.",
        },
        {
          "@type": "Service",
          name: "Spectacole cu drone și artificii",
          provider: { "@type": "Organization", name: SITE_DETAILS.name },
          areaServed: { "@type": "Country", name: SITE_DETAILS.areaServed },
        },
      ],
    },
  });

  return (
    <main className="home-page min-h-screen overflow-x-clip bg-[#050308]">
      <ScrollProgress />
      <Navbar />
      <Hero />

      <span id="intro" className="interior-section-anchor" aria-hidden="true" />
      <Stats />
      <ServicesOverview />
      <Showcase />
      <WhyUs />
      <Process />
      <Partners />

      <div className="site-ending">
        <FinalCta />
        <Footer />
      </div>
      <SocialDock />
    </main>
  );
}
