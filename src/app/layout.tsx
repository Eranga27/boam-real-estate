import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BackToTop from "@/components/ui/BackToTop";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "Boam Real-Estates | Premium Property Listings in Sri Lanka",
    template: "%s | Boam Real-Estates",
  },
  description: "Discover premium real estate properties for sale and rent in Sri Lanka. Connect directly with owners and find your dream home with Boam Real-Estates.",
  keywords: ["Real Estate", "Sri Lanka", "Buy Property", "Rent House", "Land for Sale", "Colombo Real Estate"],
  authors: [{ name: "Boam Real-Estates" }],
  creator: "Boam Real-Estates",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://boam-realestates.com",
    title: "Boam Real-Estates | Find Your Dream Home",
    description: "Discover premium real estate properties for sale and rent in Sri Lanka.",
    siteName: "Boam Real-Estates",
  },
  twitter: {
    card: "summary_large_image",
    title: "Boam Real-Estates",
    description: "Discover premium real estate properties for sale and rent in Sri Lanka.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow pt-16">
              {children}
            </main>
            <Footer />
          </div>
          <BackToTop />
        </AuthProvider>
      </body>
    </html>
  );
}
