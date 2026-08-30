import { useEffect, useRef, useState } from "react";
import { HERO_MEDIA, HERO_POSTER } from "@/data/content";
import { useIsMobile, useMediaQuery } from "@/hooks/useMediaQuery";

export const HeroVideo = () => {
  const videoRef = useRef(null);
  const mobile = useIsMobile();
  const portraitTablet = useMediaQuery("(min-width: 768px) and (max-width: 1199px) and (orientation: portrait)");
  const usePortraitMedia = mobile || portraitTablet;
  const source = usePortraitMedia ? HERO_MEDIA.mobileSrc : HERO_MEDIA.src;
  const poster = usePortraitMedia ? HERO_MEDIA.mobileWebpSrc : HERO_MEDIA.webpSrc;
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    setVideoFailed(false);
  }, [source]);

  useEffect(() => {
    if (videoFailed) return undefined;
    const video = videoRef.current;
    if (!video) return undefined;

    const attemptPlayback = () => {
      if (video.paused) video.play().catch(() => undefined);
    };

    attemptPlayback();
    video.addEventListener("canplay", attemptPlayback);
    document.addEventListener("visibilitychange", attemptPlayback);
    return () => {
      video.removeEventListener("canplay", attemptPlayback);
      document.removeEventListener("visibilitychange", attemptPlayback);
    };
  }, [source, videoFailed]);

  return (
    <div className="hero-video-stage absolute inset-0 z-0 overflow-hidden">
      {videoFailed ? (
        <img
          src={poster || HERO_POSTER}
          alt="Spectacol de drone și artificii FireArtRo"
          width={usePortraitMedia ? "2160" : "3840"}
          height={usePortraitMedia ? "3840" : "2160"}
          className="hero-media-surface hero-media-webp absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: HERO_MEDIA.position || "52% center" }}
          fetchPriority="high"
          decoding="async"
          loading="eager"
        />
      ) : (
        <video
          key={source}
          ref={videoRef}
          src={source}
          poster={poster || HERO_POSTER}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="hero-media-surface hero-media-video absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: HERO_MEDIA.position || "52% center" }}
          onCanPlay={(event) => event.currentTarget.play().catch(() => undefined)}
          onError={() => setVideoFailed(true)}
          aria-label="Spectacol video cu drone și artificii FireArtRo"
        />
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
