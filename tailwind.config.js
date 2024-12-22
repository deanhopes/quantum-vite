/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'editorial': ['PPEditorialOld', 'serif'],
      },
      animation: {
        'scan-y': 'scan-y 8s linear infinite',
        'scan-x': 'scan-x 12s linear infinite',
        'scroll-hint': 'scroll-hint 2s infinite',
        'data-stream': 'data-stream 3s linear infinite',
        'glitch': 'glitch 5s infinite',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'scan-y': {
          'from': { transform: 'translateY(-100%)' },
          'to': { transform: 'translateY(100%)' },
        },
        'scan-x': {
          'from': { transform: 'translateX(-100%)' },
          'to': { transform: 'translateX(100%)' },
        },
        'scroll-hint': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(5px)' },
        },
        'data-stream': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'glitch': {
          '0%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
          '100%': { transform: 'translate(0)' },
        },
        'pulse': {
          '0%': { transform: 'scale(1)', opacity: '0.5' },
          '50%': { transform: 'scale(1.05)', opacity: '0.8' },
          '100%': { transform: 'scale(1)', opacity: '0.5' },
        },
      },
      backgroundImage: {
        'grid-lines': `
          linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
        `,
        'grid-points': `
          linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
        `,
        'grid-scan': `radial-gradient(circle at center, rgba(255,255,255,0.1) 1px, transparent 1px)`,
      },
      backgroundSize: {
        'grid-sm': '24px 24px',
        'grid-lg': '96px 96px',
        'grid-points': '48px 48px',
      },
    },
  },
  plugins: [],
}

