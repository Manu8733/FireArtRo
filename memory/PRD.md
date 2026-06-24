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
- Full single-page site with all 13 sections + 3 legal pages. ✅
- Quote form persists to MongoDB with validation + success state + package prefill. ✅
- WhatsApp float + CTAs, partner marquee, gallery lightbox, FAQ accordion. ✅
- Verified end-to-end by testing agent: backend 5/5, frontend 100%.

## Backlog / Next
- **P0**: Replace placeholder WhatsApp number, email, Instagram in `src/lib/constants.js`.
- **P1**: Admin dashboard to view/manage submitted quotes (GET /api/quotes already exists).
- **P1**: Swap stock media for real FIREARTRO photos/videos (hero video loop + portfolio).
- **P2**: Email notification on new quote (Resend/SendGrid). Multi-language (RO/EN) toggle.
