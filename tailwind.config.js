/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        champagne: {
          50: '#FDF9EF',
          100: '#FAF1D9',
          200: '#F3E1B3',
          300: '#E8CB84',
          400: '#D9B361',
          500: '#C9A961',
          600: '#B08B3F',
          700: '#8D6D31',
          800: '#6B5228',
          900: '#4A3A1D',
        },
        jade: {
          50: '#F0F5F3',
          100: '#D8E5DF',
          200: '#B2CBBF',
          300: '#7DA998',
          400: '#4D8071',
          500: '#2F6153',
          600: '#1A3C34',
          700: '#122B25',
          800: '#0D201C',
          900: '#081613',
        },
        cream: '#FAF8F3',
        warmGray: '#F5F2EC',
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', 'Georgia', 'serif'],
        sans: ['"PingFang SC"', '"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'gold': '0 4px 20px rgba(201, 169, 97, 0.25)',
        'card': '0 4px 16px rgba(0, 0, 0, 0.08)',
        'gold-lg': '0 10px 40px rgba(201, 169, 97, 0.35)',
        'inner-gold': 'inset 0 1px 0 rgba(201, 169, 97, 0.3)',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #E8CB84 0%, #C9A961 50%, #B08B3F 100%)',
        'gold-soft': 'linear-gradient(135deg, #FAF1D9 0%, #F3E1B3 100%)',
        'jade-gradient': 'linear-gradient(135deg, #2F6153 0%, #1A3C34 100%)',
        'card-1': 'linear-gradient(140deg, #FFF8E7 0%, #FDF0D1 100%)',
        'card-2': 'linear-gradient(140deg, #F0F9F5 0%, #D8EEDF 100%)',
        'card-3': 'linear-gradient(140deg, #FDF2F8 0%, #FAE6F1 100%)',
        'card-4': 'linear-gradient(140deg, #F0F4FF 0%, #E0E9FF 100%)',
        'card-5': 'linear-gradient(140deg, #FFF0F0 0%, #FFE0E0 100%)',
        'anonymous': 'linear-gradient(140deg, #F5EEFF 0%, #E8DDFF 100%)',
        'hero-gold': 'radial-gradient(ellipse at top, #F3E1B3 0%, transparent 60%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'bounce-soft': 'bounceSoft 2s ease-in-out infinite',
        'pulse-ring': 'pulseRing 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pulseRing: {
          '0%': { transform: 'scale(0.8)', opacity: '1' },
          '100%': { transform: 'scale(1.8)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};
