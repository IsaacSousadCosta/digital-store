process.env.JWT_SECRET = "segredo-exclusivo-do-teste";

const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../src/app");
const db = require("../src/config/database");
const { User } = require("../src/models");
const categories = require("../src/services/categoryService");
const products = require("../src/services/productService");
const users = require("../src/services/userService");

const api = request(app);
const authorization = "Bearer " + jwt.sign({ sub: "1" }, process.env.JWT_SECRET);

afterEach(() => jest.restoreAllMocks());
afterAll(() => db.close());

test("categorias aceitam projeção de campos, filtro de menu e listagem completa", async () => {
  const body = { data: [{ name: "Tênis" }], total: 1, limit: -1, page: 1 };
  const search = jest.spyOn(categories, "listCategories").mockResolvedValue(body);

  const response = await api.get("/v1/category/search?limit=-1&page=8&fields=name&use_in_menu=true").expect(200);

  expect(response.body).toEqual(body);
  expect(search).toHaveBeenCalledWith({ limit: -1, page: 1, fields: ["name"], useInMenu: true });
  await api.get("/v1/category/search?use_in_menu=incorreto").expect(400);
});

test("produtos leem os filtros documentados", async () => {
  const search = jest.spyOn(products, "listProducts")
    .mockResolvedValue({ data: [], total: 0, limit: -1, page: 1 });

  await api.get("/v1/product/search").query({
    limit: -1, match: "Tênis", category_ids: "2,4", "price-range": "20-150",
    fields: "name,price", "option[5]": "39,40"
  }).expect(200);

  expect(search).toHaveBeenCalledWith({
    limit: -1, page: 1, match: "Tênis", fields: ["name", "price"], categoryIds: [2, 4],
    minPrice: 20, maxPrice: 150, options: [{ id: 5, values: ["39", "40"] }]
  });

  await api.get("/v1/product/search?price-range=150-20").expect(400);
});

test("atualização de produto aceita remoção e atualização de itens por ID", async () => {
  jest.spyOn(User, "findByPk").mockResolvedValue({ id: 1, role: "admin" });
  const update = jest.spyOn(products, "updateProduct").mockResolvedValue({ id: 9 });
  const payload = {
    images: [{ id: 3, deleted: true }],
    options: [{ id: 5, radius: "10px", value: ["42/43"] }]
  };

  await api.put("/v1/product/9").send(payload).expect(401);
  await api.put("/v1/product/9").set("Authorization", authorization).send(payload).expect(204, "");

  expect(update).toHaveBeenCalledWith("9", {
    images: [{ id: 3, deleted: true }],
    options: [{ id: 5, radius: 10, values: ["42/43"] }]
  });
});

test("cadastro valida confirmação de senha e exclusão devolve 204", async () => {
  const create = jest.spyOn(users, "createUser").mockResolvedValue({ id: 1 });
  jest.spyOn(users, "deleteUser").mockResolvedValue();
  const data = {
    firstname: "Pessoa", surname: "Teste", email: "pessoa@example.com", password: "Teste@123"
  };

  await api.post("/v1/user").send({ ...data, confirmPassword: "diferente" }).expect(400);
  expect(create).not.toHaveBeenCalled();
  await api.post("/v1/user").send({ ...data, confirmPassword: data.password }).expect(201);
  await api.delete("/v1/user/1").set("Authorization", authorization).expect(204, "");
});
