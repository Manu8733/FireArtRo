import { Link } from "react-router-dom";
import { ArrowRight, ExternalLink, Mail } from "lucide-react";
import Navbar from "@/components/site/Navbar";
import ScrollProgress from "@/components/site/ScrollProgress";
import Footer from "@/components/site/Footer";
import usePageMeta from "@/hooks/usePageMeta";
import { EMAIL } from "@/lib/constants";

const LEGAL_PAGES = {
  confidentialitate: {
    path: "/confidentialitate",
    eyebrow: "Protecția datelor",
    title: "Politica de confidențialitate",
    description:
      "Cum colectează, folosește și protejează FireArtRo datele transmise prin site.",
    updated: "24 iunie 2026",
    sections: [
      {
        title: "Operatorul datelor",
        body: [
          `Datele transmise prin acest site sunt administrate de FireArtRo. Pentru orice solicitare privind datele personale ne poți scrie la ${EMAIL}.`,
        ],
      },
      {
        title: "Datele pe care le colectăm",
        body: [
          "Prin formularul de ofertă putem colecta numele, prenumele, telefonul, emailul, localitatea, locația și data evenimentului, tipul evenimentului, serviciile selectate, pachetul preferat și mesajul transmis.",
          "Colectăm numai informațiile necesare pentru a analiza solicitarea și a continua discuția comercială.",
        ],
      },
      {
        title: "Scopul și temeiul prelucrării",
        body: [
          "Folosim datele pentru a răspunde solicitărilor, a pregăti o ofertă, a planifica serviciile cerute și a păstra evidențele necesare colaborării.",
          "Prelucrarea se bazează pe demersurile făcute la cererea ta înaintea încheierii unui contract, pe executarea contractului, pe obligații legale sau pe consimțământ, după caz.",
        ],
      },
      {
        title: "Păstrare și destinatari",
        body: [
          "Datele sunt păstrate numai cât este necesar pentru scopul comunicat și pentru obligațiile legale aplicabile. Nu vindem date personale.",
          "Accesul poate fi acordat furnizorilor tehnici strict necesari operării site-ului și comunicării, în baza unor obligații de confidențialitate și securitate.",
        ],
      },
      {
        title: "Drepturile tale",
        body: [
          "Poți solicita accesul, rectificarea, ștergerea, restricționarea sau portabilitatea datelor și te poți opune anumitor prelucrări. Îți poți retrage consimțământul atunci când acesta este temeiul utilizat.",
          "Ai și dreptul de a depune o plângere la Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal.",
        ],
      },
    ],
    source: {
      label: "Informații oficiale ANSPDCP despre GDPR",
      href: "https://www.dataprotection.ro/?page=noua+_pagina_regulamentul_GDPR",
    },
  },
  termeni: {
    path: "/termeni-si-conditii",
    eyebrow: "Condiții de utilizare",
    title: "Termeni și condiții",
    description:
      "Regulile generale pentru utilizarea site-ului și solicitarea serviciilor FireArtRo.",
    updated: "24 iunie 2026",
    sections: [
      {
        title: "Rolul site-ului",
        body: [
          "Site-ul prezintă serviciile FireArtRo și permite trimiterea unei solicitări de ofertă. Informațiile au caracter general și pot fi actualizate pe măsură ce serviciile evoluează.",
        ],
      },
      {
        title: "Oferte și rezervări",
        body: [
          "Trimiterea formularului nu reprezintă o rezervare și nu creează automat o obligație contractuală. Oferta finală este stabilită după verificarea locației, datei, cerințelor tehnice și condițiilor de siguranță.",
          "O rezervare devine fermă numai după acceptarea condițiilor comerciale și tehnice comunicate de FireArtRo.",
        ],
      },
      {
        title: "Siguranță, avize și condiții meteo",
        body: [
          "Spectacolele se realizează numai dacă pot fi respectate normele de siguranță, restricțiile locației și autorizările aplicabile.",
          "Vântul, precipitațiile, restricțiile de spațiu aerian sau alte situații independente pot impune adaptarea, amânarea ori anularea unei componente a spectacolului.",
        ],
      },
      {
        title: "Proprietate intelectuală",
        body: [
          "Textele, identitatea vizuală, conceptele, fotografiile și materialele video publicate pe site sunt protejate. Reutilizarea lor comercială fără acord scris nu este permisă.",
        ],
      },
      {
        title: "Limitarea răspunderii",
        body: [
          "FireArtRo urmărește menținerea informațiilor corecte și a site-ului disponibil, dar nu poate garanta funcționarea neîntreruptă sau lipsa completă a erorilor tehnice.",
          "Condițiile specifice fiecărui proiect sunt cele prevăzute în oferta și documentele acceptate de părți.",
        ],
      },
    ],
  },
  cookies: {
    path: "/cookies",
    eyebrow: "Preferințe și stocare locală",
    title: "Politica de cookies",
    description:
      "Ce tehnologii de stocare poate utiliza site-ul FireArtRo și cum le poți controla.",
    updated: "24 iunie 2026",
    sections: [
      {
        title: "Ce stocăm în browser",
        body: [
          "Site-ul poate folosi cookie-uri și localStorage, adică mecanisme prin care browserul păstrează preferințe tehnice. FireArtRo folosește aceste mecanisme numai pentru funcții explicate în această politică.",
          "Alegerea făcută în bannerul de consimțământ este salvată local timp de maximum 180 de zile, după care site-ul solicită din nou preferințele.",
        ],
      },
      {
        title: "Cookie-uri strict necesare",
        body: [
          "Categoria strict necesară păstrează alegerea de consimțământ și susține funcțiile esențiale ale interfeței. Nu poate fi dezactivată din banner deoarece fără ea preferința ar trebui solicitată la fiecare vizită.",
          "Aceste date nu sunt folosite pentru publicitate comportamentală și nu creează un profil comercial al vizitatorului.",
        ],
      },
      {
        title: "Analiză opțională",
        body: [
          "Categoria Analiză este dezactivată implicit. Ea poate fi folosită numai dacă FireArtRo configurează ulterior un instrument de măsurare și numai după acceptul explicit al vizitatorului.",
          "În starea actuală, acceptarea categoriei pregătește preferința, dar nu activează automat un furnizor de analiză neconfigurat.",
        ],
      },
      {
        title: "YouTube și conținut extern",
        body: [
          "Galeria afișează inițial doar posterul videoclipului. Playerul YouTube nu este încărcat la deschiderea paginii, ci numai după ce utilizatorul apasă pe un material video.",
          "După pornirea playerului, YouTube poate prelucra date tehnice conform propriei politici. Folosim domeniul youtube-nocookie.com pentru o integrare cu expunere redusă înainte de interacțiune.",
        ],
      },
      {
        title: "Marketing și servicii viitoare",
        body: [
          "Categoria Conținut extern și marketing este dezactivată implicit. Orice pixel, instrument publicitar sau integrare nouă trebuie documentată aici și condiționată de consimțământ înainte de activare.",
          "FireArtRo nu activează automat publicitate personalizată doar pentru că vizitatorul deschide site-ul.",
        ],
      },
      {
        title: "Cum modifici sau retragi alegerea",
        body: [
          "Poți redeschide oricând panoul din linkul Setări cookies aflat în footer și poți alege Doar necesare sau alte preferințe.",
          "Poți șterge și datele site-ului direct din setările browserului. La următoarea vizită, bannerul va fi afișat din nou.",
        ],
      },
      {
        title: "Lista actuală a stocării locale",
        body: [
          "fireartro-cookie-consent-v1: păstrează categoriile acceptate, data salvării și data expirării.",
          "fireartro-managed-content-v1: este utilizată numai de pagina locală de administrare pentru previzualizarea drafturilor în browserul în care au fost editate; nu este un cookie de urmărire.",
        ],
      },
    ],
  },
};

const LEGAL_NAV = [
  { key: "confidentialitate", label: "Confidențialitate" },
  { key: "termeni", label: "Termeni și condiții" },
  { key: "cookies", label: "Cookies" },
];

export default function LegalPage({ type = "confidentialitate" }) {
  const data = LEGAL_PAGES[type] || LEGAL_PAGES.confidentialitate;

  usePageMeta({
    title: `${data.title} — FireArtRo`,
    description: data.description,
    path: data.path,
  });

  return (
    <main className="legal-page min-h-screen overflow-x-clip bg-[#050308] text-white">
      <ScrollProgress />
      <Navbar />

      <header className="legal-hero">
        <div className="legal-hero-inner">
          <span>{data.eyebrow}</span>
          <h1>{data.title}</h1>
          <p>{data.description}</p>
          <small>Actualizat la {data.updated}</small>
        </div>
      </header>

      <div className="legal-layout">
        <aside className="legal-nav" aria-label="Documente legale">
          <span>Documente</span>
          {LEGAL_NAV.map((item) => (
            <Link
              key={item.key}
              to={LEGAL_PAGES[item.key].path}
              className={item.key === type ? "is-active" : undefined}
            >
              {item.label} <ArrowRight />
            </Link>
          ))}
        </aside>

        <article className="legal-article">
          {data.sections.map((section, index) => (
            <section key={section.title} aria-labelledby={`legal-section-${index}`}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h2 id={`legal-section-${index}`}>{section.title}</h2>
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}

          {data.source && (
            <a className="legal-source" href={data.source.href} target="_blank" rel="noopener noreferrer">
              {data.source.label} <ExternalLink />
            </a>
          )}

          <div className="legal-contact">
            <Mail />
            <div>
              <span>Ai o solicitare legată de acest document?</span>
              <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
            </div>
          </div>
        </article>
      </div>

      <Footer />
    </main>
  );
}
