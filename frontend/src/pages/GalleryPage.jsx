import { useCallback, useEffect, useMemo, useState } from "react";
import { Expand } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import ScrollProgress from "@/components/site/ScrollProgress";
import GalleryThreadsCanvas from "@/components/night/GalleryThreadsCanvas";
import usePageMeta from "@/hooks/usePageMeta";
import useManagedContent from "@/hooks/useManagedContent";
import { MEDIA_ITEMS, SITE_DETAILS } from "@/data/businessContent";
import "@/styles/night-gallery.css";

const gallerySchema = (items, siteUrl) => ({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Galerie FireArtRo",
  url: `${siteUrl}/galerie`,
  hasPart: items.map((item) => ({
    "@type": "ImageObject",
    name: item.title,
    description: item.shortDescription,
    contentUrl: new URL(item.src, siteUrl).toString(),
    thumbnailUrl: new URL(item.thumbnail || item.src, siteUrl).toString(),
  })),
});

export default function GalleryPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const media = useManagedContent("mediaItems", MEDIA_ITEMS);
  const siteDetails = useManagedContent("siteDetails", SITE_DETAILS);
  const photos = useMemo(
    () => [...media]
      .filter((item) => item.type === "image")
      .sort((a, b) => (a.order || 0) - (b.order || 0)),
    [media],
  );
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const categories = useMemo(
    () => ["Toate", ...new Set(photos.map((item) => item.category).filter(Boolean))],
    [photos],
  );
  const requestedFilter = params.get("filtru") || "Toate";
  const activeFilter = categories.includes(requestedFilter) ? requestedFilter : "Toate";
  const visiblePhotos = useMemo(
    () => photos.filter((item) => activeFilter === "Toate" || item.category === activeFilter),
    [activeFilter, photos],
  );
  const [expandedIndex, setExpandedIndex] = useState(-1);
  const [imageRatios, setImageRatios] = useState({});
  const [previewFrame, setPreviewFrame] = useState(null);
  const expandedItem = visiblePhotos[expandedIndex];
  const previewRatio = expandedItem
    ? (imageRatios[expandedItem.id] || expandedItem.aspectRatio || 16 / 9)
    : 16 / 9;
  const schema = useMemo(
    () => gallerySchema(photos, siteDetails.siteUrl),
    [photos, siteDetails.siteUrl],
  );

  usePageMeta({
    title: "Galerie drone show si artificii | FireArtRo",
    description: "Imagini FireArtRo din spectacole cu drone, artificii si efecte scenice.",
    path: "/galerie",
    schema,
  });

  const replaceQuery = useCallback((updates) => {
    const next = new URLSearchParams(location.search);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    const search = next.toString();
    navigate(`${location.pathname}${search ? `?${search}` : ""}`, { replace: true });
  }, [location.pathname, location.search, navigate]);

  useEffect(() => {
    const mediaId = params.get("media");
    if (!mediaId) {
      setExpandedIndex(-1);
      return;
    }

    const index = visiblePhotos.findIndex((item) => item.id === mediaId);
    setExpandedIndex(index);
  }, [params, visiblePhotos]);

  useEffect(() => {
    if (!expandedItem) {
      setPreviewFrame(null);
      return undefined;
    }

    const updatePreviewFrame = () => {
      const gutter = window.innerWidth <= 640 ? 16 : 32;
      const maxWidth = window.innerWidth - gutter;
      const maxHeight = window.innerHeight - gutter;
      const width = Math.min(maxWidth, maxHeight * previewRatio);

      setPreviewFrame({
        width: `${Math.floor(width)}px`,
        height: `${Math.floor(width / previewRatio)}px`,
      });
    };

    updatePreviewFrame();
    window.addEventListener("resize", updatePreviewFrame);
    return () => window.removeEventListener("resize", updatePreviewFrame);
  }, [expandedItem, previewRatio]);

  const selectFilter = (nextFilter) => {
    setExpandedIndex(-1);
    replaceQuery({ filtru: nextFilter === "Toate" ? null : nextFilter, media: null });
  };

  const rememberRatio = (itemId, event) => {
    const { naturalWidth, naturalHeight } = event.currentTarget;
    if (!naturalWidth || !naturalHeight) return;
    const ratio = Math.min(2.25, Math.max(0.56, naturalWidth / naturalHeight));
    setImageRatios((current) => {
      if (Math.abs((current[itemId] || 0) - ratio) < 0.01) return current;
      return { ...current, [itemId]: ratio };
    });
  };

  const openPhoto = (index) => {
    const item = visiblePhotos[index];
    if (!item) return;
    setExpandedIndex(index);
    replaceQuery({ media: item.id });
  };

  const closePhoto = () => {
    setExpandedIndex(-1);
    replaceQuery({ media: null });
  };

  return (
    <main className="nr-gallery-page" data-design="editorial-mosaic">
      <GalleryThreadsCanvas />
      <ScrollProgress />
      <Navbar />

      <section className="nr-gallery-stage" data-testid="gallery-stage" aria-labelledby="gallery-title">
        <div className="nr-shell nr-gallery-stage__shell">
          <header className="nr-gallery-header">
            <div className="nr-gallery-header__title">
              <p>Galerie FireArtRo</p>
              <h1 id="gallery-title">Galerie</h1>
            </div>
            <p className="nr-gallery-header__intro">Cadre reale din spectacole cu drone, artificii si efecte speciale.</p>
          </header>

          <nav className="nr-gallery-filters" data-testid="gallery-filters" aria-label="Filtre galerie">
            {categories.map((category) => {
              const count = category === "Toate"
                ? photos.length
                : photos.filter((item) => item.category === category).length;
              return (
                <button
                  key={category}
                  type="button"
                  aria-pressed={activeFilter === category}
                  className={activeFilter === category ? "is-active" : ""}
                  onClick={() => selectFilter(category)}
                >
                  <span>{category}</span>
                  <small>{count}</small>
                </button>
              );
            })}
          </nav>

          {visiblePhotos.length ? (
            <div className="nr-gallery-mosaic" data-testid="gallery-grid">
              {visiblePhotos.map((item, index) => (
                <article
                  key={item.id}
                  className="nr-gallery-card"
                  data-testid="gallery-card"
                  style={{
                    "--media-ratio": imageRatios[item.id] || item.aspectRatio || (item.featured ? 1.5 : 1.333),
                    "--gallery-index": index,
                  }}
                >
                  <button type="button" onClick={() => openPhoto(index)} aria-label={`Deschide ${item.title}`}>
                    <img
                      src={item.thumbnail || item.src}
                      alt={item.alt}
                      loading={index < 4 ? "eager" : "lazy"}
                      decoding="async"
                      onLoad={(event) => rememberRatio(item.id, event)}
                    />
                    <span className="nr-gallery-card__copy">
                      <small>{item.category}</small>
                      <strong>{item.title}</strong>
                    </span>
                    <span className="nr-gallery-card__expand" aria-hidden="true">
                      <Expand />
                    </span>
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <div className="nr-gallery-empty" role="status">
              <p>Nu exista inca imagini in aceasta categorie.</p>
              <button type="button" onClick={() => selectFilter("Toate")}>Vezi toate imaginile</button>
            </div>
          )}
        </div>
      </section>

      <Footer />

      <Dialog open={expandedIndex >= 0} onOpenChange={(open) => !open && closePhoto()}>
        <DialogContent
          className="nr-gallery-lightbox"
          aria-label={expandedItem ? `Previzualizare imagine: ${expandedItem.title}` : "Previzualizare imagine"}
          aria-describedby={undefined}
          style={{ "--preview-ratio": previewRatio, ...previewFrame }}
        >
          {expandedItem && (
            <div className="nr-gallery-lightbox__layout">
              <div className="nr-gallery-lightbox__media">
                <img src={expandedItem.src} alt={expandedItem.alt} loading="eager" decoding="async" />
              </div>
              <DialogTitle className="sr-only">{expandedItem.title}</DialogTitle>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
