import { MEDIA } from "@/data/content";

export default function HomeAbout() {
  return (
    <section
      id="intro"
      className="fa-about"
      data-home-scene="about"
      data-testid="home-about"
      aria-labelledby="fa-about-title"
    >
      <div className="fa-about__image" aria-hidden="true">
        <img src={MEDIA.fireworksSky} alt="" loading="lazy" decoding="async" />
      </div>
      <div className="fa-about__shade" aria-hidden="true" />

      <div className="nr-shell fa-about__inner">
        <p className="fa-kicker">Despre FireArtRo</p>
        <div className="fa-about__copy">
          <h2 id="fa-about-title">Un moment reușit începe cu o <em>direcție.</em></h2>
          <p>Data, locul și energia evenimentului sunt reperele din care se construiește spectacolul.</p>
        </div>
      </div>
    </section>
  );
}
