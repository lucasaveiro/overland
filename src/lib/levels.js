/**
 * Fonte única dos níveis de roteiro. O `title` é gravado em trips.difficulty
 * pelo admin, então mudar essas strings exige atualizar as linhas já salvas no
 * banco — não é só texto de tela. Por isso o site mostra `label` + `name`
 * ("Nível 2 · Médio") e o `title` antigo fica só como chave.
 *
 * O nível descreve o que o roteiro exige do veículo, não uma lista de modelos:
 * um SUV bem preparado pode acompanhar um roteiro médio, e um 4x4 de fábrica
 * sem preparo pode não bastar para um pesado.
 */
export const LEVELS = [
  {
    title: "Nível 1 – SUV/Leve",
    label: "Nível 1",
    name: "Leve",
    profile: "Estradas de terra conservadas e pisos irregulares, sem obstáculos técnicos.",
    requirements: [
      "Tração 4x4 ou AWD.",
      "Altura livre do solo a partir de 18 cm.",
      "Pneus em bom estado, de uso misto ou asfalto.",
    ],
  },
  {
    title: "Nível 2 – 4x4 Médio",
    label: "Nível 2",
    name: "Médio",
    profile: "Trilhas médias, areia, lama leve e travessias rasas.",
    requirements: [
      "Tração 4x4, de preferência com reduzida.",
      "Altura livre do solo a partir de 22 cm, de fábrica ou com preparação.",
      "Pneus de uso misto (AT).",
    ],
  },
  {
    title: "Nível 3 – 4x4 Pesado",
    label: "Nível 3",
    name: "Pesado",
    profile: "Trilhas pesadas e expedições longas, com erosões, degraus e subidas íngremes.",
    requirements: [
      "Tração 4x4 com reduzida.",
      "Bloqueio de diferencial, ao menos no eixo traseiro.",
      "Altura livre do solo a partir de 24 cm.",
      "Pneus de uso misto (AT) ou lama (MT).",
    ],
  },
  {
    title: "Nível 4 – Off-road Extremo",
    label: "Nível 4",
    name: "Extremo",
    profile: "Obstáculos severos: pedras, lama profunda e subidas radicais.",
    requirements: [
      "Tração 4x4 com reduzida e bloqueio de diferencial dianteiro e traseiro.",
      "Altura livre do solo acima de 27 cm.",
      "Pneus de lama (MT), guincho e proteções inferiores.",
    ],
  },
];

/** Opções do seletor de dificuldade no admin. */
export const LEVEL_TITLES = LEVELS.map((l) => l.title);

/** "Nível 2 – 4x4 Médio" → "Nível 2 · Médio". Valor antigo ou desconhecido volta como veio. */
export function levelShort(title) {
  const level = LEVELS.find((l) => l.title === title);
  return level ? `${level.label} · ${level.name}` : title || null;
}
