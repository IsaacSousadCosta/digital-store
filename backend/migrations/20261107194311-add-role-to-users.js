
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "role", {
      type: Sequelize.ENUM("customer", "admin"),
      allowNull: false,
      defaultValue: "customer"
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("users", "role");
  }
};
