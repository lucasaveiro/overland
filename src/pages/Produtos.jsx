import React, { useEffect, useMemo, useState } from "react";
import { ShoppingBag, ExternalLink, Info } from "lucide-react";
import { CATEGORY_VALUES, categoryBadgeFor } from "../lib/products.js";
import { formatBRL } from "../lib/format.js";

const API_PRODUCTS = "/.netlify/functions/products";

const cn = (...c) => c.filter(Boolean).join(" ");

export default function ProdutosPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Todos");

  useEffect(() => {
    fetch(API_PRODUCTS)
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setProducts(d))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  // Só oferece filtro para categoria que realmente tem produto cadastrado.
  const tabs = useMemo(() => {
    const usadas = new Set(products.map((p) => p.category).filter(Boolean));
    return ["Todos", ...CATEGORY_VALUES.filter((c) => usadas.has(c))];
  }, [products]);

  const visible = filter === "Todos" ? products : products.filter((p) => p.category === filter);

  return (
    <div className="py-8">
      <div className="flex items-center gap-2">
        <div className="h-9 w-9 rounded-xl bg-[var(--sand)] grid place-items-center text-[var(--moss)]">
          <ShoppingBag className="w-5 h-5" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Produtos</h1>
      </div>
      <p className="mt-1 text-sm text-neutral-600">
        Equipamentos para offroad, camping e viagem, escolhidos a dedo por quem roda com eles.
      </p>

      <p className="mt-4 flex items-start gap-2 rounded-2xl bg-[var(--sand)] px-4 py-3 text-xs text-neutral-700">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          Os links levam ao Mercado Livre. Somos afiliados: se você comprar por aqui, podemos receber
          uma comissão, <strong>sem custo adicional para você</strong>. Preços e disponibilidade são
          os do Mercado Livre no momento da compra.
        </span>
      </p>

      {tabs.length > 2 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFilter(t)}
              className={cn(
                "rounded-2xl border px-3 py-1.5 text-sm transition",
                filter === t
                  ? "border-transparent bg-[var(--moss)] text-white"
                  : "border-neutral-200 bg-white text-[var(--fg)] hover:bg-neutral-50"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <p className="py-10 text-center text-neutral-600">Carregando…</p>
      ) : visible.length === 0 ? (
        <p className="py-10 text-center text-neutral-500">
          {products.length === 0
            ? "Nenhum produto por aqui ainda. Volte em breve!"
            : "Nenhum produto nesta categoria."}
        </p>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProductCard({ product }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-3xl border bg-white shadow-sm">
      <div className="relative aspect-[4/3] w-full bg-neutral-100">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-contain p-4"
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
        <h2 className="font-semibold leading-tight">{product.name}</h2>
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
