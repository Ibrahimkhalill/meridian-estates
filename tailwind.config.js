/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bone: '#F6F5F2',
        band: '#EDEBE6',
        line: '#DEDBD4',
        ink: '#16150F',
        muted: '#6E6B61',
        moss: '#3D5A45',
        'moss-hover': '#31492F',
        'on-dark': '#F6F5F2',
      },
      fontFamily: {
        display: ['"Instrument Serif"', 'serif'],
        body: ['"Instrument Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
