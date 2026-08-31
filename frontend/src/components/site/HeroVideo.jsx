import { useEffect, useRef, useState } from "react";
import { HERO_MEDIA, HERO_POSTER } from "@/data/content";
import { useIsMobile, useMediaQuery } from "@/hooks/useMediaQuery";

export const HeroVideo = () => {
  const videoRef = useRef(null);
  const mobile = useIsMobile();
  const portraitTablet = useMediaQuery("(min-width: 768px) and (max-width: 1199px) and (orientation: portrait)");
  const compactLandscape = useMediaQuery("(max-width: 1199px) and (max-height: 900px) and (orientation: landscape)");
  const mediaVariant = compactLandscape ? "landscape" : mobile || portraitTablet ? "mobile" : "desktop";
  const source = HERO_MEDIA[`${mediaVariant === "desktop" ? "" : mediaVariant}Src`] || HERO_MEDIA.src;
  const poster = HERO_MEDIA[`${mediaVariant === "desktop" ? "" : mediaVariant}WebpSrc`] || HERO_MEDIA.webpSrc || HERO_POSTER;
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    setVideoFailed(false);
  }, [source]);

  useEffect(() => {
    if (videoFailed) return undefined;
    const video = videoRef.current;
    if (!video) return undefined;
    let disposed = false;
    let lifecycleHidden = false;
    let retryTimer;
    let errorAttempts = 0;
    let playbackWatchdog;
    const lifecycleTimers = new Set();

    const clearRetry = () => {
      if (retryTimer) window.clearTimeout(retryTimer);
      retryTimer = undefined;
    };

    const attemptPlayback = (force = false) => {
      if (disposed || lifecycleHidden || (!force && document.visibilityState === "hidden")) return;
      const promise = video.play();
      promise?.catch(() => {
        if (disposed) return;
        clearRetry();
        retryTimer = window.setTimeout(attemptPlayback, 320);
      });
    };

    const recoverPlayback = (force = false) => {
      if (disposed || lifecycleHidden || (!force && document.visibilityState === "hidden")) return;
      if (video.readyState < 2 || video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
        video.load();
      }
      attemptPlayback(force);
    };

    playbackWatchdog = window.setInterval(() => {
      if (disposed || lifecycleHidden || !video.paused) return;
      if (video.readyState >= 2) attemptPlayback(true);
      else if (video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) recoverPlayback(true);
    }, 1_200);

    const scheduleLifecycleRecovery = () => {
      [120, 650, 1400, 2600, 5000].forEach((delay) => {
        const timer = window.setTimeout(() => {
          lifecycleTimers.delete(timer);
          recoverPlayback(true);
        }, delay);
        lifecycleTimers.add(timer);
      });
    };

    const onVisibilityChange = () => {
      lifecycleHidden = document.visibilityState === "hidden";
      if (lifecycleHidden) video.pause();
      else recoverPlayback();
    };

    const onPageHide = () => {
      lifecycleHidden = true;
      video.pause();
    };
    const onPageShow = () => {
      lifecycleHidden = false;
      recoverPlayback(true);
      scheduleLifecycleRecovery();
    };
    const onFocus = () => {
      if (!lifecycleHidden) recoverPlayback(true);
    };
    const onOnline = () => {
      if (!lifecycleHidden) recoverPlayback(true);
    };
    const onError = () => {
      if (errorAttempts < 2) {
        errorAttempts += 1;
        clearRetry();
        retryTimer = window.setTimeout(recoverPlayback, 220 * errorAttempts);
        return;
      }
      setVideoFailed(true);
    };
    const onLoadedMetadata = () => attemptPlayback();
    const onLoadedData = () => attemptPlayback();
    const onCanPlay = () => attemptPlayback();
    const onStalled = () => recoverPlayback();

    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("loadeddata", onLoadedData);
    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("playing", clearRetry);
    video.addEventListener("stalled", onStalled);
    video.addEventListener("error", onError);
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("focus", onFocus);
    window.addEventListener("online", onOnline);

    recoverPlayback();
    scheduleLifecycleRecovery();
    return () => {
      disposed = true;
      window.clearInterval(playbackWatchdog);
      clearRetry();
      lifecycleTimers.forEach((timer) => window.clearTimeout(timer));
      lifecycleTimers.clear();
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("loadeddata", onLoadedData);
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("playing", clearRetry);
      video.removeEventListener("stalled", onStalled);
      video.removeEventListener("error", onError);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("online", onOnline);
    };
  }, [source, videoFailed]);

  return (
    <div className="hero-video-stage absolute inset-0 z-0 overflow-hidden">
      {videoFailed ? (
        <img
          src={poster || HERO_POSTER}
          alt="Spectacol de drone și artificii FireArtRo"
          width={mediaVariant === "mobile" ? "2160" : "1920"}
          height={mediaVariant === "mobile" ? "3840" : "1080"}
          className="hero-media-surface hero-media-webp absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: HERO_MEDIA.position || "52% center" }}
          fetchPriority="high"
          decoding="async"
          loading="eager"
        />
      ) : (
        <video
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
          data-media-variant={mediaVariant}
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
