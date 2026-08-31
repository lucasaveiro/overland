/**
 * A taxonomia agora vive no banco (tabelas categories / subcategories) e é
 * gerenciada pelo admin. Aqui ficam só os mapas de apresentação: a categoria
 * guarda uma chave de ícone e uma de cor, e quem resolve para componente ou
 * classe é o front.
 */

export const CATEGORY_ICONS = [
  { value: "truck", label: "Caminhonete" },
  { value: "tent", label: "Barraca" },
  { value: "compass", label: "Bússola" },
  { value: "mountain", label: "Montanha" },
  { value: "wrench", label: "Chave" },
  { value: "zap", label: "Energia" },
  { value: "package", label: "Caixa" },
  { value: "shopping-bag", label: "Sacola" },
];

export const CATEGORY_COLORS = [
  { value: "moss", label: "Verde musgo", badgeClass: "bg-[var(--moss)] text-white" },
  { value: "brown", label: "Marrom", badgeClass: "bg-[var(--brown)] text-white" },
  { value: "neutral", label: "Grafite", badgeClass: "bg-neutral-700 text-white" },
  { value: "blue", label: "Azul", badgeClass: "bg-blue-600 text-white" },
  { value: "amber", label: "Âmbar", badgeClass: "bg-amber-500 text-black" },
  { value: "black", label: "Preto", badgeClass: "bg-black text-white" },
];

export const colorClassFor = (key) =>
  CATEGORY_COLORS.find((c) => c.value === key)?.badgeClass ?? "bg-neutral-500 text-white";

/** Mesma regra do servidor, para prever o slug enquanto o admin digita. */
export const slugify = (s) =>
  String(s || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
