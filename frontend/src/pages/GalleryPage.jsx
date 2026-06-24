import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Camera, Film, Play, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import ScrollProgress from "@/components/site/ScrollProgress";
import { GALLERY, GALLERY_VIDEOS } from "@/data/content";

const getYouTubeId = (url) => {
  if (!url) return "";
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/i);
  return match?.[1] || "";
};

const getYouTubeThumb = (id) => `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
const getEmbedUrl = (id) =>
  `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;

const PhotoTile = ({ item, index, onOpen }) => (
  <button
    type="button"
    onClick={() => onOpen(item)}
    className={`group relative min-h-[260px] overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.035] text-left outline-none transition duration-500 hover:-translate-y-1 hover:border-white/20 focus-visible:ring-2 focus-visible:ring-white/70 ${
      item.big ? "md:col-span-2 md:row-span-2 md:min-h-[560px]" : ""
    }`}
    data-testid={`gallery-page-photo-${index}`}
    aria-label={`Deschide fotografia: ${item.alt}`}
  >
    <img
      src={item.image}
      alt={item.alt}
      width="1280"
      height="853"
      loading={index < 2 ? "eager" : "lazy"}
      decoding="async"
      className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
    />
    <span className="absolute inset-0 bg-gradient-to-t from-[#050308]/88 via-[#050308]/10 to-transparent" />
    <span className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/35 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80 backdrop-blur">
      {item.category || "FIREARTRO"}
    </span>
    <span className="absolute bottom-5 left-5 right-5 text-sm font-medium leading-relaxed text-white/78">
      {item.alt}
    </span>
  </button>
);

const VideoCard = ({ item, index, onPlay }) => {
  const youtubeId = getYouTubeId(item.youtubeUrl);
  const thumb = youtubeId ? getYouTubeThumb(youtubeId) : item.poster;

  return (
    <article
      className="group overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.035] transition duration-500 hover:-translate-y-1 hover:border-white/20"
      data-testid={`gallery-page-video-${index}`}
    >
      <button
        type="button"
        onClick={() => onPlay(item)}
        className="relative block aspect-video w-full overflow-hidden text-left outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        aria-label={`Redă video: ${item.title}`}
      >
        <img
          src={thumb}
          alt={`Thumbnail video ${item.title}`}
          width="1280"
          height="720"
          loading={index === 0 ? "eager" : "lazy"}
          decoding="async"
          className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
        />
        <span className="absolute inset-0 bg-gradient-to-t from-[#050308]/82 via-[#050308]/16 to-transparent" />
        <span className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/35 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80 backdrop-blur">
          {item.category}
        </span>
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-white/12 text-white backdrop-blur-xl transition duration-300 group-hover:scale-105 group-hover:bg-white/18">
            <Play className="ml-1 h-7 w-7 fill-current" />
          </span>
        </span>
      </button>
      <div className="p-5 sm:p-6">
        <h3 className="font-display text-xl font-semibold text-white">{item.title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-white/58">{item.desc}</p>
      </div>
    </article>
  );
};

export default function GalleryPage() {
  const [activePhoto, setActivePhoto] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);
  const videoEmbed = useMemo(() => {
    const id = getYouTubeId(activeVideo?.youtubeUrl);
    return id ? getEmbedUrl(id) : "";
  }, [activeVideo]);

  useEffect(() => {
    document.title = "Galerie foto și video — FIREARTRO";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        "content",
        "Galerie FIREARTRO cu fotografii și videoclipuri din spectacole cu drone, artificii profesionale și efecte speciale pentru evenimente premium."
      );
    }
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  return (
    <main className="min-h-screen overflow-x-clip bg-[#050308] text-white">
      <ScrollProgress />
      <Navbar />

      <section id="acasa" className="relative overflow-hidden pt-28 sm:pt-32 md:pt-40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(131,56,236,0.22),transparent_44%),radial-gradient(circle_at_80%_30%,rgba(58,134,255,0.16),transparent_34%)]" />
        <div className="relative mx-auto max-w-7xl px-5 pb-16 sm:px-6 md:px-12 md:pb-24">
          <div className="max-w-3xl">
            <span className="cine-kicker inline-flex items-center gap-3 text-xs font-semibold text-[#9D7BFF]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#9D7BFF]" />
              Galerie FIREARTRO
            </span>
            <h1 className="font-display mt-5 text-[clamp(2.45rem,7vw,6.8rem)] font-bold leading-[0.95] tracking-[-0.055em]">
              Poze și video-uri din spectacole reale.
            </h1>
            <p className="lead mt-6 max-w-2xl text-white/64">
              Vezi atmosfera, cadrele și momentele care transformă un eveniment într-un spectacol memorabil.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#poze" className="btn-grad shine inline-flex min-h-12 items-center justify-center rounded-full px-6 text-sm font-semibold text-white">
                Vezi pozele <Camera className="ml-2 h-4 w-4" />
              </a>
              <a href="#video" className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/12 bg-white/[0.045] px-6 text-sm font-semibold text-white transition hover:bg-white/10">
                Vezi video-urile <Film className="ml-2 h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="poze" className="relative mx-auto max-w-7xl px-5 py-16 sm:px-6 md:px-12 md:py-24">
        <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="cine-kicker text-xs font-semibold text-[#9D7BFF]">Poze</span>
            <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-white sm:text-5xl">
              Cadre din spectacol.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-white/56">
            O selecție de cadre pentru artificii, drone show, cold sparks și evenimente publice.
          </p>
        </div>
        <div className="grid auto-rows-[260px] gap-4 md:grid-cols-4">
          {GALLERY.map((item, index) => (
            <PhotoTile key={`${item.image}-${index}`} item={item} index={index} onOpen={setActivePhoto} />
          ))}
        </div>
      </section>

      <section id="video" className="relative mx-auto max-w-7xl px-5 pb-20 pt-6 sm:px-6 md:px-12 md:pb-28">
        <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="cine-kicker text-xs font-semibold text-[#5AA9FF]">Video</span>
            <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-white sm:text-5xl">
              Video-uri redate direct pe site.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-white/56">
            Clipurile YouTube se încarcă doar când alegi să le redai, pentru o pagină mai rapidă.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {GALLERY_VIDEOS.map((item, index) => (
            <VideoCard key={`${item.title}-${index}`} item={item} index={index} onPlay={setActiveVideo} />
          ))}
        </div>

        <div className="mt-12 rounded-[28px] border border-white/10 bg-white/[0.035] p-6 sm:p-8 md:flex md:items-center md:justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold text-white">Vrei un moment similar?</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/58">
              Trimite data, locația și tipul evenimentului. Îți spunem ce format se potrivește și cum poate arăta spectacolul.
            </p>
          </div>
          <a href="/#contact" className="btn-grad shine mt-6 inline-flex min-h-12 items-center justify-center rounded-full px-6 text-sm font-semibold text-white md:mt-0">
            Solicită ofertă <ArrowRight className="ml-2 h-4 w-4" />
          </a>
        </div>
      </section>

      <Footer />

      <Dialog open={!!activePhoto} onOpenChange={(open) => !open && setActivePhoto(null)}>
        <DialogContent className="max-w-5xl border-white/10 bg-[#0A0712] p-2 sm:p-3">
          {activePhoto && (
            <>
              <DialogTitle className="sr-only">{activePhoto.alt}</DialogTitle>
              <img
                src={activePhoto.image}
                alt={activePhoto.alt}
                width="1280"
                height="853"
                className="max-h-[82vh] w-full rounded-2xl object-contain"
              />
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!activeVideo} onOpenChange={(open) => !open && setActiveVideo(null)}>
        <DialogContent className="max-w-5xl border-white/10 bg-[#0A0712] p-2 sm:p-3">
          {activeVideo && (
            <>
              <DialogTitle className="sr-only">{activeVideo.title}</DialogTitle>
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black">
                {videoEmbed ? (
                  <iframe
                    src={videoEmbed}
                    title={activeVideo.title}
                    className="absolute inset-0 h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={activeVideo.localSrc}
                    poster={activeVideo.poster}
                    className="absolute inset-0 h-full w-full object-cover"
                    controls
                    autoPlay
                    playsInline
                  />
                )}
              </div>
              <button
                type="button"
                onClick={() => setActiveVideo(null)}
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur transition hover:bg-black/75"
                aria-label="Închide video"
              >
                <X className="h-4 w-4" />
              </button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
