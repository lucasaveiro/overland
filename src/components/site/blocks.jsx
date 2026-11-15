import React, { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { Reveal, Topo, cn } from "./ui.jsx";

/** Abertura das páginas internas: escura, tipografia grande, foto opcional. */
export function CinematicHero({ eyebrow, title, text, image, children, tall = false }) {
  return (
    <section className={cn("relative flex flex-col justify-end overflow-hidden bg-carbon text-white", tall ? "min-h-[78svh]" : "min-h-[56svh]")}>
      {image ? (
        <>
          <img src={image} alt="" fetchpriority="high" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-carbon via-carbon/55 to-carbon/20" />
        </>
      ) : (
        <Topo className="-right-48 -top-64 w-[820px] text-white opacity-[0.06]" />
      )}
      <div className="site-container relative pb-14 pt-24 lg:pb-24 lg:pt-36">
        <Reveal immediate>
          <p className="eyebrow flex items-center gap-3 text-brand"><span className="h-px w-8 bg-brand" />{eyebrow}</p>
        </Reveal>
        <Reveal immediate delay={0.08}>
          <h1 className="h1-hero mt-6 max-w-[16ch]">{title}</h1>
        </Reveal>
        {text && (
          <Reveal immediate delay={0.16}>
            <p className="lead mt-7 max-w-2xl text-white/80">{text}</p>
          </Reveal>
        )}
        {children && <Reveal immediate delay={0.24} className="mt-9 flex flex-col gap-3 sm:flex-row">{children}</Reveal>}
      </div>
    </section>
  );
}

/** Seção editorial: rótulo, título e conteúdo, em fundo claro ou escuro. */
export function EditorialSection({ id, label, title, intro, tone = "white", children, className = "" }) {
  const dark = tone === "dark";
  const bg = { white: "bg-white", ivory: "bg-ivory", dark: "bg-carbon text-white" }[tone];
  return (
    <section id={id} className={cn("section relative overflow-hidden", bg, className)}>
      <div className="site-container relative">
        <Reveal className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            {label && <p className={cn("eyebrow", dark ? "text-brand" : "text-brand-ink")}>{label}</p>}
            <h2 className="h2 mt-5">{title}</h2>
          </div>
          {intro && <p className={cn("lead lg:col-span-4 lg:col-start-9", dark ? "text-white/75" : "text-carbon/75")}>{intro}</p>}
        </Reveal>
        {children && <div className="mt-12 lg:mt-16">{children}</div>}
      </div>
    </section>
  );
}

/** Módulos numerados em colunas (pilares, soluções, fases de evolução). */
export function Pillars({ items, dark = false, columns = 3 }) {
  return (
    <ol className={cn("grid gap-x-10", columns === 3 ? "md:grid-cols-3" : columns === 2 ? "md:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-4")}>
      {items.map(([title, text, tag], i) => (
        <Reveal as="li" key={title} delay={i * 0.06} className={cn("border-t py-8", dark ? "border-white/20" : "border-carbon/20")}>
          <span className={cn("meta", dark ? "text-brand" : "text-brand-ink")}>{tag || `0${i + 1} /`}</span>
          <h3 className="h3 mt-3">{title}</h3>
          <p className={cn("mt-4 text-[16px] leading-relaxed", dark ? "text-white/70" : "text-carbon/70")}>{text}</p>
        </Reveal>
      ))}
    </ol>
  );
}

/**
 * Linha do tempo vertical. A linha verde acompanha a leitura: cresce conforme
 * a seção passa pela tela (e fica inteira para quem pediu menos movimento).
 */
export function Timeline({ items, dark = false, labelPrefix = "" }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  return (
    <ol ref={ref} className="relative">
      <span className={cn("absolute bottom-0 left-[5px] top-2 w-px", dark ? "bg-white/15" : "bg-carbon/15")} />
      <motion.span
        style={{ scaleY: reduce ? 1 : scaleY }}
        className={cn("absolute bottom-0 left-[5px] top-2 w-px origin-top", dark ? "bg-brand" : "bg-brand-deep")}
      />
      {items.map((item, i) => (
        <Reveal as="li" key={i} className="relative grid gap-3 pb-12 pl-10 last:pb-0 lg:grid-cols-12 lg:gap-8 lg:pl-14">
          <span className={cn("absolute left-0 top-2 h-[11px] w-[11px] rounded-full border-2", dark ? "border-brand bg-carbon" : "border-brand-deep bg-white")} />
          <p className={cn("meta lg:col-span-3", dark ? "text-brand" : "text-brand-ink")}>
            {labelPrefix}{String(i + 1).padStart(2, "0")}
          </p>
          <div className="lg:col-span-8">
            <h3 className="h3">{item.title}</h3>
            {item.text && <p className={cn("mt-3 max-w-2xl text-[16px] leading-relaxed", dark ? "text-white/70" : "text-carbon/75")}>{item.text}</p>}
          </div>
        </Reveal>
      ))}
    </ol>
  );
}

/** Perguntas frequentes com <details>: funciona por teclado e sem JavaScript. */
export function FAQAccordion({ items }) {
  return (
    <div className="border-t border-carbon/20">
      {items.map((item, i) => (
        <details key={i} className="group border-b border-carbon/20">
          <summary className="flex min-h-[64px] cursor-pointer list-none items-center justify-between gap-6 py-4 text-[17px] font-semibold [&::-webkit-details-marker]:hidden">
            {item.q}
            <span aria-hidden="true" className="relative h-4 w-4 flex-none">
              <span className="absolute left-0 top-[7px] h-[2px] w-4 bg-carbon" />
              <span className="absolute left-[7px] top-0 h-4 w-[2px] bg-carbon transition-transform duration-200 group-open:scale-y-0" />
            </span>
          </summary>
          <p className="max-w-3xl pb-6 text-[16px] leading-relaxed text-carbon/75">{item.a}</p>
        </details>
      ))}
    </div>
  );
}

/** Aviso de conteúdo ainda não publicado, no lugar de inventar material. */
export function Pending({ label = "Em desenvolvimento", children, dark = false }) {
  return (
    <div className={cn("border-y py-10 lg:grid lg:grid-cols-12 lg:gap-8", dark ? "border-white/20" : "border-carbon/15")}>
      <p className={cn("meta flex items-center gap-2 lg:col-span-4", dark ? "text-brand" : "text-brand-ink")}>
        <span className={cn("h-1.5 w-1.5 rounded-full", dark ? "bg-brand" : "bg-brand-deep")} /> {label}
      </p>
      <p className={cn("lead mt-4 lg:col-span-7 lg:mt-0", dark ? "text-white/80" : "text-carbon/80")}>{children}</p>
    </div>
  );
}
