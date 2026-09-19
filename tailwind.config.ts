import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#08090a",
          900: "#0c0d0f",
          800: "#131417",
          700: "#1b1c20",
          600: "#26282d",
          500: "#383b41",
        },
        bone: {
          50: "#f8f7f4",
          100: "#f0eee8",
          200: "#e3e0d7",
          300: "#c9c4b6",
        },
        brass: {
          400: "#b9955a",
          500: "#a3803f",
          600: "#8a6a34",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-sans)", "sans-serif"],
      },
      letterSpacing: {
        widest2: "0.28em",
      },
      backgroundImage: {
        "grain": "url('/images/grain.png')",
      },
      animation: {
        "fade-up": "fadeUp 0.8s cubic-bezier(0.22,1,0.36,1) forwards",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
