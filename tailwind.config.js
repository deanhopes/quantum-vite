/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Geist Sans', 'system-ui', 'sans-serif'],
        'mono': ['Geist Mono', 'monospace'],
        'editorial': ['PPEditorialOld', 'serif'],
        'input': ['Input Mono', 'monospace'],
      },
    },
    plugins: [],
  }
}
