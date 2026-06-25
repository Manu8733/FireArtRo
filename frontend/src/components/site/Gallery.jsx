import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Play } from "lucide-react";
import { Link } from "react-router-dom";
import Reveal from "@/components/site/Reveal";
import { PROMO_SLIDES } from "@/data/businessContent";
import useManagedContent from "@/hooks/useManagedContent";

const PromoMedia = ({ item, active }) => {
  if (item.type === "video") {
    return (
      <video
        src={item.media}
        poster={item.poster}
        muted
        loop
        playsInline
        autoPlay={active}
        preload={active ? "metadata" : "none"}
        aria-label={`Fundal video: ${item.title}`}
      />
    );
  }

  return (
    <img
      src={item.poster || item.media}
      alt={item.title}
      width="1280"
      height="853"
      loading="lazy"
      decoding="async"
    />
  );
};

export const Gallery = () => {
  const slides = useManagedContent("promoSlides", PROMO_SLIDES);
  const trackRef = useRef(null);
  const pointerRef = useRef(null);
  const [active, setActive] = useState(0);

  const updateActive = () => {
    const track = trackRef.current;
    if (!track) return;
    const cards = [...track.children];
    const center = track.scrollLeft + track.clientWidth / 2;
    const nearest = cards.reduce(
      (best, card, index) => {
        const cardCenter = card.offsetLeft + card.clientWidth / 2;
        const distance = Math.abs(cardCenter - center);
        return distance < best.distance ? { index, distance } : best;
      },
      { index: 0, distance: Number.POSITIVE_INFINITY },
    );
    setActive(nearest.index);
  };

  const goTo = (index) => {
    const next = (index + slides.length) % slides.length;
    const card = trackRef.current?.children[next];
    if (!card) return;
    setActive(next);
    trackRef.current.scrollTo({
      left: card.offsetLeft - (trackRef.current.clientWidth - card.clientWidth) / 2,
      behavior: "smooth",
    });
  };

  return (
    <section className="promo-showcase" data-testid="gallery-section" aria-labelledby="promo-showcase-title">
      <div className="promo-showcase-header">
        <Reveal>
          <span>Selecție vizuală</span>
          <h2 id="promo-showcase-title">Cadre reale. Spectacol în mișcare.</h2>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="promo-showcase-tools">
            <p>Trage, derulează sau folosește săgețile. Galeria completă reunește fotografiile și filmele FireArtRo.</p>
            <div>
              <button type="button" onClick={() => goTo(active - 1)} aria-label="Slide anterior">
                <ArrowLeft />
              </button>
              <button type="button" onClick={() => goTo(active + 1)} aria-label="Slide următor">
                <ArrowRight />
              </button>
            </div>
          </div>
        </Reveal>
      </div>

      <div
        ref={trackRef}
        className="promo-showcase-track"
        onScroll={updateActive}
        onPointerDown={(event) => {
          pointerRef.current = {
            x: event.clientX,
            scrollLeft: event.currentTarget.scrollLeft,
          };
          event.currentTarget.setPointerCapture?.(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (!pointerRef.current) return;
          event.currentTarget.scrollLeft =
            pointerRef.current.scrollLeft - (event.clientX - pointerRef.current.x);
        }}
        onPointerUp={(event) => {
          pointerRef.current = null;
          event.currentTarget.releasePointerCapture?.(event.pointerId);
          updateActive();
        }}
        onPointerCancel={() => {
          pointerRef.current = null;
        }}
      >
        {slides.map((item, index) => (
          <article key={item.id} className={`promo-card promo-card-${item.type}`}>
            <PromoMedia item={item} active={index === active} />
            <div className="promo-card-overlay" />
            <span className="promo-card-badge">{item.badge}</span>
            {item.type === "youtube" && (
              <span className="promo-card-play" aria-hidden="true"><Play /></span>
            )}
            <div className="promo-card-copy">
              <h3>{item.title}</h3>
              <p>{item.shortText}</p>
              <Link to={item.ctaHref}>
                {item.ctaLabel} <ArrowRight />
              </Link>
            </div>
          </article>
        ))}
      </div>

      <div className="promo-showcase-progress" aria-label={`Slide ${active + 1} din ${slides.length}`}>
        <span style={{ width: `${((active + 1) / slides.length) * 100}%` }} />
      </div>
    </section>
  );
};

export default Gallery;
