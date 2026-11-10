const { Op, literal, where: sqlWhere } = require("sequelize");
const { Product, Category, ProductImage, ProductOption } = require("../models");
const { pagination } = require("../controllers/searchParams");
const { uploadFields } = require("./productImages");

const relationships = [
  { model: Category, as: "categories", through: { attributes: [] } },
  { model: ProductImage, as: "images", attributes: { exclude: ["file_content", "mime_type"] } },
  { model: ProductOption, as: "options" }
];

function formatProduct(product, fields) {
  const data = product.toJSON();
  data.price = Number(data.price);
  data.price_with_discount = Number(data.price_with_discount);
  data.category_ids = data.categories.map(category => category.id);
  data.images = data.images.map(image => ({ ...image, content: image.path }));

  if (!fields) return data;
  return Object.fromEntries(fields.map(field => [field, data[field]]));
}

async function listProducts({ limit, page, fields, match, categoryIds, minPrice, maxPrice, options }) {
  const conditions = [];
  const sequelize = Product.sequelize;

  if (match) {
    const pattern = { [Op.like]: "%" + match + "%" };
    conditions.push({ [Op.or]: [{ name: pattern }, { description: pattern }] });
  }
  if (categoryIds.length) {
    conditions.push(literal(
      "EXISTS (SELECT 1 FROM product_categories pc WHERE pc.product_id = Product.id " +
      "AND pc.category_id IN (" + categoryIds.map(id => sequelize.escape(id)).join(", ") + "))"
    ));
  }
  if (minPrice !== undefined || maxPrice !== undefined) {
    const price = literal("CASE WHEN Product.price_with_discount > 0 THEN Product.price_with_discount ELSE Product.price END");
    if (minPrice !== undefined) conditions.push(sqlWhere(price, Op.gte, minPrice));
    if (maxPrice !== undefined) conditions.push(sqlWhere(price, Op.lte, maxPrice));
  }
  for (const { id, values } of options) {
    const matches = values.map(value =>
      "JSON_CONTAINS(po.\u0060values\u0060, JSON_QUOTE(" + sequelize.escape(value) + "))"
    );
    conditions.push(literal(
      "EXISTS (SELECT 1 FROM product_options po WHERE po.product_id = Product.id " +
      "AND po.id = " + sequelize.escape(id) + " AND (" + matches.join(" OR ") + "))"
    ));
  }

  const { count, rows } = await Product.findAndCountAll({
    where: { [Op.and]: conditions },
    include: relationships,
    distinct: true,
    ...pagination({ limit, page }),
    order: [["id", "ASC"]]
  });

  return { data: rows.map(product => formatProduct(product, fields)), total: count, limit, page };
}

async function getProduct(id) {
  const product = await Product.findByPk(id, { include: relationships });
  return product ? formatProduct(product) : null;
}

function badRequest(message) {
  return Object.assign(new Error(message), { status: 400 });
}

async function saveEntries(model, productId, entries, transaction) {
  for (const { id, deleted, upload, ...data } of entries) {
    const entry = id === undefined ? null : await model.findOne({
      where: { id, product_id: productId },
      transaction
    });
    if (id !== undefined && !entry) {
      throw badRequest("A imagem ou opção informada não pertence ao produto.");
    }
    if (deleted) {
      await entry.destroy({ transaction });
      continue;
    }
    if (upload) {
      Object.assign(data, uploadFields(upload));
    } else if (entry && model === ProductImage && data.path !== undefined && data.path !== entry.path) {
      Object.assign(data, { file_content: null, mime_type: null });
    }
    if (entry) {
      await entry.update(data, { transaction });
    } else {
      await model.create({ ...data, product_id: productId }, { transaction });
    }
  }
}

async function saveProduct(id, { category_ids, images = [], options = [], ...data }) {
  return Product.sequelize.transaction(async transaction => {
    const product = id === null
      ? await Product.create(data, { transaction })
      : await Product.findByPk(id, { transaction, lock: transaction.LOCK.UPDATE });
    if (!product) return null;

    const price = Number(data.price ?? product.price);
    const discount = Number(data.price_with_discount ?? product.price_with_discount);
    if (discount > price) throw badRequest("O desconto não pode superar o preço original.");
    if (id !== null) await product.update(data, { transaction });

    if (category_ids !== undefined) {
      const count = await Category.count({ where: { id: category_ids }, transaction });
      if (count !== category_ids.length) throw badRequest("Uma ou mais categorias não existem.");
      await product.setCategories(category_ids, { transaction });
    }

    await saveEntries(ProductImage, product.id, images, transaction);
    await saveEntries(ProductOption, product.id, options, transaction);

    const saved = await Product.findByPk(product.id, { include: relationships, transaction });
    return formatProduct(saved);
  });
}

function createProduct(data) {
  return saveProduct(null, data);
}

function updateProduct(id, data) {
  return saveProduct(id, data);
}

async function deleteProduct(id) {
  return (await Product.destroy({ where: { id } })) > 0;
}

module.exports = { listProducts, getProduct, createProduct, updateProduct, deleteProduct };
