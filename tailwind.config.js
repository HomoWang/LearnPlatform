/** @type {import('tailwindcss').Config} */

// 手帳文具風設計系統：slate / teal 兩組色階整組重新映射成暖色，
// 讓既有頁面（大量使用 text-slate-*、bg-teal-* 等 class）一次換上暖色皮膚。
// slate = 暖墨色階（紙 → 墨），teal = 奶油黃/蜂蜜色動作色階。
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        slate: {
          50: "#FBF5E9",
          100: "#F7EFDF",
          200: "#E9DCC8",
          300: "#D8C6A8",
          400: "#B4A28C",
          500: "#8A7A6A",
          600: "#6E5F50",
          700: "#5A4C3E",
          800: "#4E4235",
          900: "#453A2F",
          950: "#3B3128"
        },
        teal: {
          50: "#FFF8E4",
          100: "#FFF0C4",
          200: "#FFE49A",
          300: "#FFD66B",
          400: "#F2B94B",
          500: "#D99C2B",
          600: "#C6871F",
          700: "#A9701A",
          800: "#8A5A16",
          900: "#6E4812",
          950: "#5A3A0E"
        },
        paper: "#FFF9F0",
        card: "#FFFDF8",
        ink: "#453A2F",
        inksoft: "#8A7A6A",
        butter: "#FFD66B",
        net: { DEFAULT: "#6FAEE0", tint: "#EAF4FC", deep: "#3E6C9E" },
        dba: { DEFAULT: "#7CC9A6", tint: "#E9F7EF", deep: "#3E7D5F" },
        dev: { DEFAULT: "#FF9E73", tint: "#FFEFE5", deep: "#B25B33" }
      },
      fontFamily: {
        hn: ['"Huninn"', '"Noto Sans TC"', "sans-serif"],
        sans: ['"Noto Sans TC"', '"Microsoft JhengHei"', "system-ui", "sans-serif"]
      },
      boxShadow: {
        sticker: "4px 4px 0 rgba(69, 58, 47, 0.09)",
        "sticker-sm": "2.5px 2.5px 0 rgba(69, 58, 47, 0.12)",
        "sticker-press": "3px 3px 0 rgba(69, 58, 47, 0.18)",
        soft: "0 1px 2px rgba(69, 58, 47, 0.08), 0 12px 32px rgba(69, 58, 47, 0.08)"
      },
      borderRadius: {
        sticker: "18px"
      }
    }
  },
  plugins: []
};
