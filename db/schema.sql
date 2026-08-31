-- Schema do Supabase — estado atual do projeto.
--
-- Este arquivo é a referência de como o banco está hoje. Rodá-lo num projeto
-- Supabase novo reproduz a estrutura inteira; num projeto existente ele é
-- inofensivo, porque tudo usa "if not exists".
--
-- As functions acessam o banco com a service role key, que ignora RLS. A RLS
-- fica ligada em todas as tabelas para que a anon key, exposta no navegador,
-- não consiga ler nem escrever nada diretamente.

-- ===== Passeios =====

create table if not exists public.trips (
  id                   uuid primary key default gen_random_uuid(),
  name                 text not null,
  date_time            timestamptz not null,
  location             text,
  description          text,
  complete_description text,
  difficulty           text,
  price_car            numeric(10,2),
  price_extra          numeric(10,2),
  images               jsonb default '[]'::jsonb,
  created_at           timestamptz default now()
);

create table if not exists public.registrations (
  id         uuid primary key default gen_random_uuid(),
  trip_id    uuid references public.trips(id) on delete cascade,
  name       text not null,
  whatsapp   text not null,
  email      text not null,
  created_at timestamptz default now()
);

-- ===== Loja: taxonomia =====
-- Categorias e subcategorias são dados, gerenciados pelo admin. O slug é o que
-- vai para a URL da loja (/produtos?c=viatura-offgrid), então renomear a
-- categoria não quebra links já compartilhados.

create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text,
  icon        text not null default 'shopping-bag',
  color       text not null default 'moss',
  sort_order  int not null default 0,
  active      boolean not null default true,
  created_at  timestamptz default now()
);

create table if not exists public.subcategories (
  id          uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete cascade,
  name        text not null,
  slug        text not null,
  sort_order  int not null default 0,
  created_at  timestamptz default now(),
  unique (category_id, slug)
);

-- ===== Loja: produtos =====

create table if not exists public.products (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  description   text,
  price         numeric(10,2),
  image_url     text,
  affiliate_url text not null,
  active        boolean not null default true,
  created_at    timestamptz default now()
);

-- Um produto pode estar em várias categorias, e em cada uma delas em no máximo
-- uma subcategoria. É o que permite uma categoria curada ("Viatura Offgrid")
-- reunir produtos que continuam aparecendo nas categorias de origem.
create table if not exists public.product_categories (
  product_id     uuid not null references public.products(id) on delete cascade,
  category_id    uuid not null references public.categories(id) on delete cascade,
  subcategory_id uuid references public.subcategories(id) on delete set null,
  primary key (product_id, category_id)
);

-- ===== Banners da loja =====

create table if not exists public.banners (
  id         uuid primary key default gen_random_uuid(),
  title      text,
  image_url  text not null,
  link_url   text,
  active     boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz default now()
);

-- ===== RLS =====

alter table public.trips              enable row level security;
alter table public.registrations      enable row level security;
alter table public.categories         enable row level security;
alter table public.subcategories      enable row level security;
alter table public.products           enable row level security;
alter table public.product_categories enable row level security;
alter table public.banners            enable row level security;

-- ===== Índices =====

create index if not exists trips_date_time_idx        on public.trips (date_time);
create index if not exists registrations_trip_id_idx  on public.registrations (trip_id);
create index if not exists products_active_idx        on public.products (active, created_at desc);
create index if not exists product_categories_cat_idx on public.product_categories (category_id, subcategory_id);
create index if not exists banners_active_idx         on public.banners (active, sort_order);

-- ===== Storage =====
-- Três buckets públicos, um por tipo de imagem, criados pela API do Supabase e
-- não por SQL. Todos com limite de 5 MB por arquivo e restritos a
-- image/jpeg, image/png, image/webp, image/avif e image/gif:
--
--   trip-images     objetos em trips/<tripId>/
--   product-images  objetos em products/<productId>/
--   banner-images   objetos em banners/<bannerId>/
--
-- O prefixo por dono é o que torna a exclusão em cascata simples: apagar o
-- registro varre o prefixo inteiro, o que leva junto órfãos de upload
-- interrompido. Ver KINDS em netlify/functions/upload_url.mjs.
