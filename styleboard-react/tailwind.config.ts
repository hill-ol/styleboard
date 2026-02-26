import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./context/**/*.{js,ts,jsx,tsx,mdx}",
    "./utils/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FAF7F5",
        blush: "#F2E4E6",
        dusty: {
          50:  "#FDF2F3",
          100: "#F9E4E6",
          200: "#F0C4C8",
          300: "#E4A0A6",
          400: "#D4797F",   // main accent
          500: "#C4606A",
          600: "#A84D56",
          700: "#8A3C44",
        },
        warm: {
          50:  "#FAF7F5",
          100: "#F2EDE9",
          200: "#E8DDD8",
          900: "#2A1A1A",   // replaces pure black
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;