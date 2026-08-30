import Navbar from "@/components/site/Navbar";
import Hero from "@/components/site/Hero";
import PageEnd from "@/components/site/PageEnd";
import SocialDock from "@/components/site/SocialDock";
import ScrollProgress from "@/components/site/ScrollProgress";
import HomeRunway from "@/components/night/HomeRunway";
import usePageMeta from "@/hooks/usePageMeta";
import useManagedContent from "@/hooks/useManagedContent";
import { BUSINESS_HOURS, SITE_DETAILS, SOCIAL_LINKS } from "@/data/businessContent";
import "@/styles/night-home.css";
import "@/styles/night-home-film.css";

export default function Home() {
  const siteDetails = useManagedContent("siteDetails", SITE_DETAILS);
  const businessHours = useManagedContent("businessHours", BUSINESS_HOURS);
  const socialLinks = useManagedContent("socialLinks", SOCIAL_LINKS);

  usePageMeta({
    title: "Spectacole cu drone și artificii pentru evenimente | FireArtRo",
    description:
      "FireArtRo creează spectacole cu drone, artificii și efecte scenice pentru nunți, evenimente corporate și festivaluri din România.",
    path: "/",
    schema: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": ["Organization", "LocalBusiness", "ProfessionalService"],
          name: siteDetails.name,
          legalName: siteDetails.legalName,
          url: siteDetails.siteUrl,
          email: siteDetails.email,
          taxID: siteDetails.taxId,
          address: {
            "@type": "PostalAddress",
            streetAddress: siteDetails.mainOffice,
            addressCountry: "RO",
          },
          sameAs: socialLinks.map((profile) => profile.href),
          areaServed: { "@type": "Country", name: siteDetails.areaServed },
          openingHours: businessHours.schema,
          description:
            "Producție de spectacole cu drone, artificii profesionale și efecte speciale pentru evenimente.",
        },
        {
          "@type": "Service",
          name: "Spectacole cu drone și artificii",
          provider: { "@type": "Organization", name: siteDetails.name },
          areaServed: { "@type": "Country", name: siteDetails.areaServed },
        },
      ],
    },
  });

  return (
    <main className="nr-home" data-design="night-runway">
      <ScrollProgress />
      <Navbar />
      <Hero />
      <HomeRunway />
      <PageEnd showBlog />
      <SocialDock />
    </main>
  );
}
