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
  Crown,
  Building2,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Cinematic media                                                    */
/* ------------------------------------------------------------------ */
export const HERO_POSTER =
  "https://images.unsplash.com/photo-1557393512-3c3f34c4ad70?crop=entropy&cs=srgb&fm=jpg&q=85&w=1920";

export const HERO_VIDEOS = [
  { src: "https://assets.mixkit.co/videos/46028/46028-720.mp4", label: "Artificii" },
  { src: "https://assets.mixkit.co/videos/49846/49846-720.mp4", label: "Drone" },
  { src: "https://assets.mixkit.co/videos/21718/21718-720.mp4", label: "Momente" },
  { src: "https://assets.mixkit.co/videos/28375/28375-720.mp4", label: "Spectacol" },
];

// Curated cinematic stills (drone light shows · fireworks · cold sparks)
export const MEDIA = {
  fireworksSky: "https://images.unsplash.com/photo-1557393512-3c3f34c4ad70?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600",
  droneShow: "https://images.unsplash.com/photo-1704072979498-df7f24b04e05?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600",
  droneShow2: "https://images.pexels.com/photos/35439843/pexels-photo-35439843.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1280",
  droneShow3: "https://images.pexels.com/photos/10555659/pexels-photo-10555659.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1280",
  coldSparks: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600",
  coldSparks2: "https://images.unsplash.com/photo-1583245823946-0d3aac6562ad?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600",
  coldSparks3: "https://images.pexels.com/photos/5858809/pexels-photo-5858809.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1280",
  crowd: "https://images.unsplash.com/photo-1704073321423-e2db80cb304b?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600",
  crowd2: "https://images.pexels.com/photos/34408550/pexels-photo-34408550.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1280",
  crowd3: "https://images.pexels.com/photos/34408521/pexels-photo-34408521.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1280",
  wedding: "https://images.pexels.com/photos/3397027/pexels-photo-3397027.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1280",
  corporate: "https://images.unsplash.com/photo-1497911270199-1c552ee64aa4?crop=entropy&cs=srgb&fm=jpg&q=85&w=1280",
  hybrid: "https://images.pexels.com/photos/3385614/pexels-photo-3385614.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1280",
};

export const IMG = {
  hero: MEDIA.fireworksSky,
  drone: MEDIA.droneShow,
  fireworks: MEDIA.fireworksSky,
  hybrid: MEDIA.hybrid,
  sparks: MEDIA.coldSparks,
};

/* ------------------------------------------------------------------ */
/*  Brand story / intro                                                */
/* ------------------------------------------------------------------ */
export const INTRO_BULLETS = [
  "Concept vizual unic, creat pentru povestea ta",
  "Drone, artificii și efecte sincronizate pe muzică",
  "Execuție sigură, autorizată și milimetrică",
];

/* ------------------------------------------------------------------ */
/*  Stats                                                              */
/* ------------------------------------------------------------------ */
export const STATS = [
  { value: 150, suffix: "+", label: "Spectacole regizate" },
  { value: 320, suffix: "+", label: "Drone sincronizate" },
  { value: 90, suffix: "+", label: "Evenimente & festivaluri" },
  { value: 24, suffix: "h", label: "Răspuns la cerere" },
];

/* ------------------------------------------------------------------ */
/*  Services                                                           */
/* ------------------------------------------------------------------ */
export const SERVICES = [
  {
    icon: Plane,
    title: "Spectacole cu drone",
    desc: "Coregrafii luminoase 3D pe cerul nopții — animații, logo-uri și mesaje create special pentru evenimentul tău.",
    ideal: "Nunți · Corporate · Festivaluri · Lansări",
    benefits: ["Animații 3D personalizate", "Logo & mesaje în aer", "Zero zgomot, zero fum"],
    image: MEDIA.droneShow,
  },
  {
    icon: Flame,
    title: "Artificii profesionale",
    desc: "Spectacole pirotehnice sincronizate pe muzică, cu efecte de mare înălțime și culori spectaculoase.",
    ideal: "Nunți · Aniversări · Sărbători",
    benefits: ["Sincronizare pe muzică", "Efecte de mare înălțime", "Echipă autorizată"],
    image: MEDIA.fireworksSky,
  },
  {
    icon: Sparkles,
    title: "Drone + artificii sincronizate",
    desc: "Combinația supremă: drone show și artificii rulate împreună, pentru un final imposibil de uitat.",
    ideal: "Evenimente premium · Festivaluri",
    benefits: ["Show hibrid premium", "Impact vizual maxim", "Regie tehnică completă"],
    image: MEDIA.hybrid,
  },
  {
    icon: Zap,
    title: "Cold sparks & efecte speciale",
    desc: "Fântâni de scântei reci, fum greu, lasere și efecte de scenă pentru momentele cheie ale serii.",
    ideal: "Primul dans · Intrări · Scenă",
    benefits: ["Scântei reci, sigure", "Fum greu & lasere", "Montaj indoor & outdoor"],
    image: MEDIA.coldSparks,
  },
];

/* ------------------------------------------------------------------ */
/*  Showcase (Spectacole)                                              */
/* ------------------------------------------------------------------ */
export const PORTFOLIO = [
  { category: "Nunți", title: "Nuntă pe malul lacului", desc: "Drone show romantic și artificii pentru finalul serii.", image: MEDIA.wedding },
  { category: "Corporate", title: "Gală corporativă", desc: "Logo în aer și efecte sincronizate pentru un brand memorabil.", image: MEDIA.corporate },
  { category: "Festivaluri", title: "Festival de vară", desc: "Show de mare amploare, coordonat pentru mii de spectatori.", image: MEDIA.crowd },
  { category: "Lansări", title: "Lansare de produs", desc: "Moment de impact care pune produsul în lumina reflectoarelor.", image: MEDIA.fireworksSky },
  { category: "Evenimente private", title: "Aniversare privată", desc: "Cold sparks și artificii pentru un moment intim și spectaculos.", image: MEDIA.coldSparks2 },
  { category: "City events", title: "Eveniment de oraș", desc: "Spectacol public sincronizat, cu logistică și avize complete.", image: MEDIA.crowd2 },
];

export const SHOWCASE_CATEGORIES = ["Nunți", "Corporate", "Festivaluri", "Lansări", "Evenimente private", "City events"];

/* ------------------------------------------------------------------ */
/*  Storytelling — cinematic 8-scene journey                           */
/* ------------------------------------------------------------------ */
export const STORY = [
  { no: "01", kicker: "Momentul", title: "Totul începe cu o așteptare", text: "Lumini stinse, priviri ridicate spre cer, respirații ținute. E clipa dinaintea clipei — momentul în care orice devine posibil.", image: MEDIA.crowd2, glow: "#3A86FF" },
  { no: "02", kicker: "Viziunea", title: "Dintr-o idee, un scenariu de lumină", text: "Ascultăm povestea evenimentului tău și o transformăm într-un concept vizual unic, gândit pentru momentul și locul tău.", image: MEDIA.droneShow2, glow: "#5AA9FF" },
  { no: "03", kicker: "Designul", title: "Construit milimetric în jurul tău", text: "Muzică, ritm, locație, mesaj, forme și culori — fiecare detaliu al show-ului este desenat special pentru tine.", image: MEDIA.hybrid, glow: "#8338EC" },
  { no: "04", kicker: "Tehnologia", title: "Sute de drone, sincronizate pe beat", text: "Drone, artificii și efecte coordonate digital și sincronizate la fracțiune de secundă — tehnologie invizibilă, emoție vizibilă.", image: MEDIA.droneShow, glow: "#9D7BFF" },
  { no: "05", kicker: "Pregătirea", title: "Energia crește. Cerul așteaptă.", text: "Echipa e la poziții, sistemele sunt armate, tensiunea se simte în aer. Numărătoarea inversă tocmai a început.", image: MEDIA.coldSparks3, glow: "#C77DFF" },
  { no: "06", kicker: "Spectacolul", title: "Cerul explodează în lumină", text: "Drone, artificii și scântei prind viață într-o coregrafie care taie respirația. Acesta este momentul „wow”.", image: MEDIA.fireworksSky, glow: "#8338EC" },
  { no: "07", kicker: "Reacția", title: "Fețe luminate, telefoane ridicate", text: "Aplauze, emoție, priviri pierdute în lumină. Momentul devine deja amintirea pe care toți o vor povesti.", image: MEDIA.crowd, glow: "#5AA9FF" },
  { no: "08", kicker: "Amintirea", title: "Un moment de neuitat", text: "Ultima scânteie se stinge, dar emoția rămâne. FIREARTRO nu creează doar efecte — creează amintiri.", image: MEDIA.coldSparks2, glow: "#3A86FF" },
];

/* ------------------------------------------------------------------ */
/*  Storytelling chapters (legacy short version, kept for reference)   */
/* ------------------------------------------------------------------ */
export const CHAPTERS = [
  {
    no: "01",
    kicker: "Conceptul",
    title: "Totul începe cu o viziune",
    text: "Ascultăm povestea evenimentului tău și transformăm emoția într-un concept vizual unic, gândit pentru momentul și locația ta.",
    image: MEDIA.droneShow,
  },
  {
    no: "02",
    kicker: "Spectacolul",
    title: "Cerul prinde viață",
    text: "Drone, artificii și efecte speciale se sincronizează pe muzică într-o coregrafie care taie respirația invitaților.",
    image: MEDIA.fireworksSky,
  },
  {
    no: "03",
    kicker: "Emoția",
    title: "Un final pe care nu-l uită nimeni",
    text: "Ultima scânteie se stinge, dar amintirea rămâne — un moment despre care invitații vor vorbi mult timp după eveniment.",
    image: MEDIA.crowd,
  },
];

/* ------------------------------------------------------------------ */
/*  Why FIREARTRO                                                      */
/* ------------------------------------------------------------------ */
export const WHY = [
  { icon: Wand2, title: "Design 100% personalizat", desc: "Fiecare spectacol este creat de la zero, în jurul poveștii evenimentului tău." },
  { icon: ShieldCheck, title: "Siguranță & autorizații", desc: "Echipă autorizată, planificare tehnică riguroasă și respectarea tuturor normelor." },
  { icon: Sparkles, title: "Efect „wow” garantat", desc: "Momente vizuale spectaculoase care lasă invitații fără cuvinte." },
  { icon: HeartHandshake, title: "Consultanță dedicată", desc: "Te ghidăm pas cu pas, din prima idee până la ultimul detaliu." },
  { icon: Gauge, title: "Execuție profesionistă", desc: "Tehnică de top, operatori cu experiență și o regie milimetrică." },
  { icon: Layers, title: "Show-uri combinate", desc: "Drone, artificii și efecte speciale, într-un singur spectacol coerent." },
];

/* ------------------------------------------------------------------ */
/*  Technology & trust                                                 */
/* ------------------------------------------------------------------ */
export const TECH = [
  { icon: Settings2, title: "Planificare tehnică", desc: "Analizăm locația, vântul, spațiul aerian și logistica pentru un show fără surprize." },
  { icon: Radio, title: "Sincronizare vizuală", desc: "Coregrafie sincronizată pe muzică — drone, artificii și efecte, exact pe beat." },
  { icon: ShieldCheck, title: "Siguranță & autorizații", desc: "Echipă autorizată, protocoale de siguranță și toate avizele necesare." },
  { icon: Sparkles, title: "Drone + artificii", desc: "Combinăm tehnologia dronelor cu artificiile clasice pentru impact maxim." },
  { icon: MapPin, title: "Efecte adaptate locației", desc: "Indoor sau outdoor, adaptăm efectele la spațiul și atmosfera evenimentului." },
  { icon: MessagesSquare, title: "Consultanță completă", desc: "Te ghidăm de la prima idee până la ultimul efect, pas cu pas." },
];

/* ------------------------------------------------------------------ */
/*  Process                                                            */
/* ------------------------------------------------------------------ */
export const PROCESS = [
  { step: "01", title: "Brief", desc: "Discutăm viziunea, locația și momentul cheie al evenimentului.", icon: ClipboardList },
  { step: "02", title: "Concept vizual", desc: "Creăm conceptul show-ului: coregrafie, culori și sincronizare pe muzică.", icon: Palette },
  { step: "03", title: "Planificare tehnică", desc: "Verificăm locația, obținem autorizațiile și pregătim echipamentul.", icon: Settings2 },
  { step: "04", title: "Pregătire & sincronizare", desc: "Montaj, testare și verificări de siguranță înainte de start.", icon: Wrench },
  { step: "05", title: "Spectacol", desc: "Rulăm show-ul live, milimetric, pentru efectul „wow” garantat.", icon: Rocket },
];

/* ------------------------------------------------------------------ */
/*  Packages                                                           */
/* ------------------------------------------------------------------ */
export const PACKAGES = [
  {
    icon: Flame,
    name: "Pachet Artificii",
    tagline: "Clasic & spectaculos",
    best: "Nunți și aniversări",
    impact: "Impact vizual ridicat",
    desc: "Spectacol pirotehnic sincronizat pe muzică, regizat pentru momentul tău cheie.",
    features: ["Artificii sincronizate pe muzică", "Durată personalizată", "Echipă autorizată"],
    popular: false,
  },
  {
    icon: Plane,
    name: "Pachet Drone Show",
    tagline: "Modern & futurist",
    best: "Corporate & lansări",
    impact: "Impact vizual premium",
    desc: "Coregrafie 3D cu drone, cu logo, mesaje și animații create pentru brandul tău.",
    features: ["Coregrafie 3D cu drone", "Logo & mesaje în aer", "Zero zgomot, zero fum"],
    popular: true,
  },
  {
    icon: Crown,
    name: "Pachet Combinat Premium",
    tagline: "Experiența supremă",
    best: "Evenimente premium",
    impact: "Impact vizual maxim",
    desc: "Drone, artificii și cold sparks într-un singur show, pentru un final memorabil.",
    features: ["Drone + artificii sincronizate", "Cold sparks la momentele cheie", "Regie tehnică completă"],
    popular: false,
  },
  {
    icon: Building2,
    name: "Pachet Corporate / Festival",
    tagline: "Custom & scalabil",
    best: "Festivaluri & branduri",
    impact: "Show la scară mare",
    desc: "Producție de mari dimensiuni, gândită în jurul brandului și al publicului tău.",
    features: ["Concept custom de brand", "Producție de mari dimensiuni", "Coordonare completă eveniment"],
    popular: false,
  },
];

export const PRICING_FACTORS = [
  "Locația și accesul",
  "Durata spectacolului",
  "Complexitatea designului",
  "Numărul de drone",
  "Tipul de artificii și efecte",
  "Siguranță și logistică",
  "Cerințele specifice ale evenimentului",
];

/* ------------------------------------------------------------------ */
/*  Gallery                                                            */
/* ------------------------------------------------------------------ */
export const GALLERY = [
  { image: MEDIA.fireworksSky, alt: "Explozie colorată de artificii pe cerul nopții", category: "Artificii", big: true },
  { image: MEDIA.droneShow, alt: "Formație de drone luminoase pe cerul nopții", category: "Drone" },
  { image: MEDIA.coldSparks, alt: "Fântâni de scântei reci la un eveniment", category: "Cold sparks" },
  { image: MEDIA.crowd, alt: "Artificii spectaculoase deasupra unei mulțimi", category: "Festival" },
  { image: MEDIA.crowd2, alt: "Public la un spectacol de lumini și artificii", category: "City event", big: true },
  { image: MEDIA.coldSparks2, alt: "Cold sparks la momentul cheie al serii", category: "Eveniment privat" },
  { image: MEDIA.droneShow2, alt: "Drone show colorat pe cer", category: "Drone" },
  { image: MEDIA.crowd3, alt: "Artificii vibrante luminând cerul nopții", category: "Artificii" },
];

/* ------------------------------------------------------------------ */
/*  Social proof                                                       */
/* ------------------------------------------------------------------ */
export const TESTIMONIALS = [
  { name: "Andreea & Mihai", role: "Nuntă · Cluj", text: "Drone show-ul a fost momentul serii. Invitații încă vorbesc despre el!", rating: 5 },
  { name: "Robert Ionescu", role: "Director Marketing", text: "Lansarea noastră de produs a arătat incredibil. Profesioniști de la cap la coadă.", rating: 5 },
  { name: "Elena Pop", role: "Organizator festival", text: "Sincronizarea artificii + drone a ridicat tot festivalul la alt nivel.", rating: 5 },
];

export const PARTNERS = ["LUMEN EVENTS", "AURORA WEDDINGS", "NOVA CORP", "VERTEX FEST", "STELLAR PR", "GRAND HOTEL", "SUMMIT GROUP"];

/* ------------------------------------------------------------------ */
/*  FAQ                                                                */
/* ------------------------------------------------------------------ */
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

/* ------------------------------------------------------------------ */
/*  Forms & nav                                                        */
/* ------------------------------------------------------------------ */
export const SERVICE_OPTIONS = [
  "Spectacole cu drone",
  "Artificii profesionale",
  "Drone + artificii sincronizate",
  "Cold sparks / efecte speciale",
  "Nu sunt sigur(ă) încă",
];

export const EVENT_TYPES = ["Nuntă", "Corporate", "Festival", "Lansare de produs", "Aniversare / Eveniment privat", "Eveniment de oraș", "Altul"];

export const NAV_LINKS = [
  { label: "Acasă", href: "#acasa" },
  { label: "Servicii", href: "#servicii" },
  { label: "Spectacole", href: "#spectacole" },
  { label: "Proces", href: "#proces" },
  { label: "Pachete", href: "#pachete" },
  { label: "Galerie", href: "#galerie" },
  { label: "Întrebări", href: "#intrebari" },
  { label: "Contact", href: "#contact" },
];

// Unused icon kept to avoid tree-shake surprises in data consumers
