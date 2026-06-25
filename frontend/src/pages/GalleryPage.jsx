import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Maximize2, Play, X } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import ScrollProgress from "@/components/site/ScrollProgress";
import InteriorHero from "@/components/site/InteriorHero";
import usePageMeta from "@/hooks/usePageMeta";
import useManagedContent from "@/hooks/useManagedContent";
import { MEDIA_ITEMS, SITE_DETAILS } from "@/data/businessContent";

const getYouTubeId = (url = "") =>
  url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/i)?.[1] || "";

const getMediaSource = (item) => item.thumbnail || item.poster || item.src;

const schemaForMedia = (items) => ({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Galerie FireArtRo",
  url: `${SITE_DETAILS.siteUrl}/galerie`,
  hasPart: items.map((item) =>
    item.type === "video" || item.type === "youtube"
      ? {
          "@type": "VideoObject",
          name: item.title,
          description: item.shortDescription,
          thumbnailUrl: item.poster || item.thumbnail,
          contentUrl: item.src,
          embedUrl: item.youtubeUrl,
          uploadDate: item.date,
        }
      : {
          "@type": "ImageObject",
          name: item.title,
          description: item.shortDescription,
          contentUrl: item.src,
          thumbnailUrl: item.thumbnail,
        }
  ),
});

export default function GalleryPage() {
  const location = useLocation();
  const media = useManagedContent("mediaItems", MEDIA_ITEMS);
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const initialFilter = params.get("filtru") || "Toate";
  const [filter, setFilter] = useState(initialFilter);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const pointerStart = useRef(null);
  const wheelLock = useRef(false);

  const categories = useMemo(
    () => ["Toate", ...new Set(media.map((item) => item.category).filter(Boolean))],
    [media]
  );
  const visibleMedia = useMemo(
    () =>
      [...media]
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .filter((item) => filter === "Toate" || item.category === filter || item.tags?.includes(filter)),
    [filter, media]
  );
  const activeItem = visibleMedia[activeIndex];
  const moveCarousel = (direction) =>
    setCarouselIndex((index) => (index + direction + visibleMedia.length) % visibleMedia.length);
  const relativeOffset = (index) => {
    let distance = index - carouselIndex;
    const half = visibleMedia.length / 2;
    if (distance > half) distance -= visibleMedia.length;
    if (distance < -half) distance += visibleMedia.length;
    return distance;
  };

  usePageMeta({
    title: "Galerie spectacole cu drone și artificii | FireArtRo",
    description:
      "Galerie unificată FireArtRo cu imagini și video din spectacole cu drone, artificii de zi și de noapte, cold sparks și efecte speciale.",
    path: "/galerie",
    schema: schemaForMedia(media),
  });

  useEffect(() => {
    const mediaId = params.get("media");
    if (!mediaId) return;
    const index = visibleMedia.findIndex((item) => item.id === mediaId);
    if (index >= 0) setActiveIndex(index);
  }, [params, visibleMedia]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (activeIndex < 0) return;
      if (event.key === "ArrowRight") setActiveIndex((index) => (index + 1) % visibleMedia.length);
      if (event.key === "ArrowLeft") setActiveIndex((index) => (index - 1 + visibleMedia.length) % visibleMedia.length);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, visibleMedia.length]);

  const close = () => setActiveIndex(-1);
  const move = (direction) =>
    setActiveIndex((index) => (index + direction + visibleMedia.length) % visibleMedia.length);

  return (
    <main className="gallery-page min-h-screen overflow-x-clip bg-[#050308] text-white">
      <ScrollProgress />
      <Navbar />
      <InteriorHero
        eyebrow="Galerie FireArtRo"
        title="Foto. Film. Spectacol."
        accent="Momente reale."
        description="O selecție scurtă din producțiile FireArtRo. Derulează cadrele și deschide orice moment în lightbox."
        primaryHref="#galerie-media"
        primaryLabel="Explorează galeria"
        secondaryHref="/contact"
        secondaryLabel="Solicită ofertă"
      />

      <section id="galerie-media" className="unified-gallery" aria-labelledby="unified-gallery-title">
        <header className="unified-gallery-header">
          <div>
            <span>Media unificată</span>
            <h1 id="unified-gallery-title">Imagini, video și promoții</h1>
          </div>
          <p>Conținutul YouTube se încarcă doar când alegi să îl redai.</p>
        </header>

        <div className="gallery-filter-row" aria-label="Filtre galerie">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={filter === category ? "is-active" : ""}
              aria-pressed={filter === category}
              onClick={() => {
                setFilter(category);
                setActiveIndex(-1);
                setCarouselIndex(0);
              }}
            >
              {category}
            </button>
          ))}
        </div>

        <div
          className="gallery-orbit"
          onPointerDown={(event) => {
            pointerStart.current = event.clientX;
            event.currentTarget.setPointerCapture?.(event.pointerId);
          }}
          onPointerUp={(event) => {
            if (pointerStart.current === null) return;
            const delta = event.clientX - pointerStart.current;
            if (Math.abs(delta) > 45) moveCarousel(delta < 0 ? 1 : -1);
            pointerStart.current = null;
            event.currentTarget.releasePointerCapture?.(event.pointerId);
          }}
          onPointerCancel={() => {
            pointerStart.current = null;
          }}
          onWheel={(event) => {
            if (Math.abs(event.deltaX) < 12 || wheelLock.current) return;
            wheelLock.current = true;
            moveCarousel(event.deltaX > 0 ? 1 : -1);
            window.setTimeout(() => {
              wheelLock.current = false;
            }, 420);
          }}
        >
          <div className="gallery-orbit-track">
            {visibleMedia.map((item, index) => {
              const offset = relativeOffset(index);
              if (Math.abs(offset) > 2) return null;
              const centered = offset === 0;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`gallery-orbit-card gallery-orbit-offset-${offset + 2} ${centered ? "is-centered" : ""}`}
                  onClick={() => centered ? setActiveIndex(index) : setCarouselIndex(index)}
                  aria-label={`${centered ? "Deschide" : "Adu în centru"}: ${item.title}`}
                >
                  <img
                    src={getMediaSource(item)}
                    alt={item.alt}
                    width="1280"
                    height="853"
                    loading={Math.abs(offset) <= 1 ? "eager" : "lazy"}
                    decoding="async"
                  />
                  <span className="unified-media-shade" />
                  <span className="unified-media-type">
                    {item.type === "youtube" || item.type === "video" ? <Play /> : <Maximize2 />}
                    {item.category}
                  </span>
                  <span className="unified-media-copy">
                    <strong>{item.title}</strong>
                    <small>{item.shortDescription}</small>
                  </span>
                </button>
              );
            })}
          </div>
          <div className="gallery-orbit-controls">
            <button type="button" onClick={() => moveCarousel(-1)} aria-label="Element anterior"><ArrowLeft /></button>
            <span>{String(carouselIndex + 1).padStart(2, "0")} / {String(visibleMedia.length).padStart(2, "0")}</span>
            <button type="button" onClick={() => moveCarousel(1)} aria-label="Element următor"><ArrowRight /></button>
          </div>
        </div>
      </section>

      <Footer />

      <Dialog open={activeIndex >= 0} onOpenChange={(open) => !open && close()}>
        <DialogContent className="media-lightbox">
          {activeItem && (
            <>
              <DialogTitle className="sr-only">{activeItem.title}</DialogTitle>
              <div className="media-lightbox-stage" onContextMenu={(event) => event.preventDefault()}>
                {/* Web media cannot be made impossible to download; these controls only deter casual downloads. */}
                {activeItem.type === "youtube" ? (
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${getYouTubeId(activeItem.youtubeUrl)}?autoplay=1&rel=0&playsinline=1`}
                    title={activeItem.title}
                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : activeItem.type === "video" ? (
                  <video
                    src={activeItem.src}
                    poster={activeItem.poster}
                    controls
                    autoPlay
                    playsInline
                    controlsList="nodownload noplaybackrate"
                    disablePictureInPicture
                  />
                ) : (
                  <img src={activeItem.src} alt={activeItem.alt} width="1600" height="1067" draggable="false" />
                )}
              </div>
              <div className="media-lightbox-meta">
                <span>{activeItem.category}</span>
                <h2>{activeItem.title}</h2>
                <p>{activeItem.shortDescription}</p>
                {activeItem.type === "promo" && activeItem.ctaHref && (
                  <a href={activeItem.ctaHref}>{activeItem.ctaLabel || "Solicită ofertă"} <ArrowRight /></a>
                )}
              </div>
              <button type="button" className="media-lightbox-close" onClick={close} aria-label="Închide">
                <X />
              </button>
              {visibleMedia.length > 1 && (
                <>
                  <button type="button" className="media-lightbox-prev" onClick={() => move(-1)} aria-label="Anterior">
                    <ArrowLeft />
                  </button>
                  <button type="button" className="media-lightbox-next" onClick={() => move(1)} aria-label="Următor">
                    <ArrowRight />
                  </button>
                </>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
