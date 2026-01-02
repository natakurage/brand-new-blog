import type { Config } from "tailwindcss";
import daisyui from "daisyui";
import { light } from "daisyui/src/theming/themes";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      }
    },
  },
  plugins: [daisyui, typography],
  daisyui: {
    themes: [
      {
        light: {
          ...light,
          "primary": "#ED5126",
          "secondary": "#382E38",
          "accent": "#02DEE5",
          "neutral": "#1A3752",
        }
      },
      {
        dark: {
          "primary": "#ED5126",
          "secondary": "#382E38",
          "accent": "#02DEE5",
          "neutral": "#1A3752",
          "base-100": "#0F1A29",
          "base-200": "#08131F",
          "base-300": "#020C15",
        }
      }
    ],
  },
  darkMode: ["selector", "[data-theme=\"dark\"]"],
};
export default config;
