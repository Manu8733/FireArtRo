import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ExternalLink, Mail } from "lucide-react";
import Navbar from "@/components/site/Navbar";
import ScrollProgress from "@/components/site/ScrollProgress";
import PageEnd from "@/components/site/PageEnd";
import usePageMeta from "@/hooks/usePageMeta";
import useManagedContent from "@/hooks/useManagedContent";
import { EMAIL } from "@/lib/constants";
import { SITE_DETAILS } from "@/data/businessContent";
import "@/styles/night-legal.css";

const LEGAL_PAGES = {
  confidentialitate: {
    path: "/confidentialitate",
    eyebrow: "Protecția datelor",
    title: "Politica de confidențialitate",
    description:
      "Cum colectează, folosește și protejează FireArtRo datele transmise prin site.",
    updated: "25 iulie 2026",
    sections: [
      {
        title: "Operatorul datelor",
        body: [
          `Site-ul FireArtRo este operat de ${SITE_DETAILS.legalName}, CUI ${SITE_DETAILS.taxId}, înregistrată la Registrul Comerțului sub nr. ${SITE_DETAILS.registrationNumber}, cu sediul social în ${SITE_DETAILS.registeredOffice}.`,
          `Activitatea este coordonată din sediul principal din ${SITE_DETAILS.mainOffice}. Pentru solicitări privind datele personale ne poți scrie la ${EMAIL}.`,
        ],
      },
      {
        title: "Datele pe care le colectăm",
        body: [
          "Prin formularul de ofertă putem colecta numele, prenumele, telefonul, emailul, localitatea, locația și data evenimentului, tipul evenimentului, serviciile selectate, pachetul preferat și mesajul transmis.",
          "Colectăm numai informațiile necesare pentru a analiza solicitarea și a continua discuția comercială.",
          "Pentru protecția site-ului împotriva folosirii abuzive a formularului, reținem temporar, în memoria serverului și nu în baza de date, adresa IP a solicitării, strict pentru a limita numărul de trimiteri de la aceeași sursă într-un interval scurt de timp.",
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
    sources: [
      {
        label: "Informații oficiale ANSPDCP despre GDPR",
        href: "https://www.dataprotection.ro/?page=noua+_pagina_regulamentul_GDPR",
      },
      {
        label: "Cum depui o plângere la ANSPDCP",
        href: "https://www.dataprotection.ro/?page=Plangeri_RGPD&lang=ro",
      },
    ],
  },
  termeni: {
    path: "/termeni-si-conditii",
    eyebrow: "Condiții de utilizare",
    title: "Termeni și condiții",
    description:
      "Regulile generale pentru utilizarea site-ului și solicitarea serviciilor FireArtRo.",
    updated: "25 iulie 2026",
    sections: [
      {
        title: "Furnizorul serviciilor",
        body: [
          `Serviciile prezentate sub marca FireArtRo sunt furnizate de ${SITE_DETAILS.legalName}, CUI ${SITE_DETAILS.taxId}, nr. Registrul Comerțului ${SITE_DETAILS.registrationNumber}. Sediul social este în ${SITE_DETAILS.registeredOffice}, iar sediul principal de lucru este în ${SITE_DETAILS.mainOffice}.`,
        ],
      },
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
      {
        title: "Soluționarea litigiilor",
        body: [
          `Dacă ai o nemulțumire legată de serviciile FireArtRo, te încurajăm să ne scrii mai întâi direct la ${EMAIL}, ca să găsim împreună o soluție pe cale amiabilă.`,
          "Te poți adresa și Autorității Naționale pentru Protecția Consumatorilor (ANPC) — telefon 021 9551 sau formularul de pe eservicii.anpc.ro — ori sistemului național de soluționare alternativă a litigiilor (SAL), disponibil la reclamatiisal.anpc.ro.",
        ],
      },
      {
        title: "Legea aplicabilă",
        body: [
          "Acești termeni sunt guvernați de legislația română. Orice litigiu care nu poate fi soluționat pe cale amiabilă sau prin procedurile de mai sus este de competența instanțelor române.",
        ],
      },
    ],
    sources: [
      {
        label: "Sesizare SAL (ANPC)",
        href: "https://reclamatiisal.anpc.ro/",
      },
      {
        label: "Formular reclamație ANPC",
        href: "https://eservicii.anpc.ro/",
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
  const siteDetails = useManagedContent("siteDetails", SITE_DETAILS);
  const email = siteDetails.email || EMAIL;
  const data = useMemo(() => {
    const template = LEGAL_PAGES[type] || LEGAL_PAGES.confidentialitate;
    const replacements = [
      [SITE_DETAILS.legalName, siteDetails.legalName],
      [SITE_DETAILS.taxId, siteDetails.taxId],
      [SITE_DETAILS.registrationNumber, siteDetails.registrationNumber],
      [SITE_DETAILS.registeredOffice, siteDetails.registeredOffice],
      [SITE_DETAILS.mainOffice, siteDetails.mainOffice],
      [EMAIL, email],
    ].filter(([from, to]) => from && to && from !== to);
    const replaceDetails = (value) => replacements.reduce(
      (result, [from, to]) => result.split(from).join(to),
      value
    );

    return {
      ...template,
      sections: template.sections.map((section) => ({
        ...section,
        body: section.body.map(replaceDetails),
      })),
    };
  }, [email, siteDetails, type]);

  usePageMeta({
    title: `${data.title} — FireArtRo`,
    description: data.description,
    path: data.path,
  });

  return (
    <main className="legal-page" data-design="night-runway">
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

          {data.sources && data.sources.length > 0 && (
            <div className="legal-sources">
              {data.sources.map((item) => (
                <a
                  key={item.href}
                  className="legal-source"
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {item.label} <ExternalLink />
                </a>
              ))}
            </div>
          )}

          <div className="legal-contact">
            <Mail />
            <div>
              <span>Ai o solicitare legată de acest document?</span>
              <a href={`mailto:${email}`}>{email}</a>
            </div>
          </div>
        </article>
      </div>

      <PageEnd />
    </main>
  );
}
