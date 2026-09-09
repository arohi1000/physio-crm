import type { Config } from "tailwindcss";

/**
 * The CRM uses only the calm transactional palette. Every colour resolves to a
 * CSS custom property declared in `app/globals.css`, so the light and dark
 * values live together in one place and a single token name works in both
 * themes. Components must never reference a raw hex value.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: "var(--paper)",
          raised: "var(--paper-raised)",
        },
        ink: {
          DEFAULT: "var(--ink)",
          soft: "var(--ink-soft)",
        },
        line: "var(--line)",
        sage: {
          DEFAULT: "var(--sage)",
          deep: "var(--sage-deep)",
        },
        clay: "var(--clay)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
    },
  },
};

export default config;
