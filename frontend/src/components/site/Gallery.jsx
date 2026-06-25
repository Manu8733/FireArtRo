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
  const [active, setActive] = useState(0);

  const goTo = (index) => {
    const next = (index + slides.length) % slides.length;
    setActive(next);
    trackRef.current?.children[next]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  };

  return (
    <section className="promo-showcase" data-testid="gallery-section" aria-labelledby="promo-showcase-title">
      <div className="promo-showcase-header">
        <Reveal>
          <span>Selecție vizuală</span>
          <h2 id="promo-showcase-title">Imagini, filme și direcții de spectacol.</h2>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="promo-showcase-tools">
            <p>O selecție scurtă din producțiile FIREARTRO. Galeria completă reunește toate formatele într-un singur loc.</p>
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
        onScroll={(event) => {
          const track = event.currentTarget;
          const width = track.firstElementChild?.getBoundingClientRect().width || 1;
          setActive(Math.max(0, Math.min(slides.length - 1, Math.round(track.scrollLeft / width))));
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
