import Navbar from "@/components/site/Navbar";
import Hero from "@/components/site/Hero";
import CinematicPrologue from "@/components/site/CinematicPrologue";
import Stats from "@/components/site/Stats";
import Showcase from "@/components/site/Showcase";
import WhyUs from "@/components/site/WhyUs";
import Process from "@/components/site/Process";
import OfferJourney from "@/components/site/OfferJourney";
import Gallery from "@/components/site/Gallery";
import Testimonials from "@/components/site/Testimonials";
import Partners from "@/components/site/Partners";
import FinalCta from "@/components/site/FinalCta";
import Footer from "@/components/site/Footer";
import SocialDock from "@/components/site/SocialDock";
import ScrollProgress from "@/components/site/ScrollProgress";
import CinematicScene from "@/components/site/CinematicScene";
import usePageMeta from "@/hooks/usePageMeta";
import { BUSINESS_HOURS, SITE_DETAILS } from "@/data/businessContent";

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
          url: SITE_DETAILS.siteUrl,
          email: SITE_DETAILS.email,
          areaServed: { "@type": "Country", name: SITE_DETAILS.areaServed },
          openingHours: BUSINESS_HOURS.schema,
          description: "Producție de spectacole cu drone, artificii profesionale și efecte speciale pentru evenimente.",
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
    <main className="min-h-screen overflow-x-clip bg-[#050308]">
      <ScrollProgress />
      <Navbar />
      <Hero />

      <CinematicPrologue />

      <CinematicScene index={2} label="Dovezi" accent="#8F6BFF" motionType="focus">
        <Stats />
      </CinematicScene>

      <Showcase />

      <CinematicScene index={4} label="Siguranță" accent="#3A86FF" motionType="aperture">
        <WhyUs />
      </CinematicScene>

      <Process />

      <OfferJourney />

      <CinematicScene id="galerie" index={6} label="Galerie" accent="#5AA9FF" motionType="fold">
        <Gallery />
      </CinematicScene>

      <CinematicScene index={7} label="Încredere" accent="#8F6BFF" motionType="lift">
        <Testimonials />
      </CinematicScene>

      <Partners />

      <div className="site-ending">
        <FinalCta />
        <Footer />
      </div>
      <SocialDock />
    </main>
  );
}
