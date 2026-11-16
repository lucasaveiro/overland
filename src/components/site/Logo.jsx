import React from "react";
import { cn } from "./ui.jsx";

/**
 * Logotipo OffXpedition: Barlow Condensed em caixa alta, a mesma dos títulos,
 * com o X desenhado — duas trilhas que se cruzam, uma passando sobre a outra.
 * O tamanho vem de `text-*` e a cor das letras de `text-*` do contexto; o X é
 * sempre o verde da marca.
 */
export function LogoX({ className = "" }) {
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" className={cn("fill-brand", className)}>
      <polygon points="0,0 24,0 45,27.6 33,43.4" />
      <polygon points="55,72.4 67,56.6 100,100 76,100" />
      <polygon points="76,0 100,0 24,100 0,100" />
    </svg>
  );
}

export default function Logo({ className = "" }) {
  return (
    <span
      role="img"
      aria-label="OffXpedition"
      className={cn(
        "inline-flex items-baseline whitespace-nowrap font-display font-bold uppercase leading-none tracking-[0.035em]",
        className
      )}
    >
      <span aria-hidden="true">Off</span>
      <LogoX className="mx-[0.07em] h-[0.7em] w-[0.6em] flex-none" />
      <span aria-hidden="true">pedition</span>
    </span>
  );
}
