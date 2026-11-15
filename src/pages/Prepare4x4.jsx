import React from "react";
import { LEVELS } from "../lib/levels.js";
import { Topo } from "../components/site/ui.jsx";
import { useSeo } from "../lib/seo.js";

export default function Prepare4x4Page() {
  useSeo({ title: "Prepare seu 4x4", description: "Níveis de roteiro e o que o seu 4x4 precisa ter para acompanhar cada expedição OffXpedition." });
  return (
    <>
      <section className="relative overflow-hidden bg-carbon text-white">
        <Topo className="-right-40 -top-56 w-[720px] text-white opacity-[0.06]" />
        <div className="site-container relative py-20 lg:py-32">
          <p className="eyebrow text-brand">Experiências / Prepare seu 4x4</p>
          <h1 className="h1-hero mt-6 max-w-[14ch] lg:text-[96px]">Níveis de roteiro e veículos.</h1>
          <p className="lead mt-6 max-w-xl text-white/75">
            Cada expedição indica um nível. Veja o que o seu 4x4 precisa ter para acompanhar o roteiro com tranquilidade.
          </p>
        </div>
      </section>

      <section className="bg-white">
        <div className="site-container">
          {LEVELS.map((level, i) => {
            const [nivel, nome] = level.title.split(" – ");
            return (
              <article key={level.title} className="grid gap-8 border-b border-carbon/15 py-14 lg:grid-cols-12 lg:gap-12 lg:py-24">
                <div className={i % 2 ? "lg:order-2 lg:col-span-6" : "lg:col-span-6"}>
                  <img src={level.image} alt={level.imageAlt} loading="lazy" className="aspect-[16/10] w-full rounded-[4px] object-cover" />
                </div>
                <div className="lg:col-span-6">
                  <p className="eyebrow text-brand-ink">{nivel}</p>
                  <h2 className="h2 mt-4 lg:text-[56px]">{nome || level.title}</h2>
                  <p className="lead mt-5 text-carbon/75">{level.profile}</p>
                  <ul className="mt-7 border-t border-carbon/15">
                    {level.requirements.map((r) => (
                      <li key={r} className="flex gap-4 border-b border-carbon/10 py-3 text-[15px] text-carbon/85">
                        <span className="mt-[9px] h-1.5 w-1.5 flex-none rounded-full bg-brand-deep" />
                        {r}
                      </li>
                    ))}
                  </ul>
                  <p className="meta mt-6 text-carbon/50">Exemplos</p>
                  <p className="mt-2 text-[15px] leading-relaxed text-carbon/75">{level.examples.replace(/^- /, "").split(" - ").join(" · ")}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}
