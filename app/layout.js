import "./globals.css"; // ✅ Ensure this is imported

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>Weather App</title>
      </head>
      <body>{children}</body>
    </html>
  );
}
