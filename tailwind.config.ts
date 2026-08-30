import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Direct palette colors
        palette: {
          cream:    "#FFFCF2",
          sand:     "#CCC5B9",
          charcoal: "#403D39",
          black:    "#252422",
          flame:    "#EB5E28",
        },
        // Dynamic semantic backgrounds mapped to CSS variables
        bg: {
          base:     "var(--bg-base)",
          surface:  "var(--bg-surface)",
          card:     "var(--bg-card)",
          elevated: "var(--bg-elevated)",
        },
        border: {
          DEFAULT:  "var(--border-default)",
          muted:    "var(--border-muted)",
          subtle:   "var(--border-subtle)",
        },
        // Dynamic semantic text mapped to CSS variables
        text: {
          primary:   "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted:     "var(--text-muted)",
          faint:     "var(--text-faint)",
        },
        // Accent: Flame (#EB5E28)
        accent: {
          DEFAULT:  "#EB5E28",
          light:    "#f2794b",
          dark:     "#c94b18",
          muted:    "var(--accent-muted-bg)",
          subtle:   "var(--accent-subtle-bg)",
        },
        // Semantic pill badges tailored to palette
        sage: {
          DEFAULT: "var(--badge-sage-text)",
          light:   "#9bbba9",
          dark:    "#5e8371",
          subtle:  "var(--badge-sage-bg)",
          muted:   "var(--badge-sage-border)",
        },
        olive: {
          DEFAULT: "var(--badge-olive-text)",
          light:   "#bcc9a5",
          dark:    "#84936d",
          subtle:  "var(--badge-olive-bg)",
          muted:   "var(--badge-olive-border)",
        },
        sand: {
          DEFAULT: "var(--badge-sand-text)",
          light:   "#FFFCF2",
          dark:    "#b8b0a2",
          subtle:  "var(--badge-sand-bg)",
          muted:   "var(--badge-sand-border)",
        },
      },
      backgroundImage: {
        "earth-gradient":  "var(--earth-gradient)",
        "card-gradient":   "var(--card-gradient)",
        "accent-gradient": "linear-gradient(135deg, #EB5E28 0%, #f2794b 100%)",
      },
      boxShadow: {
        "earth":  "var(--shadow-earth)",
        "card":   "var(--shadow-card)",
        "accent": "0 4px 16px rgba(235,94,40,0.35)",
      },
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "Noto Sans JP", "Roboto", "Helvetica", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
