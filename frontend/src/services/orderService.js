
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export async function criarPedido(token, itens) {
  if (!token) {
    throw new Error("Faça login para finalizar o pedido.");
  }

  const produtos = itens.map((item) => ({
    product_id: item.id,
    quantity: item.quantidade,
    selected_options: {
      ...(item.tamanho ? { size: item.tamanho } : {}),
      ...item.opcoes
    }
  }));

  const response = await fetch(`${API_URL}/v1/order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      items: produtos
    })
  });

  const resultado = await response.json();

  if (!response.ok) {
    throw new Error(
      resultado.error || "Não foi possível criar o pedido."
    );
  }

  return resultado;
}

export async function listarPedidos(token) {
  if (!token) {
    throw new Error("Faça login para consultar seus pedidos.");
  }

  const response = await fetch(`${API_URL}/v1/order`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const resultado = await response.json();

  if (!response.ok) {
    throw new Error(
      resultado.error || "Não foi possível carregar os pedidos."
    );
  }

  return resultado.data;
}
