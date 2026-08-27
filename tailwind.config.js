/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Fraunces"', "ui-serif", "Georgia", "serif"],
        sans: ['"Plus Jakarta Sans"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#f0faf5",
          100: "#d9f2e6",
          200: "#b3e4cd",
          300: "#80d0ad",
          400: "#4cb588",
          500: "#2f9b6e",
          600: "#1f7d57",
          700: "#1a6347",
          800: "#17503b",
          900: "#134031",
          950: "#07241b",
        },
        cream: "#faf7f2",
        sand: {
          50: "#faf8f5",
          100: "#f4f0e9",
          200: "#e8e1d4",
          300: "#d6cbb8",
          400: "#b7a88f",
          500: "#998a6f",
          600: "#7c6e57",
          700: "#615645",
          800: "#433c30",
          900: "#2a261e",
        },
        ink: "#1b2723",
        success: { DEFAULT: "#15803d", bg: "#dcfce7", fg: "#14532d" },
        pending: { DEFAULT: "#b45309", bg: "#fef3c7", fg: "#78350f" },
        info: { DEFAULT: "#1d4ed8", bg: "#dbeafe", fg: "#1e3a8a" },
      },
      boxShadow: {
        soft: "0 1px 2px rgba(27,39,35,0.04), 0 8px 24px -12px rgba(27,39,35,0.18)",
        lift: "0 2px 4px rgba(27,39,35,0.05), 0 18px 40px -16px rgba(27,39,35,0.22)",
      },
      borderRadius: { xl2: "1.25rem" },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.97)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.35s ease-out both",
        "scale-in": "scale-in 0.18s ease-out both",
      },
    },
  },
  plugins: [],
};
