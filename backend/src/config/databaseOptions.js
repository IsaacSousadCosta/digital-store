function databaseOptions() {
  const useTls = process.env.DB_SSL === "true" ||
    Boolean(process.env.DB_SSL_CA) ||
    (process.env.VERCEL === "1" && process.env.DB_SSL !== "false");

  return {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    dialect: "mysql",
    ...(useTls && {
      dialectOptions: {
        ssl: {
          rejectUnauthorized: true,
          verifyIdentity: true,
          ...(process.env.DB_SSL_CA && { ca: process.env.DB_SSL_CA })
        }
      }
    })
  };
}

function hasDatabaseConfig() {
  return Boolean(process.env.DB_HOST && process.env.DB_NAME && process.env.DB_USER &&
    process.env.DB_PASSWORD && !["localhost", "127.0.0.1", "::1"].includes(process.env.DB_HOST));
}

module.exports = { databaseOptions, hasDatabaseConfig };
