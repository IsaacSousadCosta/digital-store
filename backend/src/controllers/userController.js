
const userService = require("../services/userService");

function responderErro(error, res) {
  if (error.name === "SequelizeUniqueConstraintError") {
    return res.status(409).json({
      error: "E-mail já cadastrado."
    });
  }

  if (error.name === "SequelizeForeignKeyConstraintError") {
    return res.status(409).json({
      error: "Não é possível excluir este usuário porque existem registros associados."
    });
  }

  if (error.status) {
    return res.status(error.status).json({
      error: error.message
    });
  }

  console.error(error);

  return res.status(500).json({
    error: "Erro interno do servidor."
  });
}

function validarDados(data, parcial = false) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return "Informe os dados do usuário.";
  }

  const campos = ["firstname", "surname", "email", "password"];

  if (
    Object.keys(data).some((campo) =>
      !campos.includes(campo) && (parcial || campo !== "confirmPassword"))
  ) {
    return "A requisição contém campos não permitidos.";
  }

  if (parcial && Object.keys(data).length === 0) {
    return "Informe pelo menos um campo para atualizar.";
  }

  if (data.confirmPassword !== undefined && data.confirmPassword !== data.password) {
    return "A confirmação da senha deve ser igual à senha.";
  }

  if (!parcial && campos.some((campo) => data[campo] === undefined)) {
    return "Preencha todos os campos obrigatórios.";
  }

  for (const campo of campos) {
    if (data[campo] === undefined) continue;

    if (
      typeof data[campo] !== "string" ||
      !data[campo].trim()
    ) {
      return `Campo inválido: ${campo}.`;
    }
  }

  if (
    data.email !== undefined &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())
  ) {
    return "Informe um e-mail válido.";
  }

  if (
    data.password !== undefined &&
    data.password.length < 8
  ) {
    return "A senha deve ter pelo menos 8 caracteres.";
  }

  if (
    (data.firstname && data.firstname.trim().length > 100) ||
    (data.surname && data.surname.trim().length > 100)
  ) {
    return "Nome e sobrenome devem ter até 100 caracteres.";
  }

  if (data.email && data.email.trim().length > 255) {
    return "O e-mail é muito longo.";
  }

  return null;
}

function validarId(id) {
  return /^[1-9]\d*$/.test(String(id)) &&
    Number.isSafeInteger(Number(id));
}

async function create(req, res) {
  const mensagem = validarDados(req.body);

  if (mensagem) {
    return res.status(400).json({ error: mensagem });
  }

  try {
    const usuario = await userService.createUser(req.body);
    return res.status(201).json(usuario);
  } catch (error) {
    return responderErro(error, res);
  }
}

async function getById(req, res) {
  if (!validarId(req.params.id)) {
    return res.status(400).json({ error: "ID inválido." });
  }

  try {
    const usuario = await userService.getUserById(
      req.params.id,
      req.user.id
    );

    return res.status(200).json(usuario);
  } catch (error) {
    return responderErro(error, res);
  }
}

async function update(req, res) {
  if (!validarId(req.params.id)) {
    return res.status(400).json({ error: "ID inválido." });
  }

  const mensagem = validarDados(req.body, true);

  if (mensagem) {
    return res.status(400).json({ error: mensagem });
  }

  try {
    await userService.updateUser(
      req.params.id,
      req.user.id,
      req.body
    );

    return res.status(204).send();
  } catch (error) {
    return responderErro(error, res);
  }
}

async function remove(req, res) {
  if (!validarId(req.params.id)) {
    return res.status(400).json({ error: "ID inválido." });
  }

  try {
    await userService.deleteUser(
      req.params.id,
      req.user.id
    );

    return res.status(204).send();
  } catch (error) {
    return responderErro(error, res);
  }
}

module.exports = {
  create,
  getById,
  update,
  remove
};
