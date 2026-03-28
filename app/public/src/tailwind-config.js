tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary:           "#13ec5b",
        "primary-dark":    "#0fbb47",
        "primary-light":   "#e6fdf0",
        "background-light":"#f3f8f4",
        "background-dark": "#0a1a0e",
        "surface-light":   "#ffffff",
        "surface-dark":    "#111a14",
        "border-light":    "#e4ede7",
        "border-dark":     "#1e2d22",
        muted:             "#6b7e72",
      },
      fontFamily: {
        display: ["Manrope", "system-ui", "sans-serif"],
        body:    ["Manrope", "system-ui", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.375rem",
        lg:  "0.625rem",
        xl:  "0.875rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
        full: "9999px",
      },
      boxShadow: {
        "card":    "0 4px 24px -4px rgba(19,236,91,0.10), 0 1px 6px -1px rgba(0,0,0,0.06)",
        "card-hover": "0 8px 32px -4px rgba(19,236,91,0.18), 0 2px 8px -2px rgba(0,0,0,0.08)",
        "premium": "0 20px 40px -8px rgba(19,236,91,0.15), 0 8px 16px -4px rgba(0,0,0,0.08)",
        "glow":    "0 0 0 3px rgba(19,236,91,0.25)",
        "glow-lg": "0 0 32px rgba(19,236,91,0.3)",
        "inner-glow": "inset 0 1px 0 rgba(255,255,255,0.1)",
      },
      backgroundImage: {
        "gradient-primary":  "linear-gradient(135deg, #13ec5b 0%, #0fbb47 100%)",
        "gradient-surface":  "linear-gradient(135deg, #f3f8f4 0%, #e6fdf0 100%)",
        "gradient-dark":     "linear-gradient(135deg, #0a1a0e 0%, #111a14 100%)",
        "gradient-card":     "linear-gradient(135deg, rgba(19,236,91,0.12) 0%, rgba(19,236,91,0.04) 100%)",
      },
      transitionTimingFunction: {
        "spring": "cubic-bezier(0.34,1.56,0.64,1)",
        "smooth": "cubic-bezier(0.4,0,0.2,1)",
      },
      animation: {
        "fade-up":   "fade-up 0.4s ease both",
        "fade-in":   "fade-in 0.3s ease both",
        "scale-in":  "scale-in 0.35s cubic-bezier(0.34,1.56,0.64,1) both",
        "slide-in":  "slide-in-right 0.35s ease both",
        "pulse-slow":"pulse 3s ease infinite",
      },
    },
  },
};
