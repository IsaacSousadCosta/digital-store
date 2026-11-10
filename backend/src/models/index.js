const Order = require("./Order");
const OrderItem = require("./OrderItem");
const User = require("./User");
const Category = require("./Category");
const Product = require("./Product");
const ProductImage = require("./ProductImage");
const ProductOption = require("./ProductOption");
const ProductCategory = require("./ProductCategory");

// Um produto possui várias imagens
Product.hasMany(ProductImage, {
  foreignKey: "product_id",
  as: "images"
});

ProductImage.belongsTo(Product, {
  foreignKey: "product_id",
  as: "product"
});

// Um produto possui várias opções
Product.hasMany(ProductOption, {
  foreignKey: "product_id",
  as: "options"
});

ProductOption.belongsTo(Product, {
  foreignKey: "product_id",
  as: "product"
});

// Produtos e categorias: muitos para muitos
Product.belongsToMany(Category, {
  through: ProductCategory,
  foreignKey: "product_id",
  otherKey: "category_id",
  as: "categories"
});

Category.belongsToMany(Product, {
  through: ProductCategory,
  foreignKey: "category_id",
  otherKey: "product_id",
  as: "products"
});



// Um usuário possui vários pedidos
User.hasMany(Order, {
  foreignKey: "user_id",
  as: "orders"
});

Order.belongsTo(User, {
  foreignKey: "user_id",
  as: "user"
});

// Um pedido possui vários itens
Order.hasMany(OrderItem, {
  foreignKey: "order_id",
  as: "items"
});

OrderItem.belongsTo(Order, {
  foreignKey: "order_id",
  as: "order"
});

// Um produto pode aparecer em vários itens de pedidos
Product.hasMany(OrderItem, {
  foreignKey: "product_id",
  as: "orderItems"
});

OrderItem.belongsTo(Product, {
  foreignKey: "product_id",
  as: "product"
});



module.exports = {
  User,
  Category,
  Product,
  ProductImage,
  ProductOption,
  ProductCategory,
  Order,
  OrderItem
};
