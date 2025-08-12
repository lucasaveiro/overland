import React, { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Trash2, Image as ImageIcon, Save, X, KeyRound, CalendarClock, MapPin } from "lucide-react";

const API = {
  trips: "/.netlify/functions/trips",
  login: "/.netlify/functions/auth_login",
  me: "/.netlify/functions/auth_me",
  logout: "/.netlify/functions/auth_logout",
};

const cn = (...c) => c.filter(Boolean).join(" ");
function Button({ className = "", variant = "primary", children, ...props }) {
  const base = "inline-flex items-center justify-center gap-1.5 rounded-2xl px-3 py-2 text-sm transition border";
  const variants = {
    primary: "bg-[var(--moss)] text-white hover:bg-[var(--moss-600)] border-transparent",
    secondary: "bg-white text-[var(--fg)] hover:bg-neutral-50 border-neutral-200",
    destructive: "bg-red-600 text-white hover:bg-red-700 border-transparent",
  };
  return <button className={cn(base, variants[variant], className)} {...props}>{children}</button>;
}
function Card({ className = "", children }) { return <div className={cn("rounded-3xl border bg-white shadow-sm", className)}>{children}</div>; }
function CardHeader({ className = "", children }) { return <div className={cn("p-4", className)}>{children}</div>; }
function CardContent({ className = "", children }) { return <div className={cn("p-4", className)}>{children}</div>; }
function CardTitle({ className = "", children }) { return <div className={cn("text-lg font-semibold", className)}>{children}</div>; }
function Input(props){ return <input {...props} className={cn("w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--moss)] border-neutral-300", props.className)} />; }
function Label({ htmlFor, children }){ return <label htmlFor={htmlFor} className="block text-sm font-medium mb-1">{children}</label>; }

const isUpcoming = (iso) => new Date(iso).getTime() >= Date.now();
const toLocalInputValue = (date) => { if(!date) return ""; const d=new Date(date); const p=n=>String(n).padStart(2,"0"); return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`; };

export default function AdminPage(){
  const [auth, setAuth] = useState({ loading:true, ok:false });
  const [trips, setTrips] = useState([]);
  const [editing, setEditing] = useState(null);
  const [newTripOpen, setNewTripOpen] = useState(false);

  // Checa sessão
  useEffect(()=>{
    fetch(API.me, { credentials:"include" }).then(r=>r.ok?r.json():Promise.reject()).then(()=>setAuth({loading:false, ok:true})).catch(()=>setAuth({loading:false, ok:false}));
  },[]);

  // Carrega passeios quando logado
  useEffect(()=>{
    if(!auth.ok) return;
    fetch(`${API.trips}?all=1`, { credentials:"include" }).then(r=>r.json()).then(d=>Array.isArray(d)&&setTrips(d)).catch(()=>setTrips([]));
  },[auth.ok]);

  if(auth.loading) return <div className="py-10 text-center text-neutral-600">Carregando…</div>;
  if(!auth.ok) return <LoginForm onSuccess={()=>setAuth({loading:false, ok:true})} />;

  const fut = trips.filter(t=>isUpcoming(t.date_time));
  const past = trips.filter(t=>!isUpcoming(t.date_time));

  return (
    <div className="py-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold tracking-tight">Área do administrador</h1>
        <div className="flex gap-2">
          <Button onClick={()=>setNewTripOpen(true)}><Plus className="w-4 h-4 mr-1" /> Novo passeio</Button>
          <Button variant="secondary" onClick={async()=>{ await fetch(API.logout, { method:"POST", credentials:"include" }); location.reload(); }}>Sair</Button>
        </div>
      </div>

      {/* tabela futuros */}
      <AdminTable title="Futuros" trips={fut} onEdit={setEditing} onDelete={async (id)=>{
        if(!confirm("Remover este passeio?")) return;
        const res = await fetch(`${API.trips}?id=${id}`, { method:"DELETE", credentials:"include" });
        if(res.ok) setTrips(prev=>prev.filter(t=>t.id!==id)); else alert("Falha ao remover.");
      }}/>

      {/* tabela passados */}
      <div className="mt-8" />
      <AdminTable title="Passados" trips={past} onEdit={setEditing} onDelete={async (id)=>{
        if(!confirm("Remover este passeio?")) return;
        const res = await fetch(`${API.trips}?id=${id}`, { method:"DELETE", credentials:"include" });
        if(res.ok) setTrips(prev=>prev.filter(t=>t.id!==id)); else alert("Falha ao remover.");
      }}/>

      {/* dialogs */}
      {newTripOpen && <Dialog onClose={()=>setNewTripOpen(false)}>
        <h3 className="text-lg font-semibold mb-2">Novo passeio</h3>
        <TripForm initial={{ id: crypto.randomUUID(), name:"", dateTime:new Date().toISOString(), location:"", description:"", images:[] }}
          onCancel={()=>setNewTripOpen(false)}
          onSave={async (created)=>{
            const res = await fetch(API.trips, { method:"POST", credentials:"include", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(created) });
            if(res.ok){ const data = await res.json(); setTrips(prev=>[data,...prev]); setNewTripOpen(false); } else alert("Falha ao criar.");
          }}/>
      </Dialog>}

      {editing && <Dialog onClose={()=>setEditing(null)}>
        <h3 className="text-lg font-semibold mb-2">Editar passeio</h3>
        <TripForm initial={{ id:editing.id, name:editing.name, dateTime:editing.date_time, location:editing.location, description:editing.description, images:editing.images||[] }}
          onCancel={()=>setEditing(null)}
          onSave={async (patch)=>{
            const res = await fetch(API.trips, { method:"PUT", credentials:"include", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(patch) });
            if(res.ok){ const data = await res.json(); setTrips(prev=>prev.map(t=>t.id===data.id?data:t)); setEditing(null);} else alert("Falha ao salvar.");
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

function AdminTable({ title, trips, onEdit, onDelete }){
  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2"><CardTitle className="text-base">{title}</CardTitle></CardHeader>
      <CardContent>
        {trips.length===0 ? <p className="text-sm text-neutral-600">Nada por aqui.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left border-b">
                <th className="py-2 pr-3">Passeio</th><th className="py-2 pr-3">Data</th><th className="py-2 pr-3">Local</th><th className="py-2 pr-3">Fotos</th><th className="py-2 text-right">Ações</th>
              </tr></thead>
              <tbody>
                {trips.slice().sort((a,b)=>new Date(a.date_time)-new Date(b.date_time)).map(t=>(
                  <tr key={t.id} className="border-b last:border-0">
                    <td className="py-2 pr-3 font-medium">{t.name || <span className="text-neutral-500">(sem nome)</span>}</td>
                    <td className="py-2 pr-3">{new Intl.DateTimeFormat("pt-BR",{dateStyle:"medium", timeStyle:"short"}).format(new Date(t.date_time))}</td>
                    <td className="py-2 pr-3">{t.location || <span className="text-neutral-500">—</span>}</td>
                    <td className="py-2 pr-3">{(t.images||[]).length}</td>
                    <td className="py-2 text-right">
                      <Button variant="secondary" className="mr-2" onClick={()=>onEdit(t)}><Pencil className="w-4 h-4 mr-1" /> Editar</Button>
                      <Button variant="destructive" onClick={()=>onDelete(t.id)}><Trash2 className="w-4 h-4 mr-1" /> Remover</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Dialog({ children, onClose }){
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl w-[90vw] max-w-xl shadow-2xl p-4" onClick={e=>e.stopPropagation()}>
        {children}
        <div className="flex justify-end mt-3"><Button variant="secondary" onClick={onClose}>Fechar</Button></div>
      </div>
    </div>
  );
}

function Textarea(props){ return <textarea {...props} className={cn("w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--moss)] border-neutral-300", props.className)} />; }
function TripForm({ initial, onSave, onCancel }){
  const [form, setForm] = useState(initial); const [imgUrl, setImgUrl] = useState("");
  useEffect(()=>setForm(initial), [initial]);
  const update = (patch)=>setForm(f=>({...f, ...patch}));
  return (
    <form className="grid gap-3" onSubmit={(e)=>{ e.preventDefault(); if(!form.name) return alert("Defina um nome."); if(!form.dateTime) return alert("Defina data e hora."); onSave(form); }}>
      <div><Label>Nome do passeio</Label><Input value={form.name} onChange={e=>update({name:e.target.value})} placeholder="Ex.: Estrada-Parque Serra da Canastra" /></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div><Label>Data e hora</Label><Input type="datetime-local" value={toLocalInputValue(form.dateTime)} onChange={e=>update({dateTime: new Date(e.target.value).toISOString()})} /></div>
        <div><Label>Local</Label><Input value={form.location} onChange={e=>update({location:e.target.value})} placeholder="Cidade / Região" /></div>
      </div>
      <div><Label>Descrição</Label><Textarea rows={4} value={form.description} onChange={e=>update({description:e.target.value})} placeholder="Resumo do roteiro, nível e recomendações." /></div>
      <div>
        <Label>Fotos (URLs)</Label>
        <div className="flex gap-2">
          <Input value={imgUrl} onChange={e=>setImgUrl(e.target.value)} placeholder="https://..." />
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
      <div className="flex justify-end gap-2 mt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit"><Save className="w-4 h-4 mr-1" /> Salvar</Button>
      </div>
    </form>
  );
}
