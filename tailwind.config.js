/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      colors: {
        'brand-dark-blue': '#0A194C',
        'brand-blue': '#42A8C2',
        'brand-yellow': '#F7D840',
        'brand-white': '#FFFFFF',
      },
      backgroundColor: {
        primary: '#0A194C',
        secondary: '#1A295C',
        accent: '#42A8C2',
      },
      textColor: {
        primary: '#FFFFFF',
        secondary: '#a9b3d4',
        accent: '#42A8C2',
        highlight: '#F7D840',
      },
    },
  },
  // Insurance for dynamic class patterns. Most ternaries in this codebase
  // use full literal classes so the scanner sees them, but quiz feedback /
  // play-pause buttons sometimes flip between these colors and they're
  // cheap to guarantee here.
  safelist: [
    'animate-pulse',
    { pattern: /^(bg|text|border|ring)-(red|green|yellow|amber|blue|indigo|teal)-(300|400|500|600|700|800|900)(\/(20|30|40|50|60))?$/ },
    { pattern: /^hover:(bg|text)-(red|green|yellow|amber|blue|indigo|teal)-(500|600|700)$/ },
    { pattern: /^peer-checked:bg-(green|blue|teal)-(500|600)$/ },
  ],
  plugins: [],
};
