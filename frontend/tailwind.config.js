/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
      },
      fontSize: {
        xs: ["11px", "16.5px"],
        sm: ["11.38px", "17px"],
        md: ["12px", "18px"],
        lg: ["13px", "19.5px"],
        xl: ["16px", "24px"],
        "2xl": ["19.5px", "29.25px"],
        "3xl": ["20px", "30px"],
      },
      spacing: {
        "1": "2.5px",
        "2": "4px",
        "3": "6.4px",
        "4": "7.52px",
        "5": "8px",
        "6": "10px",
        "7": "12px",
        "8": "16px",
      },
      borderRadius: {
        xs: "3.2px",
        sm: "4px",
      },
      boxShadow: {
        "1": "rgba(0, 0, 0, 0) 0px 0px 0px 9999px inset",
        "2": "rgb(239, 242, 247) -1px 0px 0px 0px",
        "3": "rgba(18, 38, 63, 0.03) 0px 12px 24px 0px",
      },
      colors: {
        textPrimary: "#212529",
        textSecondary: "#ffffff",
        surfaceBase: "#000000",
        textInverse: "#555b6d",
        surfaceRaised: "#f8f9fa",
        surfaceStrong: "#fff8dd",
      }
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        pawn_light: {
          "primary": "#d4af37",
          "secondary": "#212529",
          "accent": "#f59e0b",
          "neutral": "#212529",
          "base-100": "#ffffff",
          "base-200": "#f8f9fa",
          "base-300": "#eff2f7",
          "info": "#3b82f6",
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
