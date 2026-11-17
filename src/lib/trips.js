import { useEffect, useMemo, useState } from "react";

export const API_TRIPS = "/.netlify/functions/trips";
export const API_REGISTER = "/.netlify/functions/register";

/** Roteiro sem data definida: aparece no site como "Em breve". */
export const isUndated = (trip) => !trip?.date_time;

/** Data futura. Sem data não é "próxima" nem "realizada": veja isUndated. */
export const isUpcoming = (iso) => !!iso && new Date(iso).getTime() >= Date.now();

/**
 * Passeios publicados, já separados em próximos (mais perto primeiro) e
 * realizados. Os sem data entram no fim dos próximos, como "Em breve".
 */
export function useTrips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_TRIPS}?all=1`)
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setTrips(d))
      .catch(() => setTrips([]))
      .finally(() => setLoading(false));
  }, []);

  const upcoming = useMemo(
    () => [
      ...trips.filter((t) => isUpcoming(t.date_time)).sort((a, b) => new Date(a.date_time) - new Date(b.date_time)),
      ...trips.filter(isUndated),
    ],
    [trips]
  );
  const past = useMemo(
    () => trips.filter((t) => !isUndated(t) && !isUpcoming(t.date_time)).sort((a, b) => new Date(b.date_time) - new Date(a.date_time)),
    [trips]
  );

  return { trips, upcoming, past, loading };
}

const dateFmt = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
/** "14 nov 2026" — formato de metadado, sem ponto de abreviação. Sem data: "A definir". */
export const formatTripDate = (iso) =>
  iso ? dateFmt.format(new Date(iso)).replace(/\./g, "").replace(/ de /g, " ") : "A definir";

/* ───── Dossiê: campos opcionais em trips.details, preenchidos no admin ───── */

export const KIND_LABEL = { day: "Off Day", expedition: "Signature Expedition" };

/** Rótulo do tipo de experiência, ou null quando o admin não definiu nenhum. */
export function tripKindLabel(trip) {
  const kind = trip.details?.kind;
  if (KIND_LABEL[kind]) return KIND_LABEL[kind];
  return trip.signature ? "Signature" : null;
}

export function tripDuration(trip) {
  const n = Number(trip.details?.duration_days);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n === 1 ? "1 dia" : `${n} dias`;
}

/** "São João Batista do Glória / MG" → "MG". Sem barra, usa o local inteiro. */
export function tripRegion(trip) {
  const loc = (trip.location || "").trim();
  if (!loc) return null;
  const parts = loc.split(/\s*\/\s*|\s+[–-]\s+/);
  return parts[parts.length - 1] || loc;
}

const monthFmt = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" });
export const tripMonth = (trip) => (isUndated(trip) ? "Em breve" : monthFmt.format(new Date(trip.date_time)));

/* ───── Status: publicado, oculto ou cancelado ───── */

// "Oculto" é a coluna published = false. "Cancelado" fica em details.cancelled:
// o passeio continua no site, marcado como cancelado e sem inscrição.
export const STATUS_LABEL = { publicado: "Publicado", oculto: "Oculto", cancelado: "Cancelado" };

export const isCancelled = (trip) => trip?.details?.cancelled === true;

export function tripStatus(trip) {
  if (trip.published === false) return "oculto";
  return isCancelled(trip) ? "cancelado" : "publicado";
}

/** Corpo do PUT que leva o passeio ao status pedido. Só mexe em details quando a marca de cancelado muda. */
export function statusPatch(trip, status) {
  const { cancelled, ...rest } = trip.details || {};
  const patch = { published: status !== "oculto" };
  if ((cancelled === true) !== (status === "cancelado")) {
    patch.details = status === "cancelado" ? { ...rest, cancelled: true } : rest;
  }
  return patch;
}
