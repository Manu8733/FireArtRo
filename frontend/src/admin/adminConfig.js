import {
  BUSINESS_HOURS,
  CONTACT_SETTINGS_DEFAULT,
  MANAGED_CONTENT_DEFAULTS,
  SITE_DETAILS,
  SOCIAL_LINKS,
} from "@/data/businessContent";
import { FAQS } from "@/data/content";
export const ADMIN_DEFAULTS = {
  ...MANAGED_CONTENT_DEFAULTS,
  siteDetails: SITE_DETAILS,
  businessHours: BUSINESS_HOURS,
  contactSettings: CONTACT_SETTINGS_DEFAULT,
  socialLinks: SOCIAL_LINKS,
  faqs: FAQS,
};

const text = (key, label, options = {}) => ({ key, label, type: "text", ...options });
const textarea = (key, label, options = {}) => ({ key, label, type: "textarea", ...options });
const number = (key, label, options = {}) => ({ key, label, type: "number", ...options });
const select = (key, label, options = {}) => ({ key, label, type: "select", ...options });
const checkbox = (key, label, options = {}) => ({ key, label, type: "checkbox", ...options });
const image = (key, label, options = {}) => ({ key, label, type: "image", ...options });
const lines = (key, label, options = {}) => ({ key, label, type: "lines", ...options });

export const ADMIN_MODULES = {
  siteDetails: {
    label: "Companie",
    description: "Identitate, contact și sedii",
    kind: "object",
    fields: [
      text("name", "Nume brand", { required: true }),
      text("email", "Email public", { inputType: "email", required: true }),
      text("siteUrl", "Adresă site", { inputType: "url" }),
      text("googleReviewsUrl", "Link Google Reviews", { inputType: "url" }),
      text("areaServed", "Zonă deservită"),
      text("legalName", "Denumire juridică"),
      text("registrationNumber", "Nr. Registrul Comerțului"),
      text("taxId", "CUI"),
      textarea("registeredOffice", "Sediu social", { rows: 2 }),
      textarea("mainOffice", "Sediu principal", { rows: 2 }),
      textarea("secondaryOffice", "Sediu secundar", { rows: 2 }),
    ],
  },
  contactSettings: {
    label: "Contact direct",
    description: "Telefon și WhatsApp",
    kind: "object",
    fields: [
      text("phoneDisplay", "Telefon afișat", { placeholder: "07xx xxx xxx" }),
      text("phoneTel", "Telefon pentru apel", { inputType: "tel", placeholder: "+407..." }),
      text("whatsappNumber", "Număr WhatsApp", { inputType: "tel", placeholder: "407..." }),
    ],
  },
  businessHours: {
    label: "Program",
    description: "Ore și disponibilitate",
    kind: "object",
    fields: [
      text("label", "Program afișat"),
      textarea("note", "Notă de disponibilitate", { rows: 3 }),
      text("schema", "Program pentru motoare de căutare", {
        type: "tags",
        help: "Exemplu: Mo-Fr 10:00-18:00",
      }),
    ],
  },
  socialLinks: {
    label: "Rețele sociale",
    description: "Canale publice și linkuri",
    kind: "collection",
    titleKey: "label",
    subtitleKey: "href",
    template: { id: "social", label: "Canal nou", href: "", placeholder: false },
    fields: [
      text("id", "Identificator", { required: true }),
      text("label", "Nume canal", { required: true }),
      text("href", "Link", { inputType: "url", required: true }),
      checkbox("placeholder", "Este doar placeholder"),
    ],
  },
  promoSlides: {
    label: "Slider homepage",
    description: "Cadrele promovate pe prima pagină",
    kind: "collection",
    titleKey: "title",
    subtitleKey: "badge",
    previewKey: "poster",
    template: {
      id: "slide",
      type: "image",
      title: "Cadru nou",
      shortText: "Descriere scurtă.",
      badge: "Selecție",
      media: "",
      poster: "",
      ctaLabel: "Vezi detalii",
      ctaHref: "/contact",
    },
    fields: [
      text("id", "Identificator", { required: true }),
      select("type", "Tip media", { options: ["image", "video", "youtube", "promotion"] }),
      text("title", "Titlu", { required: true }),
      textarea("shortText", "Descriere", { rows: 3 }),
      text("badge", "Etichetă"),
      image("poster", "Poster / imagine", { help: "Încarcă o fotografie sau introdu o cale/URL." }),
      text("media", "Fișier media", { help: "Cale sau URL pentru imagine/video." }),
      text("youtubeUrl", "Link YouTube", { inputType: "url" }),
      text("ctaLabel", "Text buton"),
      text("ctaHref", "Destinație buton"),
    ],
  },
  mediaItems: {
    label: "Galerie",
    description: "Fotografii și materiale publicate",
    kind: "collection",
    titleKey: "title",
    subtitleKey: "category",
    previewKey: "thumbnail",
    template: {
      id: "gallery-item",
      type: "image",
      title: "Imagine nouă",
      shortDescription: "Descrierea cadrului.",
      category: "Artificii noapte",
      tags: [],
      thumbnail: "",
      poster: "",
      src: "",
      alt: "",
      featured: false,
      date: new Date().toISOString().slice(0, 10),
      order: 1,
      eventType: "",
    },
    fields: [
      text("id", "Identificator", { required: true }),
      select("type", "Tip", { options: ["image", "video", "youtube", "promo"] }),
      text("title", "Titlu", { required: true }),
      textarea("shortDescription", "Descriere", { rows: 3 }),
      text("category", "Categorie"),
      text("eventType", "Tip eveniment"),
      { key: "tags", label: "Etichete", type: "tags", help: "Separate prin virgulă." },
      image("src", "Imagine principală", { sync: ["thumbnail", "poster"] }),
      image("thumbnail", "Miniatură"),
      image("poster", "Poster"),
      text("youtubeUrl", "Link YouTube", { inputType: "url" }),
      textarea("alt", "Text alternativ", { rows: 2, help: "Descrie concret ce se vede în imagine." }),
      text("date", "Dată", { inputType: "date" }),
      number("order", "Ordine", { min: 0 }),
      checkbox("featured", "Evidențiat în galerie"),
      text("ctaLabel", "Text buton"),
      text("ctaHref", "Destinație buton"),
    ],
  },
  packages: {
    label: "Pachete",
    description: "Opțiuni și configurații comerciale",
    kind: "collection",
    titleKey: "title",
    subtitleKey: "category",
    previewKey: "image",
    template: {
      id: "package",
      title: "Pachet nou",
      category: "Show drone",
      bestFor: "",
      shortDescription: "",
      visualImpact: "",
      duration: "",
      droneCount: "",
      effectsCount: "",
      badge: "",
      cta: "Cere ofertă",
      image: "",
      highlights: [],
      bonus: "",
      videoUrl: "",
      videoNote: "",
      moreVideoUrls: [],
    },
    fields: [
      text("id", "Identificator", { required: true }),
      text("title", "Nume pachet", { required: true }),
      select("category", "Categorie", {
        options: ["Artificii de zi", "Artificii de noapte", "Show drone", "Drone + artificii", "Efecte speciale", "Corporate / Festival"],
      }),
      image("image", "Imagine proprie"),
      textarea("shortDescription", "Descriere", { rows: 3 }),
      text("bestFor", "Potrivit pentru"),
      text("visualImpact", "Atmosferă / impact"),
      text("duration", "Durată"),
      number("droneCount", "Număr drone", { min: 0 }),
      number("effectsCount", "Grupe de efecte", { min: 0 }),
      text("badge", "Badge"),
      { key: "highlights", label: "Caracteristici", type: "tags", help: "Separate prin virgulă." },
      textarea("bonus", "Bonus / elemente incluse", { rows: 3 }),
      text("videoUrl", "Video principal", {
        inputType: "url",
        help: "Un singur link YouTube sau un URL video direct. Playerul se încarcă numai după click.",
      }),
      textarea("videoNote", "Notă video", { rows: 2 }),
      lines("moreVideoUrls", "Alte videoclipuri", {
        rows: 6,
        help: "Câte un link pe rând. Vor apărea ca linkuri externe, nu ca playere suplimentare.",
      }),
      text("cta", "Text buton"),
    ],
  },
  faqs: {
    label: "Întrebări",
    description: "Întrebări frecvente și răspunsuri",
    kind: "collection",
    titleKey: "q",
    subtitleKey: "a",
    template: { q: "Întrebare nouă", a: "Răspuns clar și concis." },
    fields: [
      textarea("q", "Întrebare", { rows: 2, required: true }),
      textarea("a", "Răspuns", { rows: 5, required: true }),
    ],
  },
  testimonials: {
    label: "Recenzii",
    description: "Feedback publicat responsabil",
    kind: "collection",
    titleKey: "name",
    subtitleKey: "eventType",
    template: {
      id: "testimonial",
      name: "Nume client",
      eventType: "Eveniment",
      quote: "",
      source: "client",
      replaceable: false,
    },
    fields: [
      text("id", "Identificator", { required: true }),
      text("name", "Nume / titlu", { required: true }),
      text("eventType", "Tip eveniment"),
      textarea("quote", "Recenzie", { rows: 5, required: true }),
      text("source", "Sursă"),
      checkbox("replaceable", "Conținut demonstrativ"),
    ],
  },
  partners: {
    label: "Parteneri",
    description: "Identități și logo-uri aprobate",
    kind: "collection",
    titleKey: "name",
    subtitleKey: "logoPlaceholder",
    previewKey: "logo",
    template: { id: "partner", name: "Partener nou", logoPlaceholder: "LOGO", logo: "", replaceable: false },
    fields: [
      text("id", "Identificator", { required: true }),
      text("name", "Nume partener", { required: true }),
      image("logo", "Logo"),
      text("logoPlaceholder", "Text fallback"),
      checkbox("replaceable", "Conținut demonstrativ"),
    ],
  },
  cookieSettings: {
    label: "Cookies",
    description: "Textele bannerului de consimțământ",
    kind: "object",
    fields: [
      text("title", "Titlu"),
      textarea("summary", "Rezumat", { rows: 4 }),
      text("necessaryLabel", "Titlu strict necesare"),
      textarea("necessaryDescription", "Descriere strict necesare", { rows: 3 }),
      text("analyticsLabel", "Titlu analiză"),
      textarea("analyticsDescription", "Descriere analiză", { rows: 3 }),
      text("marketingLabel", "Titlu marketing"),
      textarea("marketingDescription", "Descriere marketing", { rows: 3 }),
      number("retentionDays", "Păstrare preferință (zile)", { min: 1, max: 730 }),
    ],
  },
};

export const MODULE_ORDER = [
  "siteDetails",
  "contactSettings",
  "businessHours",
  "socialLinks",
  "mediaItems",
  "packages",
  "faqs",
  "testimonials",
  "partners",
  "cookieSettings",
];

export const makeAdminItem = (moduleKey, index = 0) => {
  const template = ADMIN_MODULES[moduleKey]?.template || {};
  const suffix = `${Date.now().toString(36)}-${index + 1}`;
  const next = JSON.parse(JSON.stringify(template));
  if (Object.prototype.hasOwnProperty.call(next, "id")) {
    next.id = `${next.id || moduleKey}-${suffix}`;
  }
  if (Object.prototype.hasOwnProperty.call(next, "order")) next.order = index + 1;
  return next;
};
