export const orange = "#FF6B35";

/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // inDrive-inspired palette
        primary: "#1A1A1A", // Dark background
        secondary: "#FFFFFF", // White for cards and text
        accent: "#C7FF00", // Lime green accent (inDrive's signature color)
        "accent-dark": "#A8D600", // Darker lime for pressed states
        orange: orange, // Keep for backward compatibility
        font: "#1A1A1A", // Dark text
        "font-secondary": "#6B7280", // Gray text
        "font-light": "#9CA3AF", // Light gray text
        menu: "#E8E8E8CC",
        card: "#FFFFFF", // White cards
        "card-border": "#E5E7EB", // Light border
        background: "#F5F5F5", // Light gray background alternative
        "dark-bg": "#2D2D2D", // Slightly lighter dark for contrast
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
        card: "0px 2px 8px rgba(0, 0, 0, 0.08)",
        "card-hover": "0px 4px 12px rgba(0, 0, 0, 0.12)",
      },
      borderRadius: {
        card: "16px",
        button: "12px",
      },
    },
  },
  plugins: [],
};
