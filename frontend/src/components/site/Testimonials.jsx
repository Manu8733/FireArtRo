import { Eye, FileCheck2, MessagesSquare } from "lucide-react";
import Reveal from "@/components/site/Reveal";
import { SectionHeader } from "@/components/site/cinematic";
import { MEDIA } from "@/data/content";

const PROOF = [
  {
    icon: Eye,
    title: "Portofoliu relevant",
    text: "Selectăm exemple apropiate de tipul și scara evenimentului discutat.",
    image: MEDIA.wedding,
  },
  {
    icon: FileCheck2,
    title: "Direcție documentată",
    text: "Primești o propunere clară de concept, ritm, efecte și cerințe tehnice.",
    image: MEDIA.corporate,
  },
  {
    icon: MessagesSquare,
    title: "Referințe reale, la cerere",
    text: "Adăugăm testimoniale și nume de clienți numai cu acordul lor explicit.",
    image: MEDIA.crowd,
  },
];

export const Testimonials = () => (
  <section className="relative overflow-hidden py-20 sm:py-24 md:py-28" data-testid="testimonials-section">
    <div className="mx-auto max-w-7xl px-5 sm:px-6 md:px-12">
      <SectionHeader
        kicker="Încredere verificabilă"
        title="Îți arătăm ce este relevant înainte să ceri oferta"
        subtitle="Fără logo-uri sau recenzii inventate. Folosim exemple, documentație și referințe reale atunci când pot fi publicate."
      />
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {PROOF.map((item, index) => (
          <Reveal key={item.title} delay={index * 0.07}>
            <article className="group relative min-h-[280px] overflow-hidden rounded-3xl border border-white/10 bg-[#0A0712]">
              <img
                src={item.image}
                alt=""
                aria-hidden="true"
                width="1280"
                height="853"
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover opacity-38 transition-transform duration-700 group-hover:scale-[1.035]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050308] via-[#050308]/82 to-[#050308]/20" />
              <div className="relative flex min-h-[280px] flex-col justify-end p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/30 backdrop-blur-md">
                  <item.icon className="h-5 w-5 text-[#9D7BFF]" />
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/58">{item.text}</p>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

export default Testimonials;
