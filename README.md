# Overland Site — Vite + Netlify Functions + Supabase

Frontend em React (Vite + Tailwind), backend serverless no Netlify, banco no Supabase (Postgres).  
Agora com **/admin** protegido por **login com cookie HttpOnly** (sem token visível no público).

---

## Sumário
- [Pré-requisitos](#pré-requisitos)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Quickstart](#quickstart)
- [Banco de dados (Supabase)](#banco-de-dados-supabase)
- [Variáveis de ambiente (Netlify)](#variáveis-de-ambiente-netlify)
- [Deploy no Netlify (com GitHub)](#deploy-no-netlify-com-github)
- [Desenvolvimento local](#desenvolvimento-local)
- [Uso da área admin](#uso-da-área-admin)
- [Endpoints das Functions](#endpoints-das-functions)
- [Boas práticas de segurança](#boas-práticas-de-segurança)
- [Solução de problemas](#solução-de-problemas)
- [Licença](#licença)

---

## Pré-requisitos
- **Node.js 18+** (recomendado 20+)
- Conta no **Supabase**
- Conta no **Netlify**
- Repositório no **GitHub** (deploy via “Import from Git”)

---

## Estrutura do projeto
/ (raiz do repositório)
├─ netlify.toml
├─ package.json
├─ vite.config.js
├─ postcss.config.js
├─ tailwind.config.js
├─ index.html
├─ src/
│ ├─ main.jsx
│ ├─ App.jsx # rotas públicas e link p/ /admin
│ └─ pages/
│ └─ Admin.jsx # área logada (CRUD de passeios)
└─ netlify/
└─ functions/
├─ trips.mjs # GET público; POST/PUT/DELETE com sessão
├─ register.mjs # recebe inscrições (público)
├─ auth_login.mjs # cria cookie HttpOnly
├─ auth_me.mjs # checa sessão via cookie
└─ auth_logout.mjs # apaga cookie de sessão

lua
Copy
Edit

**`netlify.toml`** (na raiz):
```toml
[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"

# Functions legadas sob /api (opcional)
[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

# SPA fallback para permitir /admin direto
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
Quickstart
bash
Copy
Edit
# 1) Instalar dependências
npm install

# 2) Rodar o frontend (sem functions)
npm run dev

# (opcional) Rodar frontend + functions juntos com Netlify CLI
# npm i -D netlify-cli
# npx netlify dev
Para o site funcionar com as Functions no deploy, você precisa configurar as variáveis de ambiente no Netlify e o banco no Supabase (passos abaixo).

Banco de dados (Supabase)
Crie um projeto em https://app.supabase.com

No SQL Editor, cole e execute o conteúdo de [`db/schema.sql`](db/schema.sql).
Ele cria todas as tabelas (passeios, inscrições, produtos, categorias,
subcategorias, vínculos e banners), liga a RLS e cria os índices.

As Functions acessam o banco com a Service Role Key, que ignora RLS. A RLS
fica ligada para que a anon key, exposta no navegador, não leia nem escreva
nada diretamente.

Faltam ainda os três buckets de imagem — `trip-images`, `product-images` e
`banner-images` — que são criados pela API de Storage, não por SQL. O rodapé
de `db/schema.sql` descreve a configuração de cada um.

Variáveis de ambiente (Netlify)
No painel do site: Site settings → Environment variables.
Crie as chaves abaixo (exatamente estes nomes):

SUPABASE_URL → Project URL do Supabase

SUPABASE_SERVICE_ROLE_KEY → Service Role Key do Supabase (não use anon key)

ADMIN_PASSWORD → senha do administrador (texto)

SESSION_SECRET → string aleatória longa para assinar o cookie (ex.: openssl rand -base64 32)

Depois de criar/alterar variáveis: Trigger deploy → Redeploy site.

Deploy no Netlify (com GitHub)
Suba os arquivos descompactados do projeto para o GitHub (não suba .zip).

No Netlify: Add new site → Import from Git → selecione o repositório.

Build settings (se a UI pedir):

Build command: npm run build

Publish directory: dist

Functions directory: netlify/functions

Base directory: (deixe em branco)

Crie as Environment variables conforme acima.

Deploy. (Normal: 1–3 min)

Importante: “Netlify Drop” (arrastar pasta) não publica Functions. Use “Import from Git”.

Desenvolvimento local
Só frontend (rápido)
bash
Copy
Edit
npm run dev
Frontend + Functions (recomendado para testes)
bash
Copy
Edit
npm i -D netlify-cli
npx netlify dev
Defina as variáveis em um arquivo .env local ou via netlify env:set (opcional).

Uso da área admin
Acesse https://SEU-SITE.netlify.app/admin

Digite a senha definida em ADMIN_PASSWORD

Após login, é emitido um cookie HttpOnly (session).

No /admin você pode Criar/Editar/Excluir passeios.

No site público (/), os visitantes:

Visualizam apenas passeios futuros.

Enviam inscrição por passeio (salva em registrations).

Logout: botão “Sair” em /admin (zera o cookie).

Endpoints das Functions
POST /.netlify/functions/auth_login
Body: { "password": "sua_senha" } → Set-Cookie session=... (HttpOnly).

GET /.netlify/functions/auth_me
Retorna { ok: true } se sessão válida (usa cookie).

POST /.netlify/functions/auth_logout
Expira o cookie.

GET /.netlify/functions/trips?all=1
Lista passeios (público).

POST /.netlify/functions/trips (requer sessão)
Body: { id?, name, dateTime, location?, description?, completeDescription?, images?[], priceCar?, priceExtra? }

PUT /.netlify/functions/trips (requer sessão)
Body: { id, name?, dateTime?, location?, description?, completeDescription?, images?[], priceCar?, priceExtra? }

DELETE /.netlify/functions/trips?id=UUID (requer sessão)

POST /.netlify/functions/register (público)
Body: { tripId, name, whatsapp, email } → grava em registrations.

Todas as rotas que exigem sessão devem ser chamadas com credentials: "include" no fetch (o frontend já faz isso).

Boas práticas de segurança
Nunca exponha SUPABASE_SERVICE_ROLE_KEY no frontend.

Use ADMIN_PASSWORD (não tokens no client).

SESSION_SECRET deve ser longo e secreto (troque se vazar).

Use HTTPS (Netlify já entrega).

Solução de problemas
Build falhou com “Base di…”/config TOML

Deixe Base directory vazio na UI.

Garanta o netlify.toml na raiz e sem base = "..." (a menos que o código esteja em subpasta).

Sem .zip no repo.

Functions falharam ao empacotar (símbolos duplicados)

Abra netlify/functions/trips.mjs e garanta uma única definição de cada import/função.

Substitua pelo arquivo limpo (já incluso no repo).

401 ao salvar no admin

Verifique ADMIN_PASSWORD e SESSION_SECRET nas Environment variables e redeploy.

Garanta que o login foi feito (cookie válido).

Chame as rotas protegidas com credentials: "include" (o frontend já faz).

500 em trips/register

Confirme SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.

Veja Logs no Netlify (Functions → trips/register → Logs).

Nada aparece em “Próximos passeios”

Confirme que existem registros em trips com date_time futuro (UTC)

Ajuste datas no /admin.