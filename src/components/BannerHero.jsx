import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Banner fica mais tempo na tela que a galeria de fotos: é peça de leitura.
const SLIDE_MS = 5000;

const cn = (...c) => c.filter(Boolean).join(" ");

// Link para o próprio site navega na mesma aba; link externo abre em nova aba
// e sai marcado como patrocinado.
function BannerLink({ href, children }) {
  if (!href) return <>{children}</>;
  let interno = false;
  try {
    interno = new URL(href, window.location.href).origin === window.location.origin;
  } catch {
    interno = false;
  }
  return interno ? (
    <a href={href} className="block h-full w-full">{children}</a>
  ) : (
    <a href={href} target="_blank" rel="sponsored noopener noreferrer" className="block h-full w-full">
      {children}
    </a>
  );
}

/**
 * Mesma técnica do carrossel dos passeios: a animação CSS da barrinha é o
 * relógio, e quando ela termina o banner troca. Pausa no hover.
 */
export default function BannerHero({ banners = [] }) {
  const count = banners.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [cycle, setCycle] = useState(0);

  const goTo = (next) => {
    setIndex(((next % count) + count) % count);
    setCycle((c) => c + 1);
  };

  if (!count) return null;

  const multiple = count > 1;

  return (
    <section
      className="relative w-full overflow-hidden rounded-3xl bg-neutral-900 shadow-sm aspect-[16/9] sm:aspect-[3/1]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {banners.map((b, i) => (
        <div
          key={b.id}
          aria-hidden={i !== index}
          className={cn(
            "absolute inset-0 transition-opacity duration-700",
            i === index ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          <BannerLink href={b.link_url}>
            <img
              src={b.image_url}
              alt={b.title || ""}
              className="h-full w-full object-cover"
              loading={i === 0 ? "eager" : "lazy"}
            />
            {b.title && (
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-10 text-sm font-medium text-white sm:p-6 sm:pt-16 sm:text-lg">
                {b.title}
              </span>
            )}
          </BannerLink>
        </div>
      ))}

      {multiple && (
        <>
          <button
            type="button"
            aria-label="Banner anterior"
            onClick={() => goTo(index - 1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/35 p-2 text-white backdrop-blur-sm transition hover:bg-black/55 focus:outline-none focus:ring-2 focus:ring-white/70"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Próximo banner"
            onClick={() => goTo(index + 1)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/35 p-2 text-white backdrop-blur-sm transition hover:bg-black/55 focus:outline-none focus:ring-2 focus:ring-white/70"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="absolute inset-x-0 bottom-0 h-[3px] bg-white/20">
            <div
              key={cycle}
              data-testid="banner-progress"
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
    </section>
  );
}
