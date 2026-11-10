import { useState } from "react";
import arrowLeft from "../../assets/arrow-left.svg";
import arrowRight from "../../assets/arrow-right.svg";

export default function Gallery({ images, width, height, radius = 4, showThumbs = false, className = "" }) {
  const [index, setIndex] = useState(0);
  if (!images.length) return <p className="store-gallery-empty">Imagem indisponível</p>;

  return (
    <section className={`store-gallery ${className}`} aria-label="Galeria de imagens"
      style={{ maxWidth: width, "--gallery-ratio": `${width} / ${height}`, "--gallery-radius": `${radius}px` }}>
      <div className="store-gallery-frame">
        <div className="store-gallery-track" style={{ transform: `translateX(-${index * 100}%)` }}>
          {images.map(({ src, alt }, position) => (
            <img key={`${src}-${position}`} src={src} alt={alt} aria-hidden={position !== index}
              loading={position === 0 ? "eager" : "lazy"} />
          ))}
        </div>
        {images.length > 1 && (
          <>
            <button className="store-gallery-arrow store-gallery-arrow--left" type="button"
              aria-label="Imagem anterior" onClick={() => setIndex(index - 1)} disabled={index === 0}>
              <img src={arrowLeft} alt="" />
            </button>
            <button className="store-gallery-arrow store-gallery-arrow--right" type="button"
              aria-label="Próxima imagem" onClick={() => setIndex(index + 1)} disabled={index === images.length - 1}>
              <img src={arrowRight} alt="" />
            </button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className={showThumbs ? "store-gallery-thumbnails" : "store-gallery-dots"}>
          {images.map(({ src }, position) => (
            <button key={`${src}-${position}`} type="button" aria-label={`Exibir imagem ${position + 1}`}
              aria-pressed={position === index} onClick={() => setIndex(position)}>
              {showThumbs && <img src={src} alt="" loading="lazy" />}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
