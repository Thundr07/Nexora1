/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        midnight: {
          DEFAULT: '#0D1321',
          light: '#141D32',
        },
        surface: {
          primary: '#1D2D44',
          secondary: '#3E5C76',
          accent: '#748CAB',
        },
        accent: {
          DEFAULT: '#748CAB',
          hover: '#95A9C4',
        },
        warm: {
          white: '#F0EBD8',
          secondary: '#B5AE9E',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Suisse International', 'IBM Plex Sans', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #0D1321 0%, #1D2D44 35%, #3E5C76 75%, #748CAB 100%)',
        'glass-gradient': 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
        'btn-gradient': 'linear-gradient(90deg, #3E5C76, #748CAB)',
      },
      boxShadow: {
        'glow': '0 0 15px rgba(116, 140, 171, 0.2)',
        'ai-glow': '0 0 25px rgba(116, 140, 171, 0.35)',
      }
    },
  },
  plugins: [],
}
