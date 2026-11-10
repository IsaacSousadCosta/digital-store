# Digital Store

Desenvolvi a Digital Store como projeto final de front-end e back-end da Digital College. A loja tem catálogo, busca, carrinho e pedidos.

**Integrante**

Isaac Sousa da Costa

## Como rodar

Para rodar no computador, você vai precisar de Node.js 22.12 ou superior, npm e MySQL 8. Os comandos abaixo são para PowerShell e partem da raiz do projeto.

### API

Em um MySQL local, use uma conta com permissão administrativa para criar o banco `digital_store` e conceder acesso ao usuário de desenvolvimento.

```sql
CREATE DATABASE digital_store CHARACTER SET utf8mb4;
CREATE USER 'digital_store'@'localhost' IDENTIFIED BY 'troque-esta-senha';
GRANT ALL PRIVILEGES ON digital_store.* TO 'digital_store'@'localhost';
```

```powershell
cd backend
npm ci
Copy-Item .env.example .env
```

Abra `backend/.env`, preencha os dados do seu MySQL e crie uma chave aleatória para `JWT_SECRET`.

```powershell
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
npm run dev
```

A API roda em `http://localhost:3001`. O seed inclui oito produtos demonstrativos. Para testar alterações administrativas, cadastre uma conta e, **somente no banco local de desenvolvimento**, atribua o papel de administrador a essa conta com o comando abaixo.

```sql
UPDATE users SET role = 'admin' WHERE email = 'seu-email@example.com';
```

### Front-end

Em outro terminal, execute os comandos a partir da raiz do projeto.

```powershell
cd frontend
npm ci
Copy-Item .env.example .env
npm run dev
```

Abra o endereço informado pelo Vite, normalmente `http://localhost:5173`. A variável `VITE_API_URL` deve apontar para a API quando ela estiver em outro endereço.

## Verificações

- `cd frontend` e `npm run lint` verificam o código do front-end.
- `cd frontend` e `npm run build` geram o build de produção.
- `cd backend` e `npm test` executam os testes de contrato da API.
- Para incluir o teste com MySQL, aponte as variáveis `DB_*` do processo para um banco descartável chamado `drip_contract_test`, aplique as migrations e o seed, defina `JWT_SECRET` e execute `$env:RUN_MYSQL_TESTS='1'; npm test`.

## Configuração no Vercel

- [Loja no Vercel](https://digital-store-zeta-one.vercel.app)
- [API no Vercel](https://digital-store-api-gamma.vercel.app)
- [Variáveis de ambiente da API no Vercel](https://vercel.com/geracao-tech/digital-store-api/settings/environment-variables)

A loja e a API estão publicadas no Vercel. O catálogo, o login e os pedidos dependem da conexão com um MySQL hospedado, que ainda está pendente.

O front-end e a API usam projetos separados, com raízes em `frontend` e `backend`. As duas raízes têm seu próprio `vercel.json`.

1. Reserve um banco vazio no seu provedor de MySQL. No projeto da API, configure `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` e um `JWT_SECRET` aleatório como variáveis sensíveis de produção. A conexão usa TLS por padrão. Se o provedor usa uma CA própria, adicione o certificado em `DB_SSL_CA`.
2. Configure `FRONTEND_ORIGIN` na API com a URL pública da loja, sem barra final.
3. No primeiro deploy da API com banco, passe `--build-env DEPLOY_SETUP_DB=1` ao comando `vercel deploy --prod`. Isso executa as migrations e o seed no MySQL hospedado. O script recusa esquemas com tabelas de outras aplicações. Nas próximas implantações, use a opção quando houver migrations a aplicar.
4. No projeto do front-end, configure `VITE_API_URL` com a URL pública da API, sem barra final, e faça o deploy de produção. Essa URL é pública. As credenciais do MySQL e o JWT ficam só no projeto da API.
5. Valide o catálogo em `GET /v1/product/search?limit=8` e depois confira cadastro, login e pedidos na loja.

A raiz da API informa `aguardando_configuracao` até que o banco seja conectado.

## Documentação

- [Referência da API](backend/API.md)
- [Escopo do front-end](https://github.com/digitalcollegebr/projeto-digital-store)
- [Escopo do back-end](https://github.com/digitalcollegebr/projeto-backend)
- [Design no Figma](https://www.figma.com/design/nUk0ihM3x4u8JQtxUoAEJf/DRIP-STORE---DIGITAL-COLLEGE--Copy-?node-id=22-30)
