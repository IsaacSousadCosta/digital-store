
const orderService = require("../services/orderService");

function tratarErro(error, res) {
  if (error.status && error.status >= 400 && error.status < 500) {
    return res.status(error.status).json({
      error: error.message
    });
  }

  console.error("Erro na API de pedidos:", error);

  return res.status(500).json({
    error: "Erro interno ao processar o pedido."
  });
}

async function create(req, res) {
  try {
    const pedido = await orderService.criarPedido(
      req.user.id,
      req.body?.items
    );

    return res.status(201).json(pedido);
  } catch (error) {
    return tratarErro(error, res);
  }
}

async function list(req, res) {
  try {
    const pedidos = await orderService.listarPedidos(
      req.user.id
    );

    return res.status(200).json({
      data: pedidos
    });
  } catch (error) {
    return tratarErro(error, res);
  }
}

async function getById(req, res) {
  try {
    const pedido = await orderService.buscarPedido(
      req.user.id,
      Number(req.params.id)
    );

    return res.status(200).json(pedido);
  } catch (error) {
    return tratarErro(error, res);
  }
}

module.exports = {
  create,
  list,
  getById
};
