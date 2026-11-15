import React from "react";
import { useSeo } from "../lib/seo.js";
import LeadForm, { FIELD } from "../components/site/LeadForm.jsx";
import { CinematicHero, EditorialSection, Pending, Pillars, Timeline } from "../components/site/blocks.jsx";
import { Arrow } from "../components/site/ui.jsx";

const SOLUTIONS = [
  ["Automotive Customer Experience", "Expedições, encontros e experiências para clientes e comunidades de veículos."],
  ["Brand Activation & Launch", "Apresentações de produtos e ativações automotivas realizadas em ambientes planejados."],
  ["Content Production", "Produção de fotografias, filmes e materiais para campanhas, realizada em operações e ambientes adequados."],
];

const PROCESS = [
  { title: "Diagnóstico do objetivo comercial" },
  { title: "Conceito criativo e proposta" },
  { title: "Planejamento operacional" },
  { title: "Produção da experiência" },
  { title: "Entregas e avaliação de resultados" },
];

const FORM_FIELDS = [
  FIELD.name,
  { name: "company", label: "Empresa", required: true, autoComplete: "organization" },
  { ...FIELD.email, label: "E-mail corporativo" },
  FIELD.whatsapp,
  { name: "project", label: "Tipo de projeto", required: true, options: [...SOLUTIONS.map(([t]) => t), "Outro"] },
  { name: "region", label: "Local ou região pretendida" },
  { name: "participants", label: "Número aproximado de participantes" },
  { name: "period", label: "Período desejado" },
  { name: "budget", label: "Orçamento estimado", full: true },
  { name: "goal", label: "Descrição do objetivo", type: "textarea", required: true },
];

export default function ParaMarcasPage() {
  useSeo({
    title: "Brand Experience",
    description: "Experiências de marca, relacionamento e produção de conteúdo no universo off-road para montadoras, concessionárias e empresas.",
  });

  return (
    <>
      <CinematicHero
        tall
        eyebrow="OffXpedition Brand Experience"
        title={<>Beyond exposure. <span className="block">Create an experience.</span></>}
        text="Transformamos o universo off-road em experiências de marca, relacionamento e produção de conteúdo."
      >
        <a href="#proposta" className="btn-brand">Solicitar proposta <Arrow /></a>
      </CinematicHero>

      <EditorialSection
        label="01 / Soluções"
        title="Três formas de trabalhar com a sua marca."
        intro="Para marketing, concessionárias, fabricantes e distribuidores que querem colocar clientes e produtos em contato real com o off-road."
      >
        <Pillars items={SOLUTIONS} />
      </EditorialSection>

      <EditorialSection tone="dark" label="02 / Nosso processo" title="Do objetivo ao resultado.">
        <Timeline dark labelPrefix="Fase " items={PROCESS} />
      </EditorialSection>

      <EditorialSection tone="ivory" label="03 / Cases" title="Portfólio.">
        <Pending label="Em construção">
          Os cases serão publicados aqui conforme os projetos forem concluídos e autorizados pelos contratantes: desafio da
          marca, solução, operação, material audiovisual e indicadores.
        </Pending>
      </EditorialSection>

      <EditorialSection
        id="proposta"
        label="04 / Proposta"
        title="Vamos desenhar o seu projeto."
        intro="Conte o objetivo e o contexto. A equipe comercial retorna com os próximos passos."
      >
        <LeadForm
          kind="brand"
          fields={FORM_FIELDS}
          submitLabel="Iniciar projeto com a OffXpedition"
          event="submit_brand_lead"
          successTitle="Solicitação recebida."
          successText="Recebemos o seu briefing. A equipe comercial da OffXpedition entrará em contato."
          className="max-w-4xl"
        />
      </EditorialSection>
    </>
  );
}
