import { HERO_MEDIA, HERO_POSTER } from "@/data/content";
import { useIsMobile, useMediaQuery } from "@/hooks/useMediaQuery";

export const HeroVideo = () => {
  const mobile = useIsMobile();
  const portraitTablet = useMediaQuery("(min-width: 768px) and (max-width: 1199px) and (orientation: portrait)");
  const usePortraitMedia = mobile || portraitTablet;
  const source = usePortraitMedia ? HERO_MEDIA.mobileWebpSrc : HERO_MEDIA.webpSrc;

  return (
    <div className="hero-video-stage absolute inset-0 z-0 overflow-hidden">
      <img
        src={source || HERO_POSTER}
        alt="Spectacol de drone și artificii FireArtRo"
        width={usePortraitMedia ? "2160" : "3840"}
        height={usePortraitMedia ? "3840" : "2160"}
        className="hero-media-surface hero-media-webp absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: HERO_MEDIA.position || "52% center" }}
        fetchPriority="high"
        decoding="async"
        loading="eager"
      />

      <div className="hero-video-overlay hero-video-overlay--base" />
      <div className="hero-video-overlay hero-video-overlay--glow" />
      <div className="hero-video-overlay hero-video-overlay--vertical" />
      <div className="hero-video-overlay hero-video-overlay--horizontal" />
      <div className="hero-video-overlay hero-video-overlay--vignette" />
    </div>
  );
};

export default HeroVideo;
