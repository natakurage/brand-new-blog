import { NavBar } from "@/components/NavBar";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  icons: {
    icon: "/favicons/favicon.ico",
    apple: "/favicons/apple-touch-icon.png"
  },
  openGraph: {
    siteName: "ナタクラゲのブログ",
    images: [
      {
        url: "/banner.png",
        width: 1200,
        height: 630,
        alt: "ナタクラゲのブログ OGP"
      }
    ]
  }
};

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="bg-base-200">
        <NavBar />
        <div className="mx-auto max-w-xl my-8 p-3 md:p-0">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
