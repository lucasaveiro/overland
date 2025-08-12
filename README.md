# Overland Site – Netlify + Supabase

Frontend: Vite + React + Tailwind  
Backend: Netlify Functions (serverless) + Supabase (Postgres)

---

## 1) Criar o banco no Supabase
- Acesse https://app.supabase.com e crie um projeto.
- Em **SQL Editor**, rode este script para criar as tabelas:

```sql
create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  date_time timestamptz not null,
  location text,
  description text,
  images jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references public.trips(id) on delete cascade,
  name text not null,
  whatsapp text not null,
  email text not null,
  created_at timestamptz default now()
);
```

**Importante:** Mantenha as RLS (Row Level Security) ativadas (padrão). Como usamos a **Service Role Key** **apenas** dentro das Functions (server-side), os dados ficam protegidos.

---

## 2) Pegar as chaves
Em **Project Settings → API**:
- **Project URL** (SUPABASE_URL)
- **Service Role Key** (SUPABASE_SERVICE_ROLE_KEY) – **NÃO** expor no frontend.
- Crie também um **ADMIN_TOKEN** (uma string longa aleatória) para proteger os endpoints de criação/edição/exclusão de passeios.

---

## 3) Configurar variáveis no Netlify
No painel do seu site → **Site settings → Environment variables**:
- `SUPABASE_URL` = (copiar do Supabase)
- `SUPABASE_SERVICE_ROLE_KEY` = (copiar do Supabase)
- `ADMIN_TOKEN` = (string secreta que você definir)

Salve e **redeploy** quando alterar variáveis.

---

## 4) Deploy no Netlify
**Opção A — Import from Git (recomendado):**
1. Suba este projeto para um repositório no GitHub.
2. No Netlify: *Add new site → Import from Git* → selecione o repo.
3. Build command: `npm run build`  
   Publish directory: `dist`  
   Functions: `netlify/functions` (já definido em `netlify.toml`)
4. Deploy.

**Opção B — Netlify Drop (arrastar e soltar):**  
Para usar Functions você precisa usar **Import from Git** ou **CLI**. O Netlify Drop não publica Functions. Prefira a Opção A.

---

## 5) Usando o Admin
- Abra o site publicado → seção **Editar passeios**.
- No campo **“Token do admin”**, cole o valor do `ADMIN_TOKEN` (fica salvo no `localStorage` do seu navegador).
- Agora é possível **Criar/Editar/Remover** passeios:
  - Criar/Editar chama `/.netlify/functions/trips` (POST/PUT) com **Authorization: Bearer {ADMIN_TOKEN}**.
  - Excluir chama `/.netlify/functions/trips?id=...` (DELETE) idem.

---

## 6) Inscrições dos participantes
- Usuários enviam inscrição pelo card do passeio.
- O frontend chama `/.netlify/functions/register` (POST), que valida e **insere em `registrations`** no Supabase.
- Depois você pode ver os dados direto no Supabase (Table editor) ou criar uma view/CSV.

---

## 7) Rodar local (opcional)
```bash
npm install
npm run dev           # roda só o Vite (API não funciona local por aqui)
# Para rodar API + site juntos, instale a CLI do Netlify e use:
# npm i -D netlify-cli
# npx netlify dev
```

---

## Estrutura
- `src/App.jsx` – frontend (React)
- `netlify/functions/trips.mjs` – CRUD de passeios (GET sem auth; POST/PUT/DELETE com ADMIN_TOKEN)
- `netlify/functions/register.mjs` – recebe inscrições
- `netlify.toml` – build, publish e redirects (/api → functions)

---

## Segurança
- **Service Role Key** só existe nas Functions (server-side). Nunca expor no cliente.
- `ADMIN_TOKEN` protege operações de escrita. Troque periodicamente.
- Para autenticação completa (usuários/admins), depois podemos integrar Supabase Auth.
