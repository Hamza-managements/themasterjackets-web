// tailwind.config.js
export default {
   darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./index.html"
  ],
  theme: {
    extend: {
      colors: {
        // Add custom colors if needed
        dark: {
          900: '#1e87f8ff',
          800: '#d305d3ff',
          700: '#e90d0dff',
          // Add more dark mode colors
        }
      }
    },
  },
  plugins: [],
}