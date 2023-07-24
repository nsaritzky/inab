const plugin = require("tailwindcss/plugin")

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [
    require("@kobalte/tailwindcss"),
    require("tailwindcss-animate"),
    plugin(({ addVariant, e }) => {
      addVariant("data-focused", `&[data-focused="true"]`)
      addVariant("data-disabled", `&[data-disabled="true"]`)
      addVariant("data-has-value", `&[data-has-value="true"]`)
      addVariant("data-is-active", `&[data-is-active="true"]`)
      addVariant("data-multiple", `&[data-multiple="true"]`)
      addVariant("mark", "& > mark")
    }),
    plugin(({ addUtilities }) => {
      addUtilities({
        ".text-inherit": {
          font: "inherit",
        },
        ".outline-zero": {
          outline: "none",
        },
      })
    }),
  ],
}
