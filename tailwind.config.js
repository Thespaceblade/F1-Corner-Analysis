module.exports = {
  content: [
    './app/**/*.{ts,tsx,js,jsx}',
    './components/**/*.{ts,tsx,js,jsx}',
    './pages/**/*.{ts,tsx,js,jsx}',
    './public/**/*.html'
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['var(--font-body)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        page: '#0d0f13',
        panel: '#12151b',
        surface: '#171b22',
        border: '#2a313a',
        text: '#e7eaee',
        subtext: '#9aa4b2',
        accent: '#7cc7ff'
      },
      borderRadius: {
        card: '14px',
        input: '10px'
      }
    }
  },
  plugins: []
}
