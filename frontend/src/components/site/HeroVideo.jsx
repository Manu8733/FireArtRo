import { useEffect, useRef, useState } from "react";
import { HERO_POSTER, HERO_VIDEOS } from "@/data/content";
import { useIsMobile } from "@/hooks/useMediaQuery";

export const HeroVideo = () => {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const mobile = useIsMobile();
  const [enabled, setEnabled] = useState(true);
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(0);
  const item = HERO_VIDEOS[active];
  const source = mobile ? item.mobileSrc : item.src;

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = navigator.connection?.saveData;
    if (reduce || saveData) setEnabled(false);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const next = HERO_VIDEOS[(active + 1) % HERO_VIDEOS.length];
    const preload = document.createElement("video");
    preload.preload = "metadata";
    preload.muted = true;
    preload.src = mobile ? next.mobileSrc : next.src;
    return () => {
      preload.removeAttribute("src");
      preload.load();
    };
  }, [active, enabled, mobile]);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container || !enabled) return;

    let visible = true;
    const syncPlayback = () => {
      if (document.hidden || !visible) {
        video.pause();
        return;
      }
      video.play().catch(() => {});
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        syncPlayback();
      },
      { threshold: 0.08 }
    );
    const onVisibilityChange = () => syncPlayback();

    observer.observe(container);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [active, enabled, source]);

  const queueNext = () => {
    setReady(false);
    setActive((current) => (current + 1) % HERO_VIDEOS.length);
  };

  return (
    <div ref={containerRef} className="hero-video-stage absolute inset-0 z-0 overflow-hidden">
      <img
        src={HERO_POSTER}
        alt="Spectacol de drone și artificii FireArtRo"
        width="800"
        height="1600"
        className="hero-media-surface absolute inset-0 h-full w-full object-cover"
        fetchPriority="high"
        decoding="async"
      />

      {enabled && (
        <video
          key={source}
          ref={videoRef}
          className="hero-media-surface hero-media-video absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ease-out"
          style={{ opacity: ready ? 1 : 0 }}
          poster={HERO_POSTER}
          autoPlay
          muted
          loop={HERO_VIDEOS.length === 1}
          playsInline
          preload={active === 0 ? "auto" : "metadata"}
          disablePictureInPicture
          disableRemotePlayback
          controlsList="nodownload noplaybackrate nofullscreen"
          onCanPlay={() => setReady(true)}
          onPlaying={() => setReady(true)}
          onTimeUpdate={(event) => {
            const video = event.currentTarget;
            if (video.duration - video.currentTime < 0.45) setReady(false);
          }}
          onEnded={queueNext}
          aria-label={`Fundal video: ${item.label}`}
        >
          <source src={source} type="video/mp4" />
        </video>
      )}

      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_56%_30%,_rgba(23, 107, 255,0.2),_transparent_62%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#050308]/46 via-transparent to-[#050308]" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#050308]/94 via-[#050308]/24 to-transparent" />
      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_130px_34px_rgba(5,3,8,0.72)]" />
    </div>
  );
};

export default HeroVideo;
