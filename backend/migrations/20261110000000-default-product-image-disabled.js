"use strict";

module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.changeColumn("product_images", "enabled", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });
  },
  down(queryInterface, Sequelize) {
    return queryInterface.changeColumn("product_images", "enabled", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    });
  }
};
