
import "./FeaturedCollections.css";
import Section from "../store/Section";

const colecoes = [
  {
    id: 1,
    titulo: "Novo drop Supreme",
    imagem: "/collection-1.png"
  },
  {
    id: 2,
    titulo: "Coleção Adidas",
    imagem: "/collection-2.png"
  },
  {
    id: 3,
    titulo: "Novo Beats Bass",
    imagem: "/collection-3.png"
  }
];

export default function FeaturedCollections() {
  return (
    <Section className="featured-collections" id="colecoes" title="Coleções em destaque" titleAlign="center">
      <div className="collections-grid">
        {colecoes.map((colecao) => (
          <a
            className="collection-card"
            href="#produtos"
            key={colecao.id}
            aria-label={`Ver produtos: ${colecao.titulo}`}
          >
            <img
              src={colecao.imagem}
              alt={colecao.titulo}
              loading="lazy"
            />
          </a>
        ))}
      </div>
    </Section>
  );
}
