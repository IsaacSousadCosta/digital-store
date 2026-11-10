
const bcrypt = require("bcryptjs");
const { User } = require("../models");

function dadosPublicos(user) {
  return {
    id: user.id,
    firstname: user.firstname,
    surname: user.surname,
    email: user.email
  };
}

function erro(mensagem, status) {
  const error = new Error(mensagem);
  error.status = status;
  return error;
}

async function createUser(data) {
  const email = data.email.trim().toLowerCase();

  const existingUser = await User.findOne({
    where: { email }
  });

  if (existingUser) {
    throw erro("E-mail já cadastrado.", 409);
  }

  const hashedPassword = await bcrypt.hash(data.password, 12);

  const user = await User.create({
    firstname: data.firstname.trim(),
    surname: data.surname.trim(),
    email,
    password: hashedPassword
  });

  return dadosPublicos(user);
}

async function findUserByEmail(email) {
  return User.findOne({
    where: { email: email.trim().toLowerCase() }
  });
}

async function verificarAcesso(id, usuarioLogadoId) {
  const usuarioLogado = await User.findByPk(usuarioLogadoId);

  if (!usuarioLogado) {
    throw erro("Usuário autenticado não encontrado.", 401);
  }

  if (
    Number(usuarioLogado.id) !== Number(id) &&
    usuarioLogado.role !== "admin"
  ) {
    throw erro("Você não tem permissão para acessar esta conta.", 403);
  }

  const usuario = await User.findByPk(id);

  if (!usuario) {
    throw erro("Usuário não encontrado.", 404);
  }

  return usuario;
}

async function getUserById(id, usuarioLogadoId) {
  const usuario = await verificarAcesso(id, usuarioLogadoId);
  return dadosPublicos(usuario);
}

async function updateUser(id, usuarioLogadoId, data) {
  const usuario = await verificarAcesso(id, usuarioLogadoId);

  if (data.email !== undefined) {
    const email = data.email.trim().toLowerCase();

    const existente = await User.findOne({
      where: { email }
    });

    if (existente && Number(existente.id) !== Number(id)) {
      throw erro("E-mail já cadastrado.", 409);
    }

    usuario.email = email;
  }

  if (data.firstname !== undefined) {
    usuario.firstname = data.firstname.trim();
  }

  if (data.surname !== undefined) {
    usuario.surname = data.surname.trim();
  }

  if (data.password !== undefined) {
    usuario.password = await bcrypt.hash(data.password, 12);
  }

  await usuario.save();

  return dadosPublicos(usuario);
}

async function deleteUser(id, usuarioLogadoId) {
  const usuario = await verificarAcesso(id, usuarioLogadoId);

  await usuario.destroy();

  return { message: "Usuário excluído com sucesso." };
}

module.exports = {
  createUser,
  findUserByEmail,
  getUserById,
  updateUser,
  deleteUser
};
