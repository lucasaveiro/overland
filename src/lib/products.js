/**
 * Categorias do marketplace de afiliados. Assim como os níveis, o valor é
 * gravado em products.category, então mudar uma string exige atualizar as
 * linhas já salvas no banco.
 */
export const PRODUCT_CATEGORIES = [
  { value: "Offroad", badgeClass: "bg-[var(--moss)] text-white" },
  { value: "Camping", badgeClass: "bg-[var(--brown)] text-white" },
  { value: "Viagem", badgeClass: "bg-neutral-700 text-white" },
];

export const CATEGORY_VALUES = PRODUCT_CATEGORIES.map((c) => c.value);

export const categoryBadgeFor = (value) =>
  PRODUCT_CATEGORIES.find((c) => c.value === value)?.badgeClass ?? "bg-neutral-500 text-white";
