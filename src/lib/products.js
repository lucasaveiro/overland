/**
 * Taxonomia da loja. `value` e as subcategorias são gravados em
 * products.category / products.subcategory, então mudar uma string exige
 * atualizar as linhas já salvas no banco — não é só texto de tela.
 *
 * Dados puros de propósito: o ícone é uma chave que a página resolve para o
 * componente, para este módulo não depender de React.
 */
export const PRODUCT_TAXONOMY = [
  {
    value: "Offroad",
    icon: "truck",
    blurb: "O que tira o carro do atoleiro e o traz inteiro de volta.",
    badgeClass: "bg-[var(--moss)] text-white",
    subcategories: [
      "Recuperação e resgate",
      "Pneus e rodas",
      "Proteção e para-choques",
      "Iluminação auxiliar",
      "Suspensão e chassi",
      "Ferramentas e manutenção",
    ],
  },
  {
    value: "Camping",
    icon: "tent",
    blurb: "Para a parada valer tanto quanto o caminho.",
    badgeClass: "bg-[var(--brown)] text-white",
    subcategories: [
      "Barracas e abrigos",
      "Dormir e descanso",
      "Cozinha de campo",
      "Energia e iluminação",
      "Mesas e cadeiras",
      "Higiene e conforto",
    ],
  },
  {
    value: "Viagem",
    icon: "compass",
    blurb: "Bagagem, energia e navegação para a estrada longa.",
    badgeClass: "bg-neutral-700 text-white",
    subcategories: [
      "Bagageiros e racks",
      "Malas e organização",
      "Navegação e comunicação",
      "Refrigeração e água",
      "Eletrônicos de bordo",
      "Segurança e primeiros socorros",
    ],
  },
];

export const CATEGORY_VALUES = PRODUCT_TAXONOMY.map((c) => c.value);

export const findCategory = (value) => PRODUCT_TAXONOMY.find((c) => c.value === value) ?? null;

export const subcategoriesOf = (value) => findCategory(value)?.subcategories ?? [];

export const categoryBadgeFor = (value) =>
  findCategory(value)?.badgeClass ?? "bg-neutral-500 text-white";
