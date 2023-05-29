const defaultTheme = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,njk}',
    './src/css/**/*.css',
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ["'Lexend'", ...defaultTheme.fontFamily.sans],
        'dm-mono': ["'DM Mono'", ...defaultTheme.fontFamily.mono],
      }
    },
  },
  plugins: [],
}
