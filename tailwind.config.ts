import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        navy: {
          50: '#f2f6fb',
          100: '#e2ebf5',
          200: '#c3d5e9',
          300: '#94b3d5',
          400: '#5e8abc',
          500: '#3a6aa2',
          600: '#265186',
          700: '#1b416c',
          800: '#12355B',
          900: '#0e2a49',
          950: '#081a2e',
        },
        amber: {
          50: '#fff9ec',
          100: '#fff0cd',
          200: '#ffdd95',
          300: '#ffc55d',
          400: '#fdad2f',
          500: '#F4A300',
          600: '#d88600',
          700: '#b26700',
          800: '#8f5008',
          900: '#76420c',
        },
        sea: {
          50: '#f0faf4',
          100: '#daf2e3',
          200: '#b7e4c9',
          300: '#86cea6',
          400: '#52b17e',
          500: '#2E8B57',
          600: '#217547',
          700: '#1b5d3a',
          800: '#184a30',
          900: '#143d29',
        },
        primary: '#12355B',
        secondary: '#2E8B57',
        accent: '#F4A300',
        'light-gray': '#F5F7FA',
      },
      boxShadow: {
        card: '0 1px 2px rgba(18, 53, 91, 0.04), 0 8px 24px -12px rgba(18, 53, 91, 0.16)',
        lift: '0 24px 48px -20px rgba(18, 53, 91, 0.32)',
        float: '0 18px 50px -12px rgba(18, 53, 91, 0.22)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
};

export default config;
