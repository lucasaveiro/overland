import React from "react";
import { Link } from "react-router-dom";
import Logo from "./Logo.jsx";
import { NAV } from "./Header.jsx";
import { Topo } from "./ui.jsx";

// Rodapé claro, sobre marfim: o logotipo usa as letras em carbon.
export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-carbon/10 bg-ivory">
      <Topo className="-bottom-40 -right-32 w-[520px] text-brand-deep opacity-[0.16]" />
      <div className="site-container relative py-16 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Logo className="text-[40px] text-carbon lg:text-[48px]" />
            <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-carbon/70">
              Expedições 4x4 cuidadosamente planejadas para quem acredita que a verdadeira viagem vai muito além do destino.
            </p>
            <p className="eyebrow mt-8 text-carbon/50">Explore beyond the ordinary</p>
          </div>

          <nav aria-label="Rodapé" className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:col-span-7">
            {NAV.map((group) => (
              <div key={group.label}>
                <div className="meta text-carbon/50">{group.label}</div>
                <ul className="mt-4 space-y-1">
                  {group.items.map((sub) => (
                    <li key={sub.label}>
                      <Link to={sub.to} className="inline-flex min-h-[36px] items-center text-[15px] text-carbon/80 hover:text-carbon hover:underline">
                        {sub.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-carbon/15 pt-6 text-[13px] text-carbon/55 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} OffXpedition</span>
          <span className="flex gap-6">
            <Link to="/produtos" className="hover:text-carbon hover:underline">Loja</Link>
            <Link to="/admin" className="hover:text-carbon hover:underline">Área do administrador</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
