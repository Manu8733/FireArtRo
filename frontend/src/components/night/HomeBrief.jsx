import { useLayoutEffect, useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useReducedMotion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MEDIA } from "@/data/content";

gsap.registerPlugin(ScrollTrigger);

export default function HomeBrief() {
  const sectionRef = useRef(null);
  const reduceMotion = useReducedMotion();

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || reduceMotion) return undefined;
    const image = section.querySelector(".fa-brief__image");
    const context = gsap.context(() => {
      gsap.fromTo(image, { yPercent: -7, scale: 1.16 }, {
        yPercent: 7,
        scale: 1.08,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      });
    }, section);
    return () => context.revert();
  }, [reduceMotion]);

  return (
    <section
      ref={sectionRef}
      className="fa-brief"
      data-home-scene="brief"
      data-testid="home-brief"
      aria-labelledby="fa-brief-title"
    >
      <img className="fa-brief__image" src={MEDIA.crowd2} alt="Public privind un spectacol FireArtRo" loading="lazy" decoding="async" />
      <div className="fa-brief__shade" aria-hidden="true" />
      <div className="fa-brief__copy nr-shell">
        <p className="fa-kicker">Următorul spectacol</p>
        <h2 id="fa-brief-title">Spune-ne ce sărbătorești.<br />Noi aprindem restul.</h2>
        <Link className="fa-brief__link" to="/contact">
          <span>Începe conversația</span>
          <ArrowUpRight aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
