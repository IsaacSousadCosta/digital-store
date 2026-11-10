
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/useAuth.js";
import { listarPedidos } from "../../services/orderService.js";
import "./Orders.css";

function formatarPreco(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function formatarData(valor) {
  return new Date(valor).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

function traduzirStatus(status) {
  const statusTraduzidos = {
    pending: "Pendente",
    paid: "Pago",
    cancelled: "Cancelado",
    shipped: "Enviado",
    delivered: "Entregue"
  };

  return statusTraduzidos[status] || status;
}

export default function Orders() {
  const { autenticado, token } = useAuth();

  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!autenticado || !token) {
      return;
    }

    let ativo = true;

    listarPedidos(token)
      .then((dados) => {
        if (ativo) {
          setPedidos(dados);
          setErro("");
        }
      })
      .catch((error) => {
        if (ativo) {
          setErro(error.message);
        }
      })
      .finally(() => {
        if (ativo) {
          setCarregando(false);
        }
      });

    return () => {
      ativo = false;
    };
  }, [autenticado, token]);

  if (!autenticado) {
    return (
      <main className="orders-page">
        <h1>Meus Pedidos</h1>

        <p>Você precisa entrar na sua conta.</p>

        <Link to="/login">Fazer login</Link>
      </main>
    );
  }

  return (
    <main className="orders-page">
      <h1>Meus Pedidos</h1>

      {carregando && <p>Carregando pedidos...</p>}

      {erro && (
        <p className="orders-error" role="alert">
          {erro}
        </p>
      )}

      {!carregando && !erro && pedidos.length === 0 && (
        <div className="orders-empty">
          <p>Você ainda não realizou nenhum pedido.</p>
          <Link to="/">Continuar comprando</Link>
        </div>
      )}

      {!carregando && !erro && pedidos.length > 0 && (
        <div className="orders-list">
          {pedidos.map((pedido) => (
            <article className="order-card" key={pedido.id}>
              <div className="order-header">
                <div>
                  <h2>Pedido #{pedido.id}</h2>
                  <p>
                    Realizado em{" "}
                    {formatarData(pedido.created_at)}
                  </p>
                </div>

                <span className={`order-status status-${pedido.status}`}>
                  {traduzirStatus(pedido.status)}
                </span>
              </div>

              <div className="order-products">
                {pedido.items?.map((item) => (
                  <div
                    className="order-product"
                    key={item.id}
                  >
                    <span>
                      {item.product_name} × {item.quantity}
                    </span>

                    <strong>
                      {formatarPreco(item.subtotal)}
                    </strong>
                  </div>
                ))}
              </div>

              <div className="order-footer">
                <span>Total do pedido</span>

                <strong>
                  {formatarPreco(pedido.total)}
                </strong>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
