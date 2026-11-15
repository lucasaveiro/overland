import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import topoSrc from "../../assets/brand/symbol-topo.webp";

export const cn = (...c) => c.filter(Boolean).join(" ");

/** Símbolo topográfico da marca como grafismo. A cor vem de `text-*`. */
export function Topo({ className = "", spin = false }) {
  return (
    <div
      aria-hidden="true"
      style={{ "--topo-src": `url(${topoSrc})` }}
      className={cn("topo absolute aspect-square", spin && "motion-safe:animate-topo-turn", className)}
    />
  );
}

/**
 * Entrada discreta: sobe poucos pixels, uma única vez. Ao rolar, usa o
 * observador do framer-motion. `immediate` é para o que já nasce na tela
 * (heros): animação em CSS puro, que não espera o JavaScript nem atrasa a
 * pintura do título.
 */
export function Reveal({ children, delay = 0, className = "", as = "div", immediate = false }) {
  const reduce = useReducedMotion();
  if (immediate) {
    const Plain = as;
    return (
      <Plain className={cn("motion-safe:animate-rise", className)} style={{ animationDelay: `${delay}s` }}>
        {children}
      </Plain>
    );
  }
  const Tag = motion[as] || motion.div;
  if (reduce) return <Tag className={className}>{children}</Tag>;
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.2, 0.6, 0.2, 1] }}
    >
      {children}
    </Tag>
  );
}

export function Arrow({ className = "" }) {
  return (
    <svg viewBox="0 0 24 12" aria-hidden="true" className={cn("h-3 w-6 flex-none", className)}>
      <path d="M0 6h22M17 1l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
