import React, { useId, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { LEVELS } from "../../lib/levels.js";
import { Arrow, cn } from "./ui.jsx";

const normalize = (s) => (s || "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();

// Referência de modelos: os exemplos já publicados em cada nível de veículo.
const MODELS = LEVELS.flatMap((level, index) =>
  level.examples
    .replace(/^- /, "")
    .split(" - ")
    .map((name) => ({ name: name.trim(), index, level: level.title }))
);

/**
 * Orientação preliminar de veículo. Compara o modelo digitado com a tabela de
 * níveis do site; quando recebe o nível do roteiro, diz se o modelo está no
 * mesmo nível, acima ou abaixo. Nunca afirma que o veículo completa o percurso.
 */
export default function VehicleReadiness({ levelTitle }) {
  const id = useId();
  const [query, setQuery] = useState("");
  const required = LEVELS.findIndex((l) => l.title === levelTitle);
  const level = LEVELS[required];

  const q = normalize(query);
  const matches = useMemo(
    () => (q.length < 2 ? [] : MODELS.filter((m) => normalize(m.name).includes(q)).slice(0, 6)),
    [q]
  );

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
      <div className="lg:col-span-6">
        {level ? (
          <>
            <p className="meta text-carbon/50">Nível deste roteiro</p>
            <p className="h3 mt-2">{level.title}</p>
            <p className="mt-4 text-[16px] leading-relaxed text-carbon/75">{level.profile}</p>
            <ul className="mt-6 border-t border-carbon/15">
              {level.requirements.map((r) => (
                <li key={r} className="flex gap-4 border-b border-carbon/10 py-3 text-[15px] text-carbon/85">
                  <span className="mt-[9px] h-1.5 w-1.5 flex-none rounded-full bg-brand-deep" />
                  {r}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="lead text-carbon/75">
            Cada roteiro indica um nível de veículo. Consulte o seu modelo ao lado para uma primeira orientação.
          </p>
        )}
        <Link to="/prepare-seu-4x4" className="meta mt-6 inline-flex min-h-[44px] items-center gap-3 text-carbon hover:text-brand-ink">
          Ver todos os níveis <Arrow />
        </Link>
      </div>

      <div className="lg:col-span-5 lg:col-start-8">
        <div className="rounded-[4px] border border-carbon/15 bg-white p-6 lg:p-8">
          <label htmlFor={id} className="field-label">Consulte o seu modelo</label>
          <input
            id={id}
            className="field-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ex.: Hilux, Ranger, Compass"
            autoComplete="off"
          />

          <div aria-live="polite" className="mt-5 min-h-[72px]">
            {q.length >= 2 && matches.length === 0 && (
              <p className="text-[15px] leading-relaxed text-carbon/75">
                Este modelo não está na nossa tabela de referência. Isso não o exclui: a organização avalia cada veículo.
              </p>
            )}
            {matches.length > 0 && (
              <ul className="border-t border-carbon/15">
                {matches.map((m) => (
                  <li key={m.name + m.index} className="border-b border-carbon/10 py-3">
                    <p className="text-[15px] font-semibold">{m.name}</p>
                    <p className="meta mt-1 text-carbon/55">{m.level}</p>
                    {level && (
                      <p className={cn("mt-1 text-[14px]", m.index >= required ? "text-brand-ink" : "text-carbon/75")}>
                        {m.index > required && "Classificado acima do nível deste roteiro."}
                        {m.index === required && "Classificado no mesmo nível deste roteiro."}
                        {m.index < required && "Classificado abaixo do nível deste roteiro — converse com a organização antes de se inscrever."}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <p className="mt-5 border-l-2 border-carbon/25 pl-3 text-[13px] leading-relaxed text-carbon/65">
            Orientação preliminar. A compatibilidade final depende da avaliação da organização, do estado e da
            preparação do veículo e das condições da rota no período.
          </p>
        </div>
      </div>
    </div>
  );
}
