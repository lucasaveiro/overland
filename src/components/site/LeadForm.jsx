import React, { useId, useState } from "react";
import { getSource, track } from "../../lib/analytics.js";
import { Arrow, cn } from "./ui.jsx";

const API_LEADS = "/.netlify/functions/leads";
const CORE = ["name", "email", "whatsapp", "company"];

export const FIELD = {
  name: { name: "name", label: "Nome", required: true, autoComplete: "name" },
  email: { name: "email", label: "E-mail", type: "email", required: true, autoComplete: "email" },
  whatsapp: { name: "whatsapp", label: "WhatsApp", type: "tel", autoComplete: "tel", placeholder: "(11) 98765-4321" },
};

/**
 * Formulário único de solicitações (marcas, Club, Films, Off Day).
 * `fields` descreve os campos; nome, e-mail, WhatsApp e empresa viram colunas
 * próprias e o restante segue em `details`, com o rótulo como chave, para a
 * equipe ler no admin sem precisar de dicionário.
 */
export default function LeadForm({ kind, fields, submitLabel, event, successTitle, successText, className = "" }) {
  const uid = useId();
  const [values, setValues] = useState({});
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);

  const set = (name, value) => setValues((v) => ({ ...v, [name]: value }));
  const missing = (f) => f.required && !String(values[f.name] || "").trim();

  const submit = async (e) => {
    e.preventDefault();
    setTouched(true);
    if (fields.some(missing)) { setStatus("error"); setError("Preencha os campos obrigatórios."); return; }
    if (!consent) { setStatus("error"); setError("Marque a autorização de contato para enviar."); return; }

    setStatus("sending"); setError("");
    const details = {};
    fields.filter((f) => !CORE.includes(f.name)).forEach((f) => {
      const v = String(values[f.name] || "").trim();
      if (v) details[f.label] = v;
    });
    try {
      const res = await fetch(API_LEADS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          name: values.name, email: values.email, whatsapp: values.whatsapp, company: values.company,
          details, source: getSource(), consent: true, website,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        // Mensagens 4xx são de validação e servem ao visitante; erro de
        // servidor não tem nada que ele possa usar.
        throw new Error(res.status < 500 && body.error ? body.error : "");
      }
      setStatus("sent");
      if (event) track(event, { lead_kind: kind });
    } catch (err) {
      setStatus("error");
      setError(err.message || "Não foi possível enviar agora. Tente novamente em instantes.");
    }
  };

  if (status === "sent") {
    return (
      <div role="status" className={cn("rounded-[4px] border border-carbon/15 bg-white p-8 lg:p-12", className)}>
        <span className="meta flex items-center gap-2 text-brand-ink"><span className="h-1.5 w-1.5 rounded-full bg-brand-deep" /> Recebido</span>
        <p className="h3 mt-4">{successTitle || "Solicitação enviada."}</p>
        <p className="mt-3 max-w-md text-[16px] leading-relaxed text-carbon/70">
          {successText || "Recebemos seus dados e entraremos em contato."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className={cn("rounded-[4px] border border-carbon/15 bg-white p-6 sm:p-8 lg:p-12", className)}>
      <div className="grid gap-5 sm:grid-cols-2">
        {fields.map((f) => {
          const id = `${uid}-${f.name}`;
          const invalid = touched && missing(f);
          const common = {
            id,
            value: values[f.name] || "",
            onChange: (e) => set(f.name, e.target.value),
            "aria-invalid": invalid || undefined,
            required: f.required,
            className: "field-input",
          };
          return (
            <div key={f.name} className={cn((f.full || f.type === "textarea") && "sm:col-span-2")}>
              <label htmlFor={id} className="field-label">
                {f.label}{!f.required && <span className="normal-case tracking-normal text-carbon/40"> · opcional</span>}
              </label>
              {f.type === "textarea" ? (
                <textarea {...common} rows={4} placeholder={f.placeholder} />
              ) : f.options ? (
                <select {...common}>
                  <option value="">Selecione</option>
                  {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input {...common} type={f.type || "text"} placeholder={f.placeholder} autoComplete={f.autoComplete}
                  inputMode={f.type === "tel" ? "tel" : undefined} />
              )}
            </div>
          );
        })}
      </div>

      {/* Campo-isca para robôs: fora da tela e fora da navegação por teclado. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>Website<input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} /></label>
      </div>

      <label className="mt-6 flex cursor-pointer items-start gap-3 text-[14px] leading-relaxed text-carbon/75">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-4 w-4 flex-none accent-[#1D8F06]" />
        Autorizo a OffXpedition a usar estes dados para responder a esta solicitação.
      </label>

      {status === "error" && (
        <p role="alert" className="mt-5 border-l-2 border-red-700 pl-3 text-[14px] text-red-800">{error}</p>
      )}

      <button type="submit" disabled={status === "sending"} className="btn-dark mt-7 w-full disabled:opacity-60 sm:w-auto">
        {status === "sending" ? "Enviando…" : submitLabel} <Arrow className="text-brand" />
      </button>
    </form>
  );
}
