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

    const context = gsap.context(() => {
      const track = section.querySelector(".fa-work__track");
      const viewport = section.querySelector(".fa-work__viewport");
      const panels = gsap.utils.toArray("[data-gallery-panel]", section);
      const lifts = panels.map((panel) => panel.querySelector("[data-gallery-lift]"));
      if (!track || !viewport || !panels.length || lifts.some((lift) => !lift)) return;

      let travelDistance = 0;
      let liftDistance = 0;
      let viewportWidth = 0;
      let panelMetrics = [];
      const setTrackX = gsap.quickSetter(track, "x", "px");
      const setLiftY = lifts.map((lift) => gsap.quickSetter(lift, "y", "px"));

      const measure = () => {
        travelDistance = Math.max(0, track.scrollWidth - window.innerWidth);
        liftDistance = Math.min(550, window.innerHeight * 0.61);
        viewportWidth = viewport.clientWidth || window.innerWidth;
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
            ? gsap.utils.clamp(0, 1, (progress - 0.48) / 0.18)
            : 0;
          const resolvedRise = Math.max(riseProgress, outroSettleProgress);
          const y = liftDistance * ((1 - resolvedRise) ** 3);
          setLiftY[index](y);
        });
      };

      const motion = { progress: 0 };
      const renderMotion = () => {
        const progress = motion.progress;
        setTrackX(-progress * travelDistance);
        positionPanels(progress);
      };

      measure();
      gsap.set(lifts, { y: liftDistance, force3D: true });
      gsap.set(track, { x: 0, force3D: true });
      positionPanels(0);

      const timeline = gsap.timeline({
        scrollTrigger: {
          id: "fireart-gallery-track",
          trigger: section,
          start: "top top",
          end: () => {
            measure();
            return `+=${Math.max(window.innerWidth * 1.392, travelDistance * 0.686)}`;
          },
          pin: ".fa-work__sticky",
          scrub: 0.18,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onRefresh: () => {
            measure();
            renderMotion();
          },
        },
      });

      timeline.to(motion, {
        progress: 1,
        duration: 1,
        ease: "none",
        onUpdate: renderMotion,
      });

      return () => timeline.kill();
    }, section);

    return () => context.revert();
  }, [reduceMotion]);

  return (
    <section
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
