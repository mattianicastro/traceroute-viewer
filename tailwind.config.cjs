/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: ["alert", "alert-error", "alert-info", "alert-warning"],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")]
}
