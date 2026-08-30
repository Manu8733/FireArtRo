import Navbar from "@/components/site/Navbar";
import ScrollProgress from "@/components/site/ScrollProgress";
import QuoteForm from "@/components/site/QuoteForm";
import PageEnd from "@/components/site/PageEnd";
import usePageMeta from "@/hooks/usePageMeta";
import "@/styles/night-contact.css";

export default function ContactPage() {
  usePageMeta({
    title: "Solicită ofertă pentru drone show și artificii | FireArtRo",
    description:
      "Trimite data, locul și tipul evenimentului pentru o ofertă FireArtRo de drone show, artificii sau efecte speciale.",
    path: "/contact",
  });

  return (
    <main className="contact-page nr-contact-page" data-design="night-runway">
      <ScrollProgress />
      <Navbar />
      <QuoteForm />
      <PageEnd />
    </main>
  );
}
