import React from "react";
import { Link } from "react-router-dom";
import { LEVELS } from "../../lib/levels.js";
import { Arrow } from "./ui.jsx";

/**
 * Preparação do veículo. Com `levelTitle`, mostra o que o nível daquele
 * roteiro exige; sem ele, resume os quatro níveis. Não há consulta por modelo
 * de propósito: o que define se um veículo acompanha o roteiro é a preparação
 * dele, e quem confirma é a organização.
 */
export default function VehicleReadiness({ levelTitle, consultHref }) {
  const level = LEVELS.find((l) => l.title === levelTitle);

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
      <div className="lg:col-span-6">
        {level ? (
          <>
            <p className="meta text-carbon/50">Nível deste roteiro</p>
            <p className="h3 mt-2">{level.label} · {level.name}</p>
            <p className="mt-4 text-[16px] leading-relaxed text-carbon/75">{level.profile}</p>
            <p className="meta mt-7 text-carbon/50">O que o roteiro pede do veículo</p>
            <ul className="mt-3 border-t border-carbon/15">
              {level.requirements.map((r) => (
                <li key={r} className="flex gap-4 border-b border-carbon/10 py-3 text-[15px] text-carbon/85">
                  <span className="mt-[9px] h-1.5 w-1.5 flex-none rounded-full bg-brand-deep" />
                  {r}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <ul className="border-t border-carbon/15">
            {LEVELS.map((l) => (
              <li key={l.title} className="grid gap-1 border-b border-carbon/10 py-4 sm:grid-cols-[150px_1fr] sm:gap-6">
                <span className="text-[15px] font-semibold">{l.label} · {l.name}</span>
                <span className="text-[15px] leading-relaxed text-carbon/75">{l.profile}</span>
              </li>
            ))}
          </ul>
        )}
        <Link to="/prepare-seu-4x4" className="meta mt-6 inline-flex min-h-[44px] items-center gap-3 text-carbon hover:text-brand-ink">
          Ver todos os níveis <Arrow />
        </Link>
      </div>

      <div className="lg:col-span-5 lg:col-start-8">
        <div className="rounded-[4px] border border-carbon/15 bg-white p-6 lg:p-8">
          <p className="h3">O que conta é a preparação, não o modelo.</p>
          <p className="mt-4 text-[15px] leading-relaxed text-carbon/75">
            Pneus, altura livre, proteções e a experiência de quem dirige pesam mais do que o nome do carro. Um SUV bem
            preparado pode acompanhar roteiros de nível médio; um 4x4 sem preparo pode não ser suficiente para um
            roteiro pesado.
          </p>
          <p className="mt-4 border-l-2 border-carbon/25 pl-3 text-[13px] leading-relaxed text-carbon/65">
            A confirmação é sempre da organização, que avalia o veículo, o estado dele e as condições da rota no período.
          </p>
          {consultHref && (
            <a href={consultHref} className="btn-outline-dark mt-6 w-full">
              Consultar sobre o meu veículo <Arrow />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
