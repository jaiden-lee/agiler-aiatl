/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "blue-text": "#2196F3",
        "gray-text": "#7D7D7D"
      }
    },
  },
  plugins: [],
  mode: "jit"
}

