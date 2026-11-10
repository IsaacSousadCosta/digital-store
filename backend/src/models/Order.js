
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Order = sequelize.define(
  "Order",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },

    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },

    status: {
      type: DataTypes.ENUM(
        "pending",
        "paid",
        "cancelled",
        "shipped",
        "delivered"
      ),
      allowNull: false,
      defaultValue: "pending"
    },

    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    }
  },
  {
    tableName: "orders",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
);

module.exports = Order;
