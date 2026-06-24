# FIREARTRO — Product Requirements Document

## Original Problem Statement
Build a premium landing page similar to flystackdroneshows.com for **FIREARTRO**, a Romanian
drone show & fireworks production company. Content is in Romanian. Dark, cinematic, premium
aesthetic with blue/violet accents.

## User Choices (confirmed)
- Quote form ("Solicită ofertă") **saves to MongoDB** + shows success message.
- WhatsApp/phone CTA (placeholder number until real one provided).
- Stock placeholder imagery (not the uploaded fireart.rar assets).
- Single-page site + basic legal pages (Privacy / Terms / Cookies).
- Brand logo provided by user (FireArtRo white-on-black fireworks mark).

## Architecture
- **Frontend**: React 19 + Tailwind + shadcn/ui + framer-motion. Single page composed of
  section components in `src/components/site/`, pages in `src/pages/` (Home, LegalPage),
  content in `src/data/content.js`, brand constants in `src/lib/constants.js`. Custom canvas
  particles, count-up stats, embla carousel, dialog lightbox, accordion FAQ.
- **Backend**: FastAPI + Motor (MongoDB). `POST /api/quotes` saves a quote; `GET /api/quotes`
  lists them. Quotes stored in `quotes` collection (uuid id, ISO datetime).
- Fonts: Clash Display (display) + Outfit (body). Theme: deep violet-black (#050308) base.

## User Personas
- **Couple / private host** planning a wedding or anniversary wow-moment.
- **Corporate / brand manager** organizing a product launch or gala.
- **Festival / city event organizer** needing large-scale shows.

## Core Requirements (static)
- Cinematic hero, animated stats, services, portfolio carousel, why-us, process timeline,
  packages, gallery+lightbox, testimonials+partners, FAQ, final CTA, quote form, footer, legal.
- Romanian copy throughout; SEO meta + FAQ JSON-LD; responsive; reduced-motion friendly.

## Implemented (2026-06-24)
- Full single-page site with all sections + 3 legal pages. ✅
- Quote form persists to MongoDB with validation + success state + package prefill. ✅
- WhatsApp float + CTAs, partner marquee, gallery lightbox, FAQ accordion. ✅
- **Iter 2 (cinematic rebuild)**: video-first hero collage (Mixkit loops + poster), Intro, premium Showcase slider (auto-advance/progress/swipe/arrows), Technology section, scroll-driven glowing timeline, consent + preferred-service on quote form, OG/schema/sitemap/robots. ✅
- **Iter 3 (cinematic motion)**: dark-room veil, text-bloom headlines, global scale+blur scroll reveals, slide-in hero headline, letterboxed kickers, ambient floating icons, sticky-header Technology, hero parallax. ✅
- **Iter 4 (scroll choreography)**: hero field of floating brand sparks (FloatingLogos) choreographed to scroll.
- **Iter 5 (10x premium cinematic redesign, 2026-06)**:
  - Typography overhaul → **Sora (display) + Inter (body)**; fluid clamp scale (`display-xl/lg/md/sm`, `lead`) so phones never get oversized/cramped text; refined letter-spacing + restrained headline glow.
  - New motion primitives: `hooks/useMediaQuery.js` (useIsMobile), enhanced `cinematic.jsx` (RevealText, Stagger, mobile-light + reduced-motion-aware ScaleIn/SlideIn/Parallax), lighter `Reveal.jsx`.
  - Restructured storytelling flow: Hero → Brand Story → Stats → Services → Showcase → Chapters → **Why FIREARTRO (new)** → Process → Packages → Gallery → Testimonials → FAQ → Final CTA → Quote → Footer. Removed standalone Technology section from flow (file retained).
  - **Mobile rebuild**: swipe carousels (Services/Packages/Gallery/Testimonials), category pills + dots on Showcase, vertical NON-pinned Chapters story + vertical glowing Process timeline (no scroll-jacking), particles/floating-logos/hero-video disabled on phones, sticky-nav scroll-spy active pill, premium drawer.
  - Premium utilities: animated `aurora`, `glass-strong`, gradient hairline `border-gradient`, refined gradients/shadows; curated cinematic image set.
  - SEO: enriched meta/keywords, OG locale ro_RO, robots max-image-preview; FAQ JSON-LD + schema graph + sitemap/robots retained.
  - Verified by frontend testing agent: 100% pass across 360/390/430/768/1024/1440/1920 (zero horizontal scroll) + all interactions + quote submit (POST /api/quotes 200). ✅
- **Infra fix**: recreated missing `backend/.env` (MONGO_URL/DB_NAME/CORS_ORIGINS) + `frontend/.env` (REACT_APP_BACKEND_URL) that were gitignored in the source repo and crashed the backend on boot.

## Backlog / Next
- **P0**: Replace placeholder WhatsApp number, email, Instagram in `src/lib/constants.js`.
- **P1**: Admin dashboard to view/manage submitted quotes (GET /api/quotes already exists).
- **P1**: Swap stock media for real FIREARTRO photos/videos (hero video loop + portfolio).
- **P2**: Email notification on new quote (Resend/SendGrid). Multi-language (RO/EN) toggle.
