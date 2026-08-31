import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ShoppingBag, ExternalLink, Info, Search, Truck, Tent, Compass, ChevronRight, X } from "lucide-react";
import { PRODUCT_TAXONOMY, findCategory, categoryBadgeFor } from "../lib/products.js";
import { formatBRL } from "../lib/format.js";

const API_PRODUCTS = "/.netlify/functions/products";

const cn = (...c) => c.filter(Boolean).join(" ");

const ICONS = { truck: Truck, tent: Tent, compass: Compass };

// Busca sem acento: quem digita "iluminacao" precisa achar "iluminação".
const normalize = (s) =>
  (s || "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

const SORTS = [
  { value: "recentes", label: "Mais recentes" },
  { value: "menor", label: "Menor preço" },
  { value: "maior", label: "Maior preço" },
  { value: "az", label: "Nome (A–Z)" },
];

export default function ProdutosPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  // Filtros na URL: link de categoria é compartilhável e o voltar funciona.
  const [params, setParams] = useSearchParams();

  const categoria = params.get("c") || "";
  const subcategoria = params.get("s") || "";
  const busca = params.get("q") || "";
  const ordem = params.get("ord") || "recentes";

  const setParam = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    setParams(next, { replace: true });
  };

  useEffect(() => {
    fetch(API_PRODUCTS)
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setProducts(d))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const countByCategory = useMemo(() => {
    const acc = {};
    products.forEach((p) => { if (p.category) acc[p.category] = (acc[p.category] || 0) + 1; });
    return acc;
  }, [products]);

  const naCategoria = useMemo(
    () => (categoria ? products.filter((p) => p.category === categoria) : products),
    [products, categoria]
  );

  // Só oferece subcategoria que tem produto — filtro que não filtra nada frustra.
  const subcategoriasComProduto = useMemo(() => {
    const usadas = new Set(naCategoria.map((p) => p.subcategory).filter(Boolean));
    return (findCategory(categoria)?.subcategories || []).filter((sc) => usadas.has(sc));
  }, [naCategoria, categoria]);

  const visiveis = useMemo(() => {
    let lista = naCategoria;
    if (subcategoria) lista = lista.filter((p) => p.subcategory === subcategoria);
    if (busca) {
      const termo = normalize(busca);
      lista = lista.filter((p) =>
        normalize(`${p.name} ${p.description || ""} ${p.subcategory || ""}`).includes(termo)
      );
    }
    const comPreco = (p) => (p.price == null ? Infinity : Number(p.price));
    const ordenada = [...lista];
    if (ordem === "menor") ordenada.sort((a, b) => comPreco(a) - comPreco(b));
    else if (ordem === "maior") ordenada.sort((a, b) => (b.price ?? -1) - (a.price ?? -1));
    else if (ordem === "az") ordenada.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    return ordenada;
  }, [naCategoria, subcategoria, busca, ordem]);

  const temFiltro = categoria || subcategoria || busca;

  return (
    <div className="py-8">
      <header>
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-[var(--sand)] grid place-items-center text-[var(--moss)]">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Loja</h1>
        </div>
        <p className="mt-1 text-sm text-neutral-600">
          Equipamento de offroad, camping e viagem — escolhido a dedo por quem roda com ele.
        </p>
      </header>

      <p className="mt-4 flex items-start gap-2 rounded-2xl bg-[var(--sand)] px-4 py-3 text-xs text-neutral-700">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          Os links levam ao Mercado Livre. Somos afiliados: se você comprar por aqui, podemos receber
          uma comissão, <strong>sem custo adicional para você</strong>. Preço e disponibilidade são os
          do Mercado Livre no momento da compra.
        </span>
      </p>

      {/* Vitrine de categorias */}
      {/* Sempre em 3 colunas: empilhadas no celular, as vitrines empurravam o
          primeiro produto para mais de uma tela abaixo. */}
      <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-4">
        {PRODUCT_TAXONOMY.map((cat) => {
          const Icone = ICONS[cat.icon] ?? ShoppingBag;
          const ativa = categoria === cat.value;
          const total = countByCategory[cat.value] || 0;
          return (
            <button
              key={cat.value}
              type="button"
              onClick={() => setParam({ c: ativa ? "" : cat.value, s: "" })}
              className={cn(
                "group rounded-3xl border p-3 text-center transition sm:p-5 sm:text-left",
                ativa
                  ? "border-[var(--moss)] bg-white shadow-sm ring-1 ring-[var(--moss)]"
                  : "border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-sm"
              )}
            >
              <div className="flex flex-col items-center sm:flex-row sm:items-start sm:justify-between">
                <div
                  className={cn(
                    "grid h-10 w-10 place-items-center rounded-2xl transition sm:h-11 sm:w-11",
                    ativa ? "bg-[var(--moss)] text-white" : "bg-[var(--sand)] text-[var(--moss)]"
                  )}
                >
                  <Icone className="h-5 w-5" />
                </div>
                <span className="mt-1 text-xs text-neutral-500 sm:mt-0">
                  {total} {total === 1 ? "item" : "itens"}
                </span>
              </div>
              <h2 className="mt-1 text-sm font-semibold sm:mt-3 sm:text-base">{cat.value}</h2>
              <p className="mt-1 hidden text-sm text-neutral-600 sm:block">{cat.blurb}</p>
              <span className="mt-3 hidden items-center gap-1 text-sm text-[var(--moss)] sm:inline-flex">
                {ativa ? "Vendo esta categoria" : "Ver produtos"}
                <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </span>
            </button>
          );
        })}
      </div>

      {/* Subcategorias da categoria escolhida */}
      {categoria && subcategoriasComProduto.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          <Chip active={!subcategoria} onClick={() => setParam({ s: "" })}>
            Tudo em {categoria}
          </Chip>
          {subcategoriasComProduto.map((sc) => (
            <Chip key={sc} active={subcategoria === sc} onClick={() => setParam({ s: sc })}>
              {sc}
            </Chip>
          ))}
        </div>
      )}

      {/* Busca e ordenação */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            value={busca}
            onChange={(e) => setParam({ q: e.target.value })}
            placeholder="Buscar por nome ou descrição…"
            className="w-full rounded-2xl border border-neutral-300 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--moss)]"
          />
        </div>
        <select
          value={ordem}
          onChange={(e) => setParam({ ord: e.target.value === "recentes" ? "" : e.target.value })}
          className="rounded-2xl border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--moss)]"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-neutral-600">
        <span>
          {visiveis.length} {visiveis.length === 1 ? "produto" : "produtos"}
          {categoria && <> em <strong className="font-medium">{subcategoria || categoria}</strong></>}
        </span>
        {temFiltro && (
          <button
            type="button"
            onClick={() => setParams(new URLSearchParams(), { replace: true })}
            className="inline-flex items-center gap-1 hover:underline"
          >
            <X className="h-3.5 w-3.5" /> limpar filtros
          </button>
        )}
      </div>

      {loading ? (
        <p className="py-16 text-center text-neutral-600">Carregando…</p>
      ) : visiveis.length === 0 ? (
        <p className="py-16 text-center text-neutral-500">
          {products.length === 0
            ? "Nenhum produto por aqui ainda. Volte em breve!"
            : "Nada encontrado com esses filtros."}
        </p>
      ) : (
        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visiveis.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-2xl border px-3 py-1.5 text-sm transition",
        active
          ? "border-transparent bg-[var(--moss)] text-white"
          : "border-neutral-200 bg-white text-[var(--fg)] hover:bg-neutral-50"
      )}
    >
      {children}
    </button>
  );
}

function ProductCard({ product }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border bg-white shadow-sm transition hover:shadow-md">
      <div className="relative aspect-[4/3] w-full bg-neutral-50">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-contain p-4 transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-neutral-300">
            <ShoppingBag className="h-10 w-10" />
          </div>
        )}
        {product.category && (
          <span
            className={cn(
              "absolute left-3 top-3 rounded px-2 py-0.5 text-[10px] font-medium",
              categoryBadgeFor(product.category)
            )}
          >
            {product.category}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        {product.subcategory && (
          <span className="text-xs text-neutral-500">{product.subcategory}</span>
        )}
        <h3 className="mt-0.5 font-semibold leading-tight">{product.name}</h3>
        {product.description && (
          <p className="mt-2 text-sm text-neutral-600">{product.description}</p>
        )}

        <div className="mt-auto pt-4">
          {product.price != null && (
            <div className="text-sm text-neutral-700">
              <span className="text-lg font-semibold">{formatBRL(product.price)}</span>
              <span className="ml-1 text-xs text-neutral-500">preço de referência</span>
            </div>
          )}
          <a
            href={product.affiliate_url}
            target="_blank"
            // sponsored marca o link como patrocinado; noopener protege a aba de origem.
            rel="sponsored noopener noreferrer"
            className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-2xl border border-transparent bg-[var(--moss)] px-3 py-2 text-sm text-white transition hover:bg-[var(--moss-600)]"
          >
            Ver no Mercado Livre <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </article>
  );
}
