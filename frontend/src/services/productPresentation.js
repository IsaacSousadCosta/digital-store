const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export function precosDoProduto(produto) {
  const original = Number(produto.price);
  const desconto = Number(produto.price_with_discount);
  const promocional = desconto > 0 && desconto < original ? desconto : null;
  return { original, promocional, atual: promocional ?? original };
}

export function formatarPreco(valor) {
  return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function enderecoImagem(imagem) {
  const endereco = imagem?.content ?? imagem?.path;
  if (!endereco) return "";
  return /^https?:\/\//i.test(endereco) ? endereco : `${API_URL}${endereco}`;
}
