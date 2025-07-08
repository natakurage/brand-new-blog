import { NavBar } from "@/components/NavBar";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { Metadata } from "next";
import data from "@/app/data/data.json";
import NextTopLoader from "nextjs-toploader";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import { MdRssFeed } from "react-icons/md";
import AntiAdblock from "@/components/AntiAdblock";
import { ThemeProvider } from "next-themes";
import Script from "next/script";
import type {  WebSite, WithContext } from "schema-dts";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_ORIGIN || "http://localhost:3000"),
  icons: {
    icon: "/favicons/favicon.ico",
    apple: "/favicons/apple-touch-icon.png"
  },
  openGraph: {
    siteName: data.siteName,
    images: [
      {
        url: "/banner.png",
        width: 1200,
        height: 630,
        alt: data.siteName + " OGP"
      }
    ]
  }
};

// export const runtime = "edge";

function JsonLD() {
  const jsonLd: WithContext<WebSite> = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: data.siteName,
    url: process.env.NEXT_PUBLIC_ORIGIN,
    description: data.description,
    image: new URL("/banner.png", process.env.NEXT_PUBLIC_ORIGIN).href,
    potentialAction: {
      "@type": "SearchAction",
      target: new URL("/search?q={search_term_string}", process.env.NEXT_PUBLIC_ORIGIN).href,
      // @ts-expect-error: 'query-input' is not in the schema-dts types but required by schema.org
      "query-input": "required name=search_term_string"
    },
  };

  return (
    <Script
      id="json-ld-website"
      type="application/ld+json"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning>
      <body>
        <JsonLD />
        <ThemeProvider>
          <NextTopLoader
            color="#FF50DF"
          />
          <NavBar />
          <div className="flex justify-center gap-10 md:mx-4 my-8">
            <div className="max-w-2xl p-3 w-full">
              {children}
            </div>
            {
              data.useSidebar && 
              <aside className="hidden md:block max-w-72">
                <ul className="menu p-3 overflow-y-auto w-full bg-base-100 text-base-content bg-opacity-100">
                {
                    data.navbarPages.map(({ name, href }) => (
                      <li key={name}>
                        <Link href={href} >{name}</Link>
                      </li>
                    ))
                  }
                  <li><SearchBar /></li>
                  <li className="flex flex-row">
                    <Link href="/rss">
                      <MdRssFeed size={24} />
                    </Link>
                  </li>
                </ul>
              </aside>
            }
          </div>
          <Footer />
          {
            data.adblock && <AntiAdblock />
          }
        </ThemeProvider>
      </body>
    </html>
  );
}
