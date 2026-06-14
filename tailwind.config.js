/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      maxWidth: "1180px",
    },
    extend: {
      colors: {
        paper: {
          DEFAULT: "#F4EFE3",
          50: "#FAF7EE",
          100: "#F4EFE3",
          200: "#E8DFC8",
          300: "#D9CBA6",
        },
        ink: {
          DEFAULT: "#1A1A1A",
          soft: "#3B3A36",
          mute: "#6B6A62",
        },
        moss: {
          DEFAULT: "#2F4F4F",
          50: "#EEF4F2",
          100: "#D6E4DD",
          500: "#2F4F4F",
          600: "#274242",
          700: "#1F3535",
        },
        wine: {
          DEFAULT: "#8B2635",
          50: "#F5E8EA",
          500: "#8B2635",
        },
        ochre: {
          DEFAULT: "#D4A017",
          50: "#FBF2D8",
          500: "#D4A017",
        },
        night: {
          DEFAULT: "#18160F",
          card: "#2A271E",
          text: "#E8E0C9",
        },
      },
      fontFamily: {
        display: ['Fraunces', 'ui-serif', 'Georgia', 'serif'],
        serif: ['Lora', 'ui-serif', 'Georgia', 'serif'],
        cn: ['"Noto Serif SC"', 'ui-serif', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        paper:
          "0 1px 0 rgba(26,26,26,0.04), 0 8px 24px -12px rgba(26,26,26,0.18)",
        card: "0 1px 0 rgba(26,26,26,0.06), 0 14px 28px -16px rgba(26,26,26,0.25)",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        flipY: {
          "0%": { transform: "perspective(1200px) rotateY(0deg)" },
          "100%": { transform: "perspective(1200px) rotateY(180deg)" },
        },
        drift: {
          "0%": { opacity: "0.9", transform: "translateY(0) scale(1)" },
          "100%": { opacity: "0", transform: "translateY(-28px) scale(0.6)" },
        },
      },
      animation: {
        "fade-up": "fadeUp 420ms cubic-bezier(.2,.7,.2,1) both",
        "flip-y": "flipY 420ms cubic-bezier(.2,.7,.2,1) both",
        drift: "drift 1200ms ease-out both",
      },
    },
  },
  plugins: [],
};
