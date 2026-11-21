import { NavBar } from "@/components/NavBar";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { repositories } from "@/lib/repositories";
import NextTopLoader from "nextjs-toploader";
import AntiAdblock from "@/components/AntiAdblock";
import { ThemeProvider } from "next-themes";
import { VisualEditing } from "next-sanity/visual-editing";
import { isPreview } from "@/lib/preview";
import PreviewWarning from "@/components/PreviewWarning";
import SideBar from "@/components/SideBar";
import { ORIGIN } from "@/lib/config";
import { siteOpenGraph } from "@/lib/metadata";

export async function generateMetadata() {
  const data = await repositories.siteSettings.get();
  return {
    description: data.description,
    metadataBase: new URL(ORIGIN),
    icons: {
      icon: data.favicon,
      apple: data.appleTouchIcon
    },
    openGraph: siteOpenGraph(data)
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const preview = await isPreview();
  const isDevelopment = process.env.NODE_ENV === "development";
  const data = await repositories.siteSettings.get();
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
              {preview && <PreviewWarning />}
              {children}
              {preview && <VisualEditing />}
            </div>
            { data.useSidebar && <SideBar pages={data.navbarPages} /> }
          </div>
          <Footer />
          { data.adblock && !preview && <AntiAdblock /> }
        </ThemeProvider>
      </body>
    </html>
  );
}
