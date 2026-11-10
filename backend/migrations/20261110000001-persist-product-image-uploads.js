"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("product_images", "file_content", {
      type: Sequelize.BLOB("medium"),
      allowNull: true
    });
    await queryInterface.addColumn("product_images", "mime_type", {
      type: Sequelize.STRING(32),
      allowNull: true
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn("product_images", "mime_type");
    await queryInterface.removeColumn("product_images", "file_content");
  }
};
