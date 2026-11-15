import React from "react";
import { Link } from "react-router-dom";
import { isCancelled, useTrips } from "../lib/trips.js";
import { useSeo } from "../lib/seo.js";
import TripCard from "../components/site/TripCard.jsx";
import VehicleReadiness from "../components/site/VehicleReadiness.jsx";
import LeadForm, { FIELD } from "../components/site/LeadForm.jsx";
import { CinematicHero, EditorialSection, Pending, Pillars, Timeline } from "../components/site/blocks.jsx";
import { Arrow } from "../components/site/ui.jsx";
import heroImage from "../assets/niveis/nivel-1.jpg";

const CONCEPT = [
  ["Perto de casa", "Roteiros pensados para caber em um dia, sem exigir uma longa viagem até o ponto de partida."],
  ["Tudo organizado", "Rota, paradas e condução do grupo já planejadas. Você chega com o seu 4x4 e aproveita o dia."],
  ["Padrão OffXpedition", "A mesma curadoria e atenção aos detalhes das expedições longas, em formato de um dia."],
];

// Etapas gerais de um dia de comboio. Horários, paradas e estrutura de cada
// data ficam no dossiê do roteiro.
const DAY_FLOW = [
  { title: "Encontro e briefing", text: "O grupo se reúne no ponto de partida e recebe as orientações do dia antes de sair." },
  { title: "Saída em comboio", text: "A condução é organizada e acompanhada, no ritmo do grupo." },
  { title: "Paradas no caminho", text: "Tempo para contemplar a paisagem, fotografar e conviver." },
  { title: "Encerramento", text: "O dia termina com o grupo reunido antes do retorno." },
];

const FORM_FIELDS = [
  FIELD.name,
  FIELD.email,
  { ...FIELD.whatsapp, required: true },
  { name: "vehicle", label: "Modelo do veículo", placeholder: "Ex.: Hilux SRV 2022" },
  { name: "city", label: "Cidade de partida", full: true },
  { name: "message", label: "Mensagem", type: "textarea" },
];

export default function SignatureDayPage() {
  useSeo({
    title: "Signature Day",
    description: "Experiências off-road premium de um dia, com o seu próprio 4x4 e sem precisar organizar cada detalhe da jornada.",
  });
  const { upcoming, loading } = useTrips();
  const days = upcoming.filter((t) => t.details?.kind === "day" && !isCancelled(t));

  return (
    <>
      <CinematicHero
        tall
        image={heroImage}
        eyebrow="Signature Day / One Day Experience"
        title="Um dia fora da rotina."
        text="Você não precisa atravessar o país para viver uma experiência memorável. Leve o seu 4x4 para um dia planejado, com atenção a cada detalhe."
      >
        <a href="#consulta" className="btn-brand">Quero participar <Arrow /></a>
        <a href="#datas" className="btn-outline-light">Ver datas</a>
      </CinematicHero>

      <EditorialSection
        label="01 / O conceito"
        title="Uma experiência inteira para lembrar."
        intro="Experiências off-road selecionadas para quem deseja aproveitar um dia extraordinário com seu próprio 4x4, sem precisar organizar cada detalhe da jornada."
      >
        <Pillars items={CONCEPT} />
      </EditorialSection>

      <EditorialSection id="datas" tone="ivory" label="02 / Experiências" title="Próximas datas.">
        {loading ? (
          <div className="h-[340px] animate-pulse rounded-[4px] bg-stone/60" />
        ) : days.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2">
            {days.map((t) => <TripCard key={t.id} trip={t} className="min-h-[420px]" />)}
          </div>
        ) : (
          <>
            <Pending label="Em desenvolvimento">
              As primeiras datas de Signature Day estão sendo planejadas e serão publicadas aqui. Deixe seu contato abaixo para ser avisado.
            </Pending>
            {upcoming.length > 0 && (
              <Link to="/expedicoes#proximas" className="btn-outline-dark mt-10">Ver todas as próximas saídas <Arrow /></Link>
            )}
          </>
        )}
      </EditorialSection>

      <EditorialSection tone="dark" label="03 / Como funciona" title="O dia, do encontro ao retorno.">
        <Timeline dark items={DAY_FLOW} />
      </EditorialSection>

      <EditorialSection
        label="04 / Seu veículo"
        title="Venha com o seu 4x4."
        intro="Cada data indica o nível do roteiro. Ele diz o que o terreno pede do veículo, não quais modelos são aceitos."
      >
        <VehicleReadiness consultHref="#consulta" />
      </EditorialSection>

      <EditorialSection
        id="consulta"
        tone="ivory"
        label="05 / Consulta"
        title="Quero viver um Signature Day."
        intro="Conte de onde você parte e qual é o seu veículo. Avisamos quando houver uma data que combine."
      >
        <LeadForm
          kind="signature_day"
          fields={FORM_FIELDS}
          submitLabel="Enviar consulta"
          event="submit_signature_day_lead"
          successTitle="Consulta enviada."
          successText="Recebemos seus dados e avisaremos sobre as próximas datas de Signature Day."
          className="max-w-3xl"
        />
      </EditorialSection>
    </>
  );
}
