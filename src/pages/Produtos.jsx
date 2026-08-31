import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ShoppingBag, ExternalLink, Info, Search, Truck, Tent, Compass, Mountain,
  Wrench, Zap, Package, ChevronRight, X, SlidersHorizontal,
} from "lucide-react";
import { colorClassFor } from "../lib/products.js";
import { formatBRL } from "../lib/format.js";
import BannerHero from "../components/BannerHero.jsx";

const API_PRODUCTS = "/.netlify/functions/products";
const API_BANNERS = "/.netlify/functions/banners";
const API_CATEGORIES = "/.netlify/functions/categories";

const cn = (...c) => c.filter(Boolean).join(" ");

export const ICONS = {
  truck: Truck, tent: Tent, compass: Compass, mountain: Mountain,
  wrench: Wrench, zap: Zap, package: Package, "shopping-bag": ShoppingBag,
};

// Busca sem acento: quem digita "iluminacao" precisa achar "iluminação".
const normalize = (s) => (s || "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

const SORTS = [
  { value: "recentes", label: "Mais recentes" },
  { value: "menor", label: "Menor preço" },
  { value: "maior", label: "Maior preço" },
  { value: "az", label: "Nome (A–Z)" },
];

export default function ProdutosPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  // Filtros na URL por slug: link de categoria é compartilhável e o banner
  // pode apontar direto para /produtos?c=viatura-offgrid.
  const [params, setParams] = useSearchParams();

  const catSlug = params.get("c") || "";
  const subSlug = params.get("s") || "";
  const busca = params.get("q") || "";
  const ordem = params.get("ord") || "recentes";

  const setParam = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    setParams(next, { replace: true });
  };
  const limpar = () => setParams(new URLSearchParams(), { replace: true });

  useEffect(() => {
    Promise.all([
      fetch(API_PRODUCTS).then((r) => r.json()).catch(() => []),
      fetch(API_CATEGORIES).then((r) => r.json()).catch(() => []),
      fetch(API_BANNERS).then((r) => r.json()).catch(() => []),
    ]).then(([p, c, b]) => {
      if (Array.isArray(p)) setProducts(p);
      if (Array.isArray(c)) setCategories(c);
      if (Array.isArray(b)) setBanners(b);
      setLoading(false);
    });
  }, []);

  const categoriaAtual = categories.find((c) => c.slug === catSlug) || null;

  // Um produto pode estar em várias categorias: basta uma bater.
  const estaNaCategoria = (p, slug) => (p.categories || []).some((a) => a.categorySlug === slug);
  const estaNaSub = (p, slug) => (p.categories || []).some((a) => a.subcategorySlug === slug);

  const contarCategoria = (slug) => products.filter((p) => estaNaCategoria(p, slug)).length;
  const contarSub = (slug) => products.filter((p) => estaNaSub(p, slug)).length;

  const naCategoria = useMemo(
    () => (catSlug ? products.filter((p) => estaNaCategoria(p, catSlug)) : products),
    [products, catSlug]
  );

  // Só oferece subcategoria que tem produto — filtro que não filtra nada frustra.
  const subsComProduto = useMemo(() => {
    const usados = new Set(naCategoria.flatMap((p) => (p.categories || []).map((a) => a.subcategorySlug)));
    return (categoriaAtual?.subcategories || []).filter((sc) => usados.has(sc.slug));
  }, [naCategoria, categoriaAtual]);

  const subAtual = subsComProduto.find((s) => s.slug === subSlug) || null;

  const visiveis = useMemo(() => {
    let lista = naCategoria;
    if (subSlug) lista = lista.filter((p) => estaNaSub(p, subSlug));
    if (busca) {
      const termo = normalize(busca);
      lista = lista.filter((p) => {
        const rotulos = (p.categories || [])
          .map((a) => `${a.categoryName || ""} ${a.subcategoryName || ""}`)
          .join(" ");
        return normalize(`${p.name} ${p.description || ""} ${rotulos}`).includes(termo);
      });
    }
    const semPrecoNoFim = (p) => (p.price == null ? Infinity : Number(p.price));
    const ordenada = [...lista];
    if (ordem === "menor") ordenada.sort((a, b) => semPrecoNoFim(a) - semPrecoNoFim(b));
    else if (ordem === "maior") ordenada.sort((a, b) => (b.price ?? -1) - (a.price ?? -1));
    else if (ordem === "az") ordenada.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    return ordenada;
  }, [naCategoria, subSlug, busca, ordem]);

  const temFiltro = Boolean(catSlug || subSlug || busca);

  return (
    <div className="py-6">
      <BannerHero banners={banners} />

      <nav aria-label="Você está em" className="mt-6 flex flex-wrap items-center gap-1 text-sm text-neutral-500">
        <button type="button" onClick={limpar} className="hover:text-[var(--fg)] hover:underline">Loja</button>
        {categoriaAtual && (
          <>
            <ChevronRight className="h-3.5 w-3.5" />
            <button
              type="button"
              onClick={() => setParam({ s: "" })}
              className={cn(subAtual ? "hover:text-[var(--fg)] hover:underline" : "font-medium text-[var(--fg)]")}
            >
              {categoriaAtual.name}
            </button>
          </>
        )}
        {subAtual && (
          <>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-medium text-[var(--fg)]">{subAtual.name}</span>
          </>
        )}
      </nav>

      <div className="mt-4 grid gap-8 lg:grid-cols-[15rem_1fr]">
        <aside className="hidden lg:block">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-neutral-500">
            <SlidersHorizontal className="h-4 w-4" /> Categorias
          </h2>
          <ul className="space-y-1 text-sm">
            <li>
              <button
                type="button"
                onClick={limpar}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl px-3 py-2 transition",
                  !catSlug ? "bg-[var(--moss)] text-white" : "hover:bg-white"
                )}
              >
                Todas as categorias
                <span className={cn("text-xs", !catSlug ? "text-white/80" : "text-neutral-500")}>
                  {products.length}
                </span>
              </button>
            </li>
            {categories.map((cat) => {
              const Icone = ICONS[cat.icon] ?? ShoppingBag;
              const ativa = catSlug === cat.slug;
              return (
                <li key={cat.id}>
                  <button
                    type="button"
                    onClick={() => setParam({ c: cat.slug, s: "" })}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl px-3 py-2 transition",
                      ativa ? "bg-[var(--sand)] font-medium" : "hover:bg-white"
                    )}
                  >
                    <span className="flex items-center gap-2 text-left">
                      <Icone className="h-4 w-4 shrink-0 text-[var(--moss)]" /> {cat.name}
                    </span>
                    <span className="text-xs text-neutral-500">{contarCategoria(cat.slug)}</span>
                  </button>

                  {ativa && subsComProduto.length > 0 && (
                    <ul className="mb-2 ml-4 mt-1 space-y-0.5 border-l pl-3">
                      {subsComProduto.map((sc) => (
                        <li key={sc.id}>
                          <button
                            type="button"
                            onClick={() => setParam({ s: subSlug === sc.slug ? "" : sc.slug })}
                            className={cn(
                              "flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left transition",
                              subSlug === sc.slug
                                ? "font-medium text-[var(--moss)]"
                                : "text-neutral-600 hover:text-[var(--fg)]"
                            )}
                          >
                            {sc.name}
                            <span className="text-xs text-neutral-400">{contarSub(sc.slug)}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>

          <AvisoAfiliado className="mt-6" />
        </aside>

        <div>
          {/* No celular não cabe menu lateral: vira faixa rolável de categorias. */}
          <div className="lg:hidden">
            <div className="flex gap-2 overflow-x-auto pb-1">
              <CategoriaCompacta ativa={!catSlug} total={products.length} label="Tudo" onClick={limpar} />
              {categories.map((cat) => (
                <CategoriaCompacta
                  key={cat.id}
                  Icone={ICONS[cat.icon] ?? ShoppingBag}
                  ativa={catSlug === cat.slug}
                  total={contarCategoria(cat.slug)}
                  label={cat.name}
                  onClick={() => setParam({ c: cat.slug, s: "" })}
                />
              ))}
            </div>
            {subsComProduto.length > 0 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                <Chip active={!subSlug} onClick={() => setParam({ s: "" })}>Tudo</Chip>
                {subsComProduto.map((sc) => (
                  <Chip key={sc.id} active={subSlug === sc.slug} onClick={() => setParam({ s: sc.slug })}>
                    {sc.name}
                  </Chip>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center lg:mt-0">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                value={busca}
                onChange={(e) => setParam({ q: e.target.value })}
                placeholder="Buscar em toda a loja…"
                className="w-full rounded-2xl border border-neutral-300 bg-white py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--moss)]"
              />
            </div>
            <select
              value={ordem}
              onChange={(e) => setParam({ ord: e.target.value === "recentes" ? "" : e.target.value })}
              className="rounded-2xl border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--moss)]"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-neutral-600">
            <span>
              <strong className="font-medium text-[var(--fg)]">{visiveis.length}</strong>{" "}
              {visiveis.length === 1 ? "produto" : "produtos"}
            </span>
            {temFiltro && (
              <button type="button" onClick={limpar} className="inline-flex items-center gap-1 hover:underline">
                <X className="h-3.5 w-3.5" /> limpar filtros
              </button>
            )}
          </div>

          {loading ? (
            <p className="py-16 text-center text-neutral-600">Carregando…</p>
          ) : visiveis.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-neutral-500">
                {products.length === 0
                  ? "Nenhum produto por aqui ainda. Volte em breve!"
                  : "Nada encontrado com esses filtros."}
              </p>
              {temFiltro && products.length > 0 && (
                <button type="button" onClick={limpar} className="mt-3 text-sm text-[var(--moss)] hover:underline">
                  ver todos os produtos
                </button>
              )}
            </div>
          ) : (
            <div className="mt-4 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {visiveis.map((p) => (
                <ProductCard key={p.id} product={p} destaque={catSlug} />
              ))}
            </div>
          )}

          <AvisoAfiliado className="mt-8 lg:hidden" />
        </div>
      </div>
    </div>
  );
}

function AvisoAfiliado({ className }) {
  return (
    <p className={cn("flex items-start gap-2 rounded-2xl bg-[var(--sand)] px-3 py-3 text-xs text-neutral-700", className)}>
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span>
        Somos afiliados do Mercado Livre. Comprando por aqui podemos receber comissão,
        <strong> sem custo adicional para você</strong>.
      </span>
    </p>
  );
}

function CategoriaCompacta({ Icone, ativa, total, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-24 shrink-0 rounded-2xl border p-2 text-center transition",
        ativa ? "border-[var(--moss)] bg-white ring-1 ring-[var(--moss)]" : "border-neutral-200 bg-white"
      )}
    >
      <div
        className={cn(
          "mx-auto grid h-8 w-8 place-items-center rounded-xl",
          ativa ? "bg-[var(--moss)] text-white" : "bg-[var(--sand)] text-[var(--moss)]"
        )}
      >
        {Icone ? <Icone className="h-4 w-4" /> : <span className="text-xs font-semibold">{total}</span>}
      </div>
      <span className="mt-1 block truncate text-xs font-medium">{label}</span>
      <span className="block text-[10px] text-neutral-500">{total}</span>
    </button>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-2xl border px-3 py-1.5 text-sm transition",
        active
          ? "border-transparent bg-[var(--moss)] text-white"
          : "border-neutral-200 bg-white text-[var(--fg)] hover:bg-neutral-50"
      )}
    >
      {children}
    </button>
  );
}

function ProductCard({ product, destaque }) {
  const vinculos = product.categories || [];
  // Quando o visitante está dentro de uma categoria, mostra a subcategoria
  // dela; fora, mostra as categorias a que o produto pertence.
  const doDestaque = destaque ? vinculos.find((a) => a.categorySlug === destaque) : null;
  const badges = destaque ? vinculos.filter((a) => a.categorySlug === destaque) : vinculos.slice(0, 2);

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
        <div className="absolute left-3 top-3 flex flex-wrap gap-1">
          {badges.map((a) => (
            <span
              key={a.categoryId}
              className={cn("rounded px-2 py-0.5 text-[10px] font-medium", colorClassFor(a.categoryColor))}
            >
              {a.categoryName}
            </span>
          ))}
          {!destaque && vinculos.length > 2 && (
            <span className="rounded bg-white/90 px-2 py-0.5 text-[10px] font-medium text-neutral-700">
              +{vinculos.length - 2}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        {doDestaque?.subcategoryName && (
          <span className="text-xs text-neutral-500">{doDestaque.subcategoryName}</span>
        )}
        <h3 className="mt-0.5 font-semibold leading-tight">{product.name}</h3>
        {product.description && <p className="mt-2 text-sm text-neutral-600">{product.description}</p>}

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
