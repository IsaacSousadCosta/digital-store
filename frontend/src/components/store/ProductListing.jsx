import ProductCard from "../ProductCard/ProductCard";

export default function ProductListing({ products, className = "products-grid" }) {
  return (
    <div className={className}>
      {products.map(produto => <ProductCard key={produto.id} produto={produto} />)}
    </div>
  );
}
