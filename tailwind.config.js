/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      height: {
        "10p": "10%",
        "90p": "90%",
        "1/12": "1/12",
        "11/12": "11/12",
      },
      maxHeight: {
        "11/12": "11/12",
      },
    },
  },
  plugins: ["prettier-plugin-tailwindcss"],
};
