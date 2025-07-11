import { NavBar } from "@/components/NavBar";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { loadGlobalSettings } from "@/lib/globalSettings";
import NextTopLoader from "nextjs-toploader";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import { MdRssFeed } from "react-icons/md";
import AntiAdblock from "@/components/AntiAdblock";
import { ThemeProvider } from "next-themes";

export async function generateMetadata() {
  const data = await loadGlobalSettings();
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_ORIGIN || "http://localhost:3000"),
    icons: {
      icon: data.favicon,
      apple: data.appleTouchIcon
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
}

// export const runtime = "edge";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const data = await loadGlobalSettings();
  return (
    <html suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <NextTopLoader
            color="#FF50DF"
          />
          <NavBar
            topLogo={data.topLogo}
            siteName={data.siteName}
            useSidebar={data.useSidebar}
            navbarPages={data.navbarPages}
          />
          <div className="flex justify-center gap-10 md:mx-4 my-8">
            <div className="max-w-2xl p-3 w-full">
              {children}
            </div>
            {
              data.useSidebar && 
              <aside className="hidden md:block max-w-72">
                <ul className="menu p-3 overflow-y-auto w-full bg-base-100 text-base-content bg-opacity-100">
                {
                    data.navbarPages?.map(({ name, href }) => (
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
