/** @type {import('tailwindcss').Config} */
module.exports = {
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
        'editorial': ['"PP Editorial Old"', 'serif'],
        'mono': ['"Input Mono"', 'monospace'],
      },
      animation: {
        glitch: 'glitch 1s steps(2, end) infinite',
      },
      keyframes: {
        glitch: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      width: {
        '[300vw]': '300vw',
      },
      transitionProperty: {
        'transform': 'transform',
      },
      transformStyle: {
        'preserve-3d': 'preserve-3d',
      },
      backfaceVisibility: {
        'hidden': 'hidden',
      }
    },
  },
  plugins: [],
}

