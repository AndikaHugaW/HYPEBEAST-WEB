import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        nippo: ["var(--font-nippo)", "Arial", "Helvetica", "sans-serif"],
        sans: ["var(--font-nippo)", "Arial", "Helvetica", "sans-serif"], // Set sebagai default sans
      },
    },
  },
  plugins: [],
};
export default config;

