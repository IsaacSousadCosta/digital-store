const request = require("supertest");

const integration = process.env.RUN_MYSQL_TESTS === "1" ? describe : describe.skip;

integration("API com MySQL de teste", () => {
  let api;
  let db;
  let User;

  beforeAll(() => {
    if (process.env.DB_NAME !== "drip_contract_test") {
      throw new Error("Use o banco descartável drip_contract_test com migrations e seed.");
    }
    api = request(require("../src/app"));
    db = require("../src/config/database");
    User = require("../src/models").User;
  });

  afterAll(async () => {
    if (db) await db.close();
  });

  test("seed, filtros de catálogo, JWT, upload e CRUD", async () => {
    const catalog = await api.get("/v1/product/search?limit=-1&page=9").expect(200);
    expect(catalog.body).toMatchObject({ limit: -1, page: 1, total: 8 });

    const category = await api.get("/v1/category/search?fields=id,name&limit=1&use_in_menu=true").expect(200);
    expect(category.body.total).toBe(2);
    expect(Object.keys(category.body.data[0]).sort()).toEqual(["id", "name"]);
    const id = category.body.data.find(item => item.name === "Tênis")?.id ??
      (await api.get("/v1/category/search?limit=-1").expect(200)).body.data.find(item => item.slug === "demo-tenis").id;

    const filters = await api.get("/v1/product/search").query({
      fields: "name,price", "price-range": "210-230", category_ids: id, match: "demonstrativo"
    }).expect(200);
    expect(filters.body.data).toEqual([{ name: "Tênis Classic", price: 219.9 }]);

    const classic = catalog.body.data.find(product => product.slug === "demo-classic");
    const color = classic.options.find(option => option.type === "color");
    const byColor = await api.get("/v1/product/search")
      .query({ ["option[" + color.id + "]"]: "#1f1f1f", limit: 1 }).expect(200);
    expect(byColor.body.total).toBe(1);
    expect(byColor.body.data[0].id).toBe(classic.id);

    const password = "SenhaTeste!123";
    const email = "teste@localhost.test";
    const signup = await api.post("/v1/user")
      .send({ firstname: "Teste", surname: "Temporário", email, password, confirmPassword: password }).expect(201);
    await User.update({ role: "admin" }, { where: { id: signup.body.id } });
    const login = await api.post("/v1/user/token").send({ email, password }).expect(200);
    const token = "Bearer " + login.body.token;
    const png = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aNioAAAAASUVORK5CYII=";
    const product = await api.post("/v1/product").set("Authorization", token).send({
      name: "Produto temporário", slug: "produto-temporario", price: 20, price_with_discount: 0,
      category_ids: [id], images: [{ type: "image/png", content: png }],
      options: [{ title: "Tamanho", shape: "square", radius: "4px", type: "text", value: ["PP", "GG"] }]
    }).expect(201);
    const image = product.body.images[0];
    const uploadPath = image.content;
    await api.get(uploadPath).expect(200);
    await api.put("/v1/product/" + product.body.id).set("Authorization", token).send({
      images: [{ id: image.id, deleted: true }], options: [{ id: product.body.options[0].id, values: ["M"] }]
    }).expect(204);
    const changed = await api.get("/v1/product/" + product.body.id).expect(200);
    expect(changed.body.images).toEqual([]);
    await api.get(uploadPath).expect(404);
    expect(changed.body.options[0].values).toEqual(["M"]);
    expect(changed.body.category_ids).toEqual([id]);
    await api.delete("/v1/product/" + product.body.id).set("Authorization", token).expect(204);
    await api.put("/v1/category/" + id).set("Authorization", token).send({ use_in_menu: true }).expect(204);
    await api.put("/v1/user/" + signup.body.id).set("Authorization", token).send({ firstname: "Atualizado" }).expect(204);
    await api.delete("/v1/user/" + signup.body.id).set("Authorization", token).expect(204);
  });
});
