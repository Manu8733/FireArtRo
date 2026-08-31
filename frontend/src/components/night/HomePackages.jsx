import { useLayoutEffect, useMemo, useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useReducedMotion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import useManagedContent from "@/hooks/useManagedContent";
import { PACKAGE_ITEMS } from "@/data/businessContent";
import { goToContact } from "@/lib/contactNavigation";

gsap.registerPlugin(ScrollTrigger);

const FEATURED_PACKAGE_IDS = [
  "fireworks-multicolor-2026",
  "fireworks-gold-2026",
  "fireworks-diamond-piromusical-2026",
];

export default function HomePackages() {
  const sectionRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const managedPackages = useManagedContent("packages", PACKAGE_ITEMS);
  const featuredPackages = useMemo(
    () => FEATURED_PACKAGE_IDS
      .map((id) => managedPackages.find((item) => item.id === id))
      .filter(Boolean),
    [managedPackages],
  );

  const requestPackage = (item) => goToContact({
    package_id: item.id,
    package_title: item.title,
    services: [item.category],
  });

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
      const compactHandoff = isCompactHandoff();
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
      gsap.set(revealCopy, { y: 18, opacity: 0 });
      gsap.set(link, { y: 24, opacity: 0 });

      const handoffDuration = compactHandoff ? 1.52 : 1.82;
      const handoffFadeStart = handoffDuration + (compactHandoff ? 0.06 : 0.12);
      const handoffFadeDuration = compactHandoff ? 0.18 : 0.24;
      const revealCopyInStart = handoffFadeStart + handoffFadeDuration;
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
        duration: handoffFadeDuration,
        ease: "sine.inOut",
      }, handoffFadeStart);

      timeline.to(revealCopy, {
        y: 0,
        opacity: 1,
        duration: 0.2,
        ease: "sine.out",
      }, revealCopyInStart);

      timeline.to(revealCopy, {
        y: -24,
        opacity: 0,
        duration: 0.24,
        ease: "sine.inOut",
      }, panelsStart);

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
      data-motion={reduceMotion ? "static" : "reveal"}
      aria-labelledby="fa-packages-title"
    >
      <div className="fa-packages__inner nr-shell">
        <header className="fa-packages__header">
          <p className="fa-kicker">Pachete FireArtRo</p>
          <h2 id="fa-packages-title">Trei moduri de a aprinde noaptea.</h2>
          <p>Alege un punct de plecare. Configurația finală se adaptează locului, ritmului și momentului.</p>
        </header>

        <div className="fa-packages__triptych" data-package-triptych>
          {featuredPackages.map((item, index) => (
            <article data-package-panel data-package-id={item.id} className="fa-package-panel" key={item.id}>
              <div className="fa-package-panel__topline">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <span>{item.category}</span>
              </div>
              <div className="fa-package-panel__body">
                {item.badge && <p className="fa-package-panel__badge">{item.badge}</p>}
                <h3>{item.title}</h3>
                <p>{item.shortDescription}</p>
                <dl>
                  <div><dt>Durată</dt><dd>{item.duration}</dd></div>
                  <div><dt>Potrivit pentru</dt><dd>{item.bestFor}</dd></div>
                </dl>
                <ul>{item.highlights.slice(0, 3).map((value) => <li key={value}>{value}</li>)}</ul>
              </div>
              <button type="button" data-package-request onClick={() => requestPackage(item)}>
                <span>Cere ofertă</span><ArrowUpRight aria-hidden="true" />
              </button>
            </article>
          ))}
        </div>

        <Link className="fa-line-link fa-packages__all" to="/pachete">
          <span>Vezi toate pachetele</span><ArrowUpRight aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
