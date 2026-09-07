import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        odoo: {
          primary: "#714B67",
          primaryDark: "#5b3b54",
          secondary: "#00A09D",
          accent: "#F2C94C",
          bg: "#F4F3EF",
          sidebar: "#3B2C39",
          danger: "#D9534F",
          success: "#28A745",
          warning: "#F0AD4E",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
      },
    },
  },
  plugins: [],
};
export default config;
