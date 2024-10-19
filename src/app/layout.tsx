import { NavBar } from "@/components/NavBar";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  icons: {
    icon: "/favicons/favicon.ico",
    apple: "/favicons/apple-touch-icon.png"
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="bg-base-200">
        <NavBar />
        <div className="mx-auto max-w-xl my-8">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
