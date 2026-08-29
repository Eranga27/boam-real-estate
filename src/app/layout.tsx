import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import BackToTop from '@/components/ui/BackToTop';
import { getSiteUrl, SITE_SEO, getOgImageUrl } from '@/lib/site';

export const viewport: Viewport = {
  themeColor: '#0E2A49',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: SITE_SEO.defaultTitle,
    template: SITE_SEO.titleTemplate,
  },
  description: SITE_SEO.description,
  keywords: [
    'BOAM Real Estates',
    'Real Estate Sri Lanka',
    'Buy House Sri Lanka',
    'Land for Sale Sri Lanka',
    'Commercial Property Colombo',
    'Estate Land Kalutara',
    'Luxury House Kandy',
  ],
  authors: [{ name: SITE_SEO.siteName }],
  creator: SITE_SEO.siteName,
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    title: SITE_SEO.defaultTitle,
    description: SITE_SEO.description,
    siteName: SITE_SEO.siteName,
    images: [
      {
        url: getOgImageUrl('/images/boamnormallogo.png'),
        width: 1200,
        height: 630,
        alt: 'BOAM Real Estates — Premium Property Listings in Sri Lanka',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_SEO.defaultTitle,
    description: SITE_SEO.description,
    images: [getOgImageUrl('/images/boamnormallogo.png')],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Global RealEstateAgent JSON-LD Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: 'BOAM Real Estates',
    url: siteUrl,
    telephone: SITE_SEO.contactPhone,
    email: SITE_SEO.contactEmail,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'No. 326, George E. De Silva Mawatha',
      addressLocality: 'Kandy',
      addressRegion: 'Central Province',
      addressCountry: 'LK',
    },
    areaServed: 'Sri Lanka',
    description: SITE_SEO.description,
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans bg-navy-50/50 text-navy-950 antialiased">
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
          <BackToTop />
        </AuthProvider>
      </body>
    </html>
  );
}
