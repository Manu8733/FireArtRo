import { useLayoutEffect, useRef } from "react";
import { ArrowUpRight, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { useReducedMotion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { HOME_GALLERY, HOME_PACKAGES } from "@/data/homeExperience";

gsap.registerPlugin(ScrollTrigger);

const featuredPackageIds = ["night-signature", "drone-story-100", "hybrid-signature"];
const featuredPackages = featuredPackageIds
  .map((id) => HOME_PACKAGES.find((item) => item.id === id))
  .filter(Boolean);
const handoffGalleryItem = HOME_GALLERY[2];

const getYoutubePoster = (url, fallback) => {
  const match = String(url || "").match(/(?:youtu\.be\/|v=)([^?&/]+)/);
  return match?.[1]
    ? {
      primary: `https://i.ytimg.com/vi/${match[1]}/hqdefault.jpg`,
      fallback,
    }
    : { primary: fallback, fallback };
};

export default function HomePackages() {
  const sectionRef = useRef(null);
  const reduceMotion = useReducedMotion();

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || reduceMotion) return undefined;

    const context = gsap.context(() => {
      const panels = gsap.utils.toArray("[data-package-slab]", section);
      const sticky = section.querySelector(".fa-packages__sticky");
      const link = section.querySelector(".fa-packages__link");
      const handoff = section.querySelector("[data-gallery-handoff]");
      const revealCopy = section.querySelector("[data-package-reveal-copy]");
      if (!panels.length || !sticky || !handoff || !revealCopy) return;

      const viewportWidth = () => sticky.clientWidth || window.innerWidth;
      const isCompactHandoff = () => window.innerWidth <= 899;
      const handoffStartX = () => (isCompactHandoff() ? -viewportWidth() : 0);
      const measureSceneWidth = () => {
        section.style.setProperty("--nr-scene-width", `${viewportWidth()}px`);
      };

      gsap.set(sticky, { opacity: 0, pointerEvents: "none" });
      gsap.set(panels, {
        y: () => Math.min(720, window.innerHeight * 0.9),
        x: (index) => (index - 1) * window.innerWidth * 0.09,
        scale: 0.9,
        autoAlpha: 0,
        force3D: true,
      });
      gsap.set(handoff, { x: handoffStartX, xPercent: 0, autoAlpha: 1, force3D: true });
      gsap.set(revealCopy, { y: 0, opacity: 1 });
      gsap.set(link, { y: 24, opacity: 0 });

      const handoffDuration = 1.82;
      const revealCopyStart = 2;
      const panelsStart = 2.47;
      const panelDuration = 1.24;
      const panelStagger = 0.56;
      const linkStart = 5.1;
      const timeline = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: {
          id: "fireart-package-dock",
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.18,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onEnter: () => gsap.set(sticky, { opacity: 1, pointerEvents: "auto" }),
          onEnterBack: () => gsap.set(sticky, { opacity: 1, pointerEvents: "auto" }),
          onLeaveBack: () => gsap.set(sticky, { opacity: 0, pointerEvents: "none" }),
          onRefresh: measureSceneWidth,
        },
      });

      measureSceneWidth();
      timeline.to(handoff, {
        x: () => -viewportWidth(),
        duration: handoffDuration,
        ease: "sine.inOut",
      }, 0);

      timeline.to(handoff, {
        autoAlpha: 0,
        duration: 0.24,
        ease: "sine.inOut",
      }, handoffDuration + 0.12);

      timeline.to(revealCopy, {
        y: -24,
        opacity: 0,
        duration: 0.34,
        ease: "sine.inOut",
      }, revealCopyStart);

      panels.forEach((panel, index) => {
        timeline.to(panel, {
          y: 0,
          x: () => (window.innerWidth <= 520 ? (index - 1) * Math.min(window.innerWidth * 0.17, 68) : 0),
          rotation: () => (window.innerWidth <= 520 ? (index - 1) * 3.5 : 0),
          scale: () => (window.innerWidth <= 520 && index !== 1 ? 0.94 : 1),
          autoAlpha: 1,
          duration: panelDuration,
        }, panelsStart + index * panelStagger);
      });

      timeline.to(link, { y: 0, opacity: 1, duration: 0.3 }, linkStart);
    }, section);

    return () => {
      section.style.removeProperty("--nr-scene-width");
      context.revert();
    };
  }, [reduceMotion]);

  return (
    <section
      ref={sectionRef}
      className="fa-packages"
      data-home-scene="packages"
      data-testid="home-packages"
      data-motion={reduceMotion ? "static" : "scroll"}
      aria-labelledby="fa-packages-title"
    >
      <div className="fa-packages__sticky">
        <div
          className="fa-packages__handoff"
          data-gallery-handoff
          data-testid="gallery-package-handoff"
          data-direction="exit-left"
          aria-hidden="true"
        >
          <article className="fa-work__card fa-packages__handoff-card">
            <div className="fa-work__card-inner">
              <figure>
                <img
                  data-handoff-gallery-image
                  src={handoffGalleryItem.image}
                  alt=""
                  loading="eager"
                  decoding="async"
                />
              </figure>
              <div className="fa-work__meta">
                <p>{handoffGalleryItem.type}</p>
                <h3>{handoffGalleryItem.title}</h3>
              </div>
            </div>
          </article>

          <aside className="fa-work__outro fa-packages__handoff-outro">
            <div className="fa-work__outro-inner">
              <p className="fa-kicker">Dincolo de cadru</p>
              <h3>Spectacolul continuă.</h3>
              <div className="fa-line-link">
                <span>Intră în galerie</span>
                <ArrowUpRight aria-hidden="true" />
              </div>
            </div>
          </aside>
        </div>

        <header
          className="fa-packages__reveal-copy"
          data-package-reveal-copy
          data-testid="package-reveal-copy"
          data-sequence="before-packages"
        >
          <p className="fa-kicker">Pachete FireArtRo</p>
          <h2 id="fa-packages-title">Trei moduri de a<br />aprinde noaptea.</h2>
        </header>

        <div className="fa-packages__lineup nr-shell" data-package-dock>
          {featuredPackages.map((item) => (
            (() => {
              const poster = getYoutubePoster(item.youtubeUrl, item.image);
              return (
                <a
                  className="fa-package-slab"
                  data-package-slab
                  data-package-youtube
                  href={item.youtubeUrl}
                  key={item.id}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    data-package-media="poster"
                    src={poster.primary}
                    alt={item.alt}
                    loading="lazy"
                    decoding="async"
                    onError={(event) => {
                      if (event.currentTarget.src !== poster.fallback) {
                        event.currentTarget.src = poster.fallback;
                      }
                    }}
                  />
                  <div className="fa-package-slab__veil" />
                  <span className="fa-package-slab__play" data-package-play aria-hidden="true"><Play fill="currentColor" /></span>
                  <div className="fa-package-slab__copy">
                    <p data-package-type>{item.type}</p>
                    <h3>{item.title}</h3>
                    <p className="fa-package-slab__description" data-package-description>{item.description}</p>
                    <small data-package-detail>{item.detail}</small>
                    <span className="fa-package-slab__link">Vezi clipul <ArrowUpRight aria-hidden="true" /></span>
                  </div>
                </a>
              );
            })()
          ))}
        </div>

        <Link className="fa-line-link fa-packages__link" to="/pachete">
          <span>Explorează toate pachetele</span>
          <ArrowUpRight aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
