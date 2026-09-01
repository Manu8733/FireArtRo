import { useLayoutEffect, useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useReducedMotion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { HOME_GALLERY } from "@/data/homeExperience";

gsap.registerPlugin(ScrollTrigger);

const galleryItems = HOME_GALLERY.slice(0, 3);

export default function HomeGallery() {
  const sectionRef = useRef(null);
  const reduceMotion = useReducedMotion();

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || reduceMotion) return undefined;

    let cleanupMotion = () => {};

    const context = gsap.context(() => {
      const track = section.querySelector(".fa-work__track");
      const viewport = section.querySelector(".fa-work__viewport");
      const intro = section.querySelector(".fa-work__intro");
      const outroContent = section.querySelector(".fa-work__outro-inner");
      const panels = gsap.utils.toArray("[data-gallery-panel]", section);
      const lifts = panels.map((panel) => panel.querySelector("[data-gallery-lift]"));
      if (
        !track
        || !viewport
        || !intro
        || !outroContent
        || !panels.length
        || lifts.some((lift) => !lift)
      ) return;

      let travelDistance = 0;
      let liftDistance = 0;
      let viewportWidth = 0;
      let panelMetrics = [];
      let renderedProgress = 0;
      let refreshFrame = 0;
      let settleTimer = 0;
      let resizeObserver;
      let lastViewportWidth = viewport.clientWidth || window.innerWidth;
      let lastViewportHeight = window.innerHeight;
      let lastPortrait = window.matchMedia("(orientation: portrait)").matches;
      const setTrackX = gsap.quickSetter(track, "x", "px");
      const setLiftY = lifts.map((lift) => gsap.quickSetter(lift, "y", "px"));
      const setIntroOpacity = gsap.quickSetter(intro, "opacity");
      const setOutroOpacity = gsap.quickSetter(outroContent, "opacity");
      const touchDriven = window.matchMedia(
        "(max-width: 899px), (hover: none) and (pointer: coarse)",
      ).matches;

      const measure = () => {
        liftDistance = Math.min(550, window.innerHeight * 0.61);
        viewportWidth = viewport.clientWidth || window.innerWidth;
        section.style.setProperty("--nr-scene-width", `${viewportWidth}px`);
        travelDistance = Math.max(0, track.scrollWidth - viewportWidth);
        panelMetrics = panels.map((panel) => ({
          left: panel.offsetLeft,
          width: panel.offsetWidth,
        }));
      };

      const positionPanels = (progress) => {
        const horizontalOffset = progress * travelDistance;

        panels.forEach((_panel, index) => {
          const metric = panelMetrics[index];
          const centerRatio = (
            metric.left - horizontalOffset + metric.width / 2
          ) / viewportWidth;
          const riseProgress = gsap.utils.clamp(0, 1, (1.2 - centerRatio) / 0.7);
          const outroSettleProgress = index === panels.length - 1
            ? gsap.utils.clamp(0, 1, (progress - 0.28) / 0.12)
            : 0;
          const resolvedRise = Math.max(riseProgress, outroSettleProgress);
          const y = liftDistance * ((1 - resolvedRise) ** 3);
          setLiftY[index](y);
        });
      };

      const motion = { progress: 0 };
      const renderMotion = () => {
        const progress = motion.progress;
        const introOpacity = 1 - gsap.utils.clamp(0, 1, (progress - 0.025) / 0.07);
        const outroOpacity = gsap.utils.clamp(0, 1, (progress - 0.89) / 0.1);
        setTrackX(-progress * travelDistance);
        positionPanels(progress);
        setIntroOpacity(introOpacity);
        setOutroOpacity(outroOpacity);
        renderedProgress = progress;
      };

      measure();
      gsap.set(lifts, { y: liftDistance, force3D: true });
      gsap.set(track, { x: 0, force3D: true });
      renderMotion();

      const galleryTrigger = ScrollTrigger.create({
        id: "fireart-gallery-track",
        trigger: section,
        start: "top top",
        end: () => {
          measure();
          const compactScene = window.matchMedia(
            "(max-width: 899px), (hover: none) and (pointer: coarse), "
              + "(min-width: 900px) and (max-width: 1199px) and (orientation: portrait), "
              + "(min-width: 900px) and (max-width: 999px) and (max-height: 560px) and (orientation: landscape)",
          ).matches;
          const compactRunwayMultiplier = gsap.utils.clamp(
            0.42,
            0.72,
            0.72 - Math.max(0, viewportWidth - 480) * 0.0004,
          );
          const scrollRunwayMultiplier = compactScene ? compactRunwayMultiplier : 0.686;
          return `+=${Math.max(viewportWidth * 1.392, travelDistance * scrollRunwayMultiplier)}`;
        },
        pin: ".fa-work__sticky",
        invalidateOnRefresh: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          motion.progress = self.progress;
          renderMotion();
        },
        onRefresh: (self) => {
          measure();
          motion.progress = self.progress;
          renderMotion();
        },
      });

      const syncTouchMotion = () => {
        if (!touchDriven) return;
        const trigger = galleryTrigger;
        if (!trigger || trigger.end <= trigger.start) return;
        const nextProgress = gsap.utils.clamp(
          0,
          1,
          (window.scrollY - trigger.start) / (trigger.end - trigger.start),
        );
        if (Math.abs(nextProgress - renderedProgress) < 0.001) return;
        motion.progress = nextProgress;
        renderMotion();
      };

      if (touchDriven) {
        gsap.ticker.add(syncTouchMotion);
      }

      const refreshGeometry = () => {
        window.cancelAnimationFrame(refreshFrame);
        refreshFrame = window.requestAnimationFrame(() => {
          const nextViewportWidth = viewport.clientWidth || window.innerWidth;
          const nextViewportHeight = window.innerHeight;
          const nextPortrait = window.matchMedia("(orientation: portrait)").matches;
          const meaningfulResize = Math.abs(nextViewportWidth - lastViewportWidth) > 1
            || Math.abs(nextViewportHeight - lastViewportHeight) > 96
            || nextPortrait !== lastPortrait;
          if (!meaningfulResize) return;

          lastViewportWidth = nextViewportWidth;
          lastViewportHeight = nextViewportHeight;
          lastPortrait = nextPortrait;
          measure();
          renderMotion();
          ScrollTrigger.refresh();
        });
      };

      const scheduleGeometryRefresh = () => {
        refreshGeometry();
        window.clearTimeout(settleTimer);
        settleTimer = window.setTimeout(refreshGeometry, 160);
      };

      window.addEventListener("resize", scheduleGeometryRefresh, { passive: true });
      window.addEventListener("orientationchange", scheduleGeometryRefresh, { passive: true });
      window.visualViewport?.addEventListener("resize", scheduleGeometryRefresh, { passive: true });
      if (typeof ResizeObserver !== "undefined") {
        resizeObserver = new ResizeObserver(scheduleGeometryRefresh);
        resizeObserver.observe(viewport);
      }

      cleanupMotion = () => {
        window.cancelAnimationFrame(refreshFrame);
        window.clearTimeout(settleTimer);
        resizeObserver?.disconnect();
        gsap.ticker.remove(syncTouchMotion);
        window.removeEventListener("resize", scheduleGeometryRefresh);
        window.removeEventListener("orientationchange", scheduleGeometryRefresh);
        window.visualViewport?.removeEventListener("resize", scheduleGeometryRefresh);
        galleryTrigger.kill();
        section.style.removeProperty("--nr-scene-width");
      };
    }, section);

    return () => {
      cleanupMotion();
      context.revert();
    };
  }, [reduceMotion]);

  return (
    <section
      id="spectacole"
      ref={sectionRef}
      className="fa-work"
      data-home-scene="gallery"
      data-testid="home-gallery"
      data-motion={reduceMotion ? "static" : "scroll"}
      aria-labelledby="fa-work-title"
    >
      <div className="fa-work__sticky">
        <div className="fa-work__viewport">
          <div className="fa-work__track">
            <header className="fa-work__intro">
              <p className="fa-kicker">Selecție FireArtRo</p>
              <h2 id="fa-work-title">Trei momente.<br />O singură noapte.</h2>
              <Link className="fa-line-link" to="/galerie">
                <span>Vezi galeria</span>
                <ArrowUpRight aria-hidden="true" />
              </Link>
            </header>

            {galleryItems.map((item) => (
              <article
                className="fa-work__card"
                data-gallery-item
                data-gallery-panel
                key={item.id}
              >
                <div className="fa-work__card-inner" data-gallery-lift>
                  <figure>
                    <img src={item.image} alt={item.alt} loading="lazy" decoding="async" />
                  </figure>
                  <div className="fa-work__meta">
                    <p>{item.type}</p>
                    <h3>{item.title}</h3>
                  </div>
                </div>
              </article>
            ))}

            <aside className="fa-work__outro" data-gallery-panel>
              <div className="fa-work__outro-inner" data-gallery-lift>
                <p className="fa-kicker">Dincolo de cadru</p>
                <h3>Spectacolul continuă.</h3>
                <Link className="fa-line-link" to="/galerie">
                  <span>Intră în galerie</span>
                  <ArrowUpRight aria-hidden="true" />
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
