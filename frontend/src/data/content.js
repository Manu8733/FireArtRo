import {
  Plane,
  Flame,
  Sparkles,
  Zap,
  Wand2,
  ShieldCheck,
  HeartHandshake,
  Gauge,
  Layers,
  Settings2,
  Radio,
  MapPin,
  MessagesSquare,
  ClipboardList,
  Palette,
  Wrench,
  Rocket,
} from "lucide-react";

// Hero cinematic video collage (drone · fireworks · wedding) — hotlinkable Mixkit loops.
export const HERO_POSTER =
  "https://images.pexels.com/photos/27051702/pexels-photo-27051702.jpeg";
export const HERO_VIDEOS = [
  { src: "https://assets.mixkit.co/videos/46028/46028-720.mp4", label: "Artificii" },
  { src: "https://assets.mixkit.co/videos/49846/49846-720.mp4", label: "Drone" },
  { src: "https://assets.mixkit.co/videos/21718/21718-720.mp4", label: "Momente" },
  { src: "https://assets.mixkit.co/videos/28375/28375-720.mp4", label: "Spectacol" },
];

export const INTRO_BULLETS = [
  "Concept vizual creat special pentru evenimentul tău",
  "Drone, artificii și efecte speciale sincronizate",
  "Execuție sigură, autorizată și milimetrică",
];

export const TECH = [
  { icon: Settings2, title: "Planificare tehnică", desc: "Analizăm locația, vântul, spațiul aerian și logistica pentru un show fără surprize." },
  { icon: Radio, title: "Sincronizare vizuală", desc: "Coregrafie sincronizată pe muzică — drone, artificii și efecte la fix pe beat." },
  { icon: ShieldCheck, title: "Siguranță și autorizații", desc: "Echipă autorizată, protocoale de siguranță și toate avizele necesare." },
  { icon: Sparkles, title: "Drone + artificii", desc: "Combinăm tehnologia dronelor cu artificiile clasice pentru impact maxim." },
  { icon: MapPin, title: "Efecte adaptate locației", desc: "Indoor sau outdoor, adaptăm efectele la spațiul și atmosfera evenimentului." },
  { icon: MessagesSquare, title: "Consultanță pentru eveniment", desc: "Te ghidăm de la prima idee până la ultimul efect, pas cu pas." },
];

export const SERVICE_OPTIONS = [
  "Spectacole cu drone",
  "Artificii profesionale",
  "Drone + artificii sincronizate",
  "Cold sparks / efecte speciale",
  "Nu sunt sigur(ă) încă",
];

export const IMG = {
  hero: "https://images.pexels.com/photos/27051702/pexels-photo-27051702.jpeg",
  drone: "https://images.unsplash.com/photo-1730053225079-cd26d10e214d",
  fireworks: "https://images.unsplash.com/photo-1545505567-7327366a634d",
  hybrid: "https://images.pexels.com/photos/3385614/pexels-photo-3385614.jpeg",
  sparks: "https://images.unsplash.com/photo-1619229725920-ac8b63b0631a",
};

export const STATS = [
  { value: 150, suffix: "+", label: "Spectacole create" },
  { value: 320, suffix: "+", label: "Drone sincronizate" },
  { value: 90, suffix: "+", label: "Evenimente & festivaluri" },
  { value: 24, suffix: "h", label: "Răspuns la ofertă" },
];

export const SERVICES = [
  {
    icon: Plane,
    title: "Spectacole cu drone",
    desc: "Coregrafii luminoase 3D pe cerul nopții — animații, logo-uri și mesaje create special pentru evenimentul tău.",
    ideal: "Nunți · Corporate · Festivaluri · Lansări",
    benefits: ["Animații 3D personalizate", "Logo & mesaje în aer", "Zero zgomot, zero fum"],
    image: IMG.drone,
  },
  {
    icon: Flame,
    title: "Artificii profesionale",
    desc: "Spectacole pirotehnice sincronizate pe muzică, cu efecte de mare înălțime și culori spectaculoase.",
    ideal: "Nunți · Aniversări · Sărbători",
    benefits: ["Sincronizare pe muzică", "Efecte de mare înălțime", "Echipă autorizată"],
    image: IMG.fireworks,
  },
  {
    icon: Sparkles,
    title: "Drone + artificii sincronizate",
    desc: "Combinația supremă: drone show și artificii rulate împreună pentru un final imposibil de uitat.",
    ideal: "Evenimente premium · Festivaluri",
    benefits: ["Show hibrid premium", "Impact vizual maxim", "Regie tehnică completă"],
    image: IMG.hybrid,
  },
  {
    icon: Zap,
    title: "Cold sparks & efecte speciale",
    desc: "Fântâni de scântei reci, fum greu, lasere și efecte de scenă pentru momentele cheie.",
    ideal: "Primul dans · Intrări · Scenă",
    benefits: ["Scântei reci sigure", "Fum greu & lasere", "Montaj indoor & outdoor"],
    image: IMG.sparks,
  },
];

export const PORTFOLIO = [
  { category: "Nunți", title: "Nuntă pe malul lacului", image: "https://images.pexels.com/photos/3397027/pexels-photo-3397027.jpeg" },
  { category: "Corporate", title: "Gală corporativă", image: "https://images.unsplash.com/photo-1497911270199-1c552ee64aa4" },
  { category: "Festivaluri", title: "Festival de vară", image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea" },
  { category: "Lansări", title: "Lansare de produs", image: "https://images.pexels.com/photos/12995469/pexels-photo-12995469.jpeg" },
  { category: "Evenimente private", title: "Aniversare privată", image: "https://images.unsplash.com/photo-1473652502225-6b6af0664e32" },
  { category: "City events", title: "Eveniment de oraș", image: "https://images.unsplash.com/photo-1648175705050-f091e8d03d1a" },
];

export const CHAPTERS = [
  {
    no: "01",
    kicker: "Conceptul",
    title: "Totul începe cu o viziune",
    text: "Ascultăm povestea evenimentului tău și transformăm emoția într-un concept vizual unic, gândit pentru momentul și locația ta.",
    image: "https://images.unsplash.com/photo-1730053225079-cd26d10e214d",
  },
  {
    no: "02",
    kicker: "Spectacolul",
    title: "Cerul prinde viață",
    text: "Drone, artificii și efecte speciale se sincronizează pe muzică într-o coregrafie care taie respirația invitaților.",
    image: "https://images.pexels.com/photos/3385614/pexels-photo-3385614.jpeg",
  },
  {
    no: "03",
    kicker: "Emoția",
    title: "Un final pe care nu-l uită nimeni",
    text: "Ultima scânteie se stinge, dar amintirea rămâne — un moment despre care invitații vor vorbi mult timp după eveniment.",
    image: "https://images.pexels.com/photos/3397027/pexels-photo-3397027.jpeg",
  },
];

export const WHY = [
  { icon: Wand2, title: "Design personalizat", desc: "Fiecare spectacol este creat de la zero, pentru povestea evenimentului tău." },
  { icon: ShieldCheck, title: "Siguranță & autorizații", desc: "Echipă autorizată, planificare tehnică riguroasă și respectarea tuturor normelor." },
  { icon: Sparkles, title: "Efect wow garantat", desc: "Momente vizuale spectaculoase care lasă invitații fără cuvinte." },
  { icon: HeartHandshake, title: "Consultanță dedicată", desc: "Te ghidăm înainte de eveniment, pas cu pas, până la cel mai mic detaliu." },
  { icon: Gauge, title: "Execuție profesionistă", desc: "Tehnică de top, operatori cu experiență și regie milimetrică." },
  { icon: Layers, title: "Pachete combinate", desc: "Drone, artificii și efecte speciale, într-un singur show coerent." },
];

export const PROCESS = [
  { step: "01", title: "Brief", desc: "Discutăm viziunea, locația și momentul cheie al evenimentului.", icon: ClipboardList },
  { step: "02", title: "Concept vizual", desc: "Creăm conceptul show-ului: coregrafie, culori și sincronizare.", icon: Palette },
  { step: "03", title: "Planificare tehnică", desc: "Verificăm locația, obținem autorizațiile și pregătim echipamentul.", icon: Settings2 },
  { step: "04", title: "Setup & verificări", desc: "Montaj, testare și verificări de siguranță înainte de start.", icon: Wrench },
  { step: "05", title: "Spectacol", desc: "Rulăm show-ul live, milimetric, pentru efectul wow garantat.", icon: Rocket },
];

export const PACKAGES = [
  {
    name: "Pachet Artificii",
    tagline: "Clasic & spectaculos",
    best: "Nunți și aniversări",
    impact: "Impact vizual ridicat",
    features: ["Spectacol pirotehnic sincronizat", "Durată personalizată", "Echipă autorizată"],
    popular: false,
  },
  {
    name: "Pachet Drone Show",
    tagline: "Modern & futurist",
    best: "Corporate & lansări",
    impact: "Impact vizual premium",
    features: ["Coregrafie 3D cu drone", "Logo & mesaje în aer", "Zero zgomot, zero fum"],
    popular: true,
  },
  {
    name: "Pachet Combinat Premium",
    tagline: "Experiența supremă",
    best: "Evenimente premium",
    impact: "Impact vizual maxim",
    features: ["Drone + artificii sincronizate", "Cold sparks la momente cheie", "Regie tehnică completă"],
    popular: false,
  },
  {
    name: "Pachet Corporate / Festival",
    tagline: "Custom & scalabil",
    best: "Festivaluri & branduri",
    impact: "Show la scară mare",
    features: ["Concept custom de brand", "Producție de mari dimensiuni", "Coordonare completă eveniment"],
    popular: false,
  },
];

export const GALLERY = [
  { image: "https://images.pexels.com/photos/27051702/pexels-photo-27051702.jpeg", alt: "Explozie colorată de artificii pe cerul nopții", big: true },
  { image: "https://images.unsplash.com/photo-1562734041-a2d56f060a44", alt: "Artificii roz pe cer" },
  { image: "https://images.unsplash.com/photo-1439539698758-ba2680ecadb9", alt: "Invitați cu artificii de mână la o nuntă" },
  { image: "https://images.unsplash.com/photo-1672718945831-b68f3cb3a201", alt: "Artificii mari pe cerul nopții" },
  { image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819", alt: "Mulțime la un festival cu lumini", big: true },
  { image: "https://images.unsplash.com/photo-1543718290-a207a786243a", alt: "Artificii multicolore" },
  { image: "https://images.pexels.com/photos/1503520/pexels-photo-1503520.jpeg", alt: "Artificii vibrante luminând cerul" },
  { image: "https://images.unsplash.com/photo-1610900603480-c0a85ac8e315", alt: "Concert cu confetti și lumini" },
];

export const TESTIMONIALS = [
  { name: "Andreea & Mihai", role: "Nuntă · Cluj", text: "Drone show-ul a fost momentul serii. Invitații încă vorbesc despre el!", rating: 5 },
  { name: "Robert Ionescu", role: "Director Marketing", text: "Lansarea noastră de produs a arătat incredibil. Profesioniști de la cap la coadă.", rating: 5 },
  { name: "Elena Pop", role: "Organizator festival", text: "Sincronizarea artificii + drone a ridicat tot festivalul la alt nivel.", rating: 5 },
];

export const PARTNERS = ["LUMEN EVENTS", "AURORA WEDDINGS", "NOVA CORP", "VERTEX FEST", "STELLAR PR", "GRAND HOTEL", "SUMMIT GROUP"];

export const FAQS = [
  { q: "Cu cât timp înainte trebuie rezervat spectacolul?", a: "Recomandăm rezervarea cu minim 3–4 săptămâni înainte, pentru planificare tehnică și obținerea autorizațiilor. Pentru evenimente mari sau date populare (sezon de nunți), ideal este să ne contactezi cu 1–2 luni înainte." },
  { q: "Se pot combina dronele cu artificiile?", a: "Da. Pachetul Combinat Premium rulează drone show și artificii sincronizate, pentru un impact vizual maxim și un final memorabil." },
  { q: "Ce se întâmplă dacă vremea este nefavorabilă?", a: "Siguranța este prioritară. În caz de vânt puternic sau condiții nefavorabile, replanificăm spectacolul sau adaptăm tehnic show-ul, conform unui plan stabilit împreună din timp." },
  { q: "Sunt necesare autorizații?", a: "Da, iar noi ne ocupăm de partea tehnică și de avizele necesare. Echipa noastră este autorizată și respectă toate normele de siguranță în vigoare." },
  { q: "Se pot face spectacole pentru nunți?", a: "Absolut. Nunțile sunt printre cele mai solicitate evenimente — de la primul dans cu cold sparks, până la drone show sau artificii pentru finalul serii." },
  { q: "Se pot face spectacole corporate sau festivaluri?", a: "Da. Realizăm show-uri custom pentru branduri, lansări de produs, gale corporate și festivaluri, la scară mică sau mare." },
  { q: "Cât durează un spectacol?", a: "În funcție de pachet și concept, un spectacol durează de regulă între 3 și 12 minute. Durata se personalizează în funcție de moment și buget." },
  { q: "Ce informații trebuie trimise pentru ofertă?", a: "Tipul evenimentului, data, locația aproximativă și ce tip de show îți dorești (drone, artificii sau combinat). Restul detaliilor le stabilim împreună la consultanță." },
];

export const EVENT_TYPES = ["Nuntă", "Corporate", "Festival", "Lansare de produs", "Aniversare / Eveniment privat", "Eveniment de oraș", "Altul"];

export const NAV_LINKS = [
  { label: "Acasă", href: "#acasa" },
  { label: "Servicii", href: "#servicii" },
  { label: "Spectacole", href: "#spectacole" },
  { label: "Pachete", href: "#pachete" },
  { label: "Galerie", href: "#galerie" },
  { label: "Întrebări", href: "#intrebari" },
  { label: "Contact", href: "#contact" },
];
