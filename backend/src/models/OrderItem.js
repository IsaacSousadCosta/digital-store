
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const OrderItem = sequelize.define(
  "OrderItem",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },

    order_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },

    product_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },

    product_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },

    quantity: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },

    unit_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },

    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },

    selected_options: {
      type: DataTypes.JSON,
      allowNull: true
    }
  },
  {
    tableName: "order_items",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
);

module.exports = OrderItem;
