/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'quantum-black': '#000000',
        'quantum-white': '#ffffff',
      },
      fontFamily: {
        'geist-mono': ['GeistMono', 'monospace'],
      },
    },
  },
  plugins: [],
}

