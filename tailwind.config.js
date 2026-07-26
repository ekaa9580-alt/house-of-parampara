/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* House of Parampara — logo-aligned palette */
        royal: {
          DEFAULT: "#1E3A8A",
          50: "#eef2ff",
          100: "#dbe4fe",
          200: "#bfcffc",
          300: "#93adf8",
          400: "#6085f1",
          500: "#3b63e5",
          600: "#1E3A8A",
          700: "#1e3a8a",
          800: "#1e3378",
          900: "#1e2f62",
          950: "#141d3d",
        },
        brand: {
          50: "#fdfbf7",
          100: "#f7f3ed",
          200: "#ebe4d9",
          300: "#d4c5b0",
          400: "#c0a88c",
          500: "#8C6239",
          600: "#7a5531",
          700: "#664628",
          800: "#523920",
          900: "#3d2b18",
          950: "#24190e",
        },
        ink: {
          DEFAULT: "#1a1614",
          soft: "#3d3530",
          muted: "#6b6158",
        },
        cream: {
          DEFAULT: "#FDFBF7",
          dark: "#f3efe8",
        },
        gold: {
          DEFAULT: "#8C6239",
          light: "#b08a5c",
          dark: "#6b4a2b",
        },
      },
      fontFamily: {
        display: ["var(--font-cormorant)", "Georgia", "serif"],
        body: ["var(--font-outfit)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glass: "0 8px 32px rgba(26, 22, 20, 0.08)",
        lift: "0 20px 40px rgba(26, 22, 20, 0.12)",
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "slide-up": "slideUp 0.6s ease-out forwards",
        shimmer: "shimmer 1.5s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
