import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useSeo } from "../lib/seo.js";
import { track } from "../lib/analytics.js";
import LeadForm, { FIELD } from "../components/site/LeadForm.jsx";
import { Pending, Timeline } from "../components/site/blocks.jsx";
import { Arrow, Reveal, Topo } from "../components/site/ui.jsx";

const STEPS = [
  { title: "Captação", text: "Registro em campo durante a expedição." },
  { title: "Seleção de material", text: "Escolha dos momentos que contam a história da jornada." },
  { title: "Edição", text: "Montagem, cor e som." },
  { title: "Entrega", text: "O filme finalizado, para reviver e compartilhar." },
];

const FORM_FIELDS = [
  FIELD.name,
  FIELD.email,
  FIELD.whatsapp,
  { name: "expedition", label: "Expedição de interesse" },
  { name: "message", label: "O que você gostaria de registrar", type: "textarea" },
];

// Página mais minimalista e dramática que o restante do site: quase toda em
// carvão, muito espaço, um único destaque verde por tela.
export default function FilmsPage() {
  useSeo({
    title: "Films",
    description: "OffXpedition Films: filmes de expedição e produções personalizadas para reviver e compartilhar a sua jornada.",
  });
  useEffect(() => { track("view_films"); }, []);

  return (
    <div className="bg-carbon text-white">
      <section className="relative flex min-h-[calc(100svh-64px)] flex-col justify-end overflow-hidden lg:min-h-[calc(100svh-76px)]">
        <Topo spin className="left-1/2 top-1/2 w-[140vmin] -translate-x-1/2 -translate-y-1/2 text-white opacity-[0.045]" />
        <div className="site-container relative pb-16 pt-28 lg:pb-28">
          <Reveal immediate>
            <p className="eyebrow flex items-center gap-3 text-brand"><span className="h-px w-8 bg-brand" />OffXpedition Films</p>
          </Reveal>
          <Reveal immediate delay={0.1}>
            <h1 className="display mt-8 text-[56px] sm:text-[96px] lg:text-[144px]">
              Your journey. <span className="block text-white/45">Your story.</span>
            </h1>
          </Reveal>
          <Reveal immediate delay={0.2}>
            <p className="lead mt-8 max-w-xl text-white/75">
              Algumas experiências merecem mais do que fotografias. Transformamos momentos especiais da jornada em
              histórias audiovisuais para você reviver e compartilhar.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-white/10 py-20 lg:py-36">
        <div className="site-container">
          <p className="eyebrow text-white/50">Showcase</p>
          <div className="mt-8">
            <Pending dark label="Em breve">
              Os primeiros filmes serão exibidos aqui, sempre com autorização dos participantes.
            </Pending>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 py-20 lg:py-36">
        <div className="site-container grid gap-16 lg:grid-cols-2 lg:gap-24">
          <Reveal>
            <p className="eyebrow text-white/50">The Experience</p>
            <h2 className="h2 mt-6">Expedition Films</h2>
            <p className="lead mt-6 max-w-md text-white/70">
              Filmes das expedições, com narrativa sobre os destinos, participantes e momentos da viagem.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="eyebrow text-white/50">Personal Film</p>
            <h2 className="h2 mt-6">Your Expedition Film</h2>
            <p className="lead mt-6 max-w-md text-white/70">
              Produções personalizadas nas quais o participante, sua família e seu veículo recebem atenção individual.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-white/10 py-20 lg:py-36">
        <div className="site-container grid gap-12 lg:grid-cols-12 lg:gap-8">
          <Reveal className="lg:col-span-4">
            <p className="eyebrow text-white/50">How It Works</p>
            <h2 className="h2 mt-6">Da estrada à tela.</h2>
            <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-white/55">
              Prazos e escopo de cada produção serão publicados quando estiverem definidos.
            </p>
          </Reveal>
          <div className="lg:col-span-7 lg:col-start-6">
            <Timeline dark items={STEPS} />
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 py-20 lg:py-28">
        <div className="site-container flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <Reveal>
            <p className="eyebrow text-white/50">Brand Content</p>
            <h2 className="h2 mt-6 max-w-[18ch]">Conteúdo para marcas e campanhas.</h2>
          </Reveal>
          <Link to="/para-marcas" className="btn-outline-light flex-none">Conhecer Brand Experience <Arrow /></Link>
        </div>
      </section>

      <section id="registrar" className="section bg-ivory text-carbon">
        <div className="site-container grid gap-12 lg:grid-cols-12 lg:gap-8">
          <Reveal className="lg:col-span-5">
            <p className="eyebrow text-brand-ink">Seu filme</p>
            <h2 className="h2 mt-5">Quero registrar minha próxima expedição.</h2>
            <p className="lead mt-6 text-carbon/75">
              Conte qual expedição você pretende fazer e o que gostaria de registrar. Retornamos com as possibilidades.
            </p>
          </Reveal>
          <div className="lg:col-span-6 lg:col-start-7">
            <LeadForm
              kind="films"
              fields={FORM_FIELDS}
              submitLabel="Enviar solicitação"
              event="request_personal_film"
              successText="Recebemos sua solicitação e entraremos em contato sobre o seu filme."
            />
          </div>
        </div>
      </section>
    </div>
  );
}
