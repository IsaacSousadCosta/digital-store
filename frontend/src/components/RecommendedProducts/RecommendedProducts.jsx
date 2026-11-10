import { useEffect, useState } from "react";
import { buscarProdutos } from "../../services/productService";
import Section from "../store/Section";
import ProductListing from "../store/ProductListing";
import "./RecommendedProducts.css";

export default function RecommendedProducts({ produtoId }) {
  const [recomendados, setRecomendados] = useState([]);

  useEffect(() => {
    let ativo = true;
    buscarProdutos("", 5)
      .then(produtos => {
        if (ativo) setRecomendados(produtos.filter(produto => produto.id !== produtoId).slice(0, 4));
      })
      .catch(() => { if (ativo) setRecomendados([]); });
    return () => { ativo = false; };
  }, [produtoId]);

  if (!recomendados.length) return null;
  return (
    <Section className="recommended-products" title="Produtos recomendados"
      link={{ text: "Ver todos", href: "/products" }}>
      <ProductListing products={recomendados} className="recommended-grid" />
    </Section>
  );
}
