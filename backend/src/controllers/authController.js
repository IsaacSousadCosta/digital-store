
const authService = require("../services/authService");

async function login(req, res) {
  const { email, password } = req.body || {};

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email.trim() ||
    !password
  ) {
    return res.status(400).json({
      error: "Informe e-mail e senha."
    });
  }

  try {
    const result = await authService.login(email, password);
    return res.status(200).json(result);
  } catch (error) {
    if (error.status === 401) {
      return res.status(401).json({
        error: "E-mail ou senha inválidos."
      });
    }

    console.error(error.message);

    return res.status(500).json({
      error: "Erro interno ao realizar login."
    });
  }
}

module.exports = { login };
