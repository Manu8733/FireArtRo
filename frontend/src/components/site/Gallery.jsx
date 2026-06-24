import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Expand } from "lucide-react";
import { SectionHeader, Stagger, StaggerItem } from "@/components/site/cinematic";
import { GALLERY } from "@/data/content";

const Tile = ({ g, i, onOpen }) => (
  <button
    onClick={() => onOpen(g)}
    data-testid={`gallery-item-${i}`}
    className="group relative w-full h-full rounded-2xl overflow-hidden glass"
    aria-label={`Mărește imaginea: ${g.alt}`}
  >
    <img
      src={g.image}
      alt={g.alt}
      loading="lazy"
      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-[#050308]/70 via-transparent to-transparent" />
    <div className="absolute inset-0 group-hover:bg-[#8338EC]/15 transition-colors duration-300" />
    {g.category && (
      <span className="absolute top-3 left-3 glass-strong text-[10px] font-semibold uppercase tracking-wider text-white px-2.5 py-1 rounded-full">
        {g.category}
      </span>
    )}
    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      <div className="h-11 w-11 rounded-full glass-strong flex items-center justify-center">
        <Expand className="h-5 w-5 text-white" />
      </div>
    </div>
  </button>
);

export const Gallery = () => {
  const [active, setActive] = useState(null);

  return (
    <section id="galerie" className="relative py-20 sm:py-28 md:py-32 overflow-hidden" data-testid="gallery-section">
      <div className="absolute top-1/4 -left-1/4 w-[45vw] h-[45vw] rounded-full bg-[#8338EC]/8 blur-[150px] animate-breathe" />
      <div className="absolute bottom-0 -right-1/4 w-[40vw] h-[40vw] rounded-full bg-[#3A86FF]/8 blur-[150px] animate-breathe" style={{ animationDelay: "3s" }} />
      <div className="relative max-w-7xl mx-auto px-5 sm:px-6 md:px-12">
        <SectionHeader kicker="Galerie" title="Lumină, culoare, emoție" subtitle="Câteva cadre din spectacolele și atmosfera pe care le creăm." />

        {/* Mobile: swipe row */}
        <div className="mt-10 flex md:hidden gap-4 overflow-x-auto snap-x snap-mandatory hide-scrollbar -mx-5 px-5 pb-1">
          {GALLERY.map((g, i) => (
            <div key={i} className="snap-center shrink-0 w-[78%] h-64">
              <Tile g={g} i={i} onOpen={setActive} />
            </div>
          ))}
        </div>

        {/* Desktop: bento grid (revealed as a unit so tiles stay interactive) */}
        <Stagger className="mt-12 hidden md:grid grid-cols-4 auto-rows-[210px] gap-4" gap={0.06}>
          {GALLERY.map((g, i) => (
            <StaggerItem key={i} className={g.big ? "col-span-2 row-span-2" : ""}>
              <Tile g={g} i={i} onOpen={setActive} />
            </StaggerItem>
          ))}
        </Stagger>
      </div>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-4xl bg-[#0A0712] border-white/10 p-2 sm:p-3" data-testid="gallery-lightbox">
          {active && (
            <>
              <DialogTitle className="sr-only">{active.alt}</DialogTitle>
              <img
                src={active.image}
                alt={active.alt}
                className="w-full h-auto max-h-[80vh] object-contain rounded-xl"
              />
              <div className="px-3 pb-2 pt-1 flex items-center gap-2">
                {active.category && (
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9D7BFF]">{active.category}</span>
                )}
                <span className="text-sm text-white/60">{active.alt}</span>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Gallery;
