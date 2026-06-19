/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        primary: "#E53935",
        secondary: "#FFEBEE",
        success: "#22C55E",
        warning: "#F59E0B",
        background: "#FFFFFF",
        text: "#111827",
      },
      fontFamily: {
        body: ['"Plus Jakarta Sans"', "sans-serif"],
        display: ['"Fraunces"', "serif"],
      },
    },
  },
  plugins: [],
};
