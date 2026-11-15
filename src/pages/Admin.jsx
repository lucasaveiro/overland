import React, { forwardRef, useEffect, useRef, useState } from "react";
import { Pencil, Plus, Trash2, Image as ImageIcon, Save, X, Upload, ExternalLink, Users, ChevronDown, LogOut } from "lucide-react";
import { NumericFormat } from "react-number-format";
import { uploadImage, deleteUploadedImage, isUploadedImage } from "../lib/imageUpload.js";
import { LEVEL_TITLES } from "../lib/levels.js";
import { STATUS_LABEL, statusPatch, tripStatus } from "../lib/trips.js";
import CategoriesSection from "./AdminCategories.jsx";
import ProductsSection from "./AdminProducts.jsx";
import BannersSection from "./AdminBanners.jsx";
import LeadsSection from "./AdminLeads.jsx";
import DossierFields, { cleanDetails } from "./AdminTripDossier.jsx";

const API = {
  trips: "/.netlify/functions/trips",
  login: "/.netlify/functions/auth_login",
  me: "/.netlify/functions/auth_me",
  logout: "/.netlify/functions/auth_logout",
  registrations: "/.netlify/functions/registrations",
  products: "/.netlify/functions/products",
};

const cn = (...c) => c.filter(Boolean).join(" ");
export function Button({ className = "", variant = "primary", children, ...props }) {
  const base = "inline-flex h-9 items-center justify-center gap-1 rounded-lg border px-3.5 text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--moss)] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50";
  const variants = {
    primary: "bg-neutral-900 text-white hover:bg-neutral-700 border-transparent shadow-sm",
    secondary: "bg-white text-neutral-800 hover:bg-neutral-50 border-neutral-300 shadow-sm",
    destructive: "bg-white text-red-700 hover:bg-red-50 border-red-200 shadow-sm",
  };
  return <button className={cn(base, variants[variant], className)} {...props}>{children}</button>;
}

/** Grupo de ações de uma linha de tabela: botões colados, com um contorno só. */
export function RowActions({ children }) {
  return (
    <div className="inline-flex items-stretch overflow-hidden rounded-lg border border-neutral-300 bg-white align-middle shadow-sm divide-x divide-neutral-200">
      {children}
    </div>
  );
}

/**
 * Ação dentro de RowActions. Só ícone por padrão, com o nome em title e
 * aria-label; `showLabel` escreve o nome ao lado. Com `href` vira link.
 */
export function IconButton({ icon: Icon, label, tone = "default", showLabel = false, href, className = "", ...props }) {
  const classes = cn(
    "inline-flex h-9 items-center justify-center gap-1.5 text-sm font-medium text-neutral-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--moss)] disabled:opacity-40",
    showLabel ? "px-3" : "w-9",
    tone === "danger" ? "hover:bg-red-50 hover:text-red-700" : "hover:bg-neutral-100 hover:text-neutral-900",
    className
  );
  const content = <><Icon className="h-4 w-4" aria-hidden="true" />{showLabel && <span>{label}</span>}</>;
  if (href) return <a href={href} target="_blank" rel="noreferrer" title={label} aria-label={label} className={classes}>{content}</a>;
  return <button type="button" title={label} aria-label={label} className={classes} {...props}>{content}</button>;
}

const STATUS_TONE = {
  publicado: "border-emerald-200 bg-emerald-50 text-emerald-800",
  oculto: "border-neutral-300 bg-neutral-100 text-neutral-700",
  cancelado: "border-red-200 bg-red-50 text-red-800",
};

/** Status editável na própria linha: um seletor com a cor do status atual. */
function StatusSelect({ value, onChange, disabled }) {
  return (
    <span className={cn("relative inline-flex items-center rounded-full border", STATUS_TONE[value], disabled && "opacity-60")}>
      <span aria-hidden="true" className="pointer-events-none absolute left-2.5 h-1.5 w-1.5 rounded-full bg-current" />
      <select
        aria-label="Status do passeio"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 cursor-pointer appearance-none rounded-full bg-transparent pl-6 pr-7 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--moss)] disabled:cursor-wait"
      >
        {Object.entries(STATUS_LABEL).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
      </select>
      <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-2 h-3.5 w-3.5" />
    </span>
  );
}
export function Card({ className = "", children }) { return <div className={cn("rounded-3xl border bg-white shadow-sm", className)}>{children}</div>; }
function CardHeader({ className = "", children }) { return <div className={cn("p-4", className)}>{children}</div>; }
export function CardContent({ className = "", children }) { return <div className={cn("p-4", className)}>{children}</div>; }
function CardTitle({ className = "", children }) { return <div className={cn("text-lg font-semibold", className)}>{children}</div>; }
export const Input = forwardRef(function Input(props, ref){
  return <input ref={ref} {...props} className={cn("w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--moss)] border-neutral-300", props.className)} />;
});
export function Label({ htmlFor, children }){ return <label htmlFor={htmlFor} className="block text-sm font-medium mb-1">{children}</label>; }

const isUpcoming = (iso) => new Date(iso).getTime() >= Date.now();
const toLocalInputValue = (date) => { if(!date) return ""; const d=new Date(date); const p=n=>String(n).padStart(2,"0"); return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`; };

const parsePriceValue = (value) => {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const cleaned = String(value).trim().replace(/[^\d,.-]/g, "");
  if (!cleaned) return null;
  const hasComma = cleaned.includes(",");
  const dotMatches = cleaned.match(/\./g) || [];
  let normalized = cleaned;
  if (hasComma) {
    normalized = cleaned.replace(/\./g, "").replace(",", ".");
  } else if (dotMatches.length > 1) {
    normalized = cleaned.replace(/\./g, "");
  }
  const num = Number(normalized);
  return Number.isFinite(num) ? num : null;
};

const prepareFormState = (data) => {
  const images = Array.isArray(data.images) ? [...data.images] : [];
  return {
    ...data,
    images,
    priceCar: parsePriceValue(data.priceCar ?? data.price_car),
    priceExtra: parsePriceValue(data.priceExtra ?? data.price_extra),
  };
};

export default function AdminPage(){
  const [auth, setAuth] = useState({ loading:true, ok:false });
  const [trips, setTrips] = useState([]);
  const [editing, setEditing] = useState(null);
  // Guarda o id do passeio novo: as fotos sobem para trips/<id>/ antes de ele existir.
  const [newTripId, setNewTripId] = useState(null);
  // Fotos enviadas desde que o diálogo abriu, para saber o que descartar.
  const [sessionUploads, setSessionUploads] = useState([]);
  // Sobe quando o admin mexe nas categorias, para o form de produto recarregar.
  const [categoriesVersion, setCategoriesVersion] = useState(0);

  // Cancelar: apaga tudo que subiu neste diálogo e não chegou a ser salvo.
  const discardDialog = (close) => {
    const orphans = sessionUploads;
    setSessionUploads([]);
    close();
    orphans.forEach(deleteUploadedImage);
  };

  // Salvar: apaga o que subiu mas ficou de fora, e o que saiu do passeio.
  const reconcileImages = (previous, saved) => {
    const kept = new Set(saved || []);
    const dropped = [...new Set([...sessionUploads, ...(previous || [])])]
      .filter((url) => !kept.has(url) && isUploadedImage(url));
    setSessionUploads([]);
    dropped.forEach(deleteUploadedImage);
  };

  // Checa sessão
  useEffect(()=>{
    fetch(API.me, { credentials:"include" }).then(r=>r.ok?r.json():Promise.reject()).then(()=>setAuth({loading:false, ok:true})).catch(()=>setAuth({loading:false, ok:false}));
  },[]);

  // Carrega passeios quando logado
  useEffect(()=>{
    if(!auth.ok) return;
    fetch(`${API.trips}?all=1&admin=1`, { credentials:"include" }).then(r=>r.json()).then(d=>Array.isArray(d)&&setTrips(d)).catch(()=>setTrips([]));
  },[auth.ok]);

  // PUT parcial: só o que define o status, sem tocar em fotos ou no resto.
  const changeStatus = async (trip, status)=>{
    if(status === "cancelado" && !confirm(`Marcar "${trip.name}" como cancelado? Ele continua no site, com o aviso de cancelamento e sem inscrição.`)) return;
    const res = await fetch(API.trips, { method:"PUT", credentials:"include", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ id: trip.id, ...statusPatch(trip, status) }) });
    if(res.ok){ const data = await res.json(); setTrips(prev=>prev.map(t=>t.id===data.id?data:t)); }
    else alert("Falha ao alterar o status.");
  };

  if(auth.loading) return <div className="py-10 text-center text-neutral-600">Carregando…</div>;
  if(!auth.ok) return <LoginForm onSuccess={()=>setAuth({loading:false, ok:true})} />;

  const fut = trips.filter(t=>isUpcoming(t.date_time));
  const past = trips.filter(t=>!isUpcoming(t.date_time));

  return (
    <div className="py-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold tracking-tight">Área do administrador</h1>
        <div className="flex gap-2">
          <Button onClick={()=>setNewTripId(crypto.randomUUID())}><Plus className="w-4 h-4 mr-1" /> Novo passeio</Button>
          <Button variant="secondary" onClick={async()=>{ await fetch(API.logout, { method:"POST", credentials:"include" }); location.reload(); }}><LogOut className="w-4 h-4 mr-1" /> Sair</Button>
        </div>
      </div>

      {/* tabela futuros */}
      <AdminTable title="Futuros" trips={fut} showParticipants onChangeStatus={changeStatus} onEdit={setEditing} onDelete={async (id)=>{
        if(!confirm("Remover este passeio?")) return;
        const res = await fetch(`${API.trips}?id=${id}`, { method:"DELETE", credentials:"include" });
        if(res.ok) setTrips(prev=>prev.filter(t=>t.id!==id)); else alert("Falha ao remover.");
      }}/>

      {/* tabela passados */}
      <div className="mt-8" />
      <AdminTable title="Passados" trips={past} onChangeStatus={changeStatus} onEdit={setEditing} onDelete={async (id)=>{
        if(!confirm("Remover este passeio?")) return;
        const res = await fetch(`${API.trips}?id=${id}`, { method:"DELETE", credentials:"include" });
        if(res.ok) setTrips(prev=>prev.filter(t=>t.id!==id)); else alert("Falha ao remover.");
      }}/>

      {/* dialogs */}
      {newTripId && <Dialog onClose={()=>discardDialog(()=>setNewTripId(null))}>
        <h3 className="text-lg font-semibold mb-2">Novo passeio</h3>
      <TripForm initial={{ id: newTripId, name:"", dateTime:new Date().toISOString(), location:"", difficulty:"", description:"", completeDescription:"", images:[], priceCar:null, priceExtra:null, published:true, signature:false, details:{} }}
          onUploaded={(url)=>setSessionUploads(prev=>[...prev, url])}
          onCancel={()=>discardDialog(()=>setNewTripId(null))}
          onSave={async (created)=>{
            const res = await fetch(API.trips, { method:"POST", credentials:"include", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(created) });
            if(res.ok){ const data = await res.json(); setTrips(prev=>[data,...prev]); reconcileImages([], data.images); setNewTripId(null); } else alert("Falha ao criar.");
          }}/>
      </Dialog>}

      <LeadsSection />

      <CategoriesSection onChange={() => setCategoriesVersion((v) => v + 1)} />

      <ProductsSection categoriesVersion={categoriesVersion} />

      <BannersSection />

      {editing && <Dialog onClose={()=>discardDialog(()=>setEditing(null))}>
        <h3 className="text-lg font-semibold mb-2">Editar passeio</h3>

        <TripForm initial={{ id:editing.id, name:editing.name, dateTime:editing.date_time, location:editing.location, difficulty:editing.difficulty, description:editing.description, completeDescription:editing.complete_description, images:editing.images||[], priceCar:editing.price_car, priceExtra:editing.price_extra, published:editing.published !== false, signature:!!editing.signature, details:editing.details||{} }}
          onUploaded={(url)=>setSessionUploads(prev=>[...prev, url])}
          onCancel={()=>discardDialog(()=>setEditing(null))}
          onSave={async (patch)=>{
            const previous = editing.images || [];
            const res = await fetch(API.trips, { method:"PUT", credentials:"include", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(patch) });
            if(res.ok){ const data = await res.json(); setTrips(prev=>prev.map(t=>t.id===data.id?data:t)); reconcileImages(previous, data.images); setEditing(null);} else alert("Falha ao salvar.");
          }}/>
      </Dialog>}
    </div>
  );
}

function LoginForm({ onSuccess }){
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  return (
    <div className="max-w-sm mx-auto py-12">
      <h1 className="text-xl font-semibold mb-3">Login do administrador</h1>
      <p className="text-sm text-neutral-600 mb-4">Insira a senha para acessar a área administrativa.</p>
      <form onSubmit={async(e)=>{ e.preventDefault(); setSubmitting(true); const res = await fetch(API.login, { method:"POST", headers:{ "Content-Type":"application/json" }, credentials:"include", body: JSON.stringify({ password }) }); setSubmitting(false); if(res.ok) onSuccess(); else alert("Senha inválida."); }}>
        <Label>Senha</Label>
        <Input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" />
        <Button className="mt-3" disabled={submitting}>{submitting ? "Entrando..." : "Entrar"}</Button>
      </form>
    </div>
  );
}

function AdminTable({ title, trips, onEdit, onDelete, onChangeStatus, showParticipants=false }){
  const [open, setOpen] = useState({});
  // Passeio com troca de status em andamento: trava o seletor até a resposta.
  const [saving, setSaving] = useState(null);
  const setStatus = async (trip, status)=>{ setSaving(trip.id); try { await onChangeStatus?.(trip, status); } finally { setSaving(null); } };
  const [participants, setParticipants] = useState({});
  const toggle = async(id)=>{
    setOpen(o=>({ ...o, [id]: !o[id] }));
    if(!participants[id]){
      try{
        const res = await fetch(`${API.registrations}?tripId=${id}`, { credentials:'include' });
        if(res.ok){
          const data = await res.json();
          setParticipants(p=>({ ...p, [id]: data }));
        } else {
          setParticipants(p=>({ ...p, [id]: [] }));
        }
      }catch{
        setParticipants(p=>({ ...p, [id]: [] }));
      }
    }
  };
  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2"><CardTitle className="text-base">{title}</CardTitle></CardHeader>
      <CardContent>
        {trips.length===0 ? <p className="text-sm text-neutral-600">Nada por aqui.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left border-b">
                <th className="py-2 pr-3">Passeio</th><th className="py-2 pr-3">Data</th><th className="py-2 pr-3">Local</th><th className="py-2 pr-3">Fotos</th><th className="py-2 pr-3">Status</th><th className="py-2 text-right">Ações</th>
              </tr></thead>
              <tbody>
                {trips.slice().sort((a,b)=>new Date(a.date_time)-new Date(b.date_time)).map(t=>(
                  <React.Fragment key={t.id}>
                    <tr className="border-b last:border-0">
                      <td className="py-2 pr-3 font-medium">{t.name || <span className="text-neutral-500">(sem nome)</span>}{t.signature && <span className="ml-2 rounded bg-black px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-300">Signature</span>}</td>
                      <td className="py-2 pr-3">{new Intl.DateTimeFormat("pt-BR",{dateStyle:"medium", timeStyle:"short"}).format(new Date(t.date_time))}</td>
                      <td className="py-2 pr-3">{t.location || <span className="text-neutral-500">—</span>}</td>
                      <td className="py-2 pr-3">{(t.images||[]).length}</td>
                      <td className="py-2 pr-3">
                        <StatusSelect value={tripStatus(t)} disabled={saving===t.id} onChange={(status)=>setStatus(t, status)} />
                      </td>
                      <td className="py-2 text-right whitespace-nowrap">
                        <RowActions>
                          {showParticipants && <IconButton icon={Users} label="Participantes" showLabel aria-expanded={!!open[t.id]} className={open[t.id] ? "bg-neutral-100 text-neutral-900" : ""} onClick={()=>toggle(t.id)} />}
                          {/* Oculto não tem página pública: o botão fica no lugar, desligado, para as colunas não dançarem. */}
                          {t.published!==false
                            ? <IconButton icon={ExternalLink} label="Ver no site" href={`/passeio/${t.id}`} />
                            : <IconButton icon={ExternalLink} label="Oculto: não aparece no site" disabled />}
                          <IconButton icon={Pencil} label="Editar" onClick={()=>onEdit(t)} />
                          <IconButton icon={Trash2} label="Remover" tone="danger" onClick={()=>onDelete(t.id)} />
                        </RowActions>
                      </td>
                    </tr>
                    {showParticipants && open[t.id] && (
                      <tr className="border-b last:border-0 bg-neutral-50">
                        <td colSpan={6} className="p-3">
                          {participants[t.id] ? (
                            participants[t.id].length>0 ? (
                              <ul className="space-y-1">
                                {participants[t.id].map(p=>(
                                  <li key={p.id}>
                                    <span className="font-medium">{p.name}</span>
                                    {p.email && ` - ${p.email}`}
                                    {p.whatsapp && ` - ${p.whatsapp}`}
                                  </li>
                                ))}
                              </ul>
                            ) : <p className="text-sm text-neutral-600">Nenhum participante.</p>
                          ) : <p className="text-sm text-neutral-600">Carregando...</p>}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function Dialog({ children, onClose }){
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40">
      <div className="relative bg-white rounded-2xl w-[90vw] max-w-xl shadow-2xl p-4 max-h-[85vh] overflow-y-auto">
        <button type="button" onClick={onClose} className="absolute top-3 right-3 text-neutral-500 hover:text-neutral-700">
          <X className="w-5 h-5" />
        </button>
        {children}
      </div>
    </div>
  );
}

export function Textarea(props){ return <textarea {...props} className={cn("w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--moss)] border-neutral-300", props.className)} />; }
function TripForm({ initial, onSave, onCancel, onUploaded }){
  const [form, setForm] = useState(()=>prepareFormState(initial));
  const [imgUrl, setImgUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadNote, setUploadNote] = useState("");
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef(null);
  // Depende do id, não do objeto: `initial` é um literal inline no AdminPage e
  // muda de identidade a cada render dele, o que zeraria o form em digitação.
  useEffect(()=>setForm(prepareFormState(initial)), [initial.id]);
  const update = (patch)=>setForm(f=>({...f, ...patch}));

  const handleFiles = async (fileList)=>{
    const files = Array.from(fileList || []);
    if(!files.length) return;
    setUploading(true); setUploadError(""); setUploadNote("");
    const added = []; const errors = []; let resizedCount = 0;
    for(const file of files){
      try{
        const { url, resized } = await uploadImage(file, { kind: "trip", ownerId: form.id });
        if(resized) resizedCount++;
        added.push(url);
        onUploaded?.(url);
      }catch(err){ errors.push(err.message); }
    }
    if(added.length) setForm(f=>({...f, images:[...(f.images||[]), ...added]}));
    if(resizedCount) setUploadNote(resizedCount===1
      ? "1 imagem passava de 1,5 MB e foi redimensionada para caber no limite."
      : `${resizedCount} imagens passavam de 1,5 MB e foram redimensionadas para caber no limite.`);
    if(errors.length) setUploadError(errors.join(" "));
    setUploading(false);
    if(fileRef.current) fileRef.current.value = "";
  };
  const handleSubmit = (e)=>{
    e.preventDefault();
    if(!form.name) return alert("Defina um nome.");
    if(!form.dateTime) return alert("Defina data e hora.");
    const { details: rawDetails, ...rest } = form;
    const details = cleanDetails(rawDetails);
    // O dossiê só vai no envio quando existe (ou existia) conteúdo: assim o
    // cadastro segue funcionando em banco sem a coluna details.
    const hadDetails = Object.keys(initial.details || {}).length > 0;
    onSave({
      ...rest,
      ...(Object.keys(details).length > 0 || hadDetails ? { details } : {}),
      priceCar: form.priceCar ?? null,
      priceExtra: form.priceExtra ?? null,
    });
  };
  const handlePriceChange = (field)=>(values)=>{
    update({ [field]: typeof values.floatValue === "number" ? values.floatValue : null });
  };
  return (
    <form className="grid gap-3" onSubmit={handleSubmit}>
      <div><Label>Nome do passeio</Label><Input value={form.name} onChange={e=>update({name:e.target.value})} placeholder="Ex.: Estrada-Parque Serra da Canastra" /></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div><Label>Data e hora</Label><Input type="datetime-local" value={toLocalInputValue(form.dateTime)} onChange={e=>update({dateTime: new Date(e.target.value).toISOString()})} /></div>
          <div><Label>Local</Label><Input value={form.location} onChange={e=>update({location:e.target.value})} placeholder="Cidade / Região" /></div>
        </div>
        <div>
          <Label>Dificuldade</Label>
          <select value={form.difficulty} onChange={e=>update({difficulty:e.target.value})} className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--moss)] border-neutral-300">
            <option value="">Selecione</option>
            {LEVEL_TITLES.map((titulo)=>(
              <option key={titulo} value={titulo}>{titulo}</option>
            ))}
          </select>
        </div>
        <div><Label>Descrição</Label><Textarea rows={4} value={form.description} onChange={e=>update({description:e.target.value})} placeholder="Resumo do roteiro, nível e recomendações." /></div>
      <div><Label>Descrição completa</Label><Textarea rows={8} value={form.completeDescription} onChange={e=>update({completeDescription:e.target.value})} placeholder="Detalhes completos do passeio." /></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label>Preço por carro (2 pessoas)</Label>
          <NumericFormat
            value={form.priceCar ?? ""}
            onValueChange={handlePriceChange("priceCar")}
            customInput={Input}
            thousandSeparator="."
            decimalSeparator=","
            decimalScale={2}
            fixedDecimalScale
            allowNegative={false}
            prefix="R$ "
            inputMode="decimal"
            placeholder="R$ 0,00"
          />
        </div>
        <div>
          <Label>Preço por pessoa adicional</Label>
          <NumericFormat
            value={form.priceExtra ?? ""}
            onValueChange={handlePriceChange("priceExtra")}
            customInput={Input}
            thousandSeparator="."
            decimalSeparator=","
            decimalScale={2}
            fixedDecimalScale
            allowNegative={false}
            prefix="R$ "
            inputMode="decimal"
            placeholder="R$ 0,00"
          />
        </div>
      </div>
      <div>
        <Label>Fotos</Label>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          className="hidden"
          onChange={e=>handleFiles(e.target.files)}
        />
        <Button type="button" variant="secondary" disabled={uploading} onClick={()=>fileRef.current?.click()}>
          <Upload className="w-4 h-4 mr-1" /> {uploading ? "Enviando…" : "Enviar do computador"}
        </Button>
        <p className="text-xs text-neutral-500 mt-1">
          Imagens acima de 1,5 MB são redimensionadas automaticamente para no máximo 2560px, mantendo a proporção original.
        </p>
        {uploadNote && <p className="text-xs text-neutral-600 mt-1">{uploadNote}</p>}
        {uploadError && <p className="text-xs text-red-600 mt-1">{uploadError}</p>}
        <div className="flex gap-2 mt-3">
          <Input value={imgUrl} onChange={e=>setImgUrl(e.target.value)} placeholder="ou cole uma URL https://..." />
          <Button type="button" variant="secondary" onClick={()=>{ if(!imgUrl) return; update({ images:[...(form.images||[]), imgUrl] }); setImgUrl(""); }}>
            <ImageIcon className="w-4 h-4 mr-1" /> Adicionar
          </Button>
        </div>
        {form.images?.length>0 && <div className="grid grid-cols-3 gap-2 mt-2">
          {form.images.map((src,i)=>(
            <div key={i} className="relative group">
              <img src={src} className="w-full h-24 object-cover rounded-lg border" />
              <button type="button" className="absolute top-1 right-1 bg-white/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition" onClick={()=>update({ images: form.images.filter((_,idx)=>idx!==i) })}><X className="w-4 h-4" /></button>
            </div>
          ))}
        </div>}
      </div>
      <DossierFields key={form.id} value={form.details} onChange={(details)=>update({details})} />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={!!form.signature} onChange={e=>update({signature:e.target.checked})} />
        Expedição Signature
        <span className="text-xs text-neutral-500">— mostra a etiqueta Signature no card e na página</span>
      </label>
      <div>
        <Label>Status</Label>
        <select
          value={tripStatus(form)}
          onChange={e=>update(statusPatch(form, e.target.value))}
          className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--moss)] border-neutral-300"
        >
          <option value="publicado">Publicado — aparece no site</option>
          <option value="oculto">Oculto — fica só aqui no admin</option>
          <option value="cancelado">Cancelado — aparece no site como cancelado, sem inscrição</option>
        </select>
      </div>
      <div className="flex justify-end gap-2 mt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={uploading}><Save className="w-4 h-4 mr-1" /> Salvar</Button>
      </div>
    </form>
  );
}
