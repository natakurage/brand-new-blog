import { NavBar } from "@/components/NavBar";
import "./globals.css";
import { Footer } from "@/components/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <NavBar />
        <div className="mx-auto max-w-xl my-8">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
