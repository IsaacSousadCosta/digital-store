
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ProductOption = sequelize.define(
  "ProductOption",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    product_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    shape: {
      type: DataTypes.ENUM("square", "circle"),
      allowNull: false,
      defaultValue: "square"
    },
    radius: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    type: {
      type: DataTypes.ENUM("text", "color"),
      allowNull: false,
      defaultValue: "text"
    },
    values: {
      type: DataTypes.JSON,
      allowNull: false
    }
  },
  {
    tableName: "product_options",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
);

module.exports = ProductOption;
