
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");

async function login(email, password) {
  const user = await User.findOne({
    where: { email: email.trim().toLowerCase() }
  });

  // Mesma mensagem para e-mail ou senha incorretos
  if (!user || !(await bcrypt.compare(password, user.password))) {
    const error = new Error("E-mail ou senha inválidos.");
    error.status = 401;
    throw error;
  }

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET não configurado.");
  }

  const token = jwt.sign(
    { sub: String(user.id) },
    process.env.JWT_SECRET,
    {
      expiresIn: "1h",
      algorithm: "HS256"
    }
  );

  return {
    token,
    user: {
      id: user.id,
      firstname: user.firstname,
      surname: user.surname,
      email: user.email
    }
  };
}

module.exports = { login };
