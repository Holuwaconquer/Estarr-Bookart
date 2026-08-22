/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
      paper: '#FAF6EE',
      ink: '#1C2430',
      'ink-soft': '#565F6E',
      gold: '#B8863E',
      'gold-deep': '#8F6529',
      forest: '#2F4A3D',
      cardinal: '#7A2E2E',
      line: '#E4DDCB',
    },
    fontFamily: {
      serif: ['Fraunces', 'serif'],
      mono: ['"IBM Plex Mono"', 'monospace'],
    },
      animation: {
        'shimmer': 'shimmer 2s infinite linear',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      }
    }
  },
  plugins: [],
}