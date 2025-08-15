import React, { useEffect, useMemo, useState } from "react";
import { Routes, Route, Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Compass, Mountain, Tent, Truck, MapPin, CalendarClock, Camera as ImageIcon } from "lucide-react";
import AdminPage from "./pages/Admin.jsx";
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

const difficultyColors = {
  "Nível 1 – SUV/Leve": "bg-blue-600 text-white",
  "Nível 2 – 4x4 Médio": "bg-green-600 text-white",
  "Nível 3 – 4x4 Pesado": "bg-yellow-400 text-black",
  "Nível 4 – Off-road Extremo": "bg-black text-white",
};

export default function App() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <StyleBrand />
      <Header />
      <main className="max-w-6xl mx-auto px-4 md:px-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/passeio/:id" element={<TripPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function Home() {
  const [trips, setTrips] = useState([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    fetch(`${API.trips}?all=1`).then(r=>r.json()).then(d=>Array.isArray(d)&&setTrips(d)).catch(()=>setTrips([]));
  }, []);

  const upcoming = useMemo(() => trips.filter(t => isUpcoming(t.date_time)).sort((a,b)=>new Date(a.date_time)-new Date(b.date_time)), [trips]);
  const past = useMemo(() => trips.filter(t => !isUpcoming(t.date_time)).sort((a,b)=>new Date(b.date_time)-new Date(a.date_time)), [trips]);

  const galleryImages = useMemo(() => {
    const all = [...upcoming, ...past];
    return all.flatMap((t) => (t.images || []).map((src) => ({ src, alt: t.name })));
  }, [upcoming, past]);

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
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        )}
      </section>

      <VehicleLevels />

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

function TripCard({ trip }) {
  const date = new Date(trip.date_time);
  const formatted = new Intl.DateTimeFormat("pt-BR",{dateStyle:"full", timeStyle:"short"}).format(date);
  return (
    <Link to={`/passeio/${trip.id}`} className="block group">
      <Card className="overflow-hidden border shadow-sm relative">
        {trip.images?.[0] && (
          <div className="relative">
            <img src={trip.images[0]} alt={trip.name} className="w-full h-44 object-cover" />
            {trip.difficulty && (
              <span className={`absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-medium ${difficultyColors[trip.difficulty] || 'bg-neutral-500 text-white'}`}>{trip.difficulty}</span>
            )}
          </div>
        )}
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold tracking-tight">{trip.name}</h3>
          <div className="flex items-center gap-2 text-sm text-neutral-600 mt-1"><CalendarClock className="w-4 h-4" /><span>{formatted}</span></div>
          <div className="flex items-center gap-2 text-sm text-neutral-600 mt-1"><MapPin className="w-4 h-4" /><span>{trip.location}</span></div>
          <p className="text-sm text-neutral-600 mt-3">{trip.description}</p>
        </CardContent>
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition">
          <span className="inline-flex items-center justify-center gap-1.5 rounded-2xl px-3 py-2 text-sm bg-[var(--moss)] text-white">Participe</span>
        </div>
      </Card>
    </Link>
  );
}

function TripPage() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    fetch(`${API.trips}?id=${id}`).then(r=>r.json()).then(d=>{ setTrip(d); setLoading(false); }).catch(()=>setLoading(false));
  }, [id]);

  if (loading) return <div className="py-10 text-center text-neutral-600">Carregando…</div>;
  if (!trip) return <div className="py-10 text-center text-neutral-600">Passeio não encontrado.</div>;

  const date = new Date(trip.date_time);
  const formatted = new Intl.DateTimeFormat("pt-BR",{dateStyle:"full", timeStyle:"short"}).format(date);
  const paragraphs = (trip.complete_description || trip.description || "")
    .split(/\n+/)
    .map((p, i) => (
      <p key={i} className="mt-2">
        {p}
      </p>
    ));


  return (
    <div className="py-8 max-w-3xl mx-auto">
      {trip.images?.[0] && <img src={trip.images[0]} alt={trip.name} className="w-full h-64 object-cover rounded-3xl shadow-sm" />}
      <h1 className="text-2xl font-semibold mt-4">{trip.name}</h1>
      <div className="flex items-center gap-2 text-sm text-neutral-600 mt-1"><CalendarClock className="w-4 h-4" /><span>{formatted}</span></div>
      <div className="flex items-center gap-2 text-sm text-neutral-600 mt-1"><MapPin className="w-4 h-4" /><span>{trip.location}</span></div>
      <div className="mt-4 text-neutral-700">{paragraphs}</div>
      <div className="mt-4 text-sm text-neutral-700 space-y-1">
        {trip.price_car && <div>Preço por carro (2 pessoas): <span className="font-medium">{trip.price_car}</span></div>}
        {trip.price_extra && <div>Preço por pessoa adicional: <span className="font-medium">{trip.price_extra}</span></div>}
      </div>

      {trip.images?.length>1 && (
        <section className="mt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {trip.images.map((src,i)=>(
              <button key={i} className="relative group" onClick={()=>{ setLightboxIndex(i); setLightboxOpen(true); }}>
                <img src={src} alt="" className="w-full h-32 object-cover rounded-xl" />
              </button>
            ))}
          </div>
          {lightboxOpen && (
            <Lightbox
              images={trip.images.map(s=>({src:s, alt:trip.name}))}
              startIndex={lightboxIndex}
              onClose={()=>setLightboxOpen(false)}
            />
          )}
        </section>
      )}

      <form className="grid md:grid-cols-3 gap-3 mt-8" onSubmit={async (e)=>{
        e.preventDefault();
        if(!name||!whatsapp||!email) return alert("Preencha todos os campos.");
        const res = await fetch(API.register, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ name, whatsapp, email, tripId: trip.id }) });
        if(res.ok){ alert("Inscrição recebida! Entraremos em contato."); setName(""); setWhatsapp(""); setEmail(""); }
        else alert("Não foi possível enviar sua inscrição. Tente novamente.");
      }}>
        <div><Label htmlFor="nome">Nome</Label><Input id="nome" value={name} onChange={e=>setName(e.target.value)} placeholder="Seu nome" /></div>
        <div><Label htmlFor="zap">WhatsApp</Label><Input id="zap" value={whatsapp} onChange={e=>setWhatsapp(e.target.value)} placeholder="(11) 98765-4321" /></div>
        <div><Label htmlFor="email">E-mail</Label>
          <div className="flex gap-2"><Input id="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="voce@email.com" />
            <Button type="submit">Inscrever</Button>
          </div>
        </div>
      </form>
    </div>
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
        <Link to="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl brand-gradient grid place-items-center text-white shadow"><Compass className="w-5 h-5" /></div>
          <div className="leading-tight">
            <div className="font-semibold tracking-tight">Offgrid Overland</div>
            <div className="text-xs text-neutral-500">Passeios familiares em ritmo tranquilo</div>
          </div>
        </Link>
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
          <Link to="/admin" className="text-neutral-500 hover:underline">Login do administrador</Link>
        </div>
      </div>
    </footer>
  );
}

function Hero(){
  return (
    <section className="mt-8 md:mt-12">
      <div className="relative overflow-hidden rounded-3xl border shadow-sm">
        <div className="absolute inset-0 brand-gradient opacity-20" />
        <img src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1800&auto=format&fit=crop" alt="Trilha offroad em paisagem de montanha" className="w-full h-[46vh] md:h-[58vh] object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white">
          <motion.h1 initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.6}} className="text-3xl md:text-5xl font-semibold tracking-tight">
            Overland tranquilo, paisagens e boa companhia
          </motion.h1>
          <motion.p initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.1,duration:0.6}} className="mt-3 md:mt-4 text-sm md:text-base max-w-2xl text-white/90">
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

function VehicleLevels() {
  const levels = [
    {
      title: "Nível 1 – SUV/Leve",
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
        "Jeep Renegade 4x4 - Jeep Compass 4x4 - Mitsubishi ASX 4x4 - Jeep Commander 4x4",
    },
    {
      title: "Nível 2 - 4x4 Médio",
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
        "- Ram Rampage 4x4 - Chevrolet S10 LS/LT/LTZ - Mitsubishi L200 Triton GLX/GLS/Outdoor - Toyota Hilux SR/SRV - Nissan Frontier - Volkswagen Amarok Comfortline/Highline - Pajero TR4 4x4 - Fiat Titano Volcano/Ranch",
    },
    {
      title: "Nível 3 - 4x4 Pesado",
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
        "Pajero Dakar - Chevrolet S10 HighCountry - Ford Ranger 4x4 - Ram 1500 - Ram 2500 - Mitsubishi L200 Triton Sport HPE-S - Toyota Hilux SRX - Volkswagen Amarok Extreme V6",
    },
    {
      title: "Nível 4 – 4x4 Extremo",
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
      examples:
        "Suzuki Jimny 4x4 - Troller T4 - Jeep Wrangler",
    },
  ];

  return (
    <section id="niveis" className="mt-16">
      <SectionTitle
        icon={<Truck className="w-5 h-5" />}
        title="Níveis de passeio e veículos"
        subtitle="Recomendações de acordo com o preparo do seu 4x4"
      />
      <div className="grid md:grid-cols-2 gap-6">
        {levels.map((level) => (
          <Card key={level.title} className="border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{level.title}</CardTitle>
              <p className="mt-1 text-sm text-neutral-600">{level.profile}</p>
            </CardHeader>
            <CardContent className="text-sm text-neutral-700">
              <ul className="list-disc pl-4 space-y-1">
                {level.requirements.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
              <p className="mt-3 text-neutral-500">
                Exemplos: {level.examples}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function SectionTitle({icon,title,subtitle}){ return (
  <div className="mb-4 md:mb-6">
    <div className="flex items-center gap-2">
      <div className="h-9 w-9 rounded-xl bg-[var(--sand)] grid place-items-center text-[var(--moss)]">{icon}</div>
      <h2 className="text-xl md:text-2xl font-semibold tracking-tight">{title}</h2>
    </div>
    {subtitle && <p className="text-sm text-neutral-600 mt-1">{subtitle}</p>}
  </div>
);}
