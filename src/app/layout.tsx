import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <div className="mx-auto max-w-xl">
          {children}
        </div>
      </body>
    </html>
  );
}
