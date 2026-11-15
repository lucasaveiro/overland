import React, { useMemo } from "react";
import { tripDuration, tripKindLabel, tripMonth, tripRegion } from "../../lib/trips.js";
import { cn } from "./ui.jsx";

const FILTERS = [
  { key: "tipo", label: "Experiência", get: tripKindLabel },
  { key: "regiao", label: "Destino", get: tripRegion },
  { key: "duracao", label: "Duração", get: tripDuration },
  { key: "nivel", label: "Nível", get: (t) => t.difficulty || null },
  { key: "mes", label: "Período", get: tripMonth },
];

/**
 * Filtros do catálogo. Cada filtro só aparece quando os roteiros publicados
 * têm pelo menos dois valores diferentes naquele campo — com um roteiro só,
 * ou com todos iguais, o filtro não teria o que filtrar.
 */
export function useExpeditionFilters(trips, selected) {
  const available = useMemo(
    () =>
      FILTERS.map((f) => {
        const options = [...new Set(trips.map(f.get).filter(Boolean))];
        return { ...f, options };
      }).filter((f) => f.options.length > 1),
    [trips]
  );
  const filtered = useMemo(
    () => trips.filter((t) => available.every((f) => !selected[f.key] || f.get(t) === selected[f.key])),
    [trips, available, selected]
  );
  return { available, filtered };
}

export default function ExpeditionFilters({ available, selected, onChange, count }) {
  if (available.length === 0) return null;
  const active = available.some((f) => selected[f.key]);
  return (
    <div className="mt-10 border-y border-carbon/15 py-5" role="group" aria-label="Filtrar expedições">
      <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-start lg:gap-x-10">
        {available.map((f) => (
          <div key={f.key}>
            <p className="meta text-carbon/50">{f.label}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {f.options.map((o) => {
                const on = selected[f.key] === o;
                return (
                  <button
                    key={o}
                    type="button"
                    aria-pressed={on}
                    onClick={() => onChange({ ...selected, [f.key]: on ? "" : o })}
                    className={cn(
                      "min-h-[40px] rounded-[3px] border px-3.5 text-[14px] font-semibold first-letter:uppercase transition-colors",
                      on ? "border-carbon bg-carbon text-white" : "border-carbon/25 text-carbon/80 hover:border-carbon"
                    )}
                  >
                    {o}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <p className="meta mt-5 flex items-center gap-4 text-carbon/60" aria-live="polite">
        {String(count).padStart(2, "0")} {count === 1 ? "roteiro" : "roteiros"}
        {active && (
          <button type="button" onClick={() => onChange({})} className="meta underline decoration-brand-deep decoration-2 underline-offset-4 hover:text-carbon">
            Limpar filtros
          </button>
        )}
      </p>
    </div>
  );
}
