import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        night: { DEFAULT: "#0B1F3A", 700: "#12294A", 500: "#24406B", 300: "#6C86AB" },
        turquoise: { DEFAULT: "#14B8A6", dark: "#0E8F80", soft: "#D9F5F1" },
        mist: "#F3F7FA",
      },
      fontFamily: {
        sans: ['"Avenir Next"', '"Segoe UI"', "system-ui", "-apple-system", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
