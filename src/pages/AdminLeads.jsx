import React, { useEffect, useState } from "react";
import { Card, CardContent } from "./Admin.jsx";

const API_LEADS = "/.netlify/functions/leads";
const KIND = { brand: "Marcas", club: "Club", films: "Films", signature_day: "Signature Day" };
const STATUS = { novo: "Novo", em_contato: "Em contato", concluido: "Concluído" };

/** Solicitações comerciais recebidas pelos formulários do site. */
export default function LeadsSection() {
  const [leads, setLeads] = useState(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetch(API_LEADS, { credentials: "include" })
      .then(async (r) => (r.ok ? r.json() : Promise.reject((await r.json().catch(() => ({}))).error)))
      .then(setLeads)
      .catch((e) => { setLeads([]); setError(typeof e === "string" ? e : "Falha ao carregar."); });
  }, []);

  const setStatus = async (lead, status) => {
    const res = await fetch(API_LEADS, { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: lead.id, status }) });
    if (res.ok) { const data = await res.json(); setLeads((prev) => prev.map((l) => (l.id === data.id ? data : l))); }
    else alert("Falha ao atualizar o status.");
  };

  const shown = (leads || []).filter((l) => !filter || l.kind === filter);

  return (
    <Card className="mt-8 border shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 pb-2">
        <div className="text-base font-semibold">Solicitações comerciais</div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-xl border border-neutral-300 px-3 py-1.5 text-sm">
          <option value="">Todas</option>
          {Object.entries(KIND).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>
      <CardContent>
        {leads === null ? <p className="text-sm text-neutral-600">Carregando…</p>
          : error ? <p className="text-sm text-red-700">Não foi possível carregar ({error}). Se a tabela <code>leads</code> ainda não existe, rode o db/schema.sql no Supabase.</p>
          : shown.length === 0 ? <p className="text-sm text-neutral-600">Nada por aqui.</p>
          : (
            <ul className="divide-y">
              {shown.map((l) => (
                <li key={l.id} className="py-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="mr-2 rounded bg-neutral-900 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white">{KIND[l.kind] || l.kind}</span>
                      <span className="font-medium">{l.name}</span>
                      {l.company && <span className="text-neutral-600"> · {l.company}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-neutral-500">{new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(l.created_at))}</span>
                      <select value={l.status} onChange={(e) => setStatus(l, e.target.value)} className="rounded-lg border border-neutral-300 px-2 py-1 text-xs">
                        {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="mt-1 text-neutral-700">
                    <a className="underline" href={"mailto:" + l.email}>{l.email}</a>
                    {l.whatsapp && <> · {l.whatsapp}</>}
                  </div>
                  {Object.keys(l.details || {}).length > 0 && (
                    <dl className="mt-2 grid gap-x-6 gap-y-1 text-neutral-700 md:grid-cols-2">
                      {Object.entries(l.details).map(([k, v]) => (
                        <div key={k}><dt className="inline text-neutral-500">{k}: </dt><dd className="inline whitespace-pre-wrap">{v}</dd></div>
                      ))}
                    </dl>
                  )}
                  {Object.keys(l.source || {}).length > 0 && (
                    <p className="mt-1 text-xs text-neutral-500">Origem: {Object.entries(l.source).map(([k, v]) => k + "=" + v).join(" · ")}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
      </CardContent>
    </Card>
  );
}
