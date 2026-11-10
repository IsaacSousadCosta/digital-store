import Gallery from "../store/Gallery";
import "./HeroBanner.css";

const images = Array.from({ length: 8 }, (_, index) => ({
  src: `/home-slide-${index + 1}.jpeg`,
  alt: `Calçado em destaque ${index + 1}`
}));

export default function HeroBanner() {
  return (
    <section className="hero-banner" aria-label="Destaques da loja">
      <div className="hero-content">
        <div className="hero-text">
          <span className="hero-label">Melhores ofertas</span>
          <h1>Queima de estoque Nike</h1>
          <p>Confira nossos produtos em destaque e encontre seu próximo tênis.</p>
          <a href="#produtos" className="hero-button">Ver ofertas</a>
        </div>
        <Gallery images={images} width={1440} height={681} className="hero-gallery" />
      </div>
    </section>
  );
}
