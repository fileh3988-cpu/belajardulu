import './globals.css';

export const metadata = {
  title: 'Live Photowall',
  description: 'Interactive event photowall',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      
      <body>
        {children}
      </body>
    </html>
  );
}