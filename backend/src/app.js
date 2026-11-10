const orderRoutes = require("./routes/orderRoutes");
const express = require("express");
const cors = require("cors");
const path = require("path");
const { Op } = require("sequelize");
const { ProductImage } = require("./models");
const { hasDatabaseConfig } = require("./config/databaseOptions");

const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

// Middlewares
app.use(cors(process.env.FRONTEND_ORIGIN ? { origin: process.env.FRONTEND_ORIGIN } : undefined));
app.use(express.json({ limit: "12mb" }));

app.use(["/v1", "/images/uploads"], (req, res, next) => {
  if (process.env.VERCEL === "1" && (!hasDatabaseConfig() || !process.env.JWT_SECRET)) {
    return res.status(503).json({ error: "Banco hospedado ou chave da API ainda não configurados." });
  }
  next();
});

app.get("/images/uploads/:filename", async (req, res, next) => {
  const filename = req.params.filename;
  if (!/^[0-9a-f-]{36}\.(png|jpg|webp)$/.test(filename)) return next();
  const image = await ProductImage.findOne({
    attributes: ["file_content", "mime_type"],
    where: { path: "/images/uploads/" + filename, enabled: true, file_content: { [Op.ne]: null } }
  });
  if (!image) return next();
  res.set("X-Content-Type-Options", "nosniff");
  return res.type(image.mime_type).send(image.file_content);
});

// Disponibilizar imagens dos produtos
app.use(
  "/images",
  express.static(
    path.join(__dirname, "../public/images")
  )
);

// Rota inicial
app.get("/", (req, res) => {
  res.json({
    message: "Digital Store API",
    status: process.env.VERCEL === "1" && (!hasDatabaseConfig() || !process.env.JWT_SECRET)
      ? "aguardando_configuracao"
      : "online"
  });
});

// Rotas de categorias
app.use("/v1/category", categoryRoutes);

// Rotas de produtos
app.use("/v1/product", productRoutes);

// Rotas de usuários
app.use("/v1/user", userRoutes);

// Rotas de autenticação
app.use("/v1/user", authRoutes);


// Rotas de pedidos
app.use("/v1/order", orderRoutes);

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  if (error.type === "entity.too.large") {
    return res.status(413).json({ error: "O corpo da requisição excede 12 MB." });
  }
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ error: "JSON inválido." });
  }
  console.error(error);
  return res.status(500).json({ error: "Erro interno do servidor." });
});


module.exports = app;
