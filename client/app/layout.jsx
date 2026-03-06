import './globals.css';

export const metadata = {
  title: 'Sudoku Multiplayer',
  description: 'Classic logic puzzle — solo or with friends',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-app-bg text-app-text font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
