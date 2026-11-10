
const { Sequelize } = require("sequelize");
const { databaseOptions } = require("./databaseOptions");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    ...databaseOptions(),
    logging: false
  }
);

module.exports = sequelize;
