import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import RecommendedProducts from "../../components/RecommendedProducts/RecommendedProducts";
import Gallery from "../../components/store/Gallery";
import BuyBox from "../../components/store/BuyBox";
import ProductOptions from "../../components/store/ProductOptions";
import { useCart } from "../../contexts/useCart";
import { buscarProdutoPorId } from "../../services/productService";
import { enderecoImagem, precosDoProduto } from "../../services/productPresentation";
import "./ProductDetails.css";

function ProductView({ id }) {
  const { adicionarProduto } = useCart();
  const [resultado, setResultado] = useState(null);
  const [selecoes, setSelecoes] = useState({});
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    let ativo = true;
    buscarProdutoPorId(id)
      .then(produto => { if (ativo) setResultado({ produto }); })
      .catch(error => { if (ativo) setResultado({ erro: error.message }); });
    return () => { ativo = false; };
  }, [id]);

  if (!resultado) return <main className="details-page"><p>Carregando produto...</p></main>;
  if (resultado.erro) {
    return (
      <main className="details-page">
        <p role="alert">{resultado.erro}</p>
        <Link to="/products">Voltar aos produtos</Link>
      </main>
    );
  }

  const { produto } = resultado;
  const { original, promocional } = precosDoProduto(produto);
  const imagens = (produto.images ?? [])
    .filter(imagem => imagem.enabled && enderecoImagem(imagem))
    .map(imagem => ({ src: enderecoImagem(imagem), alt: produto.name }));
  const opcoes = (produto.options ?? []).map(opcao => ({
    ...opcao,
    values: Array.isArray(opcao.values) ? opcao.values.map(String) :
      String(opcao.values ?? "").split(",").map(valor => valor.trim()).filter(Boolean)
  })).filter(opcao => opcao.values.length);

  function comprar() {
    const pendente = opcoes.find(opcao => selecoes[opcao.id] === undefined);
    if (pendente) {
      setMensagem(`Selecione uma opção em ${pendente.title}.`);
      return;
    }
    const selecionadas = Object.fromEntries(opcoes.map(opcao => [opcao.title, selecoes[opcao.id]]));
    const tamanho = selecoes[opcoes.find(opcao => /^tamanho|numera/i.test(opcao.title))?.id] ?? "";
    const adicionado = adicionarProduto(produto, tamanho, 1, selecionadas);
    setMensagem(adicionado
      ? "Produto adicionado ao carrinho!"
      : "Não foi possível adicionar. Verifique o estoque disponível.");
  }

  return (
    <main className="details-page">
      <Link to="/products">← Voltar aos produtos</Link>
      <div className="details-layout">
        <Gallery images={imagens} width={700} height={570} showThumbs />
        <BuyBox name={produto.name} reference={produto.reference ?? produto.slug}
          stars={produto.stars} rating={produto.rating} price={original} priceDiscount={promocional}
          description={produto.description} disabled={produto.stock <= 0} onBuy={comprar}>
          {opcoes.map(opcao => (
            <ProductOptions key={opcao.id} title={opcao.title} options={opcao.values}
              type={opcao.type} shape={opcao.shape} radius={opcao.radius} value={selecoes[opcao.id]}
              onChange={valor => {
                setSelecoes(atuais => ({ ...atuais, [opcao.id]: valor }));
                setMensagem("");
              }} />
          ))}
          <p>Estoque: {produto.stock} unidades</p>
          {mensagem && <p role="status">{mensagem}</p>}
        </BuyBox>
      </div>
      <RecommendedProducts produtoId={produto.id} />
    </main>
  );
}

export default function ProductDetails() {
  const { id } = useParams();
  return <ProductView key={id} id={id} />;
}
