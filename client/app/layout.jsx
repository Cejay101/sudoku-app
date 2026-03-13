import './globals.css';

export const metadata = {
  title: 'Sudoku Multiplayer',
  description: 'Classic logic puzzle — solo or with friends',
};

const themeScript = `
  (function() {
    var t = localStorage.getItem('theme');
    var d = t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (d) document.documentElement.classList.add('dark');
  })();
`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen bg-app-bg text-app-text font-sans antialiased transition-colors duration-200">
        {children}
      </body>
    </html>
  );
}
