import { Compass, MapPin, Radio, ShieldCheck } from "lucide-react";
import Reveal from "@/components/site/Reveal";
import { SectionHeader } from "@/components/site/cinematic";

const PROOF = [
  { icon: Compass, title: "Concept personalizat", text: "Show-ul pornește de la eveniment, nu de la un șablon." },
  { icon: MapPin, title: "Adaptat locației", text: "Spațiul, publicul și momentul dictează soluția vizuală." },
  { icon: Radio, title: "Sincronizare controlată", text: "Dronele, artificiile și efectele urmează același scenariu." },
  { icon: ShieldCheck, title: "Plan tehnic clar", text: "Deciziile de siguranță și logistică sunt definite înainte de show." },
];

export const Stats = () => (
  <section className="relative border-y border-white/5 py-16 sm:py-20 md:py-24" data-testid="stats-section">
    <div className="mx-auto max-w-7xl px-5 sm:px-6 md:px-12">
      <SectionHeader
        kicker="Dovezi înainte de promisiuni"
        title="Spectacolul începe cu un proces bine construit"
        subtitle="Încrederea vine din claritate: ce proiectăm, cum adaptăm și cum pregătim fiecare moment."
      />
      <div className="mt-9 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {PROOF.map((item, index) => (
          <Reveal key={item.title} delay={index * 0.06}>
            <article className="h-full rounded-2xl border border-white/9 bg-white/[0.035] p-4 sm:p-5">
              <item.icon className="h-5 w-5 text-[#9D7BFF]" />
              <h3 className="mt-4 font-display text-sm font-semibold text-white sm:text-base">{item.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-white/52 sm:text-sm">{item.text}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

export default Stats;
