import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { isCancelled, useTrips } from "../lib/trips.js";
import { useSeo } from "../lib/seo.js";
import TripCard from "../components/site/TripCard.jsx";
import { Arrow, Reveal, Topo, cn } from "../components/site/ui.jsx";
import nivel1 from "../assets/niveis/nivel-1.jpg";
import nivel2 from "../assets/niveis/nivel-2.jpg";
import nivel3 from "../assets/niveis/nivel-3.jpg";

// Imagem provisória do hero (banco de imagens), a mesma que o site já usava.
// Trocar por foto ou vídeo real da OffXpedition assim que houver material.
const HERO_IMAGE = "https://images.unsplash.com/photo-1627490597661-a905d22ec1fa?q=80&w=2000&auto=format&fit=crop";

export default function Home() {
  useSeo();
  const { upcoming, past, loading } = useTrips();

  // Fotos reais das galerias dos passeios têm prioridade nas seções editoriais.
  // A capa de cada próxima saída fica de fora: ela já aparece no card.
  const pool = useMemo(
    () => [
      ...past.flatMap((t) => t.images || []),
      ...upcoming.flatMap((t) => (t.images || []).slice(1)),
    ],
    [past, upcoming]
  );
  const photo = (i, fallback) => pool[i] || fallback;

  return (
    <>
      <Hero />
      <Manifesto image={photo(0, nivel1)} />
      <Expeditions upcoming={upcoming} past={past} loading={loading} />
      <Standard image={photo(1, nivel3)} />
      <OffDay image={photo(2, nivel2)} />
      <Films poster={photo(3, null)} />
      <Ecosystem />
    </>
  );
}

/* ───────────────────────── 01 · Hero ───────────────────────── */
function Hero() {
  return (
    <section className="relative flex min-h-[calc(100svh-64px)] flex-col justify-end overflow-hidden bg-carbon text-white lg:min-h-[calc(100svh-76px)]">
      <img
        src={HERO_IMAGE}
        alt=""
        fetchpriority="high"
        className="absolute inset-0 h-full w-full object-cover motion-safe:animate-hero-drift"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-carbon via-carbon/45 to-carbon/15" />
      <div className="absolute inset-0 bg-gradient-to-r from-carbon/60 via-transparent to-transparent" />

      <div className="site-container relative pb-12 pt-16 sm:pb-24 sm:pt-28 lg:pb-28">
        <Reveal immediate>
          <p className="eyebrow flex items-center gap-3 text-white/85">
            <span className="h-px w-8 bg-brand" />
            OffXpedition / Premium 4x4 Experiences
          </p>
        </Reveal>
        <Reveal immediate delay={0.08}>
          <h1 className="h1-hero mt-6 max-w-[14ch]">
            Longe de tudo. <span className="block">Nunca sozinho.</span>
          </h1>
        </Reveal>
        <Reveal immediate delay={0.16}>
          <p className="lead mt-7 max-w-xl text-white/85">
            Expedições 4x4 guiadas, com roteiro e apoio planejados do início ao fim.
          </p>
        </Reveal>
        <Reveal immediate delay={0.24} className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Link to="/expedicoes" className="btn-brand">
            Explorar expedições <Arrow />
          </Link>
          <a href="#manifesto" className="btn-outline-light">Conheça nossa filosofia</a>
        </Reveal>
      </div>

      <div className="site-container relative flex items-end justify-between border-t border-white/15 py-5">
        <a href="#manifesto" className="meta flex items-center gap-3 text-white/70 hover:text-white">
          <span className="relative block h-8 w-px overflow-hidden bg-white/25">
            <span className="absolute inset-0 bg-brand motion-safe:animate-scroll-cue" />
          </span>
          Role
        </a>
        <p className="meta hidden text-right text-white/60 sm:block">Explore beyond the ordinary / OffXpedition</p>
      </div>
    </section>
  );
}

/* ─────────────────────── 02 · Manifesto ─────────────────────── */
function Manifesto({ image }) {
  return (
    <section id="manifesto" className="section relative overflow-hidden bg-white">
      <Topo spin className="-left-64 top-10 w-[720px] text-brand-deep opacity-[0.09]" />
      <div className="site-container relative grid gap-12 lg:grid-cols-12 lg:gap-8">
        <Reveal className="lg:col-span-6">
          <p className="eyebrow text-brand-ink">01 / Manifesto</p>
          <h2 className="display mt-6 text-[48px] sm:text-[72px] lg:text-[96px] xl:text-[112px]">
            Não é apenas sobre chegar.
          </h2>
        </Reveal>
        <div className="lg:col-span-5 lg:col-start-8 lg:pt-16">
          <Reveal>
            <p className="lead text-carbon/80">
              É sobre descobrir caminhos que você não percorreria sozinho. Compartilhar momentos que não cabem em um
              roteiro convencional. Conhecer lugares, pessoas e paisagens com o tempo e a atenção que merecem.
            </p>
            <p className="lead mt-5 font-semibold text-carbon">
              Na OffXpedition, cada jornada nasce de uma combinação de planejamento, experiência e paixão por explorar.
            </p>
          </Reveal>
          <Reveal delay={0.1} className="mt-10">
            <img src={image} alt="" loading="lazy" className="aspect-[4/5] w-full rounded-[4px] object-cover" />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────── 03 · Próximas expedições ─────────────────── */
function Expeditions({ upcoming, past, loading }) {
  // Cancelada continua no catálogo, mas não ocupa o destaque da home.
  const featured = upcoming.filter((t) => !isCancelled(t)).slice(0, 3);
  const hasUpcoming = featured.length > 0;
  const archive = past.slice(0, 3);

  return (
    <section id="expedicoes" className="section bg-ivory">
      <div className="site-container">
        <Reveal className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="eyebrow text-brand-ink">02 / Próximas expedições</p>
            <h2 className="h2 mt-5">Escolha sua próxima história.</h2>
          </div>
          <p className="lead text-carbon/75 lg:col-span-4 lg:col-start-9">
            De experiências de um dia a jornadas de vários dias. Encontre a expedição que combina com o seu próximo destino.
          </p>
        </Reveal>

        <div className="mt-12 lg:mt-16">
          {loading ? (
            <div className="h-[420px] animate-pulse rounded-[4px] bg-stone/60" />
          ) : hasUpcoming ? (
            <FeaturedGrid trips={featured} />
          ) : (
            <>
              <div className="border-y border-carbon/15 py-10 lg:grid lg:grid-cols-12 lg:gap-8">
                <p className="meta text-brand-ink lg:col-span-4">Roteiros em desenvolvimento</p>
                <p className="lead mt-4 text-carbon/80 lg:col-span-7 lg:mt-0">
                  Os próximos roteiros estão sendo planejados. As saídas confirmadas, com data e valores, serão publicadas aqui.
                </p>
              </div>
              {archive.length > 0 && (
                <>
                  <p className="meta mt-12 text-carbon/60">Expedições realizadas</p>
                  <div className="mt-5 grid gap-5 md:grid-cols-3">
                    {archive.map((t) => <TripCard key={t.id} trip={t} />)}
                  </div>
                </>
              )}
            </>
          )}
        </div>

        <div className="mt-12 flex justify-center lg:mt-16">
          <Link to="/expedicoes" className="btn-outline-dark">
            Ver todas as expedições <Arrow />
          </Link>
        </div>
      </div>
    </section>
  );
}

/** Um card principal maior e até dois secundários ao lado. */
function FeaturedGrid({ trips }) {
  const [main, ...rest] = trips;
  if (rest.length === 0) return <TripCard trip={main} size="lg" className="min-h-[460px] lg:min-h-[620px]" />;
  return (
    <div className="grid gap-5 lg:grid-cols-12">
      <TripCard trip={main} size="lg" className="min-h-[460px] lg:col-span-7 lg:min-h-[720px]" />
      <div className="grid gap-5 lg:col-span-5">
        {rest.map((t) => <TripCard key={t.id} trip={t} />)}
      </div>
    </div>
  );
}

/* ───────────────────── 04 · Experience Standard ───────────────────── */
const PILLARS = [
  ["Curadoria de rotas", "Seleção cuidadosa dos caminhos, paradas e experiências."],
  ["Planejamento e suporte", "Organização antecipada, comunicação, preparação e gerenciamento de riscos."],
  ["Grupos selecionados", "Experiências organizadas para favorecer conforto, convivência e qualidade."],
  ["Memórias além da viagem", "Registro visual e experiências que permanecem depois do retorno."],
];

function Standard({ image }) {
  return (
    <section id="padrao" className="relative overflow-hidden bg-carbon text-white">
      <div className="lg:grid lg:grid-cols-2">
        <div className="relative h-[60vw] max-h-[520px] lg:h-auto lg:max-h-none">
          <img src={image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-carbon/70 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-carbon/60" />
        </div>
        <div className="relative px-5 py-16 sm:px-8 lg:py-36 lg:pl-16 lg:pr-12 xl:pl-24">
          <Topo className="-right-56 -top-40 w-[640px] text-white opacity-[0.05]" />
          <div className="relative max-w-[620px]">
            <Reveal>
              <p className="eyebrow text-brand">03 / Experience Standard</p>
              <h2 className="h2 mt-5">Cada detalhe faz parte da jornada.</h2>
            </Reveal>
            <ol className="mt-12 grid gap-x-10 sm:grid-cols-2">
              {PILLARS.map(([title, text], i) => (
                <Reveal as="li" key={title} delay={i * 0.06} className="border-t border-white/15 py-7">
                  <span className="meta text-brand">0{i + 1} /</span>
                  <h3 className="h3 mt-3 text-[24px] lg:text-[26px]">{title}</h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-white/70">{text}</p>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── 05 · Off Day ───────────────────────── */
const DAY_FACTS = [
  ["Formato", "Experiência de um dia"],
  ["Veículo", "O seu próprio 4x4"],
  ["Requisitos", "Conforme o nível do roteiro", "/prepare-seu-4x4"],
  ["Datas", "Publicadas em Próximas saídas", "/expedicoes#proximas"],
];

function OffDay({ image }) {
  return (
    <section id="off-day" className="section bg-white">
      <div className="site-container">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          <Reveal className="lg:col-span-8">
            <p className="eyebrow inline-flex items-center gap-3 border border-carbon/20 px-3 py-2 text-carbon">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" />
              Off Day / One Day Experience
            </p>
            <h2 className="h2 mt-7">
              Um dia fora da rotina. <span className="text-carbon/45">Uma experiência inteira para lembrar.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-4 lg:pt-16">
            <p className="lead text-carbon/75">
              Experiências off-road selecionadas para quem deseja aproveitar um dia extraordinário com seu próprio 4x4,
              sem precisar organizar cada detalhe da jornada.
            </p>
          </Reveal>
        </div>

        <Reveal className="mt-12 lg:mt-16">
          <img src={image} alt="" loading="lazy" className="aspect-[4/3] w-full rounded-[4px] object-cover sm:aspect-[21/9]" />
        </Reveal>

        <dl className="grid grid-cols-2 border-b border-carbon/15 lg:grid-cols-4">
          {DAY_FACTS.map(([label, value, to], i) => (
            <div key={label} className={cn("border-carbon/15 py-6 pr-4 lg:py-8", i % 2 === 1 && "border-l pl-5", i > 1 && "border-t lg:border-t-0", i > 0 && "lg:border-l lg:pl-7")}>
              <dt className="meta text-carbon/50">{label}</dt>
              <dd className="mt-2 text-[16px] font-semibold lg:text-[18px]">
                {to ? <Link to={to} className="underline decoration-brand decoration-2 underline-offset-4 hover:text-brand-ink">{value}</Link> : value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-10">
          <Link to="/passeios/off-day" className="btn-dark">
            Conhecer Off Day <Arrow />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────── 06 · OffXpedition Films ─────────────────────── */
function Films({ poster }) {
  return (
    <section id="films" className="section relative overflow-hidden bg-carbon text-white">
      <div className="site-container relative">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <Reveal className="lg:col-span-7">
            <p className="eyebrow text-brand">04 / OffXpedition Films</p>
            <h2 className="h2 mt-5">
              A aventura termina. <span className="block">A história continua.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-4 lg:col-start-9">
            <p className="lead text-white/75">
              Algumas experiências merecem mais do que fotografias. Transformamos momentos especiais da jornada em
              histórias audiovisuais para você reviver e compartilhar.
            </p>
          </Reveal>
        </div>

        {/* Moldura do player. Ainda não há filme publicado, então é só o
            pôster: sem botão de play que não toca nada. */}
        <Reveal className="relative mt-12 aspect-video overflow-hidden rounded-[4px] bg-charcoal lg:mt-16">
          {poster ? (
            <img src={poster} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-70" />
          ) : (
            <Topo className="left-1/2 top-1/2 w-[90%] -translate-x-1/2 -translate-y-1/2 text-white opacity-[0.07]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-carbon/80 via-transparent to-carbon/30" />
          <div className="absolute inset-x-0 top-0 flex justify-between p-5 lg:p-8">
            <span className="meta text-white/80">OffXpedition Films</span>
            <span className="meta flex items-center gap-2 text-white/80">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" /> Em breve
            </span>
          </div>
          <div className="absolute inset-x-0 bottom-0 p-5 lg:p-8">
            <p className="display text-[28px] sm:text-[44px] lg:text-[56px]">Os primeiros filmes estreiam aqui.</p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-x-12 md:grid-cols-2 lg:mt-16">
          {[
            ["Expedition Films", "Filmes das expedições, com narrativa sobre os destinos, participantes e momentos da viagem."],
            ["Your Expedition Film", "Produções personalizadas nas quais o participante, sua família e seu veículo recebem atenção individual."],
          ].map(([title, text], i) => (
            <Reveal key={title} delay={i * 0.08} className="border-t border-white/20 py-8">
              <span className="meta text-brand">0{i + 1} /</span>
              <h3 className="h3 mt-3">{title}</h3>
              <p className="mt-4 max-w-md text-[16px] leading-relaxed text-white/70">{text}</p>
            </Reveal>
          ))}
        </div>

        <div className="mt-6">
          <Link to="/films" className="btn-brand">
            Explorar OffXpedition Films <Arrow />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ───────────────── Ecossistema · Para Marcas e Clube ───────────────── */
function Ecosystem() {
  const lines = [
    ["/para-marcas", "Brand Experience", "Experiências e produções para marcas, concessionárias e empresas.", "Para marcas"],
    ["/club", "OffXpedition Club", "Comunidade, relacionamento e benefícios para participantes recorrentes.", "Conhecer o Club"],
  ];
  return (
    <section className="bg-white py-16 lg:py-28">
      <div className="site-container">
        <p className="eyebrow text-brand-ink">O ecossistema OffXpedition</p>
        <div className="mt-8 border-b border-carbon/15">
          {lines.map(([to, title, text, cta]) => (
            <Reveal key={to}>
              <Link to={to} className="group grid gap-4 border-t border-carbon/15 py-9 lg:grid-cols-12 lg:items-baseline lg:gap-8 lg:py-12">
                <h2 className="display text-[36px] transition-colors group-hover:text-brand-ink sm:text-[48px] lg:col-span-6 lg:text-[56px]">{title}</h2>
                <p className="lead text-carbon/75 lg:col-span-4">{text}</p>
                <p className="meta flex items-center gap-3 text-carbon lg:col-span-2 lg:justify-end">
                  {cta} <Arrow className="text-brand-deep transition-transform duration-300 group-hover:translate-x-1.5" />
                </p>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
