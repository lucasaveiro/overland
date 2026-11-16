/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // Tokens do design system OffXpedition. `brand` é o verde do X do
      // logotipo: 3,27:1 no branco e 5,67:1 no carbon, então serve para
      // grafismos e botões nos dois fundos. `brand-deep` e `brand-ink` ficam
      // para texto pequeno sobre fundo claro, onde `brand` não dá contraste.
      colors: {
        carbon: "#111412",
        charcoal: "#202522",
        ivory: "#F3F1EA",
        stone: "#DADDD6",
        muted: "#818982",
        brand: { DEFAULT: "#14A514", deep: "#1D8F06", ink: "#156B05" },
      },
      fontFamily: {
        display: ['"Barlow Condensed"', "Arial Narrow", "sans-serif"],
        sans: ["Manrope", "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      maxWidth: { site: "1400px" },
      keyframes: {
        "hero-progress": {
          from: { transform: "scaleX(0)" },
          to: { transform: "scaleX(1)" },
        },
        "hero-drift": {
          from: { transform: "scale(1.02)" },
          to: { transform: "scale(1.1)" },
        },
        "scroll-cue": {
          "0%": { transform: "translateY(-100%)" },
          "60%, 100%": { transform: "translateY(100%)" },
        },
        "topo-turn": { to: { transform: "rotate(360deg)" } },
        rise: {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "none" },
        },
      },
      // Sem duração em hero-progress: quem define é o style inline do componente.
      animation: {
        "hero-progress": "hero-progress linear forwards",
        "hero-drift": "hero-drift 28s ease-out forwards",
        "scroll-cue": "scroll-cue 2.8s cubic-bezier(.6,0,.2,1) infinite",
        "topo-turn": "topo-turn 240s linear infinite",
        rise: "rise 0.7s cubic-bezier(.2,.6,.2,1) both",
      },
    },
  },
  plugins: [],
}
