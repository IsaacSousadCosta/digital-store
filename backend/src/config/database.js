
const { Sequelize } = require("sequelize");
const mysql = require("mysql2");
const { databaseOptions } = require("./databaseOptions");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    ...databaseOptions(),
    dialectModule: mysql,
    logging: false
  }
);

module.exports = sequelize;
