import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Lightbox from "../components/Lightbox.jsx";
import HeroCarousel from "../components/HeroCarousel.jsx";
import VehicleReadiness from "../components/site/VehicleReadiness.jsx";
import { FAQAccordion, Timeline } from "../components/site/blocks.jsx";
import { Arrow, Reveal, Topo, cn } from "../components/site/ui.jsx";
import { formatBRL } from "../lib/format.js";
import { API_REGISTER, API_TRIPS, formatTripDate, isCancelled, isUpcoming, tripDuration, tripKindLabel } from "../lib/trips.js";
import { track } from "../lib/analytics.js";
import { useSeo } from "../lib/seo.js";

const lines = (v) => (Array.isArray(v) ? v.filter(Boolean) : []);

/**
 * Expedition Dossier: a página do roteiro. Os blocos são montados a partir do
 * cadastro do passeio e de `trip.details` (preenchido no admin). Bloco sem
 * dado não aparece — os rótulos em inglês são linguagem visual, não conteúdo.
 */
export default function TripPage() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_TRIPS}?id=${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        setTrip(d);
        if (d) track("view_expedition", { expedition_id: d.id, expedition_name: d.name });
      })
      .catch(() => setTrip(null))
      .finally(() => setLoading(false));
  }, [id]);

  useSeo({
    title: trip?.name,
    description: trip?.description || undefined,
    image: trip?.images?.[0],
  });
  useEventSchema(trip);

  if (loading) return <div className="site-container py-40 text-center text-carbon/60">Carregando…</div>;
  if (!trip) {
    return (
      <div className="site-container py-40 text-center">
        <p className="h3">Expedição não encontrada.</p>
        <Link to="/expedicoes" className="btn-outline-dark mt-8">Ver todas as expedições</Link>
      </div>
    );
  }

  const d = trip.details || {};
  const cancelled = isCancelled(trip);
  // Cancelada não aceita inscrição: para a página, deixa de ser "próxima".
  const upcoming = isUpcoming(trip.date_time) && !cancelled;
  const closedLabel = cancelled ? "Cancelada" : "Realizada";
  const kind = tripKindLabel(trip);
  const duration = tripDuration(trip);
  const cover = trip.images?.[0];
  const overview = (trip.complete_description || trip.description || "").split(/\n+/).filter(Boolean);
  const days = lines(d.days);
  const included = lines(d.included);
  const excluded = lines(d.excluded);
  const faq = lines(d.faq);
  const fullDate = new Intl.DateTimeFormat("pt-BR", { dateStyle: "full", timeStyle: "short" }).format(new Date(trip.date_time));

  const brief = [
    ["Data", fullDate],
    ["Duração total", duration],
    ["Região de encontro", d.meeting || trip.location],
    ["Distância estimada", d.distance],
    ["Tipo de terreno", d.terrain],
    ["Nível de dificuldade", trip.difficulty],
    ["Experiência prévia", d.experience],
    ["Veículos previstos", d.vehicles],
    ["Hospedagem", d.lodging],
  ].filter(([, v]) => v);

  const sections = [
    ["visao-geral", "Visão geral", true],
    ["brief", "Brief", true],
    ["jornada", "Jornada", days.length > 0],
    ["veiculo", "Veículo", true],
    ["incluso", "Incluso", included.length + excluded.length > 0],
    ["duvidas", "Dúvidas", faq.length > 0],
  ].filter(([, , on]) => on);

  const cta = upcoming ? "Consultar participação" : "Ver próximas saídas";
  const ctaHref = upcoming ? "#reserva" : "/expedicoes#proximas";

  return (
    <article>
      {/* ── Abertura ── */}
      <header className="relative flex min-h-[78svh] flex-col justify-end overflow-hidden bg-carbon text-white">
        {cover ? (
          <img src={cover} alt="" fetchpriority="high" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <Topo className="-right-48 -top-64 w-[820px] text-white opacity-[0.06]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-carbon via-carbon/50 to-carbon/25" />
        <div className="site-container relative pb-10 pt-24 lg:pb-14">
          <Link to="/expedicoes" className="meta inline-flex min-h-[44px] items-center gap-3 text-white/70 hover:text-white">
            <Arrow className="rotate-180" /> Expedições
          </Link>
          <p className="eyebrow mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-brand">
            <span>Expedition Dossier</span>
            {kind && <span className="text-white/75">/ {kind}</span>}
            {cancelled && <span className="bg-white px-2 py-1 text-carbon">Cancelada</span>}
          </p>
          <h1 className="display mt-5 max-w-[18ch] text-[44px] sm:text-[64px] lg:text-[96px]">{trip.name}</h1>
          <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4 border-t border-white/20 pt-6">
            {trip.location && <HeroFact label="Região" value={trip.location} />}
            <HeroFact label="Data" value={formatTripDate(trip.date_time)} />
            {duration && <HeroFact label="Duração" value={duration} />}
            {trip.difficulty && <HeroFact label="Nível" value={trip.difficulty} />}
          </dl>
          <div className="mt-8">
            <a href={ctaHref} className="btn-brand" onClick={() => upcoming && track("begin_reservation", { expedition_id: trip.id, origin: "hero" })}>
              {cta} <Arrow />
            </a>
          </div>
        </div>
        {/* Crédito de capa de banco livre (licenças CC exigem autoria). Vale só
            enquanto a capa for a imagem do Wikimedia: trocou a foto, some. */}
        {d.cover_credit?.url && cover?.includes("wikimedia.org") && (
          <a
            href={d.cover_credit.url}
            target="_blank"
            rel="noreferrer"
            className="absolute bottom-2 right-5 max-w-[70%] truncate text-[11px] text-white/55 hover:text-white lg:right-12"
          >
            Imagem da região: {d.cover_credit.text}
          </a>
        )}
      </header>

      {/* ── Índice do dossiê + CTA contextual (telas maiores) ── */}
      <nav aria-label="Seções do dossiê" className="sticky top-16 z-30 hidden border-b border-carbon/10 bg-white/95 backdrop-blur md:block lg:top-[76px]">
        <div className="site-container flex h-14 items-center justify-between gap-6">
          <ul className="flex items-center gap-7">
            {sections.map(([anchor, label]) => (
              <li key={anchor}><a href={`#${anchor}`} className="meta text-carbon/60 hover:text-carbon">{label}</a></li>
            ))}
          </ul>
          <a href={ctaHref} className="meta inline-flex min-h-[40px] items-center gap-3 font-semibold text-carbon hover:text-brand-ink"
            onClick={() => upcoming && track("begin_reservation", { expedition_id: trip.id, origin: "dossier_nav" })}>
            {cta} <Arrow className="text-brand-deep" />
          </a>
        </div>
      </nav>

      {/* ── The Experience ── */}
      <section id="visao-geral" className="section bg-white">
        <div className="site-container grid gap-10 lg:grid-cols-12 lg:gap-8">
          <Reveal className="lg:col-span-4">
            <p className="eyebrow text-brand-ink">The Experience</p>
            <h2 className="h2 mt-5 lg:text-[56px]">Visão geral</h2>
          </Reveal>
          <Reveal delay={0.08} className="space-y-5 text-[17px] leading-relaxed text-carbon/85 lg:col-span-7 lg:col-start-6 lg:text-[19px]">
            {overview.length > 0 ? overview.map((p, i) => <p key={i}>{p}</p>) : <p className="text-carbon/60">A descrição deste roteiro será publicada em breve.</p>}
          </Reveal>
        </div>
        {trip.images?.length > 1 && (
          <div className="site-container mt-14 lg:mt-20">
            <HeroCarousel images={trip.images} alt={trip.name} onOpen={(i) => setLightbox(i)} />
          </div>
        )}
      </section>

      {/* ── Journey Details / Expedition Brief ── */}
      <section id="brief" className="section relative overflow-hidden bg-ivory">
        <Topo className="-bottom-48 -right-40 w-[640px] text-brand-deep opacity-[0.08]" />
        <div className="site-container relative">
          <Reveal>
            <p className="eyebrow text-brand-ink">Journey Details</p>
            <h2 className="h2 mt-5 lg:text-[56px]">Expedition Brief</h2>
          </Reveal>
          <Reveal delay={0.08} className="mt-10 rounded-[4px] border border-carbon/20 bg-white">
            <div className="flex items-center justify-between gap-4 border-b border-carbon/20 px-5 py-4 lg:px-8">
              <span className="meta text-carbon/60">OffXpedition / Expedition Brief</span>
              <span className="meta flex items-center gap-2 text-carbon/60">
                <span className={cn("h-1.5 w-1.5 rounded-full", upcoming ? "bg-brand-deep" : "bg-carbon/30")} />
                {upcoming ? "Inscrições abertas" : closedLabel}
              </span>
            </div>
            <dl className="grid sm:grid-cols-2 lg:grid-cols-3">
              {brief.map(([label, value]) => (
                <div key={label} className="-mb-px -mr-px border-b border-r border-carbon/10 px-5 py-6 lg:px-8">
                  <dt className="meta text-carbon/50">{label}</dt>
                  <dd className="mt-2 text-[17px] font-semibold first-letter:uppercase">{value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      {/* ── The Journey ── */}
      {days.length > 0 && (
        <section id="jornada" className="section bg-carbon text-white">
          <div className="site-container">
            <Reveal>
              <p className="eyebrow text-brand">The Journey</p>
              <h2 className="h2 mt-5 lg:text-[56px]">O roteiro, dia a dia</h2>
            </Reveal>
            <div className="mt-12 lg:mt-16">
              <Timeline dark labelPrefix="Day " items={days.map((x) => ({ title: x.title, text: x.text }))} />
            </div>
          </div>
        </section>
      )}

      {/* ── Vehicle Readiness ── */}
      <section id="veiculo" className="section bg-white">
        <div className="site-container">
          <Reveal>
            <p className="eyebrow text-brand-ink">Vehicle Readiness</p>
            <h2 className="h2 mt-5 lg:text-[56px]">O seu 4x4 neste roteiro</h2>
          </Reveal>
          <div className="mt-10 lg:mt-14">
            <VehicleReadiness levelTitle={trip.difficulty} />
          </div>
        </div>
      </section>

      {/* ── What's Included ── */}
      {included.length + excluded.length > 0 && (
        <section id="incluso" className="section bg-ivory">
          <div className="site-container">
            <Reveal>
              <p className="eyebrow text-brand-ink">What's Included</p>
              <h2 className="h2 mt-5 lg:text-[56px]">O que está e o que não está incluso</h2>
            </Reveal>
            <div className="mt-10 grid gap-10 md:grid-cols-2 lg:mt-14 lg:gap-16">
              <IncludeList title="Incluso" items={included} on />
              <IncludeList title="Não incluso" items={excluded} />
            </div>
          </div>
        </section>
      )}

      {/* ── Field Notes / FAQ ── */}
      {faq.length > 0 && (
        <section id="duvidas" className="section bg-white">
          <div className="site-container grid gap-10 lg:grid-cols-12 lg:gap-8">
            <Reveal className="lg:col-span-4">
              <p className="eyebrow text-brand-ink">Field Notes</p>
              <h2 className="h2 mt-5 lg:text-[56px]">Dúvidas frequentes</h2>
            </Reveal>
            <div className="lg:col-span-7 lg:col-start-6">
              <FAQAccordion items={faq} />
            </div>
          </div>
        </section>
      )}

      {/* ── Reservation ── */}
      <section id="reserva" className="section bg-carbon text-white">
        <div className="site-container grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <p className="eyebrow text-brand">Reservation</p>
            <h2 className="h2 mt-5 lg:text-[56px]">{upcoming ? "Consulte sua participação" : `Expedição ${closedLabel.toLowerCase()}`}</h2>
            <dl className="mt-10 border-t border-white/20">
              {trip.price_car != null && <PriceRow label="Por veículo · 2 pessoas" value={formatBRL(trip.price_car)} />}
              {trip.price_extra != null && <PriceRow label="Pessoa adicional" value={formatBRL(trip.price_extra)} />}
              {trip.price_car == null && upcoming && <PriceRow label="Valores" value="Sob consulta" />}
            </dl>
            {upcoming && (
              <p className="mt-6 max-w-md text-[15px] leading-relaxed text-white/65">
                O envio do formulário não é um pagamento nem confirma a vaga: a organização entra em contato para
                validar o veículo e combinar as condições.
              </p>
            )}
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            {upcoming ? (
              <RegistrationForm trip={trip} />
            ) : (
              <div className="border-y border-white/20 py-10">
                <p className="lead text-white/80">{cancelled ? "Esta expedição foi cancelada e não recebe inscrições." : "Esta expedição já aconteceu."} Veja as próximas saídas publicadas.</p>
                <Link to="/expedicoes#proximas" className="btn-brand mt-8">Ver próximas saídas <Arrow /></Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {upcoming && <MobileActionBar trip={trip} />}

      {lightbox !== null && (
        <Lightbox images={trip.images.map((s) => ({ src: s, alt: trip.name }))} startIndex={lightbox} onClose={() => setLightbox(null)} />
      )}
    </article>
  );
}

function HeroFact({ label, value }) {
  return (
    <div>
      <dt className="meta text-[11px] text-white/55">{label}</dt>
      <dd className="mt-1 text-[16px] font-semibold">{value}</dd>
    </div>
  );
}

function PriceRow({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-b border-white/20 py-5">
      <dt className="meta text-white/60">{label}</dt>
      <dd className="font-display text-[32px] font-semibold leading-none lg:text-[40px]">{value}</dd>
    </div>
  );
}

function IncludeList({ title, items, on = false }) {
  return (
    <div>
      <p className="meta text-carbon/60">{title}</p>
      {items.length === 0 ? (
        <p className="mt-4 border-t border-carbon/20 pt-4 text-[15px] text-carbon/60">A definir.</p>
      ) : (
        <ul className="mt-4 border-t border-carbon/20">
          {items.map((item) => (
            <li key={item} className="flex gap-4 border-b border-carbon/10 py-3.5 text-[16px] text-carbon/85">
              <span aria-hidden="true" className={cn("mt-[3px] w-4 flex-none text-center font-mono text-[14px]", on ? "text-brand-ink" : "text-carbon/40")}>
                {on ? "+" : "–"}
              </span>
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Inscrição no roteiro: continua gravando em registrations, como antes. */
function RegistrationForm({ trip }) {
  const [form, setForm] = useState({ name: "", whatsapp: "", email: "" });
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const begun = useRef(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const begin = () => {
    if (begun.current) return;
    begun.current = true;
    track("begin_reservation", { expedition_id: trip.id, origin: "form" });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.whatsapp.trim() || !form.email.trim()) {
      setStatus("error"); setError("Preencha nome, WhatsApp e e-mail."); return;
    }
    setStatus("sending"); setError("");
    try {
      const res = await fetch(API_REGISTER, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, tripId: trip.id }),
      });
      if (!res.ok) throw new Error();
      setStatus("sent");
      track("submit_expedition_lead", { expedition_id: trip.id, expedition_name: trip.name });
    } catch {
      setStatus("error"); setError("Não foi possível enviar agora. Tente novamente em instantes.");
    }
  };

  if (status === "sent") {
    return (
      <div role="status" className="rounded-[4px] bg-white p-8 text-carbon lg:p-12">
        <span className="meta flex items-center gap-2 text-brand-ink"><span className="h-1.5 w-1.5 rounded-full bg-brand-deep" /> Recebido</span>
        <p className="h3 mt-4">Consulta enviada.</p>
        <p className="mt-3 text-[16px] leading-relaxed text-carbon/70">Recebemos seus dados e entraremos em contato sobre esta expedição.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} onFocus={begin} noValidate className="rounded-[4px] bg-white p-6 text-carbon sm:p-8 lg:p-12">
      <div className="grid gap-5">
        <div>
          <label htmlFor="reg-nome" className="field-label">Nome</label>
          <input id="reg-nome" className="field-input" value={form.name} onChange={set("name")} autoComplete="name" required />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="reg-zap" className="field-label">WhatsApp</label>
            <input id="reg-zap" className="field-input" value={form.whatsapp} onChange={set("whatsapp")} placeholder="(11) 98765-4321" inputMode="tel" autoComplete="tel" required />
          </div>
          <div>
            <label htmlFor="reg-email" className="field-label">E-mail</label>
            <input id="reg-email" type="email" className="field-input" value={form.email} onChange={set("email")} autoComplete="email" required />
          </div>
        </div>
      </div>
      {status === "error" && <p role="alert" className="mt-5 border-l-2 border-red-700 pl-3 text-[14px] text-red-800">{error}</p>}
      <button type="submit" disabled={status === "sending"} className="btn-dark mt-7 w-full disabled:opacity-60">
        {status === "sending" ? "Enviando…" : "Consultar participação"} <Arrow className="text-brand" />
      </button>
      <p className="mt-4 text-[13px] leading-relaxed text-carbon/60">
        Seus dados são usados apenas para o contato sobre esta expedição.
      </p>
    </form>
  );
}

/** Barra compacta no celular. Some quando o formulário de reserva entra na tela. */
function MobileActionBar({ trip }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const check = () => {
      const target = document.getElementById("reserva");
      const pastHero = window.scrollY > window.innerHeight * 0.6;
      setShow(pastHero && !!target && target.getBoundingClientRect().top > window.innerHeight);
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, []);
  if (!show) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-4 border-t border-carbon/15 bg-white px-5 py-3 md:hidden">
      <div className="min-w-0">
        <p className="meta text-[11px] text-carbon/55">{formatTripDate(trip.date_time)}</p>
        <p className="truncate text-[15px] font-semibold">{trip.price_car != null ? `${formatBRL(trip.price_car)} por veículo` : trip.name}</p>
      </div>
      <a href="#reserva" className="btn-dark min-h-[44px] flex-none px-4 text-[15px]"
        onClick={() => track("begin_reservation", { expedition_id: trip.id, origin: "mobile_bar" })}>
        Consultar
      </a>
    </div>
  );
}

/** Dados estruturados (schema.org/Event) só com o que o cadastro tem. */
function useEventSchema(trip) {
  useEffect(() => {
    if (!trip || !isUpcoming(trip.date_time)) return;
    const cancelled = isCancelled(trip);
    const data = {
      "@context": "https://schema.org",
      "@type": "Event",
      name: trip.name,
      startDate: trip.date_time,
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      eventStatus: cancelled ? "https://schema.org/EventCancelled" : "https://schema.org/EventScheduled",
      organizer: { "@type": "Organization", name: "OffXpedition", url: window.location.origin },
      ...(trip.description && { description: trip.description }),
      ...(trip.images?.length && { image: trip.images }),
      ...(trip.location && { location: { "@type": "Place", name: trip.location, address: trip.location } }),
      ...(trip.price_car != null && {
        offers: { "@type": "Offer", price: trip.price_car, priceCurrency: "BRL", url: window.location.href },
      }),
    };
    const el = document.createElement("script");
    el.type = "application/ld+json";
    el.textContent = JSON.stringify(data);
    document.head.appendChild(el);
    return () => el.remove();
  }, [trip]);
}
