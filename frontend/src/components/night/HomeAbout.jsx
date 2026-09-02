export default function HomeAbout() {
  return (
    <section
      id="intro"
      className="fa-about"
      data-home-scene="about"
      data-testid="home-about"
      aria-labelledby="fa-about-title"
    >
      <div className="fa-about__image" aria-hidden="true" />
      <div className="fa-about__shade" aria-hidden="true" />

      <div className="nr-shell fa-about__inner">
        <p className="fa-kicker">Despre FireArtRo</p>
        <div className="fa-about__copy">
          <h2 id="fa-about-title">Suntem echipa din spatele <em>spectacolului.</em></h2>
          <p>
            FireArtRo planifică și produce în România show-uri cu drone, artificii profesionale și efecte scenice.
            Coordonăm conceptul, partea tehnică, logistica și execuția pentru fiecare eveniment.
          </p>
        </div>
      </div>
    </section>
  );
}
