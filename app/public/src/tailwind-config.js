tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#13ec5b",
        "background-light": "#f6f8f6",
        "background-dark": "#102216",
      },
      fontFamily: {
        display: ["Manrope", "sans-serif"],
        body: ["Manrope", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        full: "9999px",
      },
      boxShadow: {
        'premium': '0 20px 25px -5px rgb(19 236 91 / 0.1), 0 8px 10px -6px rgb(19 236 91 / 0.1)',
      }
    },
  },
};
