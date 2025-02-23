/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
theme: {
    extend: {
      colors: {
        win95gray: "#c0c0c0",
        win95blue: "#0A246A",
        win95border: "#909090",
        win95green: "#008000",
        win95red: "#800000",
      },
      fontFamily: {
        terminal: ["IBM VGA 9x16"],
        main: ["W95FA"]
      }
    },
  },
  plugins: [],
};
