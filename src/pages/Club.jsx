import React from "react";
import { useSeo } from "../lib/seo.js";
import LeadForm, { FIELD } from "../components/site/LeadForm.jsx";
import { CinematicHero, EditorialSection, Pillars } from "../components/site/blocks.jsx";
import { Arrow, Reveal } from "../components/site/ui.jsx";

// O Club abre só com a lista de interesse. As fases seguintes aparecem como
// planejamento, com rótulo explícito, para não anunciar o que ainda não existe.
const PHASES = [
  ["Comunidade", "Lista de interesse, conteúdos e relacionamento com quem viaja com a OffXpedition.", "Fase 1 / Aberta"],
  ["Benefícios", "Eventos específicos, acesso antecipado às expedições e parcerias.", "Fase 2 / Planejada"],
  ["Membership", "Assinatura com benefícios recorrentes, quando houver estrutura e demanda para isso.", "Fase 3 / Futura"],
];

const FORM_FIELDS = [
  FIELD.name,
  FIELD.email,
  FIELD.whatsapp,
  { name: "vehicle", label: "Seu veículo", placeholder: "Ex.: Ranger Limited 2023" },
];

export default function ClubPage() {
  useSeo({
    title: "Club",
    description: "OffXpedition Club: o relacionamento contínuo com a marca entre uma expedição e outra. Entre na lista de interesse.",
  });

  return (
    <>
      <CinematicHero
        tall
        eyebrow="OffXpedition Club"
        title={<>The journey <span className="block">doesn't end here.</span></>}
        text="O Club é o relacionamento mais próximo com a OffXpedition: o que continua entre uma expedição e a seguinte."
      >
        <a href="#lista" className="btn-brand">Entrar na lista de interesse <Arrow /></a>
      </CinematicHero>

      <section className="section bg-white">
        <div className="site-container grid gap-10 lg:grid-cols-12 lg:gap-8">
          <Reveal className="lg:col-span-6">
            <p className="eyebrow text-brand-ink">01 / Pertencimento</p>
            <h2 className="display mt-6 text-[44px] sm:text-[64px] lg:text-[88px]">Mais que a próxima viagem.</h2>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-5 lg:col-start-8 lg:pt-16">
            <p className="lead text-carbon/80">
              Uma expedição cria vínculos: com os lugares, com o grupo e com a forma de viajar. O Club existe para manter
              esse vínculo vivo — um círculo reservado para quem compartilha a mesma maneira de explorar.
            </p>
          </Reveal>
        </div>
      </section>

      <EditorialSection
        tone="dark"
        label="02 / Evolução"
        title="Construído em etapas."
        intro="O Club começa pela comunidade. Cada etapa seguinte só é aberta quando estiver pronta para ser entregue."
      >
        <Pillars dark items={PHASES} />
      </EditorialSection>

      <EditorialSection
        id="lista"
        tone="ivory"
        label="03 / Lista de interesse"
        title="Seja avisado primeiro."
        intro="Entrar na lista não tem custo nem compromisso. É por ela que as novidades do Club serão comunicadas."
      >
        <LeadForm
          kind="club"
          fields={FORM_FIELDS}
          submitLabel="Entrar na lista de interesse"
          event="join_club_waitlist"
          successTitle="Você está na lista."
          successText="Avisaremos por aqui sobre as novidades do OffXpedition Club."
          className="max-w-3xl"
        />
      </EditorialSection>
    </>
  );
}
