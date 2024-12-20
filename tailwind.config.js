/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: true,
    styled: true,
    themes: true,
    base: true,
    utils: true,
    logs: true,
    rtl: false,
  },
};
