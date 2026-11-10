
require("dotenv").config();

const app = require("./app");
const sequelize = require("./config/database");

const PORT = process.env.PORT || 3001;

async function iniciarServidor() {
  try {
    await sequelize.authenticate();

    console.log("✅ Conectado ao MySQL!");

    app.listen(PORT, () => {
      console.log(`🚀 API rodando em http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error(
      "❌ Erro ao conectar ao banco:",
      error.message
    );

    process.exitCode = 1;
  }
}

iniciarServidor();
