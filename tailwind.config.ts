import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FFF8F0",
        coral: {
          50: "#FFF2EE",
          100: "#FFE1D8",
          200: "#FFC4B1",
          300: "#FFA68A",
          400: "#FF8C7A",
          500: "#FF6B5A",
          600: "#E85444",
        },
        teal: {
          50: "#ECFAF9",
          100: "#C8F1ED",
          200: "#93E3DC",
          300: "#5ED5CA",
          400: "#4ECDC4",
          500: "#2FB4AB",
          600: "#228F88",
        },
        lavender: {
          100: "#EDE7FB",
          200: "#D7CAF6",
          300: "#B4A5E8",
          400: "#8F7ED4",
        },
        sunny: {
          200: "#FFE999",
          300: "#FFD93D",
          400: "#F5C518",
        },
        plum: {
          700: "#3E2A62",
          800: "#2D1B4E",
          900: "#1E1136",
        },
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-nunito)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        soft: "0 20px 60px -20px rgba(45, 27, 78, 0.18)",
        glow: "0 0 0 6px rgba(78, 205, 196, 0.18)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-18px) rotate(3deg)" },
        },
        wobble: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(30px, -20px) scale(1.05)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.95)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        wobble: "wobble 14s ease-in-out infinite",
        shimmer: "shimmer 6s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
