import nivel1 from "../assets/niveis/nivel-1.jpg";
import nivel2 from "../assets/niveis/nivel-2.jpg";
import nivel3 from "../assets/niveis/nivel-3.jpg";
import nivel4 from "../assets/niveis/nivel-4.jpg";

/**
 * Fonte única dos níveis. O `title` é gravado em trips.difficulty pelo admin,
 * então mudar essas strings exige atualizar as linhas já salvas no banco —
 * não é só texto de tela.
 */
export const LEVELS = [
  {
    title: "Nível 1 – SUV/Leve",
    badgeClass: "bg-blue-600 text-white",
    image: nivel1,
    imageAlt: "Jeep Renegade Trailhawk em estrada de terra bem conservada, ao entardecer",
    profile:
      "Veículos com tração 4x4 ou AWD, mas projetados para conforto e uso predominantemente urbano, com alguma aptidão em estradas de terra e pisos irregulares. Limitados em ângulos de ataque/saída e altura livre do solo.",
    requirements: [
      "Tração AWD ou 4x4 sob demanda (muitas vezes sem reduzida real).",
      "Altura livre do solo entre 18–22 cm.",
      "Pneus de uso misto ou mais voltados para asfalto.",
      "Suspensão confortável, mas não reforçada para impactos severos.",
      "Sem proteções robustas de fábrica (skid plates, para-choques off-road).",
      "Sistema eletrônico de tração (controle de descida, terrain select), mas sem bloqueios mecânicos.",
    ],
    examples:
      "Jeep Renegade 4x4 - Jeep Compass 4x4 - Mitsubishi ASX 4x4 - Jeep Commander 4x4 - Fiat Toro 4x4",
  },
  {
    title: "Nível 2 – 4x4 Médio",
    badgeClass: "bg-green-600 text-white",
    image: nivel2,
    imageAlt: "Toyota Hilux SRV atravessando um rio raso de leito pedregoso",
    profile:
      "Veículos que equilibram uso rodoviário e off-road, aptos para trilhas médias, areia, lama leve e travessias rasas. Já contam com reduzida, estrutura mais robusta e altura livre superior.",
    requirements: [
      "Tração 4x4 com caixa de redução.",
      "Altura livre do solo 22–24 cm.",
      "Chassi mais robusto (monobloco reforçado ou chassi sobre longarinas).",
      "Pneus AT de fábrica ou facilmente adaptáveis.",
      "Ângulos de ataque/saída medianos.",
      "Recursos como controle de descida e modos de terreno.",
      "Sem bloqueios diferenciais mecânicos (ou apenas traseiro eletrônico opcional).",
    ],
    examples:
      "- Ram Rampage 4x4 - Chevrolet S10 LS/LT/LTZ - Mitsubishi L200 Triton GLX/GLS/Outdoor - Toyota Hilux SR/SRV - Nissan Frontier S/SE/XE - Volkswagen Amarok Comfortline/Highline - Pajero TR4 4x4 - Fiat Titano Volcano/Ranch",
  },
  {
    title: "Nível 3 – 4x4 Pesado",
    badgeClass: "bg-yellow-400 text-black",
    image: nivel3,
    imageAlt: "Ford Ranger vencendo um degrau rochoso em trilha de montanha",
    profile:
      "Veículos preparados de fábrica ou facilmente adaptáveis para trilhas pesadas e expedições, com boa articulação de suspensão, altura livre elevada, bloqueios diferenciais opcionais e grande robustez mecânica.",
    requirements: [
      "Tração 4x4 com reduzida e bloqueio de diferencial (pelo menos traseiro).",
      "Altura livre do solo 24–27 cm.",
      "Chassi sobre longarinas ou monobloco extremamente reforçado.",
      "Ângulos de ataque/saída favoráveis.",
      "Capacidade de carga alta e tolerância a modificações (lift, pneus MT).",
      "Mecânica confiável para uso extremo.",
    ],
    examples:
      "Pajero Dakar - Chevrolet S10 HighCountry - Ford Ranger Storm/Limited - Ram 1500 - Ram 2500 - Nissan Frontier Attack/4Pro-X/Platinum - Mitsubishi L200 Triton Sport HPE-S - Toyota Hilux SRX - Volkswagen Amarok Extreme V6",
  },
  {
    title: "Nível 4 – Off-road Extremo",
    badgeClass: "bg-black text-white",
    image: nivel4,
    imageAlt: "Jeep Wrangler Rubicon com suspensão muito articulada sobre pedras e lama, na mata",
    profile:
      "Veículos com projeto ou preparo para enfrentar obstáculos severos, como pedras, lama profunda e subidas radicais, com máxima articulação e tração. São os mais indicados para aventuras pesadas e terrenos hostis.",
    requirements: [
      "Tração 4x4 com reduzida e bloqueio de diferencial dianteiro e traseiro.",
      "Altura livre do solo acima de 27 cm.",
      "Ângulos de ataque/saída máximos.",
      "Grande curso de suspensão e possibilidade de modificações severas.",
      "Construção extremamente robusta (eixo rígido na dianteira/traseira é comum).",
      "Pode ter snorkel, guincho, proteções integrais e pneus MT de fábrica ou instalados.",
    ],
    examples: "Suzuki Jimny 4x4 - Troller T4 - Jeep Wrangler",
  },
];

/** Opções do seletor de dificuldade no admin. */
export const LEVEL_TITLES = LEVELS.map((l) => l.title);

/** Classe do badge de dificuldade. Cinza para valor antigo ou desconhecido. */
export const badgeClassFor = (title) =>
  LEVELS.find((l) => l.title === title)?.badgeClass ?? "bg-neutral-500 text-white";
