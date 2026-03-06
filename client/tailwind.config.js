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
        'app-bg':      '#f5f3ee',
        'app-surface': '#ffffff',
        'app-raised':  '#fafaf8',

        // Borders
        'app-border':       '#e2dfd8',
        'app-border-light': '#c8c4bc',
        'app-border-bold':  '#2a2a2a',

        // Text
        'app-text':      '#1a1a1a',
        'app-secondary': '#666666',
        'app-muted':     '#999999',

        // Accent (indigo)
        'app-accent':        '#4f46e5',
        'app-accent-hover':  '#4338ca',
        'app-accent-light':  '#eef2ff',
        'app-accent-border': '#c7d2fe',

        // Status
        'app-success':       '#16a34a',
        'app-success-light': '#dcfce7',
        'app-error':         '#dc2626',
        'app-error-light':   '#fee2e2',
        'app-warning':       '#d97706',

        // Sudoku board cells
        'cell-highlight': '#e8f0fe',
        'cell-same':      '#fef9c3',
        'cell-revealed':  '#dcfce7',
        'cell-error-bg':  '#fee2e2',
      },
      fontFamily: {
        board: ['"Crimson Pro"', 'Georgia', 'serif'],
      },
      boxShadow: {
        app:    '0 2px 8px rgba(0, 0, 0, 0.08)',
        'app-lg': '0 8px 32px rgba(0, 0, 0, 0.12)',
      },
      borderRadius: {
        app:    '10px',
        'app-sm': '6px',
      },
    },
  },
  plugins: [],
};
