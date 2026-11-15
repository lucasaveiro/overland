import React, { useEffect } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import Header from "./components/site/Header.jsx";
import Footer from "./components/site/Footer.jsx";
import Home from "./pages/Home.jsx";
import ExpedicoesPage from "./pages/Expedicoes.jsx";
import Prepare4x4Page from "./pages/Prepare4x4.jsx";
import TripPage from "./pages/Trip.jsx";
import AdminPage from "./pages/Admin.jsx";
import ProdutosPage from "./pages/Produtos.jsx";
import SignatureDayPage from "./pages/SignatureDay.jsx";
import FilmsPage from "./pages/Films.jsx";
import ParaMarcasPage from "./pages/ParaMarcas.jsx";
import ClubPage from "./pages/Club.jsx";
import { captureSource } from "./lib/analytics.js";

export default function App() {
  useEffect(captureSource, []);
  return (
    <div className="min-h-screen bg-white text-carbon">
      <ScrollManager />
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/expedicoes" element={<ExpedicoesPage />} />
          <Route path="/experiencias/signature-day" element={<SignatureDayPage />} />
          <Route path="/prepare-seu-4x4" element={<Prepare4x4Page />} />
          <Route path="/films" element={<FilmsPage />} />
          <Route path="/para-marcas" element={<ParaMarcasPage />} />
          <Route path="/club" element={<ClubPage />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/passeio/:id" element={<TripPage />} />
          {/* Admin e loja mantêm a coluna estreita em que foram desenhados. */}
          <Route path="/admin" element={<Narrow><AdminPage /></Narrow>} />
          <Route path="/produtos" element={<Narrow><ProdutosPage /></Narrow>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function NotFound() {
  return (
    <div className="site-container py-40 text-center">
      <p className="eyebrow text-brand-ink">404</p>
      <h1 className="h2 mt-5">Página não encontrada.</h1>
      <Link to="/" className="btn-outline-dark mt-10">Voltar ao início</Link>
    </div>
  );
}

function Narrow({ children }) {
  return <div className="mx-auto max-w-6xl px-4 pb-20 pt-8 md:px-6">{children}</div>;
}

/**
 * Troca de página volta ao topo; link com #âncora rola até a seção. As seções
 * que dependem dos passeios só existem depois do fetch, então a busca pelo
 * elemento insiste por um instante antes de desistir.
 */
function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) { window.scrollTo(0, 0); return; }
    let tries = 0;
    let timer;
    const seek = () => {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (el) el.scrollIntoView();
      else if (tries++ < 20) timer = setTimeout(seek, 100);
    };
    seek();
    return () => clearTimeout(timer);
  }, [pathname, hash]);
  return null;
}
