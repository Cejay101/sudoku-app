/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './store/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // App background & surfaces
        'app-bg':      'var(--app-bg)',
        'app-surface': 'var(--app-surface)',
        'app-raised':  'var(--app-raised)',

        // Borders
        'app-border':       'var(--app-border)',
        'app-border-light': 'var(--app-border-light)',
        'app-border-bold':  'var(--app-border-bold)',

        // Text
        'app-text':      'var(--app-text)',
        'app-secondary': 'var(--app-secondary)',
        'app-muted':     'var(--app-muted)',

        // Accent (indigo)
        'app-accent':        'var(--app-accent)',
        'app-accent-hover':  'var(--app-accent-hover)',
        'app-accent-light':  'var(--app-accent-light)',
        'app-accent-border': 'var(--app-accent-border)',

        // Status
        'app-success':       'var(--app-success)',
        'app-success-light': 'var(--app-success-light)',
        'app-error':         'var(--app-error)',
        'app-error-light':   'var(--app-error-light)',
        'app-warning':       'var(--app-warning)',

        // Sudoku board cells
        'cell-highlight': 'var(--cell-highlight)',
        'cell-same':      'var(--cell-same)',
        'cell-revealed':  'var(--cell-revealed)',
        'cell-error-bg':  'var(--cell-error-bg)',
      },
      fontFamily: {
        board: ['"Crimson Pro"', 'Georgia', 'serif'],
      },
      boxShadow: {
        app:    'var(--shadow-app)',
        'app-lg': 'var(--shadow-app-lg)',
      },
      borderRadius: {
        app:    '10px',
        'app-sm': '6px',
      },
    },
  },
  plugins: [],
};
