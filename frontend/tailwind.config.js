/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0B0F19',
          card: '#131A2A',
          border: '#2A344A',
          accent: '#2563EB',
          yellow: '#F59E0B',
          green: '#10B981',
          red: '#EF4444',
          expedia: '#00256C'
        }
      }
    },
  },
  plugins: [],
}
