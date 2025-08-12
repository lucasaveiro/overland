import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Compass, Mountain, Tent, Truck, MapPin, CalendarClock, Plus, Pencil, Trash2, Image as ImageIcon, Save, X, KeyRound } from "lucide-react";

const API = {
  base: "/.netlify/functions",
  trips: "/.netlify/functions/trips",
  register: "/.netlify/functions/register",
};

const cn = (...c) => c.filter(Boolean).join(" ");

function Button({ className = "", variant = "primary", children, ...props }) {
  const base = "inline-flex items-center justify-center gap-1.5 rounded-2xl px-3 py-2 text-sm transition border";
  const variants = {
    primary: "bg-[var(--moss)] text-white hover:bg-[var(--moss-600)] border-transparent",
    secondary: "bg-white text-[var(--fg)] hover:bg-neutral-50 border-neutral-200",
    destructive: "bg-red-600 text-white hover:bg-red-700 border-transparent",
    ghost: "bg-transparent hover:bg-neutral-100 border-transparent",
  };
  return <button className={cn(base, variants[variant], className)} {...props}>{children}</button>;
}

function Card({ className = "", children }) {
  return <div className={cn("rounded-3xl border bg-white shadow-sm", className)}>{children}</div>;
}
function CardHeader({ className = "", children }) {
  return <div className={cn("p-4", className)}>{children}</div>;
}
function CardContent({ className = "", children }) {
  return <div className={cn("p-4", className)}>{children}</div>;
}
function CardTitle({ className = "", children }) {
  return <div className={cn("text-lg font-semibold", className)}>{children}</div>;
}
function Input(props) {
  return <input {...props} className={cn("w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--moss)] border-neutral-300", props.className)} />;
}
function Label({ htmlFor, children }) {
  return <label htmlFor={htmlFor} className="block text-sm font-medium mb-1">{children}</label>;
}
function Textarea(props) {
  return <textarea {...props} className={cn("w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--moss)] border-neutral-300", props.className)} />;
}

const STORAGE_KEYS = { admin: "overland_admin_token" };

const toLocalInputValue = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const min = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
};
const fromLocalInputValue = (value) => {
  if (!value) return "";
  const [d, t] = value.split("T");
  const [y, m, day] = d.split("-").map(Number);
  const [h, min] = t.split(":").map(Number);
  const local = new Date(y, m - 1, day, h, min);
  return local.toISOString();
};

const isUpcoming = (iso) => new Date(iso).getTime() >= new Date().getTime();

export default function OverlandSite() {
  const [trips, setTrips] = useState([]);
  const [editing, setEditing] = useState(null);
  const [newTripOpen, setNewTripOpen] = useState(false);
  const [adminToken, setAdminToken] = useState(localStorage.getItem(STORAGE_KEYS.admin) || "");

  const headers = adminToken ? { Authorization: `Bearer ${adminToken}` } : {};

  useEffect(() => {
    fetch(`${API.trips}?all=1`)
      .then((r) => r.json())
      .then((data) => setTrips(Array.isArray(data) ? data : []))
      .catch(() => setTrips([]));
  }, []);

  useEffect(() => {
    if (adminToken) localStorage.setItem(STORAGE_KEYS.admin, adminToken);
  }, [adminToken]);

  const upcoming = useMemo(() => trips.filter((t) => isUpcoming(t.date_time)).sort((a, b) => new Date(a.date_time) - new Date(b.date_time)), [trips]);
  const past = useMemo(() => trips.filter((t) => !isUpcoming(t.date_time)).sort((a, b) => new Date(b.date_time) - new Date(a.date_time)), [trips]);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <StyleBrand />
      <Header />
      <main className="max-w-6xl mx-auto px-4 md:px-6">
        <Hero />
        <ValueProps />
        <section id="proximos" className="mt-12 md:mt-16">
          <SectionTitle icon={<CalendarClock className="w-5 h-5" />} title="Próximos passeios" subtitle="Inscreva-se para viver o overland em ritmo tranquilo." />
          {upcoming.length === 0 ? (
            <p className="text-center text-neutral-500">Nenhum passeio futuro no momento. Volte em breve!</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {upcoming.map((trip) => (
                <TripCard key={trip.id} trip={trip} onSubmit={async (payload) => {
                  const res = await fetch(API.register, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...payload, tripId: trip.id }) });
                  if (res.ok) alert("Inscrição recebida! Entraremos em contato pelo WhatsApp ou e-mail.");
                  else alert("Não foi possível enviar sua inscrição. Tente novamente.");
                }} />
              ))}
            </div>
          )}
        </section>

        <section id="galeria" className="mt-16">
          <SectionTitle icon={<ImageIcon className="w-5 h-5" />} title="Galeria recente" subtitle="Alguns registros dos nossos rolês offroad." />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[...upcoming.slice(0, 2), ...past.slice(0, 2)].flatMap((t) => (t.images || []).map((src, i) => (
              <motion.img whileHover={{ scale: 1.02 }} key={`${t.id}-${i}`} src={src} alt={t.name} className="w-full h-36 object-cover rounded-2xl shadow-sm" />
            )))}
          </div>
        </section>

        <section id="admin" className="mt-20">
          <AdminPanel trips={trips} setTrips={setTrips} setEditing={setEditing} onAdd={() => setNewTripOpen(true)} adminToken={adminToken} setAdminToken={setAdminToken} headers={headers} />
        </section>
      </main>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        {editing && (
          <DialogContent>
            <DialogHeader><DialogTitle>Editar passeio</DialogTitle></DialogHeader>
            <TripForm
              initial={{
                id: editing.id,
                name: editing.name,
                dateTime: editing.date_time,
                location: editing.location,
                description: editing.description,
                images: editing.images || []
              }}
              onCancel={() => setEditing(null)}
              onSave={async (updated) => {
                const res = await fetch(API.trips, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json", ...headers },
                  body: JSON.stringify(updated),
                });
                if (res.ok) {
                  const data = await res.json();
                  setTrips((prev) => prev.map((t) => (t.id === data.id ? data : t)));
                  setEditing(null);
                } else {
                  alert("Falha ao salvar. Verifique o token de admin e tente novamente.");
                }
              }}
            />
          </DialogContent>
        )}
      </Dialog>

      <Dialog open={newTripOpen} onOpenChange={setNewTripOpen}>
        {newTripOpen && (
          <DialogContent>
            <DialogHeader><DialogTitle>Novo passeio</DialogTitle></DialogHeader>
            <TripForm
              initial={{ id: crypto.randomUUID(), name: "", dateTime: new Date().toISOString(), location: "", description: "", images: [] }}
              onCancel={() => setNewTripOpen(false)}
              onSave={async (created) => {
                const res = await fetch(API.trips, {
                  method: "POST",
                  headers: { "Content-Type": "application/json", ...headers },
                  body: JSON.stringify(created),
                });
                if (res.ok) {
                  const data = await res.json();
                  setTrips((prev) => [data, ...prev]);
                  setNewTripOpen(false);
                } else {
                  alert("Falha ao criar. Verifique o token de admin.");
                }
              }}
            />
          </DialogContent>
        )}
      </Dialog>

      <Footer />
    </div>
  );
}

function StyleBrand() {
  return (
    <style>{`
      :root {
        --moss: #556B2F;
        --moss-600: #4B5F2B;
        --moss-700: #3F5224;
        --brown: #8B5E3C;
        --sand: #e7e3da;
        --bg: #f8f7f4;
        --fg: #1f241b;
      }
      .brand-gradient { background: linear-gradient(120deg, var(--moss) 0%, var(--brown) 100%); }
      .chip { background: #f0ede6; border: 1px solid #e4dfd3; }
    `}</style>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-30 backdrop-blur bg-[rgba(248,247,244,0.7)] border-b">
      <div className="max-w-6xl mx-auto px-4 md:px-6 flex items-center justify-between h-16">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl brand-gradient grid place-items-center text-white shadow">
            <Compass className="w-5 h-5" />
          </div>
          <div className="leading-tight">
            <div className="font-semibold tracking-tight">Offgrid Overland</div>
            <div className="text-xs text-neutral-500">Passeios familiares em ritmo tranquilo</div>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <a href="#proximos" className="hover:underline">Passeios</a>
          <a href="#galeria" className="hover:underline">Galeria</a>
          <a href="#admin" className="hover:underline">Editar passeios</a>
          <Button>Inscreva-se</Button>
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="mt-8 md:mt-12">
      <div className="relative overflow-hidden rounded-3xl border shadow-sm">
        <div className="absolute inset-0 brand-gradient opacity-20" />
        <img
          src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1800&auto=format&fit=crop"
          alt="Trilha offroad em paisagem de montanha"
          className="w-full h-[46vh] md:h-[58vh] object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-3xl md:text-5xl font-semibold tracking-tight">
            Overland tranquilo, paisagens e boa companhia
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }} className="mt-3 md:mt-4 text-sm md:text-base max-w-2xl text-white/90">
            Passeios offroad familiares por estradas de terra, com paradas para contemplar a natureza. Sem pressa, sem cobrança – apenas a experiência.
          </motion.p>
          <div className="mt-4 md:mt-6 flex items-center gap-3">
            <span className="bg-white text-[var(--moss)] px-3 py-1 rounded-full chip inline-flex items-center gap-1"><Mountain className="w-4 h-4" /> montanhas</span>
            <span className="bg-white text-[var(--moss)] px-3 py-1 rounded-full chip inline-flex items-center gap-1"><Truck className="w-4 h-4" /> 4x4 & SUVs</span>
            <span className="bg-white text-[var(--moss)] px-3 py-1 rounded-full chip inline-flex items-center gap-1"><Tent className="w-4 h-4" /> picnic & família</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function ValueProps() {
  const items = [
    { icon: <Mountain className="w-5 h-5" />, title: "Ritmo contemplativo", text: "Paradas frequentes para fotos e descanso. Aproveite o caminho." },
    { icon: <Compass className="w-5 h-5" />, title: "Roteiros seguros", text: "Estradas de terra e vicinais com briefing prévio e comboio organizado." },
    { icon: <Truck className="w-5 h-5" />, title: "Para família e amigos", text: "Bem-vindos SUVs e 4x4. Nível leve a moderado, sempre sem pressa." },
  ];
  return (
    <div className="grid md:grid-cols-3 gap-4 mt-8">
      {items.map((it, i) => (
        <Card key={i} className="border shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-[var(--sand)] grid place-items-center text-[var(--moss)]">{it.icon}</div>
            <CardTitle className="text-base">{it.title}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-neutral-600 -mt-2">{it.text}</CardContent>
        </Card>
      ))}
    </div>
  );
}

function SectionTitle({ icon, title, subtitle }) {
  return (
    <div className="mb-4 md:mb-6">
      <div className="flex items-center gap-2">
        <div className="h-9 w-9 rounded-xl bg-[var(--sand)] grid place-items-center text-[var(--moss)]">{icon}</div>
        <h2 className="text-xl md:text-2xl font-semibold tracking-tight">{title}</h2>
      </div>
      {subtitle && <p className="text-sm text-neutral-600 mt-1">{subtitle}</p>}
    </div>
  );
}

function TripCard({ trip, onSubmit }) {
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");

  const date = new Date(trip.date_time);
  const formatted = new Intl.DateTimeFormat("pt-BR", { dateStyle: "full", timeStyle: "short" }).format(date);

  return (
    <Card className="overflow-hidden border shadow-sm">
      {trip.images?.[0] && (
        <img src={trip.images[0]} alt={trip.name} className="w-full h-44 object-cover" />
      )}
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold tracking-tight">{trip.name}</h3>
            <div className="flex items-center gap-2 text-sm text-neutral-600 mt-1">
              <CalendarClock className="w-4 h-4" />
              <span>{formatted}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-neutral-600 mt-1">
              <MapPin className="w-4 h-4" />
              <span>{trip.location}</span>
            </div>
          </div>
        </div>
        <p className="text-sm text-neutral-600 mt-3">{trip.description}</p>

        <form
          className="grid md:grid-cols-3 gap-3 mt-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!name || !whatsapp || !email) return alert("Preencha nome, WhatsApp e e-mail.");
            onSubmit({ name, whatsapp, email });
            setName("");
            setWhatsapp("");
            setEmail("");
          }}
        >
          <div>
            <Label htmlFor={`nome-${trip.id}`}>Nome</Label>
            <Input id={`nome-${trip.id}`} value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" />
          </div>
          <div>
            <Label htmlFor={`zap-${trip.id}`}>WhatsApp</Label>
            <Input id={`zap-${trip.id}`} value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="(11) 98765-4321" />
          </div>
          <div>
            <Label htmlFor={`email-${trip.id}`}>E-mail</Label>
            <div className="flex gap-2">
              <Input id={`email-${trip.id}`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" />
              <Button type="submit">Inscrever</Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function AdminPanel({ trips, setTrips, setEditing, onAdd, adminToken, setAdminToken, headers }) {
  const fut = trips.filter((t) => isUpcoming(t.date_time));
  const past = trips.filter((t) => !isUpcoming(t.date_time));
  const [tab, setTab] = useState("futuros");

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-[var(--sand)] grid place-items-center text-[var(--moss)]"><Pencil className="w-5 h-5" /></div>
            <CardTitle className="text-base">Editar passeios</CardTitle>
          </div>
          <Button onClick={onAdd}><Plus className="w-4 h-4 mr-1" /> Novo passeio</Button>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <KeyRound className="w-4 h-4" />
          <Input placeholder="Token do admin" value={adminToken} onChange={(e)=>setAdminToken(e.target.value)} />
          <span className="text-xs text-neutral-500">Use o token cadastrado nas variáveis do Netlify</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="inline-flex rounded-xl border bg-white p-1">
          {["futuros","passados","todos"].map(key => {
            const active = tab === key;
            const label = key[0].toUpperCase()+key.slice(1);
            return <button key={key} onClick={()=>setTab(key)} className={cn("px-3 py-1.5 text-sm rounded-lg", active ? "bg-[var(--moss)] text-white" : "hover:bg-neutral-100")}>{label}</button>
          })}
        </div>
        <div className="mt-3">
          {tab === "futuros" && <TripTable trips={fut} onEdit={setEditing} onDelete={async (id)=>{
            const ok = confirm("Remover este passeio?"); if(!ok) return;
            const res = await fetch(`${API.trips}?id=${id}`, {method:"DELETE", headers});
            if(res.ok) setTrips(prev=>prev.filter(t=>t.id!==id)); else alert("Falha ao remover (token inválido?).");
          }} />}
          {tab === "passados" && <TripTable trips={past} onEdit={setEditing} onDelete={async (id)=>{
            const ok = confirm("Remover este passeio?"); if(!ok) return;
            const res = await fetch(`${API.trips}?id=${id}`, {method:"DELETE", headers});
            if(res.ok) setTrips(prev=>prev.filter(t=>t.id!==id)); else alert("Falha ao remover (token inválido?).");
          }} />}
          {tab === "todos" && <TripTable trips={trips} onEdit={setEditing} onDelete={async (id)=>{
            const ok = confirm("Remover este passeio?"); if(!ok) return;
            const res = await fetch(`${API.trips}?id=${id}`, {method:"DELETE", headers});
            if(res.ok) setTrips(prev=>prev.filter(t=>t.id!==id)); else alert("Falha ao remover (token inválido?).");
          }} />}
        </div>
      </CardContent>
    </Card>
  );
}

function TripTable({ trips, onEdit, onDelete }) {
  if (trips.length === 0) return <p className="text-sm text-neutral-600">Nada por aqui.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b">
            <th className="py-2 pr-3">Passeio</th>
            <th className="py-2 pr-3">Data</th>
            <th className="py-2 pr-3">Local</th>
            <th className="py-2 pr-3">Fotos</th>
            <th className="py-2 text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {trips
            .slice()
            .sort((a, b) => new Date(a.date_time) - new Date(b.date_time))
            .map((t) => (
              <tr key={t.id} className="border-b last:border-0">
                <td className="py-2 pr-3 font-medium">{t.name || <span className="text-neutral-500">(sem nome)</span>}</td>
                <td className="py-2 pr-3">{new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(t.date_time))}</td>
                <td className="py-2 pr-3">{t.location || <span className="text-neutral-500">—</span>}</td>
                <td className="py-2 pr-3">{(t.images || []).length}</td>
                <td className="py-2 text-right">
                  <Button variant="secondary" className="mr-2" onClick={() => onEdit(t)}><Pencil className="w-4 h-4 mr-1" /> Editar</Button>
                  <Button variant="destructive" onClick={onDelete}><Trash2 className="w-4 h-4 mr-1" /> Remover</Button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

function Dialog({ open, onOpenChange, children }) {
  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40" onClick={() => onOpenChange(false)}>
          <div className="bg-white rounded-2xl w-[90vw] max-w-xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {children}
          </div>
        </div>
      )}
    </>
  );
}
function DialogContent({ children }) { return <div className="p-4">{children}</div>; }
function DialogHeader({ children }) { return <div className="pb-2">{children}</div>; }
function DialogTitle({ children }) { return <h3 className="text-lg font-semibold">{children}</h3>; }

function TripForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial);
  const [imgUrl, setImgUrl] = useState("");

  useEffect(() => setForm(initial), [initial]);
  const update = (patch) => setForm((f) => ({ ...f, ...patch }));

  return (
    <form
      className="grid gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!form.name) return alert("Defina um nome para o passeio.");
        if (!form.dateTime) return alert("Defina data e hora.");
        onSave(form);
      }}
    >
      <div>
        <Label>Nome do passeio</Label>
        <Input value={form.name} onChange={(e) => update({ name: e.target.value })} placeholder="Ex.: Estrada-Parque Serra da Canastra" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label>Data e hora</Label>
          <Input type="datetime-local" value={toLocalInputValue(form.dateTime)} onChange={(e) => update({ dateTime: (e.target.value ? new Date(e.target.value) : new Date()).toISOString() })} />
        </div>
        <div>
          <Label>Local</Label>
          <Input value={form.location} onChange={(e) => update({ location: e.target.value })} placeholder="Cidade / Região" />
        </div>
      </div>
      <div>
        <Label>Descrição</Label>
        <Textarea value={form.description} onChange={(e) => update({ description: e.target.value })} placeholder="Resumo do roteiro, nível e recomendações." rows={4} />
      </div>
      <div>
        <Label>Fotos (URLs)</Label>
        <div className="flex gap-2">
          <Input value={imgUrl} onChange={(e) => setImgUrl(e.target.value)} placeholder="https://..." />
          <Button type="button" variant="secondary" onClick={() => { if (!imgUrl) return; update({ images: [...(form.images || []), imgUrl] }); setImgUrl(""); }}>
            <ImageIcon className="w-4 h-4 mr-1" /> Adicionar
          </Button>
        </div>
        {form.images?.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-2">
            {form.images.map((src, i) => (
              <div key={i} className="relative group">
                <img src={src} className="w-full h-24 object-cover rounded-lg border" />
                <button type="button" className="absolute top-1 right-1 bg-white/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition" onClick={() => update({ images: form.images.filter((_, idx) => idx !== i) })}>
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 mt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit"><Save className="w-4 h-4 mr-1" /> Salvar</Button>
      </div>
    </form>
  );
}

function Footer() {
  return (
    <footer className="mt-20 border-t">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 text-sm text-neutral-600 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg brand-gradient grid place-items-center text-white"><Compass className="w-4 h-4" /></div>
          <div>
            <div className="font-medium text-[var(--fg)]">Offgrid Overland</div>
            <div className="text-xs">© {new Date().getFullYear()} – Passeios familiares e contemplativos</div>
          </div>
        </div>
        <div className="flex gap-4">
          <a href="#proximos" className="hover:underline">Próximos passeios</a>
          <a href="#admin" className="hover:underline">Editar passeios</a>
        </div>
      </div>
    </footer>
  );
}
