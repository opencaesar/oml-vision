/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './public/**/*.html',
    './view/src/**/*.{js,jsx,ts,tsx,css}'
  ],
  darkMode: 'media', // or 'media' or 'class'
  theme: {
    extend: {},
    fontSize: {
      xxs: '0.675rem'
    }
  },
  variants: {
    extend: {},
  },
}