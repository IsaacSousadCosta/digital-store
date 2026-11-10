
require("dotenv").config();
const { databaseOptions } = require("./databaseOptions");

const databaseConfig = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ...databaseOptions()
};

module.exports = {
  development: databaseConfig,
  test: databaseConfig,
  production: databaseConfig
};
