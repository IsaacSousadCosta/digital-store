
const { Category } = require("../models");
const { pagination } = require("../controllers/searchParams");

async function listCategories({ limit, page, fields, useInMenu }) {
  const { rows, count } = await Category.findAndCountAll({
    attributes: fields,
    where: useInMenu === undefined ? {} : { use_in_menu: useInMenu },
    ...pagination({ limit, page }),
    order: [["id", "ASC"]]
  });
  return { data: rows, total: count, limit, page };
}

async function getCategory(id) {
  return await Category.findByPk(id);
}

async function createCategory(data) {
  return await Category.create(data);
}

async function updateCategory(id, data) {
  const category = await Category.findByPk(id);

  if (!category) return null;

  await category.update(data);
  return category;
}

async function deleteCategory(id) {
  const category = await Category.findByPk(id);

  if (!category) return false;

  await category.destroy();
  return true;
}

module.exports = {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
};
