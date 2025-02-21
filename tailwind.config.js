/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontSize: {
        xxs: "0.7rem",
        xs: "0.875rem",
        sm: "1rem",
        base: "1.125rem",
        lg: "1.25rem",
        xl: "1.5625rem",
        "2xl": "2.4375rem",
        "3xl": "3.75rem",
        "4xl": "6.25rem",
        "5xl": "10rem",
        "6xl": "16rem",
      },
      fontFamily: {
        "dela-gothic-one": ["Dela Gothic One", "serif"],
        "alte-haas-grotesk": ["alte_haas_grotesk", "sans-serif"],
        "montserrat": ["Montserrat", "sans-serif"],
      },
      boxShadow: {
        "dark": "0px 32px 29px -8px rgba(0,0,0,0.25)",
      },
      dropShadow: {
        "dark": "0px 32px 29px -8px rgba(0,0,0,0.25)",
      },  
      colors: {
        "green": "#07FF10",
        "dark-green": "#3FE80C",
        "light-green": "#03DF45",
        "lighter-green": "#49BA50",
        "light-blue": "#3FCCFF",
        "red":"#FF2407"
      },
    },
  },
  plugins: [],
};
