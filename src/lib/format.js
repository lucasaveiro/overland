export const formatBRL = (v) =>
  Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
