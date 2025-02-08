module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./index.html",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1E40AF",
        secondary: "#F59E0B"
      },
      maxWidth: {
        '4xl': '50%',  // Changed from 50% to 100%
      },
    },
  },
  plugins: [],
}
