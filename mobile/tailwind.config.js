/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#09090b", // Default zinc-950 for dark mode
        foreground: "#fafafa", // Default zinc-50
        primary: "#10b981", // emerald-500
        danger: "#ef4444", // red-500
        card: "#18181b", // zinc-900
        border: "#27272a" // zinc-800
      },
    },
  },
  plugins: [],
}
