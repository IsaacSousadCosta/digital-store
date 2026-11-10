const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { hasDatabaseConfig } = require("../src/config/databaseOptions");

async function setup() {
  if (process.env.DEPLOY_SETUP_DB !== "1") return;
  if (!hasDatabaseConfig()) throw new Error("Configure as variáveis do MySQL hospedado.");

  const db = require("../src/config/database");
  try {
    const tables = await db.getQueryInterface().showAllTables();
    const expected = new Set([
      "SequelizeMeta", "users", "categories", "products", "product_images",
      "product_options", "product_categories", "orders", "order_items"
    ]);
    if (tables.some(table => !expected.has(table)) ||
        (tables.length && !tables.includes("SequelizeMeta"))) {
      throw new Error("Use um banco vazio e dedicado à Digital Store.");
    }
  } finally {
    await db.close();
  }

  const cli = path.join(__dirname, "../node_modules/sequelize-cli/lib/sequelize");
  for (const command of ["db:migrate", "db:seed:all"]) {
    const result = spawnSync(process.execPath, [cli, command, "--env", "production"], {
      cwd: path.join(__dirname, ".."),
      encoding: "utf8"
    });
    if (result.status !== 0) throw new Error("Falha ao executar " + command + ".");
    console.log(command + " concluído.");
  }
}

setup().catch(error => {
  console.error(error.original?.code ?? error.message);
  process.exitCode = 1;
});
