/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#111827",
        muted: "#6B7280",
        card: "#FFFFFF",
        secondary: "#F9FAFB",
        accent: "#F59E0B",
      },
    },
  },
  plugins: [],
};
