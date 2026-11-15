import React, { useState } from "react";

const inputClass = "w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--moss)] border-neutral-300";

// Listas viram texto com um item por linha; pares usam " | " entre as partes.
const toLines = (list) => (Array.isArray(list) ? list.join("\n") : "");
const fromLines = (text) => text.split("\n").map((l) => l.trim()).filter(Boolean);
const pairsToText = (list, a, b) => (Array.isArray(list) ? list.map((x) => (x[a] || "") + " | " + (x[b] || "")).join("\n") : "");
const textToPairs = (text, a, b) =>
  fromLines(text).map((line) => {
    const [first, ...rest] = line.split("|");
    return { [a]: first.trim(), [b]: rest.join("|").trim() };
  });

/** Tira campos vazios: dossiê em branco vira {} e a página não mostra nada. */
export function cleanDetails(details) {
  const out = {};
  Object.entries(details || {}).forEach(([k, v]) => {
    if (Array.isArray(v) ? v.length : v !== "" && v != null && v !== false) out[k] = v;
  });
  return out;
}

const TEXT_FIELDS = [
  ["meeting", "Região de encontro", "Ex.: Posto X, Passos / MG"],
  ["distance", "Distância estimada", "Ex.: 180 km, sendo 120 km de terra"],
  ["terrain", "Tipo de terreno", "Ex.: Estrada de terra, cascalho e travessias rasas"],
  ["experience", "Experiência prévia recomendada", "Ex.: Não exige experiência off-road"],
  ["vehicles", "Veículos previstos", "Ex.: Até 8 veículos"],
  ["lodging", "Hospedagem", "Ex.: Pousada em quarto duplo"],
];

/**
 * Campos do dossiê do roteiro, gravados em trips.details. Todos opcionais: a
 * página pública só mostra o que estiver preenchido.
 */
export default function DossierFields({ value, onChange }) {
  const details = value || {};
  const [open, setOpen] = useState(Object.keys(details).length > 0);
  const set = (patch) => onChange({ ...details, ...patch });

  return (
    <fieldset className="rounded-xl border border-neutral-200 p-3">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between text-left text-sm font-medium" aria-expanded={open}>
        Dossiê do roteiro (opcional)
        <span className="text-xs text-neutral-500">{open ? "Recolher" : "Preencher"}</span>
      </button>
      {open && (
        <div className="mt-3 grid gap-3">
          <p className="text-xs text-neutral-500">
            Requer a coluna <code>details</code> na tabela trips (ver db/schema.sql). O que ficar em branco não aparece no site.
          </p>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block font-medium">Tipo de experiência</span>
              <select className={inputClass} value={details.kind || ""} onChange={(e) => set({ kind: e.target.value })}>
                <option value="">Não definido</option>
                <option value="day">Off Day (um dia)</option>
                <option value="expedition">Signature Expedition (vários dias)</option>
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium">Duração em dias</span>
              <input type="number" min="1" className={inputClass} value={details.duration_days || ""} onChange={(e) => set({ duration_days: e.target.value ? Number(e.target.value) : "" })} />
            </label>
            {TEXT_FIELDS.map(([key, label, placeholder]) => (
              <label key={key} className="text-sm">
                <span className="mb-1 block font-medium">{label}</span>
                <input className={inputClass} value={details[key] || ""} placeholder={placeholder} onChange={(e) => set({ [key]: e.target.value })} />
              </label>
            ))}
          </div>
          <LinesField label="Incluso — um item por linha" value={toLines(details.included)} onChange={(t) => set({ included: fromLines(t) })} />
          <LinesField label="Não incluso — um item por linha" value={toLines(details.excluded)} onChange={(t) => set({ excluded: fromLines(t) })} />
          <LinesField
            label="Roteiro dia a dia — uma linha por dia: Título | Descrição"
            placeholder="Encontro e partida | Encontro às 7h, briefing e saída em comboio."
            value={pairsToText(details.days, "title", "text")}
            onChange={(t) => set({ days: textToPairs(t, "title", "text") })}
          />
          <LinesField
            label="Perguntas frequentes — uma por linha: Pergunta | Resposta"
            placeholder="Posso levar crianças? | Sim, desde que..."
            value={pairsToText(details.faq, "q", "a")}
            onChange={(t) => set({ faq: textToPairs(t, "q", "a") })}
          />
        </div>
      )}
    </fieldset>
  );
}

// Guarda o texto digitado em estado próprio: reformatar a cada tecla a partir
// da lista já limpa apagaria a linha em branco que a pessoa acabou de abrir.
function LinesField({ label, value, onChange, placeholder }) {
  const [text, setText] = useState(value);
  return (
    <label className="text-sm">
      <span className="mb-1 block font-medium">{label}</span>
      <textarea rows={4} className={inputClass} value={text} placeholder={placeholder}
        onChange={(e) => { setText(e.target.value); onChange(e.target.value); }} />
    </label>
  );
}
