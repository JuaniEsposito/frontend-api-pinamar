/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#6DB33F;",      // Azul vibrante
        secondary: "#4C8C2B",    // Verde lima
        accent: "#A8E6A3",       // Amarillo cálido
        background: "#f8fafc",   // Gris muy claro
        dark: "#1e293b",         // Gris oscuro
        muted: "#64748b",  

      },
    },
  },
  plugins: [],
}
