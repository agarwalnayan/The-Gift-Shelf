/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf3f0',
          100: '#fbe4dc',
          200: '#f6c4b3',
          300: '#eea082',
          400: '#e37a52',
          500: '#d15a30',
          600: '#b04423',
          700: '#8c351c',
          800: '#6c291a',
          900: '#4f1e14',
        },
        cream: '#faf6f0',
        charcoal: '#232019',
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
