/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eef6ff",
          100: "#d9ebff",
          200: "#b9d9ff",
          300: "#8fc1ff",
          400: "#63a3ff",
          500: "#3b82f6",
          600: "#2f68d1",
          700: "#2956a8",
          800: "#244a8a",
          900: "#1f3f73"
        },
        accent: "#10b981"
      },
      fontFamily: {
        display: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        body: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      backgroundImage: {
        "hero-pattern": "url('/hero.jpg')"
      }
    }
  },
  plugins: []
};


