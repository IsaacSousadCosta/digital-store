# API da Digital Store

Endereço local `http://localhost:3001`. Envie JSON com `Content-Type: application/json`. Para rotas protegidas, envie `Authorization: Bearer <token>`.

## Usuários

| Método e rota | Corpo ou resultado | Sucesso |
| --- | --- | --- |
| `POST /v1/user` | `firstname`, `surname`, `email`, `password` e `confirmPassword` | 201 |
| `POST /v1/user/token` | Recebe `email` e `password`. Devolve `token` e `user`. | 200 |
| `GET /v1/user/:id` | Perfil público da conta, acessível pelo titular ou administrador | 200 |
| `PUT /v1/user/:id` | Recebe os campos do perfil a atualizar. Requer titular ou administrador. | 204 |
| `DELETE /v1/user/:id` | Requer titular ou administrador | 204 |

## Categorias e produtos

| Método e rota | Corpo ou resultado | Sucesso |
| --- | --- | --- |
| `GET /v1/category/search` | Lista paginada de categorias | 200 |
| `GET /v1/category/:id` | Categoria por ID | 200 |
| `POST /v1/category` | `name`, `slug` e `use_in_menu` opcional | 201 |
| `PUT /v1/category/:id` | Campos da categoria a atualizar | 204 |
| `DELETE /v1/category/:id` | Exclui uma categoria | 204 |
| `GET /v1/product/search` | Lista paginada de produtos | 200 |
| `GET /v1/product/:id` | Produto com categorias, imagens e opções | 200 |
| `POST /v1/product` | Cria um produto com seus relacionamentos | 201 |
| `PUT /v1/product/:id` | Atualiza os campos e relacionamentos enviados | 204 |
| `DELETE /v1/product/:id` | Exclui um produto sem vínculos que impeçam a exclusão | 204 |

Consultas de categorias e produtos são públicas. As operações de escrita dessas duas coleções exigem JWT e papel `admin`.

As buscas devolvem `{ data, total, limit, page }`. O padrão é `limit=12&page=1`. Use `limit=-1` para retornar todos os resultados, ou `fields=name,slug` para selecionar campos da resposta.

- Categorias aceitam `use_in_menu=true` ou `false`.
- Produtos aceitam `match` para nome ou descrição, `category_ids=1,2`, `price-range=100-300` e `option[4]=39,40`. Codifique caracteres especiais nos valores da URL.
- Preços são armazenados como `DECIMAL(10,2)` e retornados como números. O preço promocional igual a zero significa que o preço original se aplica.
- As opções são armazenadas em JSON para preservar a lista de valores, inclusive opções com vírgulas no próprio texto.

### Criar ou alterar um produto

```json
{
  "enabled": true,
  "name": "Tênis de demonstração",
  "slug": "tenis-demonstracao",
  "stock": 12,
  "price": 199.90,
  "price_with_discount": 149.90,
  "category_ids": [1],
  "options": [
    { "title": "Tamanho", "shape": "square", "radius": "4px", "type": "text", "values": ["39", "40"] },
    { "title": "Cor", "shape": "circle", "type": "color", "values": ["#C92071"] }
  ]
}
```

Para enviar uma imagem, adicione `images` com objetos no formato `{ "type": "image/png", "content": "<Base64>" }`. São aceitos PNG, JPEG e WebP de até 2 MiB cada, com limite de 12 MiB por corpo de requisição. A consulta devolve `images[].content` com o caminho acessível pela API ou a URL informada.

No `PUT`, informe o `id` da imagem ou opção para atualizar, ou envie `{ "id": 2, "deleted": true }` para remover o item. Itens sem ID são adicionados. Se `category_ids` for enviado, ele substitui a associação anterior. Novos uploads ficam no MySQL e são servidos em `/images/uploads/:filename`.

## Pedidos

| Método e rota | Corpo ou resultado | Sucesso |
| --- | --- | --- |
| `POST /v1/order` | `{ "items": [{ "product_id": 1, "quantity": 2, "selected_options": { "size": "40" } }] }` | 201 |
| `GET /v1/order` | Pedidos do usuário autenticado | 200 |
| `GET /v1/order/:id` | Pedido do usuário autenticado pelo ID | 200 |

O servidor usa os preços e o estoque do banco. As operações de pedido exigem JWT.

Erros retornam JSON com a chave `error`. Os códigos incluem `400` para entrada inválida, `401` para autenticação inválida, `403` para falta de permissão, `404` para recurso ausente, `409` para conflito e `413` para corpo acima do limite.
