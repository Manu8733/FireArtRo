import { useEffect, useState } from "react";
import { HERO_VIDEOS, HERO_POSTER } from "@/data/content";

// Cinematic video collage — all clips autoplay natively; we crossfade opacity between them.
const CLIPS = HERO_VIDEOS.slice(0, 3);

export const HeroVideo = () => {
  const [active, setActive] = useState(0);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.matchMedia("(max-width: 640px)").matches;
    if (reduce || small) return;
    setEnabled(true);
    const id = setInterval(() => setActive((a) => (a + 1) % CLIPS.length), 6000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <img
        src={HERO_POSTER}
        alt="Spectacol de drone și artificii FIREARTRO"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {enabled &&
        CLIPS.map((clip, i) => (
          <video
            key={clip.src}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[1500ms] ease-in-out"
            style={{ opacity: i === active ? 1 : 0 }}
            src={clip.src}
            poster={HERO_POSTER}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden="true"
          />
        ))}

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_28%,_rgba(131,56,236,0.30),_transparent_58%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#050308]/75 via-[#050308]/55 to-[#050308]" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#050308] via-[#050308]/30 to-transparent" />
    </div>
  );
};

export default HeroVideo;
