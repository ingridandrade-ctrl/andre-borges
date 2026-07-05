/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./assets/js/**/*.js"],
  theme: {
    extend: {
      colors: {
        bone: "rgb(var(--bone-rgb) / <alpha-value>)",
        "bone-warm": "rgb(var(--bone-warm-rgb) / <alpha-value>)",
        ink: "rgb(var(--ink-rgb) / <alpha-value>)",
        "ink-deep": "rgb(var(--ink-deep-rgb) / <alpha-value>)",
        "ink-soft": "rgb(var(--ink-soft-rgb) / <alpha-value>)",
        ember: "rgb(var(--ember-rgb) / <alpha-value>)",
        "ember-deep": "rgb(var(--ember-deep-rgb) / <alpha-value>)",
        moss: "rgb(var(--moss-rgb) / <alpha-value>)",
        "moss-light": "rgb(var(--moss-light-rgb) / <alpha-value>)",
        border: "var(--border)",
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["'IBM Plex Mono'", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
