import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import FilterGroup from "../../components/store/FilterGroup";
import ProductListing from "../../components/store/ProductListing";
import Section from "../../components/store/Section";
import { buscarProdutos } from "../../services/productService";
import { precosDoProduto } from "../../services/productPresentation";
import "./Products.css";

function ProductResults({ busca }) {
  const [resultado, setResultado] = useState(null);
  const [ordenacao, setOrdenacao] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [somenteEstoque, setSomenteEstoque] = useState(false);

  useEffect(() => {
    let ativo = true;
    buscarProdutos(busca, -1)
      .then(produtos => { if (ativo) setResultado({ produtos }); })
      .catch(error => { if (ativo) setResultado({ erro: error.message }); });
    return () => { ativo = false; };
  }, [busca]);

  const produtos = resultado?.produtos ?? [];
  const categoriasDisponiveis = [...new Set(produtos.flatMap(
    produto => (produto.categories ?? []).map(categoria => categoria.name)
  ))].sort((a, b) => a.localeCompare(b, "pt-BR"));
  const filtrados = produtos.filter(produto =>
    (!somenteEstoque || produto.stock > 0) &&
    (!categorias.length || produto.categories?.some(categoria => categorias.includes(categoria.name)))
  );
  if (ordenacao) {
    const direcao = ordenacao === "menor" ? 1 : -1;
    filtrados.sort((a, b) => direcao * (precosDoProduto(a).atual - precosDoProduto(b).atual));
  }

  return (
    <main className="products-page">
      <div className="products-heading">
        <h1>{busca ? `Resultados para "${busca}"` : "Todos os produtos"}</h1>
        <Link to="/">Voltar à loja</Link>
      </div>
      <div className="products-layout">
        <aside className="products-sidebar">
          <label className="products-order">
            Ordenar por
            <select value={ordenacao} onChange={event => setOrdenacao(event.target.value)}>
              <option value="">Mais relevantes</option>
              <option value="menor">Menor preço</option>
              <option value="maior">Maior preço</option>
            </select>
          </label>
          <div className="products-filters">
            <h2>Filtrar por</h2>
            <hr />
            <FilterGroup title="Categoria" options={categoriasDisponiveis.map(nome => ({
              text: nome, value: nome, checked: categorias.includes(nome)
            }))} onChange={(nome, checked) =>
              setCategorias(atuais => checked ? [...atuais, nome] : atuais.filter(item => item !== nome))} />
            <FilterGroup title="Disponibilidade"
              options={[{ text: "Em estoque", value: "estoque", checked: somenteEstoque }]}
              onChange={(_, checked) => setSomenteEstoque(checked)} />
          </div>
        </aside>
        <Section className="products-results" title={resultado?.produtos
          ? `${filtrados.length} produtos encontrados`
          : "Resultados"}>
          {!resultado && <p>Carregando produtos...</p>}
          {resultado?.erro && <p role="alert" className="products-error">{resultado.erro}</p>}
          {resultado?.produtos && !filtrados.length && <p>Nenhum produto encontrado.</p>}
          {filtrados.length > 0 && <ProductListing products={filtrados} />}
        </Section>
      </div>
    </main>
  );
}

export default function Products() {
  const [searchParams] = useSearchParams();
  const busca = searchParams.get("filter") ?? searchParams.get("name") ?? "";
  return <ProductResults key={busca} busca={busca} />;
}
