/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Outfit", "Inter", "sans-serif"],
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        luxury_dark: {
          "primary": "#d4af37", // Gold
          "secondary": "#1e293b", // Slate
          "accent": "#f59e0b", // Amber
          "neutral": "#0f172a", // Dark Slate
          "base-100": "#020617", // Very Dark Slate
          "info": "#38bdf8",
          "success": "#10b981",
          "warning": "#f59e0b",
          "error": "#ef4444",
        },
      },
      "light",
      "dark",
    ],
  },
}
