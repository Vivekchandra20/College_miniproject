export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: '#4F46E5',
        secondary: '#22C55E',
        background: '#0F172A',
        surface: '#1E293B',
        textPrimary: '#F1F5F9',
        textSecondary: '#94A3B8',
      },
    },
  },
  plugins: [],
};
