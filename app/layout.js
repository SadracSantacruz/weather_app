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
