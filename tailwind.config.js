export const orange = "#FF6B35";

/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#0B503D",
        secondary: "#FFFFFF",
        orange: orange,
        font: "#000000",
        menu: "#E8E8E8CC",
      },
      fontFamily: {
        sf: [
          "System",
          "SF Pro Display",
          "-apple-system",
          "BlinkMacSystemFont",
          "Roboto",
          "sans-serif",
        ],
      },
      fontWeight: {
        normal: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
      },
      boxShadow: {
        "custom-10": "10px 10px 0px -3px rgba(0,0,0,0.25)",
      },
    },
  },
  plugins: [],
};
