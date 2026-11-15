import React from "react";
import { Link } from "react-router-dom";
import { LEVELS } from "../lib/levels.js";
import { useSeo } from "../lib/seo.js";
import { CinematicHero } from "../components/site/blocks.jsx";
import { Arrow, Reveal } from "../components/site/ui.jsx";

// O que mais muda a capacidade do veículo, em ordem de efeito prático.
const PREPARATION = [
  ["Pneus", "É a preparação que mais muda o comportamento fora do asfalto. Pneus de uso misto (AT) em bom estado já resolvem a maior parte dos roteiros."],
  ["Altura e proteções", "Altura livre do solo e proteções inferiores evitam danos em erosões, pedras e travessias."],
  ["Recuperação", "Pontos de reboque firmes e equipamento básico de resgate dão segurança a você e ao comboio."],
  ["Quem dirige", "Experiência conta tanto quanto o equipamento. Se for a sua primeira vez, avise: o grupo é conduzido no ritmo de todos."],
];

export default function Prepare4x4Page() {
  useSeo({
    title: "Prepare seu 4x4",
    description: "Os níveis de roteiro da OffXpedition e o que cada um pede do veículo. O que conta é a preparação, não o modelo.",
  });

  return (
    <>
      <CinematicHero
        eyebrow="Passeios / Prepare seu 4x4"
        title="O nível é do roteiro, não do carro."
        text="Cada expedição indica um nível de 1 a 4. Ele descreve o terreno e o que o veículo precisa ter — não uma lista de modelos aceitos."
      />

      <section className="section bg-white">
        <div className="site-container grid gap-10 lg:grid-cols-12 lg:gap-8">
          <Reveal className="lg:col-span-6">
            <p className="eyebrow text-brand-ink">01 / Como ler os níveis</p>
            <h2 className="h2 mt-5">O que conta é a preparação.</h2>
          </Reveal>
          <Reveal delay={0.08} className="lg:col-span-5 lg:col-start-8 lg:pt-10">
            <p className="lead text-carbon/80">
              Um SUV com boa preparação — pneus adequados, altura e proteções — pode acompanhar roteiros de nível médio.
              E um 4x4 grande, de fábrica e sem preparo, pode não ser o bastante para um roteiro pesado.
            </p>
            <p className="lead mt-5 font-semibold text-carbon">
              Por isso a confirmação é sempre da organização, que avalia o seu veículo antes da saída.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section bg-ivory">
        <div className="site-container">
          <Reveal>
            <p className="eyebrow text-brand-ink">02 / Os quatro níveis</p>
            <h2 className="h2 mt-5">Do leve ao extremo.</h2>
          </Reveal>
          <ol className="mt-12 border-t border-carbon/20 lg:mt-16">
            {LEVELS.map((level, i) => (
              <Reveal as="li" key={level.title} delay={i * 0.05} className="grid gap-6 border-b border-carbon/20 py-10 lg:grid-cols-12 lg:gap-8 lg:py-14">
                <div className="lg:col-span-4">
                  <p className="meta text-brand-ink">{level.label}</p>
                  <h3 className="display mt-2 text-[44px] lg:text-[64px]">{level.name}</h3>
                </div>
                <div className="lg:col-span-4">
                  <p className="meta text-carbon/50">O terreno</p>
                  <p className="mt-3 text-[17px] leading-relaxed text-carbon/85">{level.profile}</p>
                </div>
                <div className="lg:col-span-4">
                  <p className="meta text-carbon/50">O que pede do veículo</p>
                  <ul className="mt-3 space-y-2">
                    {level.requirements.map((r) => (
                      <li key={r} className="flex gap-3 text-[15px] leading-relaxed text-carbon/85">
                        <span className="mt-[9px] h-1.5 w-1.5 flex-none rounded-full bg-brand-deep" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="section bg-carbon text-white">
        <div className="site-container">
          <Reveal>
            <p className="eyebrow text-brand">03 / Preparação</p>
            <h2 className="h2 mt-5">O que faz mais diferença.</h2>
          </Reveal>
          <ol className="mt-12 grid gap-x-10 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
            {PREPARATION.map(([title, text], i) => (
              <Reveal as="li" key={title} delay={i * 0.06} className="border-t border-white/20 py-7">
                <span className="meta text-brand">0{i + 1} /</span>
                <h3 className="h3 mt-3 text-[26px]">{title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-white/70">{text}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="section bg-white">
        <div className="site-container flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <Reveal>
            <p className="eyebrow text-brand-ink">Na dúvida</p>
            <h2 className="h2 mt-5 max-w-[18ch]">Escolha o roteiro e consulte a organização.</h2>
            <p className="lead mt-5 max-w-xl text-carbon/75">
              Na página de cada expedição você envia seus dados, e a organização entra em contato para avaliar o veículo caso a caso.
            </p>
          </Reveal>
          <Link to="/expedicoes" className="btn-dark flex-none">Ver expedições <Arrow /></Link>
        </div>
      </section>
    </>
  );
}
