import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Expand } from "lucide-react";
import Reveal from "@/components/site/Reveal";
import { GALLERY } from "@/data/content";

export const Gallery = () => {
  const [active, setActive] = useState(null);

  return (
    <section id="galerie" className="relative py-24 md:py-32" data-testid="gallery-section">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <Reveal>
          <div className="max-w-2xl">
            <span className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-[#8338EC]">
              Galerie
            </span>
            <h2 className="font-display font-bold text-white text-4xl sm:text-5xl mt-4 tracking-tight">
              Lumină, culoare, emoție
            </h2>
          </div>
        </Reveal>

        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 auto-rows-[180px] md:auto-rows-[220px] gap-4">
          {GALLERY.map((g, i) => (
            <Reveal
              key={i}
              delay={(i % 4) * 0.06}
              className={g.big ? "col-span-2 row-span-2" : ""}
            >
              <button
                onClick={() => setActive(g)}
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
                <div className="absolute inset-0 bg-[#050308]/20 group-hover:bg-[#8338EC]/20 transition-colors duration-300" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="h-12 w-12 rounded-full glass flex items-center justify-center">
                    <Expand className="h-5 w-5 text-white" />
                  </div>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-4xl bg-[#0A0712] border-white/10 p-2 sm:p-3" data-testid="gallery-lightbox">
          {active && (
            <img
              src={active.image}
              alt={active.alt}
              className="w-full h-auto max-h-[80vh] object-contain rounded-xl"
            />
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Gallery;
