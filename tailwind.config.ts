import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        card: "rgb(var(--card-rgb) / <alpha-value>)",
      },
    },
  },
  plugins: [],
};

export default config;
