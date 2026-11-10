
const sequelize = require("../config/database");
const { Order, OrderItem, Product, User } = require("../models");

function erroHttp(status, mensagem) {
  const error = new Error(mensagem);
  error.status = status;
  return error;
}

function emCentavos(valor) {
  const numero = Number(valor);

  if (!Number.isFinite(numero) || numero < 0) {
    throw erroHttp(422, "Preço inválido no cadastro do produto.");
  }

  const centavos = Math.round(numero * 100);

  if (!Number.isSafeInteger(centavos)) {
    throw erroHttp(422, "Preço fora do limite permitido.");
  }

  return centavos;
}

function emReais(centavos) {
  return (centavos / 100).toFixed(2);
}

function validarItens(items) {
  if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
    throw erroHttp(400, "Informe entre 1 e 50 itens.");
  }

  const ids = new Set();

  for (const item of items) {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw erroHttp(400, "Item inválido.");
    }

    if (
      !Number.isSafeInteger(item.product_id) ||
      item.product_id <= 0
    ) {
      throw erroHttp(400, "Identificação do produto inválida.");
    }

    if (
      !Number.isSafeInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > 100
    ) {
      throw erroHttp(400, "Quantidade deve estar entre 1 e 100.");
    }

    if (ids.has(item.product_id)) {
      throw erroHttp(400, "Produto duplicado no pedido.");
    }

    ids.add(item.product_id);

    const opcoes = item.selected_options;

    if (
      opcoes !== undefined &&
      opcoes !== null &&
      (
        typeof opcoes !== "object" ||
        Array.isArray(opcoes) ||
        JSON.stringify(opcoes).length > 2000
      )
    ) {
      throw erroHttp(400, "Opções selecionadas inválidas.");
    }
  }
}

async function criarPedido(userId, items) {
  validarItens(items);

  // Converte o ID recebido do JWT para número.
  const userIdNumerico = Number(userId);

  if (
    !Number.isSafeInteger(userIdNumerico) ||
    userIdNumerico <= 0
  ) {
    throw erroHttp(401, "Usuário não autenticado.");
  }

  return sequelize.transaction(async (transaction) => {
    const usuario = await User.findByPk(userIdNumerico, {
      transaction
    });

    if (!usuario) {
      throw erroHttp(401, "Usuário não encontrado.");
    }

    // Mantém uma ordem fixa de bloqueio dos produtos.
    const itensOrdenados = [...items].sort(
      (a, b) => a.product_id - b.product_id
    );

    let totalCentavos = 0;
    const itensPreparados = [];

    for (const item of itensOrdenados) {
      // Bloqueia a linha do produto durante a transação.
      const produto = await Product.findByPk(item.product_id, {
        transaction,
        lock: transaction.LOCK.UPDATE
      });

      if (!produto || !produto.enabled) {
        throw erroHttp(404, "Produto indisponível.");
      }

      if (produto.stock < item.quantity) {
        throw erroHttp(
          409,
          `Estoque insuficiente para ${produto.name}.`
        );
      }

      // Os preços são obtidos do banco, não do navegador.
      const precoOriginal = emCentavos(produto.price);
      const precoPromocional = emCentavos(
        produto.price_with_discount
      );

      const precoUnitario =
        precoPromocional > 0 &&
        precoPromocional < precoOriginal
          ? precoPromocional
          : precoOriginal;

      const subtotalCentavos = precoUnitario * item.quantity;

      if (!Number.isSafeInteger(subtotalCentavos)) {
        throw erroHttp(
          422,
          "Subtotal fora do limite permitido."
        );
      }

      totalCentavos += subtotalCentavos;

      if (
        !Number.isSafeInteger(totalCentavos) ||
        totalCentavos > 9999999999
      ) {
        throw erroHttp(
          422,
          "Valor total excede o limite."
        );
      }

      itensPreparados.push({
        product_id: produto.id,
        product_name: produto.name,
        quantity: item.quantity,
        unit_price: emReais(precoUnitario),
        subtotal: emReais(subtotalCentavos),
        selected_options: item.selected_options ?? null
      });

      // Reserva o estoque do produto.
      await produto.decrement("stock", {
        by: item.quantity,
        transaction
      });
    }

    // Cria o pedido associado ao usuário autenticado.
    const pedido = await Order.create(
      {
        user_id: userIdNumerico,
        status: "pending",
        total: emReais(totalCentavos)
      },
      { transaction }
    );

    // Registra todos os itens do pedido.
    const itensCriados = await OrderItem.bulkCreate(
      itensPreparados.map((item) => ({
        ...item,
        order_id: pedido.id
      })),
      { transaction }
    );

    return {
      ...pedido.toJSON(),
      items: itensCriados.map((item) => item.toJSON())
    };
  });
}

async function listarPedidos(userId) {
  return Order.findAll({
    where: {
      user_id: userId
    },
    attributes: [
      "id",
      "status",
      "total",
      "created_at",
      "updated_at"
    ],
    include: [
      {
        model: OrderItem,
        as: "items"
      }
    ],
    order: [["created_at", "DESC"]]
  });
}

async function buscarPedido(userId, orderId) {
  if (
    !Number.isSafeInteger(orderId) ||
    orderId <= 0
  ) {
    throw erroHttp(
      400,
      "Identificação do pedido inválida."
    );
  }

  const pedido = await Order.findOne({
    where: {
      id: orderId,
      user_id: userId
    },
    include: [
      {
        model: OrderItem,
        as: "items"
      }
    ]
  });

  if (!pedido) {
    throw erroHttp(404, "Pedido não encontrado.");
  }

  return pedido;
}

module.exports = {
  criarPedido,
  listarPedidos,
  buscarPedido
};
