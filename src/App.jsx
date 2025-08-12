import React, { useEffect, useMemo, useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Compass, Mountain, Tent, Truck, MapPin, CalendarClock, Image as ImageIcon } from "lucide-react";
import AdminPage from "./pages/Admin.jsx"; // nova página
import Lightbox from "./components/Lightbox.jsx";


const API = {
  trips: "/.netlify/functions/trips",
  register: "/.netlify/functions/register",
};

const cn = (...c) => c.filter(Boolean).join(" ");
function Button({ className = "", variant = "primary", children, ...props }) {
  const base = "inline-flex items-center justify-center gap-1.5 rounded-2xl px-3 py-2 text-sm transition border";
  const variants = {
    primary: "bg-[var(--moss)] text-white hover:bg-[var(--moss-600)] border-transparent",
    secondary: "bg-white text-[var(--fg)] hover:bg-neutral-50 border-neutral-200",
    ghost: "bg-transparent hover:underline border-transparent",
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

export default function App() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <StyleBrand />
      <Header />
      <main className="max-w-6xl mx-auto px-4 md:px-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function Home() {
  const [trips, setTrips] = useState([]);
  const [regs, setRegs] = useState([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // junta todas as imagens de todos os passeios (ordem: futuros depois passados)
  const galleryImages = useMemo(() => {
  const all = [...upcoming, ...past];
  return all.flatMap((t) => (t.images || []).map((src) => ({ src, alt: t.name })));
}, [upcoming, past]);


  useEffect(() => {
    fetch(`${API.trips}?all=1`).then(r=>r.json()).then(d=>Array.isArray(d)&&setTrips(d)).catch(()=>setTrips([]));
  }, []);

  const upcoming = useMemo(() => trips.filter(t => isUpcoming(t.date_time)).sort((a,b)=>new Date(a.date_time)-new Date(b.date_time)), [trips]);
  const past = useMemo(() => trips.filter(t => !isUpcoming(t.date_time)).sort((a,b)=>new Date(b.date_time)-new Date(a.date_time)), [trips]);

  return (
    <>
      <Hero />
      <ValueProps />
      <section id="proximos" className="mt-12 md:mt-16">
        <SectionTitle icon={<CalendarClock className="w-5 h-5" />} title="Próximos passeios" subtitle="Inscreva-se para viver o overland em ritmo tranquilo." />
        {upcoming.length === 0 ? (
          <p className="text-center text-neutral-500">Nenhum passeio futuro no momento. Volte em breve!</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {upcoming.map(trip => (
              <TripCard key={trip.id} trip={trip} onSubmit={async (payload) => {
                const res = await fetch(API.register, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...payload, tripId: trip.id }) });
                if (res.ok) alert("Inscrição recebida! Entraremos em contato.");
                else alert("Não foi possível enviar sua inscrição. Tente novamente.");
              }} />
            ))}
          </div>
        )}
      </section>

      <section id="galeria" className="mt-16">
  <SectionTitle icon={<ImageIcon className="w-5 h-5" />} title="Galeria recente" subtitle="Alguns registros dos nossos rolês offroad." />

  {galleryImages.length === 0 ? (
    <p className="text-sm text-neutral-600">Sem fotos ainda.</p>
  ) : (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {galleryImages.map((img, i) => (
        <button
          key={`${img.src}-${i}`}
          className="relative group"
          onClick={() => { setLightboxIndex(i); setLightboxOpen(true); }}
          aria-label={`Abrir foto ${i + 1}`}
        >
          <motion.img
            whileHover={{ scale: 1.02 }}
            src={img.src}
            alt={img.alt || ""}
            className="w-full h-36 object-cover rounded-2xl shadow-sm"
          />
          <span className="absolute inset-0 rounded-2xl ring-0 ring-white/0 group-hover:ring-2 group-hover:ring-white/60 transition" />
        </button>
      ))}
    </div>
  )}

  {lightboxOpen && (
    <Lightbox
      images={galleryImages}
      startIndex={lightboxIndex}
      onClose={() => setLightboxOpen(false)}
    />
  )}
</section>

    </>
  );
}

function TripCard({ trip, onSubmit }) {
  const [name, setName] = useState(""); const [whatsapp, setWhatsapp] = useState(""); const [email, setEmail] = useState("");
  const date = new Date(trip.date_time);
  const formatted = new Intl.DateTimeFormat("pt-BR",{dateStyle:"full", timeStyle:"short"}).format(date);
  return (
    <Card className="overflow-hidden border shadow-sm">
      {trip.images?.[0] && <img src={trip.images[0]} alt={trip.name} className="w-full h-44 object-cover" />}
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold tracking-tight">{trip.name}</h3>
        <div className="flex items-center gap-2 text-sm text-neutral-600 mt-1"><CalendarClock className="w-4 h-4" /><span>{formatted}</span></div>
        <div className="flex items-center gap-2 text-sm text-neutral-600 mt-1"><MapPin className="w-4 h-4" /><span>{trip.location}</span></div>
        <p className="text-sm text-neutral-600 mt-3">{trip.description}</p>
        <form className="grid md:grid-cols-3 gap-3 mt-4" onSubmit={(e)=>{e.preventDefault(); if(!name||!whatsapp||!email) return alert("Preencha todos os campos."); onSubmit({name,whatsapp,email}); setName(""); setWhatsapp(""); setEmail("");}}>
          <div><Label htmlFor={`nome-${trip.id}`}>Nome</Label><Input id={`nome-${trip.id}`} value={name} onChange={e=>setName(e.target.value)} placeholder="Seu nome" /></div>
          <div><Label htmlFor={`zap-${trip.id}`}>WhatsApp</Label><Input id={`zap-${trip.id}`} value={whatsapp} onChange={e=>setWhatsapp(e.target.value)} placeholder="(11) 98765-4321" /></div>
          <div><Label htmlFor={`email-${trip.id}`}>E-mail</Label>
            <div className="flex gap-2"><Input id={`email-${trip.id}`} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="voce@email.com" />
              <Button type="submit">Inscrever</Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function StyleBrand(){ return (<style>{`
:root{ --moss:#556B2F; --moss-600:#4B5F2B; --brown:#8B5E3C; --sand:#e7e3da; --bg:#f8f7f4; --fg:#1f241b; }
.brand-gradient{ background:linear-gradient(120deg,var(--moss) 0%,var(--brown) 100%); }
.chip{ background:#f0ede6; border:1px solid #e4dfd3; }
`}</style>); }
function Header(){
  return (
    <header className="sticky top-0 z-30 backdrop-blur bg-[rgba(248,247,244,0.7)] border-b">
      <div className="max-w-6xl mx-auto px-4 md:px-6 flex items-center justify-between h-16">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl brand-gradient grid place-items-center text-white shadow"><Compass className="w-5 h-5" /></div>
          <div className="leading-tight">
            <div className="font-semibold tracking-tight">OFFGRID Overland</div>
            <div className="text-xs text-neutral-500">Passeios offroad em ritmo tranquilo</div>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <a href="#proximos" className="hover:underline">Passeios</a>
          <a href="#galeria" className="hover:underline">Galeria</a>
          <Link to="/admin" className="text-neutral-500 hover:underline">Área do administrador</Link>
        </nav>
      </div>
    </header>
  );
}
function Footer(){
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
          {/* link discreto de login do admin */}
          <Link to="/admin" className="text-neutral-500 hover:underline">Login do administrador</Link>
        </div>
      </div>
    </footer>
  );
}

function Hero(){/* ...mantido igual ao anterior... */ return (
  <section className="mt-8 md:mt-12">
    <div className="relative overflow-hidden rounded-3xl border shadow-sm">
      <div className="absolute inset-0 brand-gradient opacity-20" />
      <img src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1800&auto=format&fit=crop" alt="Trilha offroad em paisagem de montanha" className="w-full h-[46vh] md:h-[58vh] object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white">
        <motion.h1 initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.6}} className="text-3xl md:text-5xl font-semibold tracking-tight">Overland tranquilo, paisagens e boa companhia</motion.h1>
        <motion.p initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.1,duration:0.6}} className="mt-3 md:mt-4 text-sm md:text-base max-w-2xl text-white/90">Passeios offroad familiares por estradas de terra, com paradas para contemplar a natureza. Sem pressa, sem cobrança – apenas a experiência.</motion.p>
        <div className="mt-4 md:mt-6 flex items-center gap-3">
          <span className="bg-white text-[var(--moss)] px-3 py-1 rounded-full chip inline-flex items-center gap-1"><Mountain className="w-4 h-4" /> montanhas</span>
          <span className="bg-white text-[var(--moss)] px-3 py-1 rounded-full chip inline-flex items-center gap-1"><Truck className="w-4 h-4" /> 4x4 & SUVs</span>
          <span className="bg-white text-[var(--moss)] px-3 py-1 rounded-full chip inline-flex items-center gap-1"><Tent className="w-4 h-4" /> picnic & família</span>
        </div>
      </div>
    </div>
  </section>
);}
function ValueProps(){/* ...idem ao anterior... */}
function SectionTitle({icon,title,subtitle}){ return (
  <div className="mb-4 md:mb-6">
    <div className="flex items-center gap-2">
      <div className="h-9 w-9 rounded-xl bg-[var(--sand)] grid place-items-center text-[var(--moss)]">{icon}</div>
      <h2 className="text-xl md:text-2xl font-semibold tracking-tight">{title}</h2>
    </div>
    {subtitle && <p className="text-sm text-neutral-600 mt-1">{subtitle}</p>}
  </div>
);}
