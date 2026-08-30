/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        "hero-progress": {
          from: { transform: "scaleX(0)" },
          to: { transform: "scaleX(1)" },
        },
      },
      // Sem duração aqui: quem define é o style inline do componente.
      animation: {
        "hero-progress": "hero-progress linear forwards",
      },
    },
  },
  plugins: [],
}
