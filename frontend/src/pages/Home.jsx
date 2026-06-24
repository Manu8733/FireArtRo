import { useEffect } from "react";
import Navbar from "@/components/site/Navbar";
import Hero from "@/components/site/Hero";
import CinematicPrologue from "@/components/site/CinematicPrologue";
import Chapters from "@/components/site/Chapters";
import Stats from "@/components/site/Stats";
import Services from "@/components/site/Services";
import Showcase from "@/components/site/Showcase";
import WhyUs from "@/components/site/WhyUs";
import Process from "@/components/site/Process";
import Packages from "@/components/site/Packages";
import Gallery from "@/components/site/Gallery";
import Testimonials from "@/components/site/Testimonials";
import Faq from "@/components/site/Faq";
import QuoteForm from "@/components/site/QuoteForm";
import FinalCta from "@/components/site/FinalCta";
import Footer from "@/components/site/Footer";
import SocialDock from "@/components/site/SocialDock";
import ScrollProgress from "@/components/site/ScrollProgress";
import CinematicScene from "@/components/site/CinematicScene";

export default function Home() {
  useEffect(() => {
    document.title = "FIREARTRO — Spectacole cu drone și artificii pentru evenimente";
  }, []);

  return (
    <main className="min-h-screen overflow-x-clip bg-[#050308]">
      <ScrollProgress />
      <Navbar />
      <Hero />

      <CinematicPrologue />

      <Chapters />

      <CinematicScene index={2} label="Dovezi" accent="#C77DFF" motionType="focus">
        <Stats />
      </CinematicScene>

      <CinematicScene id="servicii" index={3} label="Servicii" accent="#8338EC" motionType="curtain">
        <Services />
      </CinematicScene>

      <Showcase />

      <CinematicScene index={4} label="Siguranță" accent="#3A86FF" motionType="aperture">
        <WhyUs />
      </CinematicScene>

      <Process />

      <CinematicScene id="pachete" index={5} label="Pachete" accent="#8338EC" motionType="depth">
        <Packages />
      </CinematicScene>

      <CinematicScene id="galerie" index={6} label="Galerie" accent="#5AA9FF" motionType="fold">
        <Gallery />
      </CinematicScene>

      <CinematicScene index={7} label="Încredere" accent="#C77DFF" motionType="lift">
        <Testimonials />
      </CinematicScene>

      <CinematicScene id="intrebari" index={8} label="Întrebări" accent="#8338EC" motionType="focus">
        <Faq />
      </CinematicScene>

      <QuoteForm />
      <FinalCta />
      <Footer />
      <SocialDock />
    </main>
  );
}
