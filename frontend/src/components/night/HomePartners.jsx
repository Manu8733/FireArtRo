import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import PartnerOrbitCanvas from "@/components/night/PartnerOrbitCanvas";
import { PARTNER_PLACEHOLDERS } from "@/data/homeExperience";

gsap.registerPlugin(ScrollTrigger);

export default function HomePartners() {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const [gpuState, setGpuState] = useState("warming");
  const setReady = useCallback((state) => setGpuState(state), []);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || reduceMotion) return undefined;

    const trigger = ScrollTrigger.create({
      id: "fireart-partner-orbit",
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: ({ progress }) => canvasRef.current?.setProgress(progress),
    });
    return () => trigger.kill();
  }, [reduceMotion]);

  return (
    <section
      ref={sectionRef}
      className="fa-partners"
      data-home-scene="partners"
      data-testid="home-partners"
      data-gpu={reduceMotion ? "static" : gpuState}
      aria-labelledby="fa-partners-title"
    >
      <div className="fa-partners__sticky">
        <header className="fa-partners__copy">
          <p className="fa-kicker">Un show se construiește împreună</p>
          <h2 id="fa-partners-title">O rețea care prinde formă.</h2>
          <p>Locații, organizatori și echipe tehnice intră în aceeași orbită.</p>
        </header>

        {!reduceMotion && (
          <PartnerOrbitCanvas ref={canvasRef} partners={PARTNER_PLACEHOLDERS} onReady={setReady} />
        )}

        <div className="fa-partners__names" aria-label="Spații rezervate pentru partenerii FireArtRo">
          {PARTNER_PLACEHOLDERS.map((partner) => (
            <span data-partner-name key={partner.id}>{partner.name}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
