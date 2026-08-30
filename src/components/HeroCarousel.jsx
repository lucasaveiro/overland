import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Tempo que cada foto fica na tela. É o único número a mexer para acelerar/desacelerar.
const SLIDE_MS = 3000;

const cn = (...c) => c.filter(Boolean).join(" ");

/**
 * A barrinha de progresso é o relógio do carrossel: quando a animação dela
 * termina, a foto troca. Assim barra e avanço não têm como sair de sincronia,
 * e pausar é só trocar o animation-play-state.
 */
export default function HeroCarousel({ images = [], alt = "", onOpen }) {
  const count = images.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  // Trocar de valor remonta a barra, o que reinicia a animação do zero.
  const [cycle, setCycle] = useState(0);

  const goTo = (next) => {
    setIndex(((next % count) + count) % count);
    setCycle((c) => c + 1);
  };

  if (!count) return null;

  const multiple = count > 1;

  return (
    <section>
      <div
        className="relative w-full overflow-hidden rounded-3xl bg-neutral-900 shadow-sm aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/9]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
      >
        {images.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={i === index ? alt : ""}
            aria-hidden={i !== index}
            onClick={() => onOpen?.(i)}
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-opacity duration-700 cursor-zoom-in",
              i === index ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
          />
        ))}

        {multiple && (
          <>
            <button
              type="button"
              aria-label="Foto anterior"
              onClick={() => goTo(index - 1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/35 p-2 text-white backdrop-blur-sm transition hover:bg-black/55 focus:outline-none focus:ring-2 focus:ring-white/70"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              aria-label="Próxima foto"
              onClick={() => goTo(index + 1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/35 p-2 text-white backdrop-blur-sm transition hover:bg-black/55 focus:outline-none focus:ring-2 focus:ring-white/70"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            <div className="absolute inset-x-0 bottom-0 h-[3px] bg-white/20">
              <div
                key={cycle}
                data-testid="hero-progress"
                onAnimationEnd={() => goTo(index + 1)}
                style={{
                  animationDuration: `${SLIDE_MS}ms`,
                  animationPlayState: paused ? "paused" : "running",
                }}
                className="h-full w-full origin-left animate-hero-progress bg-white/80"
              />
            </div>
          </>
        )}
      </div>

      {multiple && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Ir para a foto ${i + 1}`}
              aria-current={i === index}
              onClick={() => goTo(i)}
              className={cn(
                "h-16 w-24 flex-shrink-0 overflow-hidden rounded-xl border-2 transition",
                i === index ? "border-[var(--moss)] opacity-100" : "border-transparent opacity-60 hover:opacity-100"
              )}
            >
              <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
