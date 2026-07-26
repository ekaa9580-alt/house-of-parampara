import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import { Providers } from "@/components/providers/Providers";
import { PageTransition } from "@/components/providers/PageTransition";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { QuickView } from "@/components/product/QuickView";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { BrandTheme } from "@/components/cms/BrandTheme";
import { fetchSettings } from "@/lib/data/commerce";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-cormorant",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-outfit",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  try {
    const s = await fetchSettings();
    const title =
      s.seo_title ||
      (s.site_name
        ? `${s.site_name}${s.tagline ? ` | ${s.tagline}` : ""}`
        : undefined);
    return {
      title: title
        ? { default: title, template: s.site_name ? `%s | ${s.site_name}` : "%s" }
        : undefined,
      description: s.seo_description || s.tagline || undefined,
      metadataBase: new URL(
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
      ),
      openGraph: {
        title: s.seo_title || s.site_name || undefined,
        description: s.seo_description || s.tagline || undefined,
        images: s.seo_og_image ? [{ url: s.seo_og_image }] : undefined,
        type: "website",
      },
      icons: s.favicon ? { icon: s.favicon } : undefined,
    };
  } catch {
    return {
      metadataBase: new URL(
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
      ),
    };
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${cormorant.variable} ${outfit.variable} min-h-screen font-body antialiased`}
      >
        <Providers>
          <BrandTheme />
          <ErrorBoundary>
            <Header />
            <main className="min-h-screen">
              <PageTransition>{children}</PageTransition>
            </main>
            <Footer />
            <CartDrawer />
            <QuickView />
            <WhatsAppButton />
          </ErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}
