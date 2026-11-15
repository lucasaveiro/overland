import { useEffect } from "react";

const SITE = "OffXpedition";
const DEFAULT_DESCRIPTION =
  "Expedições 4x4 cuidadosamente planejadas para quem acredita que a verdadeira viagem vai muito além do destino.";

function setMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

/** Título, descrição e Open Graph próprios de cada página. */
export function useSeo({ title, description = DEFAULT_DESCRIPTION, image } = {}) {
  useEffect(() => {
    const full = title ? `${title} — ${SITE}` : `${SITE} — Expedições 4x4 premium`;
    document.title = full;
    setMeta("name", "description", description);
    setMeta("property", "og:title", full);
    setMeta("property", "og:description", description);
    setMeta("property", "og:type", "website");
    setMeta("property", "og:url", window.location.origin + window.location.pathname);
    if (image) setMeta("property", "og:image", image);
  }, [title, description, image]);
}
