import { useEffect } from "react";
import Navbar from "@/components/site/Navbar";
import Hero from "@/components/site/Hero";
import Stats from "@/components/site/Stats";
import Services from "@/components/site/Services";
import Portfolio from "@/components/site/Portfolio";
import WhyUs from "@/components/site/WhyUs";
import Process from "@/components/site/Process";
import Packages from "@/components/site/Packages";
import Gallery from "@/components/site/Gallery";
import Testimonials from "@/components/site/Testimonials";
import Faq from "@/components/site/Faq";
import FinalCta from "@/components/site/FinalCta";
import QuoteForm from "@/components/site/QuoteForm";
import Footer from "@/components/site/Footer";
import WhatsAppFloat from "@/components/site/WhatsAppFloat";

export default function Home() {
  useEffect(() => {
    document.title = "FIREARTRO — Spectacole de drone și artificii premium";
  }, []);

  return (
    <main className="bg-[#050308] min-h-screen overflow-x-hidden">
      <Navbar />
      <Hero />
      <Stats />
      <Services />
      <Portfolio />
      <WhyUs />
      <Process />
      <Packages />
      <Gallery />
      <Testimonials />
      <Faq />
      <FinalCta />
      <QuoteForm />
      <Footer />
      <WhatsAppFloat />
    </main>
  );
}
