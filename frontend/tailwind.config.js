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
        "gray-text": "#7D7D7D",
        "yellow-in-progress": "#F6EEDC",
        "green-completed": "#DDE9E5",
        "gray-unfinished": "#EAEAEA",
        "orange-primary": "#F35D21"
      }
    },
  },
  plugins: [],
  mode: "jit"
}

