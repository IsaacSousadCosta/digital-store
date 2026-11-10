import { Link } from "react-router-dom";
import { enderecoImagem, formatarPreco, precosDoProduto } from "../../services/productPresentation";
import "./ProductCard.css";

export default function ProductCard({ produto }) {
  const imagem = enderecoImagem(produto.images?.find(item => item.enabled));
  const { original, promocional, atual } = precosDoProduto(produto);
  const desconto = promocional === null ? 0 : Math.round((1 - promocional / original) * 100);
  const link = `/product/${produto.id}`;

  return (
    <article className="product-card">
      <div className="product-card-image">
        {desconto > 0 && <span className="product-discount">{desconto}% OFF</span>}
        <Link to={link} className="product-image-link" aria-label={`Ver detalhes de ${produto.name}`}>
          {imagem ? <img src={imagem} alt={produto.name} loading="lazy" /> :
            <div className="product-no-image">Imagem indisponível</div>}
        </Link>
      </div>
      <div className="product-card-info">
        <p className="product-category">{produto.categories?.[0]?.name || "Produto"}</p>
        <h3><Link to={link} className="product-name-link">{produto.name}</Link></h3>
        <div className="product-prices">
          {promocional !== null && <del className="product-old-price">{formatarPreco(original)}</del>}
          <strong>{formatarPreco(atual)}</strong>
        </div>
        <p className="product-stock">{produto.stock > 0
          ? `${produto.stock} unidades disponíveis` : "Produto esgotado"}</p>
      </div>
    </article>
  );
}
