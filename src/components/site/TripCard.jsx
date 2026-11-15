import React from "react";
import { Link } from "react-router-dom";
import { formatBRL } from "../../lib/format.js";
import { formatTripDate, isCancelled, isUpcoming, tripDuration, tripKindLabel } from "../../lib/trips.js";
import { track } from "../../lib/analytics.js";
import { levelShort } from "../../lib/levels.js";
import { Arrow, Topo, cn } from "./ui.jsx";

/**
 * Card editorial de expedição. Mostra só o que existe no cadastro do passeio:
 * local, nome, data, nível, preço e — quando o admin preencheu o dossiê —
 * tipo de experiência e duração. Nada aqui é inferido.
 */
export default function TripCard({ trip, size = "md", className = "" }) {
  const cancelled = isCancelled(trip);
  const upcoming = isUpcoming(trip.date_time) && !cancelled;
  const large = size === "lg";
  const cover = trip.images?.[0];
  const kind = tripKindLabel(trip);
  const duration = tripDuration(trip);

  return (
    <Link
      to={`/passeio/${trip.id}`}
      onClick={() => track("select_expedition", { expedition_id: trip.id, expedition_name: trip.name })}
      className={cn("group relative flex min-h-[340px] flex-col justify-end overflow-hidden rounded-[4px] bg-charcoal text-white", className)}
    >
      {cover ? (
        <img
          src={cover}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition duration-[1200ms] ease-out group-hover:scale-[1.04] group-hover:contrast-[1.06] group-focus-visible:scale-[1.04]"
        />
      ) : (
        <Topo className="-right-24 -top-24 w-[420px] text-white opacity-10" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-carbon/90 via-carbon/25 to-carbon/10" />

      <div className="absolute left-5 top-5 flex items-center gap-2 bg-carbon/70 px-3 py-1.5 backdrop-blur-sm lg:left-7 lg:top-7">
        <span className={cn("h-1.5 w-1.5 rounded-full", upcoming ? "bg-brand" : "bg-white/50")} />
        <span className="meta text-[11px] text-white">{cancelled ? "Cancelada" : upcoming ? "Inscrições abertas" : "Realizada"}</span>
      </div>

      <div className={cn("relative p-5 lg:p-7", large && "lg:p-10")}>
        <div className="meta flex flex-wrap gap-x-4 gap-y-1 text-white/75">
          {kind && <span className="text-brand">{kind}</span>}
          {trip.location && <span>{trip.location}</span>}
        </div>
        <h3 className={cn("display mt-2", large ? "text-[36px] sm:text-[48px] lg:text-[64px]" : "text-[30px] lg:text-[36px]")}>
          {trip.name}
        </h3>

        <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/20 pt-4">
          <Meta label="Data" value={formatTripDate(trip.date_time)} />
          {duration && <Meta label="Duração" value={duration} />}
          {trip.difficulty && <Meta label="Nível" value={levelShort(trip.difficulty)} />}
          {trip.price_car != null && <Meta label="Por veículo · 2 pessoas" value={formatBRL(trip.price_car)} />}
        </dl>

        <span className="mt-6 inline-flex items-center gap-3 font-display text-[17px] font-semibold uppercase tracking-[0.08em]">
          Explorar expedição
          <Arrow className="text-brand transition-transform duration-300 group-hover:translate-x-1.5" />
        </span>
      </div>
    </Link>
  );
}

function Meta({ label, value }) {
  return (
    <div>
      <dt className="meta text-[11px] text-white/55">{label}</dt>
      <dd className="mt-1 text-[14px] font-semibold">{value}</dd>
    </div>
  );
}
