
const router = require("express").Router();

const controller = require("../controllers/categoryController");

const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");

// Consultas públicas
router.get("/search", controller.search);
router.get("/:id", controller.getById);

// Apenas administradores podem modificar categorias
router.post("/", authMiddleware, adminMiddleware, controller.create);
router.put("/:id", authMiddleware, adminMiddleware, controller.update);
router.delete("/:id", authMiddleware, adminMiddleware, controller.remove);

module.exports = router;
