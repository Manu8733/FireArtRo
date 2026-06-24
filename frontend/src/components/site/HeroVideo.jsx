import { useEffect, useState } from "react";
import { HERO_VIDEOS, HERO_POSTER } from "@/data/content";

// Cinematic video collage — clips autoplay natively; we crossfade opacity between them.
const CLIPS = HERO_VIDEOS.slice(0, 3);

export const HeroVideo = () => {
  const [active, setActive] = useState(0);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.matchMedia("(max-width: 768px)").matches;
    if (reduce || small) return; // mobile & reduced-motion: poster only (perf)
    setEnabled(true);
    const id = setInterval(() => setActive((a) => (a + 1) % CLIPS.length), 6500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <img
        src={HERO_POSTER}
        alt="Spectacol de drone și artificii FIREARTRO"
        className="absolute inset-0 w-full h-full object-cover scale-105"
        fetchPriority="high"
      />

      {enabled &&
        CLIPS.map((clip, i) => (
          <video
            key={clip.src}
            className="absolute inset-0 w-full h-full object-cover transition-opacity ease-in-out"
            style={{ opacity: i === active ? 1 : 0, transitionDuration: "1600ms" }}
            src={clip.src}
            poster={HERO_POSTER}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
          />
        ))}

      {/* Cinematic overlays — depth, mood and strong text legibility */}
      <div className="absolute inset-0 bg-black/45" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_22%,_rgba(131,56,236,0.32),_transparent_60%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#050308]/65 via-[#050308]/35 to-[#050308]" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#050308] via-[#050308]/30 to-transparent" />
      {/* subtle vignette */}
      <div className="absolute inset-0 shadow-[inset_0_0_180px_60px_rgba(5,3,8,0.9)] pointer-events-none" />
    </div>
  );
};

export default HeroVideo;
