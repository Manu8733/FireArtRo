import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Maximize2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
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
    contentUrl: new URL(item.src, SITE_DETAILS.siteUrl).toString(),
    thumbnailUrl: new URL(item.thumbnail || item.src, SITE_DETAILS.siteUrl).toString(),
  })),
});

export default function GalleryPage() {
  const location = useLocation();
  const navigate = useNavigate();
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
  const [carouselRef, carouselApi] = useEmblaCarousel({
    align: "center",
    containScroll: "trimSnaps",
    loop: true,
    skipSnaps: false,
  });

  const categories = useMemo(
    () => ["Toate", ...new Set(photos.map((item) => item.category).filter(Boolean))],
    [photos]
  );
  const activeFilter = categories.includes(filter) ? filter : "Toate";
  const visiblePhotos = useMemo(
    () => photos.filter((item) => activeFilter === "Toate" || item.category === activeFilter),
    [activeFilter, photos]
  );
  const activeItem = visiblePhotos[activeIndex];
  const gallerySchema = useMemo(() => schemaForPhotos(photos), [photos]);

  const moveCarousel = useCallback((direction) => {
    if (!carouselApi) return;
    if (direction > 0) carouselApi.scrollNext();
    else carouselApi.scrollPrev();
  }, [carouselApi]);
  const moveLightbox = useCallback((direction) => {
    if (!visiblePhotos.length) return;
    setActiveIndex((index) => (index + direction + visiblePhotos.length) % visiblePhotos.length);
  }, [visiblePhotos.length]);
  const selectFilter = useCallback((nextFilter) => {
    setFilter(nextFilter);
    const nextParams = new URLSearchParams(location.search);
    nextParams.delete("media");
    if (nextFilter === "Toate") nextParams.delete("filtru");
    else nextParams.set("filtru", nextFilter);
    const search = nextParams.toString();
    navigate(`${location.pathname}${search ? `?${search}` : ""}`, { replace: true });
  }, [location.pathname, location.search, navigate]);

  usePageMeta({
    title: "Galerie foto spectacole cu drone și artificii | FireArtRo",
    description:
      "Galerie foto FireArtRo cu spectacole de drone, artificii profesionale, cold sparks și efecte speciale pentru evenimente.",
    path: "/galerie",
    schema: gallerySchema,
  });

  useEffect(() => {
    setCarouselIndex(0);
    setActiveIndex(-1);
    carouselApi?.scrollTo(0, true);
    carouselApi?.reInit();
  }, [carouselApi, filter, visiblePhotos.length]);

  useEffect(() => {
    if (!carouselApi) return undefined;
    const onSelect = () => setCarouselIndex(carouselApi.selectedScrollSnap());
    onSelect();
    carouselApi.on("select", onSelect);
    carouselApi.on("reInit", onSelect);
    return () => {
      carouselApi.off("select", onSelect);
      carouselApi.off("reInit", onSelect);
    };
  }, [carouselApi]);

  useEffect(() => {
    const mediaId = params.get("media");
    if (!mediaId) return;
    const index = visiblePhotos.findIndex((item) => item.id === mediaId);
    if (index >= 0) {
      setCarouselIndex(index);
      setActiveIndex(index);
      carouselApi?.scrollTo(index, true);
    }
  }, [carouselApi, params, visiblePhotos]);

  useEffect(() => {
    const requestedFilter = params.get("filtru") || "Toate";
    setFilter(categories.includes(requestedFilter) ? requestedFilter : "Toate");
  }, [categories, params]);

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

  return (
    <main className="gallery-page min-h-screen overflow-x-clip bg-[#050308] text-white">
      <ScrollProgress />
      <Navbar />
      <InteriorHero
        eyebrow="Galerie FireArtRo"
        title="Cadre reale."
        accent="Lumina rămâne în fotografie."
        description="O selecție din spectacolele FireArtRo, surprinsă din mijlocul publicului și de lângă scenă."
        primaryHref="#galerie-media"
        primaryLabel="Explorează galeria"
        secondaryHref="/contact"
        secondaryLabel="Discută evenimentul"
      />

      <section id="galerie-media" className="photo-gallery-section" aria-labelledby="photo-gallery-title">
        <header className="photo-gallery-header">
          <div>
            <span>Selecție foto</span>
            <h2 id="photo-gallery-title">Privește spectacolul, cadru cu cadru.</h2>
          </div>
          <div className="photo-gallery-header-tools">
            <p>Glisează colecția sau folosește săgețile. Fiecare fotografie se poate deschide la dimensiune mare.</p>
          </div>
        </header>

        <div className="photo-gallery-toolbar">
          <div className="photo-gallery-filters" aria-label="Filtre galerie foto">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={activeFilter === category ? "is-active" : ""}
                aria-pressed={activeFilter === category}
                onClick={() => selectFilter(category)}
              >
                {category}
              </button>
            ))}
          </div>
          <div className="photo-gallery-controls" aria-label="Navigare fotografii">
            <button type="button" onClick={() => moveCarousel(-1)} aria-label="Fotografia anterioară">
              <ArrowLeft />
            </button>
            <span aria-live="polite">
              {String(carouselIndex + 1).padStart(2, "0")} / {String(visiblePhotos.length).padStart(2, "0")}
            </span>
            <button type="button" onClick={() => moveCarousel(1)} aria-label="Fotografia următoare">
              <ArrowRight />
            </button>
          </div>
        </div>

        {visiblePhotos.length > 0 && (
          <div className="photo-carousel-shell">
            <div className="photo-carousel" ref={carouselRef}>
              <div className="photo-carousel-track">
                {visiblePhotos.map((item, index) => (
                  <div
                    className={`photo-carousel-slide ${index === carouselIndex ? "is-active" : ""}`}
                    key={item.id}
                  >
                    <button
                      type="button"
                      className="photo-carousel-card"
                      onClick={() => setActiveIndex(index)}
                      aria-label={`Deschide fotografia: ${item.title}`}
                    >
                      <img
                        src={item.src}
                        alt={item.alt}
                        width="1440"
                        height="960"
                        loading={Math.abs(index - carouselIndex) <= 1 ? "eager" : "lazy"}
                        decoding="async"
                      />
                      <span className="photo-gallery-feature-shade" />
                      <span className="photo-gallery-kicker">{item.category}</span>
                      <span className="photo-gallery-open"><Maximize2 /> Deschide</span>
                      <span className="photo-gallery-copy">
                        <strong>{item.title}</strong>
                        <small>{item.shortDescription}</small>
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="photo-gallery-pagination" aria-label="Navigare galerie">
          {visiblePhotos.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={index === carouselIndex ? "is-active" : ""}
              onClick={() => carouselApi?.scrollTo(index)}
              aria-label={`Afișează ${item.title}`}
            />
          ))}
        </div>
      </section>

      <Footer />

      <Dialog open={activeIndex >= 0} onOpenChange={(open) => !open && setActiveIndex(-1)}>
        <DialogContent className="media-lightbox">
          {activeItem && (
            <>
              <DialogTitle className="sr-only">{activeItem.title}</DialogTitle>
              <DialogDescription className="sr-only">
                {activeItem.shortDescription}
              </DialogDescription>
              <div className="media-lightbox-stage" onContextMenu={(event) => event.preventDefault()}>
                <img src={activeItem.src} alt={activeItem.alt} width="1600" height="1067" draggable="false" />
              </div>
              <div className="media-lightbox-meta">
                <span>{activeItem.category}</span>
                <h2>{activeItem.title}</h2>
                <p>{activeItem.shortDescription}</p>
              </div>
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
