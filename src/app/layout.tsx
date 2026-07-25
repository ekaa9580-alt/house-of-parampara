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

export const metadata: Metadata = {
  title: {
    default: "House of Parampara | Bringing Tradition to Life",
    template: "%s | House of Parampara",
  },
  description:
    "Luxury Indian ethnic wear — sarees, festive collections, and heritage craft. Bringing tradition to life.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  openGraph: {
    title: "House of Parampara",
    description: "Bringing Tradition to Life",
    type: "website",
  },
};

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
