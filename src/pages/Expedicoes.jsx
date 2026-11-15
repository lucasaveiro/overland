import React, { useState } from "react";
import { useTrips } from "../lib/trips.js";
import { useSeo } from "../lib/seo.js";
import TripCard from "../components/site/TripCard.jsx";
import ExpeditionFilters, { useExpeditionFilters } from "../components/site/ExpeditionFilters.jsx";
import { CinematicHero, Pending } from "../components/site/blocks.jsx";

export default function ExpedicoesPage() {
  useSeo({
    title: "Expedições",
    description: "Próximas saídas e diário de expedições 4x4 da OffXpedition: de experiências de um dia a jornadas de vários dias.",
  });
  const { upcoming, past, loading } = useTrips();
  const [selected, setSelected] = useState({});
  const { available, filtered } = useExpeditionFilters(upcoming, selected);

  return (
    <>
      <CinematicHero
        eyebrow="Expedições"
        title="Escolha sua próxima história."
        text="De experiências de um dia a jornadas de vários dias. Encontre a expedição que combina com o seu próximo destino."
      />

      <section id="proximas" className="bg-ivory py-16 lg:py-28">
        <div className="site-container">
          <Heading index="01" title="Próximas saídas" />
          {loading ? (
            <div className="mt-10 h-[420px] animate-pulse rounded-[4px] bg-stone/60" />
          ) : upcoming.length === 0 ? (
            <div className="mt-10">
              <Pending label="Roteiros em desenvolvimento">
                Os próximos roteiros estão sendo planejados. As saídas confirmadas, com data e valores, serão publicadas aqui.
              </Pending>
            </div>
          ) : (
            <>
              <ExpeditionFilters available={available} selected={selected} onChange={setSelected} count={filtered.length} />
              {filtered.length === 0 ? (
                <p className="lead mt-10 text-carbon/75">Nenhum roteiro combina com os filtros escolhidos.</p>
              ) : (
                <div className="mt-10 grid gap-5 md:grid-cols-2">
                  {filtered.map((t, i) => (
                    <TripCard
                      key={t.id}
                      trip={t}
                      size={i === 0 ? "lg" : "md"}
                      className={i === 0 ? "min-h-[460px] md:col-span-2 lg:min-h-[600px]" : "min-h-[420px]"}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <section id="realizadas" className="bg-white py-16 lg:py-28">
        <div className="site-container">
          <Heading index="02" title="Diário de expedições" />
          {past.length > 0 ? (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {past.map((t) => <TripCard key={t.id} trip={t} />)}
            </div>
          ) : !loading && (
            <div className="mt-10">
              <Pending label="Em breve">
                O diário reúne as expedições já realizadas, com fotos e registros de cada jornada. Ele começa a ser publicado após as primeiras saídas.
              </Pending>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function Heading({ index, title }) {
  return (
    <div>
      <p className="eyebrow text-brand-ink">{index} /</p>
      <h2 className="h2 mt-4">{title}</h2>
    </div>
  );
}
