/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/routes/**/*.{svelte,js,ts,html,md}"],
  theme: {
    extend: {},
  },
  plugins: [require("@tailwindcss/typography")],
};
