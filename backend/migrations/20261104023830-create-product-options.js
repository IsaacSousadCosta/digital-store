
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("product_options", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },

      product_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: "products",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },

      title: {
        type: Sequelize.STRING(100),
        allowNull: false
      },

      shape: {
        type: Sequelize.ENUM("square", "circle"),
        allowNull: false,
        defaultValue: "square"
      },

      radius: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },

      type: {
        type: Sequelize.ENUM("text", "color"),
        allowNull: false,
        defaultValue: "text"
      },

      values: {
        type: Sequelize.JSON,
        allowNull: false
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("product_options");
  }
};
