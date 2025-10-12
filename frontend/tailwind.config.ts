import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        noir: {
          darker: '#0a0a0a',
          dark: '#1a1a1a',
          medium: '#2d2d2d',
          light: '#404040',
        },
        accent: {
          gold: '#d4af37',
          rose: '#ff6b9d',
          purple: '#9b59b6',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
