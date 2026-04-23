/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        'civitas-blue':       '#3D5A99',
        'civitas-blue-dark':  '#2E4577',
        'civitas-blue-light': '#5B7FE8',
        'civitas-blue-pale':  '#EEF2FF',
        'civitas-bg':         '#F0F2F8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
