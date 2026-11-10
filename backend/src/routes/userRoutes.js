
const router = require("express").Router();

const controller = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

// Cadastro público
router.post("/", controller.create);

// Operações protegidas
router.get("/:id", authMiddleware, controller.getById);
router.put("/:id", authMiddleware, controller.update);
router.delete("/:id", authMiddleware, controller.remove);

module.exports = router;
