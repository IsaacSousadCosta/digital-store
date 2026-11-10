
import { useEffect, useState } from "react";
import { CartContext } from "./CartContext.js";
import { enderecoImagem, precosDoProduto } from "../services/productPresentation";
import { buscarProdutoPorId } from "../services/productService";

const STORAGE_KEY = "digital-store-cart";

function carregarCarrinho() {
  try {
    const salvo = localStorage.getItem(STORAGE_KEY);

    if (!salvo) return [];

    const dados = JSON.parse(salvo);

    return Array.isArray(dados) ? dados : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [itens, setItens] = useState(carregarCarrinho);

  useEffect(() => {
    const ids = [...new Set(carregarCarrinho()
      .filter(item => item.preco === 0 && !item.opcoes)
      .map(item => item.id))];
    if (!ids.length) return;

    let ativo = true;
    Promise.allSettled(ids.map(buscarProdutoPorId)).then(resultados => {
      if (!ativo) return;
      const precos = new Map(resultados.flatMap(resultado =>
        resultado.status === "fulfilled"
          ? [[resultado.value.id, precosDoProduto(resultado.value).atual]]
          : []
      ));
      if (precos.size) {
        setItens(atuais => atuais.map(item => item.preco === 0 && !item.opcoes && precos.has(item.id)
          ? { ...item, preco: precos.get(item.id), opcoes: {} }
          : item));
      }
    });
    return () => { ativo = false; };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(itens)
      );
    } catch {
      // Continua funcionando durante esta sessão.
    }
  }, [itens]);

  function adicionarProduto(produto, tamanho, quantidade = 1, opcoes = {}) {
    if (
      !produto ||
      !Number.isSafeInteger(produto.id) ||
      !Number.isSafeInteger(produto.stock) ||
      produto.stock <= 0 ||
      !Number.isSafeInteger(quantidade) ||
      quantidade <= 0
    ) {
      return false;
    }

    const tamanhoSelecionado = String(tamanho ?? "");
    const temOutrasOpcoes = Object.entries(opcoes).some(([titulo]) => !/^(tamanho|numera)/i.test(titulo));
    const chave = `${produto.id}-${tamanhoSelecionado}` +
      (temOutrasOpcoes ? JSON.stringify(Object.entries(opcoes).sort()) : "");
    const preco = precosDoProduto(produto).atual;

    const existente = itens.find(
      (item) => item.chave === chave
    );

    const quantidadeAtual = itens.filter(item => item.id === produto.id)
      .reduce((total, item) => total + item.quantidade, 0);

    if (quantidadeAtual + quantidade > produto.stock) {
      return false;
    }

    let novosItens;

    if (existente) {
      novosItens = itens.map((item) =>
        item.chave === chave
          ? {
              ...item,
              preco,
              opcoes,
              quantidade: item.quantidade + quantidade
            }
          : item
      );
    } else {
      novosItens = [
        ...itens,
        {
          chave,
          id: produto.id,
          nome: produto.name,
          preco,
          imagem: enderecoImagem(produto.images?.find(imagem => imagem.enabled)),
          tamanho: tamanhoSelecionado,
          opcoes,
          quantidade,
          estoque: produto.stock
        }
      ];
    }

    setItens(novosItens);
    return true;
  }

  function limparCarrinho() {
    setItens([]);
  }

  function removerProduto(chave) {
    setItens(
      itens.filter((item) => item.chave !== chave)
    );
  }

  function alterarQuantidade(chave, quantidade) {
    if (!Number.isSafeInteger(quantidade)) {
      return;
    }

    if (quantidade <= 0) {
      removerProduto(chave);
      return;
    }

    setItens(
      itens.map((item) =>
        item.chave === chave
          ? {
              ...item,
              quantidade: Math.min(
                quantidade,
                item.estoque
              )
            }
          : item
      )
    );
  }

  const quantidadeTotal = itens.reduce(
    (total, item) => total + item.quantidade,
    0
  );

  const subtotal = itens.reduce(
    (total, item) => total + item.preco * item.quantidade,
    0
  );

  return (
    <CartContext.Provider
  value={{
    itens,
    adicionarProduto,
    removerProduto,
    limparCarrinho,
    alterarQuantidade,
    quantidadeTotal,
    subtotal
  }}>
      {children}
    </CartContext.Provider>
  );
}
