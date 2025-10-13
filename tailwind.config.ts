import type { Config } from "tailwindcss";

export default {
  content: [
    "index.html",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        lilac: {
          50: "#f9f7fb",
          100: "#f3eef9",
          200: "#e6dcf3",
          300: "#d6c4eb",
          400: "#c3a7e2",
          500: "#af89d9",
          600: "#986fca",
          700: "#7d56b3",
          800: "#624293",
          900: "#422d6b",
        },
        blush: {
          100: "#fae9ef",
          200: "#f2d2e0",
          300: "#e6b7cc",
        },
        cream: {
          50: "#fdfcfa",
          100: "#fbf8f4",
          200: "#f4eee8",
        },
      },
      fontFamily: {
        display: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 0 0 2px rgba(163,120,204,0.15), 0 0 40px rgba(163,120,204,0.2)",
      },
      borderRadius: {
        card: "16px",
      },
    },
  },
  plugins: [],
} satisfies Config;
