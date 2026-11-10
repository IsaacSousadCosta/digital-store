
const { User } = require("../models");

async function adminMiddleware(req, res, next) {
  try {
    // O authMiddleware deve executar antes deste middleware
    if (!req.user?.id) {
      return res.status(401).json({
        error: "Autenticação necessária."
      });
    }

    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "role"]
    });

    if (!user) {
      return res.status(401).json({
        error: "Usuário não encontrado."
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        error: "Acesso permitido somente para administradores."
      });
    }

    return next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Erro ao verificar permissões."
    });
  }
}

module.exports = adminMiddleware;
