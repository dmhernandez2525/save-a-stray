/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom colors matching the existing design
        'sky-blue': 'rgb(43, 177, 255)',
        'salmon': 'lightsalmon',
      },
      fontFamily: {
        'capriola': ['Capriola', 'sans-serif'],
      },
      gridTemplateColumns: {
        // Custom grid for the main layout
        'main': '5% 20% 50% 20% 5%',
        'splash': '15% 70% 15%',
        'splash-top': '35% 30% 35%',
      },
      gridTemplateRows: {
        'main': '10% 70% 20%',
        'nav': '15% 70% 15%',
        'splash-top': '75% 10% 15%',
      },
      animation: {
        'droop': 'droop 0.75s ease-in',
      },
      keyframes: {
        droop: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
