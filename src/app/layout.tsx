import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import { Header, Footer } from '@/components/layout';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    template: '%s | Learn STR by GoStudioM',
    default: 'Learn STR by GoStudioM - Knowledge Hub for Short-Term Rental Hosts',
  },
  description:
    'The ultimate knowledge hub for Airbnb and VRBO hosts. Watch curated videos, read industry news, and chat with AI to level up your STR business.',
  keywords: [
    'Airbnb',
    'VRBO',
    'short-term rental',
    'vacation rental',
    'STR',
    'hosting tips',
    'property management',
    'rental income',
  ],
  authors: [{ name: 'GoStudioM' }],
  creator: 'GoStudioM',
  publisher: 'GoStudioM',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'https://learn.gostudiom.com'
  ),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Learn STR by GoStudioM',
    title: 'Learn STR by GoStudioM - Knowledge Hub for Short-Term Rental Hosts',
    description:
      'The ultimate knowledge hub for Airbnb and VRBO hosts. Watch curated videos, read industry news, and chat with AI.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Learn STR by GoStudioM - Knowledge Hub for Short-Term Rental Hosts',
    description:
      'The ultimate knowledge hub for Airbnb and VRBO hosts. Watch curated videos, read industry news, and chat with AI.',
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
  return (
    <html lang="en" className={inter.className}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className="min-h-screen flex flex-col antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />

        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GA_TRACKING_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_TRACKING_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_TRACKING_ID}');
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
