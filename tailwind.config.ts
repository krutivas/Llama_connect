import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef3f2',
          100: '#fee5e2',
          200: '#fccfca',
          300: '#faaea5',
          400: '#f68171',
          500: '#ed5845',
          600: '#da3b29',
          700: '#b72f1f',
          800: '#972a1d',
          900: '#7d291f',
        },
      },
    },
  },
  plugins: [],
}
export default config
