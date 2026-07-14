import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    container: {
      center: true,
      padding: "1.25rem",
      screens: {
        "2xl": "1280px"
      }
    },
    extend: {
      colors: {
        background: "#FFFDF8",
        foreground: "#1F2937",
        border: "hsl(40 30% 88%)",
        input: "hsl(40 30% 88%)",
        ring: "#0B4D3A",
        primary: {
          DEFAULT: "#0B4D3A",
          foreground: "#FFFDF8"
        },
        secondary: {
          DEFAULT: "#D4AF37",
          foreground: "#1F2937"
        },
        accent: {
          DEFAULT: "#F8F2E7",
          foreground: "#1F2937"
        },
        muted: {
          DEFAULT: "#F4EEE2",
          foreground: "#6B7280"
        },
        card: {
          DEFAULT: "#FFFCF5",
          foreground: "#1F2937"
        }
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem"
      },
      boxShadow: {
        soft: "0 20px 60px rgba(11, 77, 58, 0.12)",
        panel: "0 10px 30px rgba(31, 41, 55, 0.08)"
      },
      backgroundImage: {
        aura: "radial-gradient(circle at top, rgba(212, 175, 55, 0.18), transparent 35%), radial-gradient(circle at bottom right, rgba(11, 77, 58, 0.14), transparent 30%)"
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
};

export default config;
