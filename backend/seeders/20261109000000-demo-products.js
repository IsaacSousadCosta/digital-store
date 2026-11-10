"use strict";

const { QueryTypes } = require("sequelize");

const categorias = [
  { name: "Tênis", slug: "demo-tenis" },
  { name: "Corrida", slug: "demo-corrida" }
];

const produtos = [
  {
    name: "Nike Air Max 270",
    slug: "demo-nike-air-max-270",
    description: "Tênis esportivo demonstrativo Nike Air Max 270.",
    price: "799.90",
    price_with_discount: "599.90",
    stock: 30,
    image: "/images/products/produc-image-5.jpeg",
    category: "demo-tenis",
    sizes: ["38", "39", "40", "41", "42"]
  },
  {
    name: "Adidas Run",
    slug: "demo-adidas-run",
    description: "Tênis demonstrativo para corrida e uso diário.",
    price: "499.90",
    price_with_discount: "399.90",
    stock: 15,
    image: "/images/products/produc-image-1.jpeg",
    category: "demo-corrida",
    sizes: ["38", "39", "40", "41", "42"]
  },
  ...[
    ["Tênis Urban", "urban", "249.90", "199.90", "demo-tenis", 1],
    ["Tênis Classic", "classic", "219.90", "0.00", "demo-tenis", 2],
    ["Tênis Sprint", "sprint", "329.90", "279.90", "demo-corrida", 3],
    ["Tênis Run Max", "run-max", "399.90", "319.90", "demo-corrida", 4],
    ["Tênis Street", "street", "279.90", "239.90", "demo-tenis", 5],
    ["Tênis Move", "move", "349.90", "299.90", "demo-corrida", 1]
  ].map(([name, slug, price, price_with_discount, category, image]) => ({
    name,
    slug: `demo-${slug}`,
    description: `${name}, modelo demonstrativo da Digital Store.`,
    price,
    price_with_discount,
    stock: 20,
    image: `/images/products/product-thumb-${image}.jpeg`,
    extraImage: `/images/products/produc-image-${image}.jpeg`,
    category,
    sizes: ["38", "39", "40", "41", "42"],
    colors: ["#1f1f1f", "#B5B6F2", "#C92071"]
  }))
];

async function buscarId(sequelize, tabela, slug, transaction) {
  const resultado = await sequelize.query(
    `SELECT id FROM ${tabela} WHERE slug = :slug`,
    {
      replacements: { slug },
      type: QueryTypes.SELECT,
      transaction
    }
  );

  return resultado[0]?.id ?? null;
}

module.exports = {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize;

    await sequelize.transaction(async (transaction) => {
      const agora = new Date();

      for (const categoria of categorias) {
        const existe = await buscarId(
          sequelize, "categories", categoria.slug, transaction
        );

        if (!existe) {
          await queryInterface.bulkInsert("categories", [{
            name: categoria.name,
            slug: categoria.slug,
            use_in_menu: true,
            created_at: agora,
            updated_at: agora
          }], { transaction });
        }
      }

      for (const produto of produtos) {
        let productId = await buscarId(
          sequelize, "products", produto.slug, transaction
        );

        if (productId) continue;

        await queryInterface.bulkInsert("products", [{
          enabled: true,
          name: produto.name,
          slug: produto.slug,
          use_in_menu: true,
          stock: produto.stock,
          description: produto.description,
          price: produto.price,
          price_with_discount: produto.price_with_discount,
          created_at: agora,
          updated_at: agora
        }], { transaction });

        productId = await buscarId(
          sequelize, "products", produto.slug, transaction
        );

        const categoryId = await buscarId(
          sequelize, "categories", produto.category, transaction
        );

        if (!productId || !categoryId) {
          throw new Error("Produto ou categoria não encontrado.");
        }

        const imagens = [produto.image, produto.extraImage].filter(Boolean);
        await queryInterface.bulkInsert("product_images", imagens.map(path => ({
          product_id: productId,
          enabled: true,
          path,
          created_at: agora,
          updated_at: agora
        })), { transaction });

        await queryInterface.bulkInsert("product_options", [{
          product_id: productId,
          title: "Tamanho",
          shape: "square",
          radius: 0,
          type: "text",
          values: JSON.stringify(produto.sizes),
          created_at: agora,
          updated_at: agora
        }], { transaction });

        if (produto.colors) {
          await queryInterface.bulkInsert("product_options", [{
            product_id: productId,
            title: "Cor",
            shape: "circle",
            radius: 0,
            type: "color",
            values: JSON.stringify(produto.colors),
            created_at: agora,
            updated_at: agora
          }], { transaction });
        }

        await queryInterface.bulkInsert("product_categories", [{
          product_id: productId,
          category_id: categoryId,
          created_at: agora,
          updated_at: agora
        }], { transaction });
      }
    });
  },

  async down(queryInterface) {
    const sequelize = queryInterface.sequelize;

    await sequelize.transaction(async (transaction) => {
      for (const produto of produtos) {
        const id = await buscarId(
          sequelize, "products", produto.slug, transaction
        );

        if (!id) continue;

        for (const tabela of [
          "product_categories",
          "product_options",
          "product_images"
        ]) {
          await queryInterface.bulkDelete(
            tabela,
            { product_id: id },
            { transaction }
          );
        }

        await queryInterface.bulkDelete(
          "products",
          { id },
          { transaction }
        );
      }
    });
  }
};
