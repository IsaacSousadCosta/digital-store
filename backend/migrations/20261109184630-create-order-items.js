
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("order_items", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },

      order_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: "orders",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },

      product_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: "products",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT"
      },

      product_name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },

      quantity: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false
      },

      unit_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },

      subtotal: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },

      selected_options: {
        type: Sequelize.JSON,
        allowNull: true
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("order_items");
  }
};
