
const service = require("../services/categoryService");
const { searchParams } = require("./searchParams");

const fields = ["id", "name", "slug", "use_in_menu"];

const validarId = (id) => /^[1-9]\d*$/.test(String(id));

function tratarErro(error, res) {
  if (error.name === "SequelizeUniqueConstraintError") {
    return res.status(409).json({
      error: "Já existe uma categoria com esse slug."
    });
  }

  console.error(error);
  return res.status(500).json({
    error: "Erro interno do servidor."
  });
}

function validarDados(body, completo = false) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return null;
  }

  const data = {};

  if (body.name !== undefined) {
    if (typeof body.name !== "string" ||
        !body.name.trim() ||
        body.name.length > 100) return null;

    data.name = body.name.trim();
  }

  if (body.slug !== undefined) {
    if (typeof body.slug !== "string" ||
        !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(body.slug) ||
        body.slug.length > 100) return null;

    data.slug = body.slug;
  }

  if (body.use_in_menu !== undefined) {
    if (typeof body.use_in_menu !== "boolean") return null;
    data.use_in_menu = body.use_in_menu;
  }

  if (completo && (!data.name || !data.slug)) return null;
  if (Object.keys(data).length === 0) return null;

  return data;
}

exports.search = async (req, res) => {
  const filtros = searchParams(req.query, fields);
  const useInMenu = req.query.use_in_menu;
  if (!filtros || (useInMenu !== undefined && !["true", "false"].includes(useInMenu))) {
    return res.status(400).json({ error: "Filtros de pesquisa inválidos." });
  }

  try {
    const categorias = await service.listCategories({
      ...filtros,
      fields: filtros.fields ?? fields,
      useInMenu: useInMenu === undefined ? undefined : useInMenu === "true"
    });
    return res.status(200).json(categorias);
  } catch (error) {
    return tratarErro(error, res);
  }
};

exports.getById = async (req, res) => {
  if (!validarId(req.params.id)) {
    return res.status(400).json({ error: "ID inválido." });
  }

  try {
    const category = await service.getCategory(req.params.id);

    if (!category) {
      return res.status(404).json({
        error: "Categoria não encontrada."
      });
    }

    return res.status(200).json(category);
  } catch (error) {
    return tratarErro(error, res);
  }
};

exports.create = async (req, res) => {
  const data = validarDados(req.body, true);

  if (!data) {
    return res.status(400).json({
      error: "Informe name e slug válidos."
    });
  }

  try {
    const category = await service.createCategory(data);
    return res.status(201).json(category);
  } catch (error) {
    return tratarErro(error, res);
  }
};

exports.update = async (req, res) => {
  if (!validarId(req.params.id)) {
    return res.status(400).json({ error: "ID inválido." });
  }

  const data = validarDados(req.body);

  if (!data) {
    return res.status(400).json({ error: "Dados inválidos." });
  }

  try {
    const category = await service.updateCategory(req.params.id, data);

    if (!category) {
      return res.status(404).json({
        error: "Categoria não encontrada."
      });
    }

    return res.status(204).send();
  } catch (error) {
    return tratarErro(error, res);
  }
};

exports.remove = async (req, res) => {
  if (!validarId(req.params.id)) {
    return res.status(400).json({ error: "ID inválido." });
  }

  try {
    const removed = await service.deleteCategory(req.params.id);

    if (!removed) {
      return res.status(404).json({
        error: "Categoria não encontrada."
      });
    }

    return res.status(204).send();
  } catch (error) {
    return tratarErro(error, res);
  }
};
