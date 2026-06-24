import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { LOGO_URL, EMAIL, PHONE_DISPLAY } from "@/lib/constants";

const CONTENT = {
  confidentialitate: {
    title: "Politica de confidențialitate",
    intro:
      "FIREARTRO respectă confidențialitatea datelor tale. Această politică descrie ce date colectăm și cum le folosim.",
    sections: [
      {
        h: "Ce date colectăm",
        p: "Atunci când completezi formularul de ofertă, colectăm numele, numărul de telefon, adresa de email (opțional) și detaliile evenimentului (tip, dată, locație, mesaj). Aceste date sunt folosite exclusiv pentru a-ți transmite o ofertă și a comunica despre eveniment.",
      },
      {
        h: "Cum folosim datele",
        p: "Datele sunt utilizate pentru a răspunde solicitărilor tale, a pregăti oferte personalizate și a organiza spectacolele. Nu vindem și nu transmitem datele tale către terți în scopuri de marketing.",
      },
      {
        h: "Stocare și securitate",
        p: "Datele sunt stocate în siguranță și păstrate doar atât timp cât este necesar pentru a-ți oferi serviciile solicitate sau conform obligațiilor legale.",
      },
      {
        h: "Drepturile tale",
        p: "Ai dreptul de a solicita accesul, rectificarea sau ștergerea datelor tale personale. Pentru orice solicitare, ne poți contacta la " + EMAIL + ".",
      },
    ],
  },
  termeni: {
    title: "Termeni și condiții",
    intro:
      "Prin utilizarea acestui site și solicitarea serviciilor FIREARTRO, ești de acord cu următorii termeni.",
    sections: [
      {
        h: "Serviciile noastre",
        p: "FIREARTRO oferă spectacole de drone, artificii profesionale, show-uri combinate și efecte speciale. Fiecare ofertă este personalizată în funcție de locație, durată și complexitate.",
      },
      {
        h: "Rezervări și oferte",
        p: "Solicitarea unei oferte prin formular nu constituie o rezervare confirmată. Rezervarea devine fermă în urma confirmării reciproce și a îndeplinirii condițiilor agreate.",
      },
      {
        h: "Siguranță și autorizații",
        p: "Toate spectacolele sunt realizate cu respectarea normelor de siguranță și a autorizațiilor necesare. În condiții meteo nefavorabile, ne rezervăm dreptul de a replanifica sau adapta spectacolul.",
      },
      {
        h: "Responsabilitate",
        p: "FIREARTRO depune toate eforturile pentru execuția impecabilă a fiecărui show. Detaliile finale, durata și conținutul spectacolului se stabilesc de comun acord înainte de eveniment.",
      },
    ],
  },
  cookies: {
    title: "Politica de cookie-uri",
    intro:
      "Acest site folosește un minim de cookie-uri pentru a asigura funcționarea corectă și a îmbunătăți experiența ta.",
    sections: [
      {
        h: "Ce sunt cookie-urile",
        p: "Cookie-urile sunt fișiere mici stocate în browserul tău care ajută site-ul să funcționeze și să rețină anumite preferințe.",
      },
      {
        h: "Cookie-uri pe care le folosim",
        p: "Folosim cookie-uri esențiale pentru funcționarea site-ului și, eventual, cookie-uri de analiză pentru a înțelege cum este utilizat site-ul, fără a colecta date personale identificabile.",
      },
      {
        h: "Controlul cookie-urilor",
        p: "Poți gestiona sau șterge cookie-urile din setările browserului tău. Dezactivarea unor cookie-uri poate afecta funcționalitatea site-ului.",
      },
    ],
  },
};

export default function LegalPage() {
  const { slug } = useParams();
  const data = CONTENT[slug] || CONTENT.confidentialitate;

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = `${data.title} — FIREARTRO`;
  }, [slug, data.title]);

  return (
    <main className="bg-[#050308] min-h-screen">
      <div className="border-b border-white/10">
        <div className="max-w-3xl mx-auto px-6 md:px-12 py-6 flex items-center justify-between">
          <Link to="/" data-testid="legal-logo">
            <img src={LOGO_URL} alt="FIREARTRO" className="h-9 w-auto object-contain" />
          </Link>
          <Link
            to="/"
            data-testid="legal-back"
            className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Înapoi acasă
          </Link>
        </div>
      </div>

      <article className="max-w-3xl mx-auto px-6 md:px-12 py-16 md:py-24">
        <h1 className="font-display font-bold text-white text-4xl sm:text-5xl tracking-tight">
          {data.title}
        </h1>
        <p className="mt-5 text-white/60 font-light text-lg">{data.intro}</p>

        <div className="mt-12 space-y-10">
          {data.sections.map((s, i) => (
            <section key={i} data-testid={`legal-section-${i}`}>
              <h2 className="font-display font-semibold text-2xl text-white">{s.h}</h2>
              <p className="mt-3 text-white/60 font-light leading-relaxed">{s.p}</p>
            </section>
          ))}
        </div>

        <div className="mt-16 glass rounded-2xl p-6">
          <p className="text-white/55 text-sm">
            Pentru întrebări, ne poți contacta la{" "}
            <a href={`mailto:${EMAIL}`} className="text-[#9D7BFF]">{EMAIL}</a> sau telefonic la{" "}
            <span className="text-white">{PHONE_DISPLAY}</span>.
          </p>
        </div>
      </article>
    </main>
  );
}
