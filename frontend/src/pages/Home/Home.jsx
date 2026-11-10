import { useEffect, useState } from "react";
import FeaturedCollections from "../../components/FeaturedCollections/FeaturedCollections";
import HeroBanner from "../../components/HeroBanner/HeroBanner";
import Section from "../../components/store/Section";
import ProductListing from "../../components/store/ProductListing";
import { buscarProdutos } from "../../services/productService";

export default function Home() {
  const [resultado, setResultado] = useState(null);

  useEffect(() => {
    let ativo = true;
    buscarProdutos("", 8)
      .then(produtos => { if (ativo) setResultado({ produtos }); })
      .catch(error => { if (ativo) setResultado({ erro: error.message }); });
    return () => { ativo = false; };
  }, []);

  return (
    <main>
      <HeroBanner />
      <FeaturedCollections />
      <Section className="loja" id="produtos" title="Produtos em alta"
        link={{ text: "Ver todos", href: "/products" }}>
        {!resultado && <p>Carregando produtos...</p>}
        {resultado?.erro && <p role="alert">{resultado.erro}</p>}
        {resultado?.produtos?.length === 0 && <p>Nenhum produto encontrado.</p>}
        {resultado?.produtos?.length > 0 &&
          <ProductListing products={resultado.produtos} className="produtos" />}
      </Section>
    </main>
  );
}
