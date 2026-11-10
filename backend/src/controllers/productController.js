
const service = require("../services/productService");
const { validateImage, validateOption } = require("./productEntries");
const { positiveInteger, searchParams } = require("./searchParams");

const fields = [
  "id", "enabled", "name", "slug", "use_in_menu", "stock", "description",
  "price", "price_with_discount", "category_ids", "categories", "images", "options"
];

// Validar ID numérico positivo
const validarId = (id) =>
  /^[1-9][0-9]*$/.test(String(id));

// Validar preços com até duas casas decimais
function validarPreco(valor) {
  return (
    typeof valor === "number" &&
    Number.isFinite(valor) &&
    valor >= 0 &&
    /^[0-9]+([.][0-9]{1,2})?$/.test(String(valor)) &&
    valor <= 99999999.99
  );
}

// Validar dados recebidos pela API
function validarDados(body, completo = false) {
  if (
    !body ||
    typeof body !== "object" ||
    Array.isArray(body)
  ) {
    return null;
  }

  const camposPermitidos = [
    "name",
    "slug",
    "enabled",
    "use_in_menu",
    "stock",
    "description",
    "price",
    "price_with_discount",
    "category_ids",
    "images",
    "options"
  ];

  // Rejeitar campos desconhecidos
  if (
    Object.keys(body).some(
      campo => !camposPermitidos.includes(campo)
    )
  ) {
    return null;
  }

  const data = {};

  // Nome
  if (body.name !== undefined) {
    if (
      typeof body.name !== "string" ||
      !body.name.trim() ||
      body.name.length > 255
    ) {
      return null;
    }

    data.name = body.name.trim();
  }

  // Slug
  if (body.slug !== undefined) {
    if (
      typeof body.slug !== "string" ||
      body.slug.length > 255 ||
      !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(body.slug)
    ) {
      return null;
    }

    data.slug = body.slug;
  }

  // Campos booleanos
  for (const campo of ["enabled", "use_in_menu"]) {
    if (body[campo] !== undefined) {
      if (typeof body[campo] !== "boolean") {
        return null;
      }

      data[campo] = body[campo];
    }
  }

  // Estoque
  if (body.stock !== undefined) {
    if (
      !Number.isSafeInteger(body.stock) ||
      body.stock < 0 ||
      body.stock > 2147483647
    ) {
      return null;
    }

    data.stock = body.stock;
  }

  // Descrição
  if (body.description !== undefined) {
    if (
      body.description !== null &&
      typeof body.description !== "string"
    ) {
      return null;
    }

    data.description = body.description;
  }

  // Preços
  for (const campo of [
    "price",
    "price_with_discount"
  ]) {
    if (body[campo] !== undefined) {
      if (!validarPreco(body[campo])) {
        return null;
      }

      data[campo] = body[campo];
    }
  }

  // Desconto não pode superar o preço original
  if (
    data.price !== undefined &&
    data.price_with_discount !== undefined &&
    data.price_with_discount > data.price
  ) {
    return null;
  }

  // Categorias
  if (body.category_ids !== undefined) {
    if (
      !Array.isArray(body.category_ids) ||
      body.category_ids.length > 50 ||
      !body.category_ids.every(
        id => Number.isSafeInteger(id) && id > 0
      ) ||
      new Set(body.category_ids).size !==
        body.category_ids.length
    ) {
      return null;
    }

    data.category_ids = body.category_ids;
  }

  for (const [campo, validar] of [["images", validateImage], ["options", validateOption]]) {
    if (body[campo] === undefined) continue;
    if (!Array.isArray(body[campo]) || body[campo].length > 20) return null;
    const entries = body[campo].map(entry => validar(entry, completo));
    if (entries.some(entry => !entry)) return null;
    const ids = entries.flatMap(entry => entry.id === undefined ? [] : [entry.id]);
    if (new Set(ids).size !== ids.length) return null;
    data[campo] = entries;
  }

  // Campos obrigatórios no cadastro
  if (
    completo &&
    (
      !data.name ||
      !data.slug ||
      data.price === undefined ||
      data.price_with_discount === undefined
    )
  ) {
    return null;
  }

  if (Object.keys(data).length === 0) {
    return null;
  }

  return data;
}

// Tratamento de erros
function tratarErro(error, res) {
  if (error.status === 400) {
    return res.status(400).json({
      error: error.message
    });
  }

  if (error.name === "SequelizeUniqueConstraintError") {
    return res.status(409).json({
      error: "Já existe um produto com esse slug."
    });
  }

  if (error.name === "SequelizeForeignKeyConstraintError") {
    return res.status(409).json({ error: "O produto está vinculado a outros registros." });
  }

  if (error.name === "SequelizeValidationError") {
    return res.status(400).json({
      error: "Dados inválidos."
    });
  }

  console.error(error);

  return res.status(500).json({
    error: "Erro interno do servidor."
  });
}

// GET /v1/product/search


exports.search = async (req, res) => {
  try {
    const query = req.query;
    const params = searchParams(query, fields);
    const match = query.match ?? query.name;
    const categories = query.category_ids ?? query.category_id;
    const categoryIds = typeof categories === "string" ? categories.split(",").map(positiveInteger) : [];
    const range = typeof query["price-range"] === "string" &&
      /^(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)$/.exec(query["price-range"]);
    const minPrice = range ? Number(range[1]) : query.min_price === undefined ? undefined : Number(query.min_price);
    const maxPrice = range ? Number(range[2]) : query.max_price === undefined ? undefined : Number(query.max_price);
    const options = [];

    for (const [key, value] of Object.entries(query)) {
      if (!key.startsWith("option")) continue;
      const optionId = positiveInteger(/^option\[(\d+)\]$/.exec(key)?.[1]);
      if (!optionId || typeof value !== "string" || value.length > 2000 ||
          value.split(",").some(item => !item.trim())) {
        return res.status(400).json({ error: "Filtro de opção inválido." });
      }
      options.push({ id: optionId, values: value.split(",").map(item => item.trim()) });
    }

    if (!params || (match !== undefined && (typeof match !== "string" || match.length > 100)) ||
        (categories !== undefined && (!categoryIds.length || categoryIds.includes(null))) ||
        (query["price-range"] !== undefined && !range) ||
        [minPrice, maxPrice].some(value => value !== undefined && (!Number.isFinite(value) || value < 0)) ||
        (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice)) {
      return res.status(400).json({ error: "Filtros de pesquisa inválidos." });
    }

    const filtros = { ...params, match, categoryIds, minPrice, maxPrice, options };
    const result = await service.listProducts(filtros);

    return res.status(200).json(result);
  } catch (error) {
    return tratarErro(error, res);
  }
};



// GET /v1/product/:id
exports.getById = async (req, res) => {
  if (!validarId(req.params.id)) {
    return res.status(400).json({
      error: "ID inválido."
    });
  }

  try {
    const product = await service.getProduct(req.params.id);

    if (!product) {
      return res.status(404).json({
        error: "Produto não encontrado."
      });
    }

    return res.status(200).json(product);
  } catch (error) {
    return tratarErro(error, res);
  }
};

// POST /v1/product
exports.create = async (req, res) => {
  const data = validarDados(req.body, true);

  if (!data) {
    return res.status(400).json({
      error: "Dados do produto inválidos ou incompletos."
    });
  }

  try {
    const product = await service.createProduct(data);
    return res.status(201).json(product);
  } catch (error) {
    return tratarErro(error, res);
  }
};

// PUT /v1/product/:id
exports.update = async (req, res) => {
  if (!validarId(req.params.id)) {
    return res.status(400).json({
      error: "ID inválido."
    });
  }

  const data = validarDados(req.body);

  if (!data) {
    return res.status(400).json({
      error: "Dados inválidos."
    });
  }

  try {
    const product = await service.updateProduct(
      req.params.id,
      data
    );

    if (!product) {
      return res.status(404).json({
        error: "Produto não encontrado."
      });
    }

    return res.status(204).send();
  } catch (error) {
    return tratarErro(error, res);
  }
};

// DELETE /v1/product/:id
exports.remove = async (req, res) => {
  if (!validarId(req.params.id)) {
    return res.status(400).json({
      error: "ID inválido."
    });
  }

  try {
    const removed = await service.deleteProduct(
      req.params.id
    );

    if (!removed) {
      return res.status(404).json({
        error: "Produto não encontrado."
      });
    }

    return res.status(204).send();
  } catch (error) {
    return tratarErro(error, res);
  }
};
