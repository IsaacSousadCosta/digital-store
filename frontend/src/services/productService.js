

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export async function buscarProdutos(match = "", limit = 12) {
  const params = new URLSearchParams({ limit });

  if (match) {
    params.set("match", match);
  }

  const query = params.toString();
  const url = `${API_URL}/v1/product/search${query ? `?${query}` : ""}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Não foi possível carregar os produtos.");
  }

  const resultado = await response.json();

  return resultado.data;
}

export async function buscarProdutoPorId(id) {
  const response = await fetch(
    `${API_URL}/v1/product/${id}`
  );

  if (response.status === 404) {
    throw new Error("Produto não encontrado.");
  }

  if (!response.ok) {
    throw new Error("Erro ao carregar os detalhes do produto.");
  }

  return response.json();
}
