
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../contexts/useCart.js";
import { useAuth } from "../../contexts/useAuth.js";
import { criarPedido } from "../../services/orderService.js";
import { enderecoImagem } from "../../services/productPresentation";
import "./Cart.css";

function formatarPreco(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

export default function Cart() {
  const {
    itens,
    removerProduto,
    alterarQuantidade,
    limparCarrinho,
    quantidadeTotal,
    subtotal
  } = useCart();

  const { autenticado, token } = useAuth();

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [pedidoCriado, setPedidoCriado] = useState(null);

  const enviando = useRef(false);

  async function finalizarPedido() {
    if (enviando.current || itens.length === 0) {
      return;
    }

    setErro("");

    if (!autenticado || !token) {
      setErro("Faça login para finalizar seu pedido.");
      return;
    }

    const ids = itens.map((item) => item.id);

    if (new Set(ids).size !== ids.length) {
      setErro(
        "O pedido contém o mesmo produto em variações diferentes. " +
        "Nesta versão, finalize cada variação em um pedido separado."
      );
      return;
    }

    enviando.current = true;
    setCarregando(true);

    try {
      const resultado = await criarPedido(token, itens);

      // Só limpa após a confirmação do backend.
      limparCarrinho();

      setPedidoCriado(resultado);
    } catch (error) {
      setErro(error.message);
    } finally {
      enviando.current = false;
      setCarregando(false);
    }
  }

  if (pedidoCriado) {
    return (
      <main className="cart-page">
        <section className="cart-empty" role="status">
          <h1>Pedido registrado com sucesso!</h1>

          <p>
            Número do pedido: <strong>#{pedidoCriado.id}</strong>
          </p>

          <p>
            Status: <strong>{pedidoCriado.status}</strong>
          </p>

          <p>
            Total:{" "}
            <strong>
              {formatarPreco(pedidoCriado.total)}
            </strong>
          </p>

          <p>
            Este é um pedido de teste. Nenhum pagamento
            foi realizado.
          </p>

          <Link to="/">Voltar à loja</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="cart-page">
      <h1>Meu carrinho</h1>

      {itens.length === 0 ? (
        <div className="cart-empty">
          <p>Seu carrinho está vazio.</p>
          <Link to="/">Continuar comprando</Link>
        </div>
      ) : (
        <div className="cart-layout">
          <section className="cart-items">
            {itens.map((item) => (
              <article
                className="cart-item"
                key={item.chave}
              >
                <div className="cart-item-image">
                  {item.imagem ? (
                    <img
                      src={enderecoImagem({ path: item.imagem })}
                      alt={item.nome}
                    />
                  ) : (
                    <span>Sem imagem</span>
                  )}
                </div>

                <div className="cart-item-info">
                  <Link to={`/produto/${item.id}`}>
                    <h2>{item.nome}</h2>
                  </Link>

                  {item.tamanho && (
                    <p>Numeração: {item.tamanho}</p>
                  )}
                  {Object.entries(item.opcoes ?? {}).filter(([titulo]) =>
                    !/^(tamanho|numera)/i.test(titulo)).map(([titulo, valor]) => (
                    <p key={titulo}>{titulo}: {valor}</p>
                  ))}

                  <strong>
                    {formatarPreco(item.preco)}
                  </strong>

                  <div className="cart-quantity">
                    <button
                      type="button"
                      disabled={carregando}
                      aria-label={`Diminuir quantidade de ${item.nome}`}
                      onClick={() =>
                        alterarQuantidade(
                          item.chave,
                          item.quantidade - 1
                        )
                      }
                    >
                      −
                    </button>

                    <span>{item.quantidade}</span>

                    <button
                      type="button"
                      disabled={
                        carregando ||
                        item.quantidade >= item.estoque
                      }
                      aria-label={`Aumentar quantidade de ${item.nome}`}
                      onClick={() =>
                        alterarQuantidade(
                          item.chave,
                          item.quantidade + 1
                        )
                      }
                    >
                      +
                    </button>
                  </div>

                  <button
                    className="cart-remove"
                    type="button"
                    disabled={carregando}
                    onClick={() => removerProduto(item.chave)}
                  >
                    Remover
                  </button>
                </div>
              </article>
            ))}
          </section>

          <aside className="cart-summary">
            <h2>Resumo do pedido</h2>

            <p>Quantidade de itens: {quantidadeTotal}</p>

            <div className="cart-total">
              <span>Subtotal estimado</span>
              <strong>{formatarPreco(subtotal)}</strong>
            </div>

            <p className="cart-note">
              O valor definitivo será calculado pelo
              servidor. Frete e pagamento ainda não
              estão disponíveis.
            </p>

            {erro && (
              <p className="cart-error" role="alert">
                {erro}
              </p>
            )}

            {autenticado ? (
              <button
                type="button"
                onClick={finalizarPedido}
                disabled={carregando}
              >
                {carregando
                  ? "Registrando pedido..."
                  : "Finalizar pedido de teste"}
              </button>
            ) : (
              <Link to="/login">
                Entre na sua conta para finalizar
              </Link>
            )}

            <Link to="/">Continuar comprando</Link>
          </aside>
        </div>
      )}
    </main>
  );
}
