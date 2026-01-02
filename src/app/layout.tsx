import { NavBar } from "@/components/NavBar";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { loadGlobalSettings } from "@/lib/cms";
import NextTopLoader from "nextjs-toploader";
import AntiAdblock from "@/components/AntiAdblock";
import { ThemeProvider } from "next-themes";
import { VisualEditing } from "next-sanity/visual-editing";
import { draftMode } from "next/headers";
import PreviewWarning from "@/components/PreviewWarning";
import SideBar from "@/components/SideBar";

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
  const { isEnabled } = draftMode();
  const isDevelopment = process.env.NODE_ENV === "development";
  const data = await loadGlobalSettings();
  return (
    <html lang="ja" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <NextTopLoader
            color="#ED5126"
          />
          <NavBar
            topLogo={data.topLogo}
            siteName={data.siteName}
            useSidebar={data.useSidebar}
            navbarPages={data.navbarPages}
            isDevelopment={isDevelopment}
          />
          <div className="flex justify-center gap-10 md:mx-4 my-8">
            <div className="max-w-2xl p-3 w-full">
              {isEnabled && <PreviewWarning />}
              {children}
              {isEnabled && <VisualEditing />}
            </div>
            { data.useSidebar && <SideBar pages={data.navbarPages} /> }
          </div>
          <Footer />
          { data.adblock && !isEnabled && <AntiAdblock /> }
        </ThemeProvider>
      </body>
    </html>
  );
}
