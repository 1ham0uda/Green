import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
          950: "#022c22",
        },
        surface: {
          DEFAULT: "rgb(var(--surface) / <alpha-value>)",
          muted: "rgb(var(--surface-muted) / <alpha-value>)",
          subtle: "rgb(var(--surface-subtle) / <alpha-value>)",
          border: "rgb(var(--surface-border) / <alpha-value>)",
          hover: "rgb(var(--surface-hover) / <alpha-value>)",
        },
        ink: {
          DEFAULT: "rgb(var(--ink) / <alpha-value>)",
          muted: "rgb(var(--ink-muted) / <alpha-value>)",
          subtle: "rgb(var(--ink-subtle) / <alpha-value>)",
          inverted: "rgb(var(--ink-inverted) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-2xl": ["4.5rem", { lineHeight: "1.05", letterSpacing: "-0.04em" }],
        "display-xl": ["3.75rem", { lineHeight: "1.05", letterSpacing: "-0.04em" }],
        "display-lg": ["3rem", { lineHeight: "1.1", letterSpacing: "-0.03em" }],
        "display-md": ["2.25rem", { lineHeight: "1.15", letterSpacing: "-0.02em" }],
        "display-sm": ["1.875rem", { lineHeight: "1.2", letterSpacing: "-0.02em" }],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        soft: "0 1px 2px rgb(0 0 0 / 0.04), 0 1px 3px rgb(0 0 0 / 0.06)",
        card: "0 1px 3px rgb(0 0 0 / 0.04), 0 4px 16px rgb(0 0 0 / 0.04)",
        elevated: "0 10px 40px -12px rgb(0 0 0 / 0.15), 0 2px 8px -2px rgb(0 0 0 / 0.08)",
        float: "0 20px 60px -15px rgb(0 0 0 / 0.2), 0 8px 20px -10px rgb(0 0 0 / 0.1)",
        glow: "0 0 0 1px rgb(16 185 129 / 0.2), 0 8px 24px -8px rgb(16 185 129 / 0.4)",
        "inner-soft": "inset 0 1px 2px 0 rgb(0 0 0 / 0.04)",
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        "gradient-brand-soft": "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
        "gradient-mesh":
          "radial-gradient(at 20% 0%, rgba(16, 185, 129, 0.15) 0px, transparent 50%), radial-gradient(at 80% 50%, rgba(5, 150, 105, 0.1) 0px, transparent 50%), radial-gradient(at 40% 100%, rgba(110, 231, 183, 0.1) 0px, transparent 50%)",
        shimmer:
          "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.6) 50%, transparent 100%)",
      },
      container: {
        center: true,
        padding: {
          DEFAULT: "1rem",
          sm: "1.5rem",
          lg: "2rem",
        },
        screens: {
          sm: "640px",
          md: "768px",
          lg: "1024px",
          xl: "1180px",
          "2xl": "1280px",
        },
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "slide-down": {
          "0%": { opacity: "0", transform: "translateY(-8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        heartbeat: {
          "0%": { transform: "scale(1)" },
          "30%": { transform: "scale(1.3)" },
          "60%": { transform: "scale(0.9)" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
        "fade-up": "fade-up 0.4s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "slide-down": "slide-down 0.3s ease-out",
        shimmer: "shimmer 2s linear infinite",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
        heartbeat: "heartbeat 0.6s ease-in-out",
      },
      backdropBlur: {
        xs: "2px",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.19, 1, 0.22, 1)",
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
