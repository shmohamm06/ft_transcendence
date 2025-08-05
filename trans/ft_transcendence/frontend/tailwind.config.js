/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './dist/index.html',
    './dist/**/*.js',
    './src/**/*.ts',
    './src/**/*.tsx',
    './src/**/*.js',
    './src/**/*.jsx',
  ],
  theme: {
    extend: {
      colors: {
        'primary-bg': '#1e1b3c',
        'secondary-bg': '#2a2550',
        'accent-bg': '#1a1a3a',
        'deep-bg': '#0f1419',
        'electric-green': '#CCFF00',
        'electric-green-dark': '#9ADB00',
        'electric-green-light': '#E5FF66',
        'ev-blue': {
          900: '#1e1b3c',
          800: '#2a2550',
          700: '#1a1a3a',
          600: '#0f1419',
        }
      },
      fontFamily: {
        'sans': ['Inter', 'Arial', 'sans-serif'],
      },
      backdropBlur: {
        '20': '20px',
      },
      borderRadius: {
        '16': '16px',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(204, 255, 0, 0.3)',
        'glow-lg': '0 0 40px rgba(204, 255, 0, 0.4)',
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(204, 255, 0, 0.2)' },
          '50%': { boxShadow: '0 0 30px rgba(204, 255, 0, 0.4)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
};
