import React, { useEffect, useState, useMemo } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function Lightbox({ images = [], startIndex = 0, onClose }) {
  const [index, setIndex] = useState(startIndex);

  const count = images.length;
  const current = images[index];

  const prev = () => setIndex((i) => (i - 1 + count) % count);
  const next = () => setIndex((i) => (i + 1) % count);

  // teclado: ESC fecha; setas navegam
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [count]);

  if (!count) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        {/* conteúdo (impede fechamento ao clicar dentro) */}
        <div
          className="absolute inset-0 flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header com X */}
          <div className="flex justify-end p-3">
            <button
              aria-label="Fechar"
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
              onClick={onClose}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Área principal com setas e imagem */}
          <div className="relative flex-1 flex items-center justify-center px-4">
            {count > 1 && (
              <button
                aria-label="Anterior"
                className="absolute left-2 md:left-4 p-2 md:p-3 rounded-full bg-white/10 hover:bg-white/20 text-white"
                onClick={prev}
              >
                <ChevronLeft className="w-7 h-7 md:w-8 md:h-8" />
              </button>
            )}

            <motion.img
              key={index}
              src={typeof current === "string" ? current : current.src}
              alt={typeof current === "string" ? "" : (current.alt || "")}
              className="max-h-[78vh] max-w-[92vw] object-contain rounded-xl shadow-2xl"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            />

            {count > 1 && (
              <button
                aria-label="Próxima"
                className="absolute right-2 md:right-4 p-2 md:p-3 rounded-full bg-white/10 hover:bg-white/20 text-white"
                onClick={next}
              >
                <ChevronRight className="w-7 h-7 md:w-8 md:h-8" />
              </button>
            )}
          </div>

          {/* Miniaturas */}
          {count > 1 && (
            <div className="p-3 bg-black/30">
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {images.map((img, i) => {
                  const src = typeof img === "string" ? img : img.src;
                  const active = i === index;
                  return (
                    <button
                      key={i}
                      onClick={() => setIndex(i)}
                      className={`relative h-16 w-24 flex-shrink-0 rounded-lg overflow-hidden border ${
                        active
                          ? "border-white shadow-[0_0_0_2px_rgba(255,255,255,0.6)]"
                          : "border-white/20"
                      }`}
                      aria-label={`Ir para foto ${i + 1}`}
                    >
                      <img
                        src={src}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
