import { useEffect, useRef, useState } from "react";
import { HERO_POSTER, HERO_VIDEOS } from "@/data/content";
import { useIsMobile, useMediaQuery } from "@/hooks/useMediaQuery";

const HERO_LOOP_SECONDS = 20;

export const HeroVideo = () => {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const switchingRef = useRef(false);
  const mobile = useIsMobile();
  const portraitTablet = useMediaQuery("(min-width: 768px) and (max-width: 1199px) and (orientation: portrait)");
  const usePortraitVideo = mobile || portraitTablet;
  const [enabled, setEnabled] = useState(true);
  const [videoStatus, setVideoStatus] = useState("loading");
  const [webpStatus, setWebpStatus] = useState("idle");
  const [active, setActive] = useState(0);
  const item = HERO_VIDEOS[active];
  const source = usePortraitVideo ? item.mobileSrc : item.src;
  const webpSource = usePortraitVideo ? item.mobileWebpSrc : item.webpSrc;
  const fallbackActive = videoStatus === "failed";

  useEffect(() => {
    switchingRef.current = false;
    setVideoStatus("loading");
  }, [source]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = navigator.connection?.saveData;
    if (reduce || saveData) setEnabled(false);
  }, []);

  useEffect(() => {
    if (!enabled || HERO_VIDEOS.length < 2) return;
    const next = HERO_VIDEOS[(active + 1) % HERO_VIDEOS.length];
    const preload = document.createElement("video");
    preload.preload = "metadata";
    preload.muted = true;
    preload.src = usePortraitVideo ? next.mobileSrc : next.src;
    return () => {
      preload.removeAttribute("src");
      preload.load();
    };
  }, [active, enabled, usePortraitVideo]);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container || !enabled || fallbackActive) return;

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
  }, [active, enabled, source, fallbackActive]);

  const queueNext = () => {
    if (HERO_VIDEOS.length < 2) return;
    if (switchingRef.current) return;
    switchingRef.current = true;
    setVideoStatus("loading");
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

      {enabled && fallbackActive && webpSource && (
        <div
          key={webpSource}
          className="hero-media-picture absolute inset-0 block h-full w-full"
          aria-hidden="true"
        >
          <img
            src={webpSource}
            alt=""
            width={usePortraitVideo ? "2160" : "3840"}
            height={usePortraitVideo ? "3840" : "2160"}
            className="hero-media-surface hero-media-webp absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ease-out"
            style={{ opacity: webpStatus === "ready" ? 1 : 0, objectPosition: item.position || "52% center" }}
            fetchPriority="high"
            decoding="async"
            loading="eager"
            onLoad={() => setWebpStatus("ready")}
            onError={() => {
              setWebpStatus("failed");
            }}
          />
        </div>
      )}

      {enabled && (
        <video
          key={source}
          ref={videoRef}
          className="hero-media-surface hero-media-video absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ease-out"
          style={{ opacity: videoStatus === "ready" ? 1 : 0, objectPosition: item.position || "52% center" }}
          poster={HERO_POSTER}
          autoPlay={!fallbackActive}
          muted
          loop={HERO_VIDEOS.length === 1}
          playsInline
          preload={fallbackActive ? "none" : "metadata"}
          disablePictureInPicture
          disableRemotePlayback
          controlsList="nodownload noplaybackrate nofullscreen"
          onCanPlay={() => setVideoStatus("ready")}
          onPlaying={() => setVideoStatus("ready")}
          onError={() => {
            setVideoStatus("failed");
            setWebpStatus("loading");
          }}
          onTimeUpdate={(event) => {
            const video = event.currentTarget;
            const mediaDuration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : HERO_LOOP_SECONDS;
            const clipDuration = Math.min(mediaDuration, HERO_LOOP_SECONDS);
            if (HERO_VIDEOS.length > 1) {
              if (clipDuration - video.currentTime < 0.45) setVideoStatus("loading");
              if (video.currentTime >= clipDuration) queueNext();
            }
          }}
          onEnded={queueNext}
          aria-label={`Fundal video: ${item.label}`}
        >
          <source src={source} type="video/mp4" />
        </video>
      )}

      <div className="hero-video-overlay hero-video-overlay--base" />
      <div className="hero-video-overlay hero-video-overlay--glow" />
      <div className="hero-video-overlay hero-video-overlay--vertical" />
      <div className="hero-video-overlay hero-video-overlay--horizontal" />
      <div className="hero-video-overlay hero-video-overlay--vignette" />
    </div>
  );
};

export default HeroVideo;
