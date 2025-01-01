/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        quantum: {
          black: '#000000',
          green: 'rgb(0, 255, 200)',
          'green-dark': 'rgba(0, 255, 200, 0.2)',
          'green-glow': 'rgba(0, 255, 200, 0.1)',
        }
      },
      fontFamily: {
        'quantum-mono': ['JetBrains Mono', 'monospace'],
        'geist': ['Geist Sans', 'sans-serif'],
      },
      animation: {
        'glitch-slide': 'glitch-slide 2s linear infinite',
        'glitch-fast': 'glitch-fast 0.4s steps(2) infinite',
        'scan': 'scanline 4s linear infinite',
        'quantum-pulse': 'quantum-pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      backgroundImage: {
        'gradient-quantum': 'radial-gradient(circle at center, rgba(15, 15, 15, 0.9) 0%, rgba(0, 0, 0, 0.98) 100%)',
        'scanline': 'repeating-linear-gradient(to bottom, transparent 0%, rgba(0, 255, 200, 0.05) 0.5%, transparent 1%)',
        'glitch-pattern': 'repeating-linear-gradient(90deg, rgba(0, 255, 200, 0.03) 0px, rgba(0, 255, 200, 0.03) 1px, transparent 1px, transparent 3px), repeating-linear-gradient(0deg, rgba(0, 255, 200, 0.03) 0px, rgba(0, 255, 200, 0.03) 1px, transparent 1px, transparent 3px)',
      },
    },
  },
  plugins: [],
}

