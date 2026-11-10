
const router = require("express").Router();

const controller = require("../controllers/orderController");
const authMiddleware = require("../middlewares/authMiddleware");

// Todas as rotas de pedidos exigem autenticação.
router.use(authMiddleware);

// Criar pedido
router.post("/", controller.create);

// Listar meus pedidos
router.get("/", controller.list);

// Buscar um pedido específico
router.get("/:id", controller.getById);

module.exports = router;
