import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Logo from "./Logo.jsx";
import { Arrow, cn } from "./ui.jsx";

/**
 * Navegação principal: as cinco linhas comerciais a um clique, e as seções de
 * cada página no segundo nível. Só entram destinos que existem.
 */
export const NAV = [
  {
    label: "Expedições",
    to: "/expedicoes",
    items: [
      { label: "Todas as expedições", to: "/expedicoes" },
      { label: "Próximas saídas", to: "/expedicoes#proximas" },
      { label: "Diário de expedições", to: "/expedicoes#realizadas" },
      { label: "Prepare seu 4x4", to: "/prepare-seu-4x4" },
    ],
  },
  {
    label: "Passeios",
    to: "/passeios/off-day",
    items: [
      { label: "Off Day", to: "/passeios/off-day" },
      { label: "Como funciona", to: "/#padrao" },
      { label: "Prepare seu 4x4", to: "/prepare-seu-4x4" },
    ],
  },
  {
    label: "Films",
    to: "/films",
    items: [
      { label: "OffXpedition Films", to: "/films" },
      { label: "Filmes personalizados", to: "/films#registrar" },
    ],
  },
  {
    label: "Para Marcas",
    to: "/para-marcas",
    items: [
      { label: "Brand Experience", to: "/para-marcas" },
      { label: "Solicitar proposta", to: "/para-marcas#proposta" },
    ],
  },
  {
    label: "Clube",
    to: "/club",
    items: [
      { label: "Apresentação", to: "/club" },
      { label: "Lista de interesse", to: "/club#lista" },
    ],
  },
  {
    label: "A OffXpedition",
    to: "/#manifesto",
    items: [
      { label: "Manifesto", to: "/#manifesto" },
      { label: "Nossa proposta", to: "/#padrao" },
    ],
  },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => setOpen(false), [location]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-carbon/10 bg-white">
      <div className="site-container flex h-16 items-center justify-between gap-6 lg:h-[76px]">
        <Link to="/" aria-label="OffXpedition — página inicial" className="flex-none">
          <Logo className="text-[28px] text-carbon sm:text-[32px]" />
        </Link>

        <nav aria-label="Principal" className="hidden h-full items-stretch xl:flex">
          {NAV.map((item) => (
            <div key={item.label} className="group relative flex items-center">
              <Link
                to={item.to}
                className="relative flex h-full items-center px-3.5 text-[14px] font-semibold text-carbon/80 transition-colors hover:text-carbon 2xl:px-4"
              >
                {item.label}
                <span className="absolute inset-x-3.5 bottom-0 h-[2px] origin-left scale-x-0 bg-brand transition-transform duration-300 group-hover:scale-x-100 group-focus-within:scale-x-100" />
              </Link>
              {item.items && (
                <div className="invisible absolute left-0 top-full min-w-[240px] translate-y-1 border border-carbon/10 bg-white py-3 opacity-0 shadow-[0_24px_48px_-24px_rgba(17,20,18,0.35)] transition duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                  {item.items.map((sub) => (
                    <Link
                      key={sub.label}
                      to={sub.to}
                      className="flex items-center justify-between gap-6 px-5 py-2.5 text-[14px] text-carbon/75 hover:bg-ivory hover:text-carbon"
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/expedicoes"
            className="hidden min-h-[44px] items-center gap-3 rounded-[3px] bg-carbon px-5 font-display text-[16px] font-semibold uppercase tracking-[0.08em] text-white transition-colors hover:bg-brand hover:text-carbon sm:inline-flex"
          >
            Explorar Expedições <Arrow />
          </Link>
          {/* No celular o CTA encolhe para caber ao lado do menu. */}
          <Link
            to="/expedicoes"
            className="inline-flex min-h-[40px] items-center rounded-[3px] bg-carbon px-3.5 font-display text-[15px] font-semibold uppercase tracking-[0.08em] text-white sm:hidden"
          >
            Expedições
          </Link>
          <button
            type="button"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="-mr-2 grid h-12 w-12 place-items-center xl:hidden"
          >
            <span className="relative block h-3.5 w-6">
              <span className={cn("absolute left-0 h-[2px] w-6 bg-carbon transition-transform duration-200", open ? "top-1.5 rotate-45" : "top-0")} />
              <span className={cn("absolute left-0 h-[2px] w-6 bg-carbon transition-transform duration-200", open ? "top-1.5 -rotate-45" : "top-3")} />
            </span>
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-x-0 bottom-0 top-16 z-40 flex flex-col overflow-y-auto bg-white lg:top-[76px] xl:hidden">
          <nav aria-label="Principal (mobile)" className="site-container flex-1 py-4">
            {NAV.map((item) => (
              <div key={item.label} className="border-b border-carbon/10 py-3">
                <Link to={item.to} className="flex min-h-[48px] items-center font-display text-[30px] font-semibold uppercase leading-none">
                  {item.label}
                </Link>
                {item.items && (
                  <div className="pb-1">
                    {item.items.map((sub) => (
                      <Link key={sub.label} to={sub.to} className="flex min-h-[44px] items-center text-[15px] text-carbon/70">
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
          <div className="site-container sticky bottom-0 border-t border-carbon/10 bg-white py-4">
            <Link to="/expedicoes" className="btn-dark w-full">
              Explorar Expedições <Arrow />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
