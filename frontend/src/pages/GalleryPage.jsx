import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Maximize2, X } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import ScrollProgress from "@/components/site/ScrollProgress";
import InteriorHero from "@/components/site/InteriorHero";
import usePageMeta from "@/hooks/usePageMeta";
import useManagedContent from "@/hooks/useManagedContent";
import { MEDIA_ITEMS, SITE_DETAILS } from "@/data/businessContent";

const schemaForPhotos = (items) => ({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Galerie foto FireArtRo",
  url: `${SITE_DETAILS.siteUrl}/galerie`,
  hasPart: items.map((item) => ({
    "@type": "ImageObject",
    name: item.title,
    description: item.shortDescription,
    contentUrl: item.src,
    thumbnailUrl: item.thumbnail || item.src,
  })),
});

export default function GalleryPage() {
  const location = useLocation();
  const media = useManagedContent("mediaItems", MEDIA_ITEMS);
  const photos = useMemo(
    () => [...media]
      .filter((item) => item.type === "image")
      .sort((a, b) => (a.order || 0) - (b.order || 0)),
    [media]
  );
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const initialFilter = params.get("filtru") || "Toate";
  const [filter, setFilter] = useState(initialFilter);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const pointerStart = useRef(null);
  const didSwipe = useRef(false);

  const categories = useMemo(
    () => ["Toate", ...new Set(photos.flatMap((item) => [item.category, ...(item.tags || [])]).filter(Boolean))],
    [photos]
  );
  const visiblePhotos = useMemo(
    () => photos.filter((item) => filter === "Toate" || item.category === filter || item.tags?.includes(filter)),
    [filter, photos]
  );
  const current = visiblePhotos[carouselIndex] || visiblePhotos[0];
  const activeItem = visiblePhotos[activeIndex];

  const moveCarousel = useCallback((direction) => {
    if (!visiblePhotos.length) return;
    setCarouselIndex((index) => (index + direction + visiblePhotos.length) % visiblePhotos.length);
  }, [visiblePhotos.length]);
  const moveLightbox = useCallback((direction) => {
    if (!visiblePhotos.length) return;
    setActiveIndex((index) => (index + direction + visiblePhotos.length) % visiblePhotos.length);
  }, [visiblePhotos.length]);
  const openCurrent = () => {
    if (didSwipe.current) {
      didSwipe.current = false;
      return;
    }
    setActiveIndex(carouselIndex);
  };

  usePageMeta({
    title: "Galerie foto spectacole cu drone și artificii | FireArtRo",
    description:
      "Galerie foto FireArtRo cu spectacole de drone, artificii profesionale, cold sparks și efecte speciale pentru evenimente.",
    path: "/galerie",
    schema: schemaForPhotos(photos),
  });

  useEffect(() => {
    setCarouselIndex(0);
    setActiveIndex(-1);
  }, [filter]);

  useEffect(() => {
    const mediaId = params.get("media");
    if (!mediaId) return;
    const index = visiblePhotos.findIndex((item) => item.id === mediaId);
    if (index >= 0) {
      setCarouselIndex(index);
      setActiveIndex(index);
    }
  }, [params, visiblePhotos]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (activeIndex >= 0) {
        if (event.key === "ArrowRight") moveLightbox(1);
        if (event.key === "ArrowLeft") moveLightbox(-1);
        if (event.key === "Escape") setActiveIndex(-1);
        return;
      }
      if (event.key === "ArrowRight") moveCarousel(1);
      if (event.key === "ArrowLeft") moveCarousel(-1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, moveCarousel, moveLightbox]);

  const handlePointerDown = (event) => {
    pointerStart.current = event.clientX;
    didSwipe.current = false;
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };
  const handlePointerUp = (event) => {
    if (pointerStart.current === null) return;
    const delta = event.clientX - pointerStart.current;
    if (Math.abs(delta) > 42) {
      didSwipe.current = true;
      moveCarousel(delta < 0 ? 1 : -1);
    }
    pointerStart.current = null;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  };

  return (
    <main className="gallery-page min-h-screen overflow-x-clip bg-[#050308] text-white">
      <ScrollProgress />
      <Navbar />
      <InteriorHero
        eyebrow="Galerie FireArtRo"
        title="Cadre reale."
        accent="Spectacol în mișcare."
        description="O galerie foto concentrată, cu imagini din producțiile FireArtRo. Alege o categorie, glisează cadrele și deschide fotografia în lightbox."
        primaryHref="#galerie-media"
        primaryLabel="Vezi fotografiile"
        secondaryHref="/contact"
        secondaryLabel="Solicită ofertă"
      />

      <section id="galerie-media" className="photo-gallery-section" aria-labelledby="photo-gallery-title">
        <header className="photo-gallery-header">
          <div>
            <span>Selecție foto</span>
            <h2 id="photo-gallery-title">Fotografii din spectacole FireArtRo</h2>
          </div>
          <p>Filtrează rapid după tipul momentului. Cardul central se poate glisa pe telefon sau controla din săgeți.</p>
        </header>

        <div className="photo-gallery-filters" aria-label="Filtre galerie foto">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={filter === category ? "is-active" : ""}
              aria-pressed={filter === category}
              onClick={() => setFilter(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {current && (
          <div className="photo-gallery-stage">
            <button type="button" className="photo-gallery-arrow photo-gallery-arrow-left" onClick={() => moveCarousel(-1)} aria-label="Fotografia anterioară">
              <ArrowLeft />
            </button>

            <button
              type="button"
              className="photo-gallery-feature"
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              onPointerCancel={() => { pointerStart.current = null; }}
              onClick={openCurrent}
              aria-label={`Deschide fotografia: ${current.title}`}
            >
              <img src={current.src} alt={current.alt} width="1440" height="960" decoding="async" />
              <span className="photo-gallery-feature-shade" />
              <span className="photo-gallery-kicker">{current.category}</span>
              <span className="photo-gallery-open"><Maximize2 /> Deschide</span>
              <span className="photo-gallery-copy">
                <strong>{current.title}</strong>
                <small>{current.shortDescription}</small>
              </span>
            </button>

            <button type="button" className="photo-gallery-arrow photo-gallery-arrow-right" onClick={() => moveCarousel(1)} aria-label="Fotografia următoare">
              <ArrowRight />
            </button>
          </div>
        )}

        <div className="photo-gallery-thumbs" aria-label="Miniaturi galerie">
          {visiblePhotos.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={index === carouselIndex ? "is-active" : ""}
              onClick={() => setCarouselIndex(index)}
              aria-label={`Afișează ${item.title}`}
            >
              <img src={item.thumbnail || item.src} alt="" width="320" height="220" loading="lazy" decoding="async" />
              <span>{String(index + 1).padStart(2, "0")}</span>
            </button>
          ))}
        </div>
      </section>

      <Footer />

      <Dialog open={activeIndex >= 0} onOpenChange={(open) => !open && setActiveIndex(-1)}>
        <DialogContent className="media-lightbox">
          {activeItem && (
            <>
              <DialogTitle className="sr-only">{activeItem.title}</DialogTitle>
              <div className="media-lightbox-stage" onContextMenu={(event) => event.preventDefault()}>
                <img src={activeItem.src} alt={activeItem.alt} width="1600" height="1067" draggable="false" />
              </div>
              <div className="media-lightbox-meta">
                <span>{activeItem.category}</span>
                <h2>{activeItem.title}</h2>
                <p>{activeItem.shortDescription}</p>
              </div>
              <button type="button" className="media-lightbox-close" onClick={() => setActiveIndex(-1)} aria-label="Închide">
                <X />
              </button>
              {visiblePhotos.length > 1 && (
                <>
                  <button type="button" className="media-lightbox-prev" onClick={() => moveLightbox(-1)} aria-label="Anterior">
                    <ArrowLeft />
                  </button>
                  <button type="button" className="media-lightbox-next" onClick={() => moveLightbox(1)} aria-label="Următor">
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
