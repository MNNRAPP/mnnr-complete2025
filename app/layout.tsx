import { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Footer from '@/components/ui/Footer';
import Navbar from '@/components/ui/Navbar';
import { Toaster } from '@/components/ui/Toasts/toaster';
import { PostHogProvider } from '@/providers/PostHogProvider';
import { PropsWithChildren, Suspense } from 'react';
import { getURL } from '@/utils/helpers';
import 'styles/main.css';

// Optimize font loading with next/font
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
});

const title = 'MNNR - Payments for Machines';
const description = 'Pay-per-call billing for AI agents, APIs, and autonomous systems. Usage tracking, spend caps, and real-time settlement.';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#000000',
};

export const metadata: Metadata = {
  metadataBase: new URL(getURL()),
  title: {
    default: title,
    template: '%s | MNNR',
  },
  description: description,
  keywords: ['AI billing', 'API monetization', 'usage tracking', 'machine payments', 'agent billing', 'LLM billing'],
  authors: [{ name: 'MNNR' }],
  creator: 'MNNR',
  publisher: 'MNNR',
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
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: getURL(),
    siteName: 'MNNR',
    title: title,
    description: description,
    images: [
      {
        url: '/mnnr-logo-full.svg',
        width: 1200,
        height: 630,
        alt: 'MNNR - Payments for Machines',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: title,
    description: description,
    images: ['/mnnr-logo-full.svg'],
  },
  icons: {
    icon: '/mnnr-icon.svg',
    apple: '/mnnr-icon.svg',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* Preconnect to external domains for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.stripe.com" />
        <link rel="dns-prefetch" href="https://js.stripe.com" />
        {/* Preload critical assets */}
        <link rel="preload" href="/mnnr-icon.svg" as="image" type="image/svg+xml" />
      </head>
      <body className={`${inter.className} bg-black antialiased`}>
        <PostHogProvider>
          {/* Skip to main content link for accessibility */}
          <a 
            href="#main-content" 
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-emerald-500 focus:text-black focus:rounded-lg"
          >
            Skip to main content
          </a>
          <Navbar />
          <main
            id="main-content"
            className="min-h-[calc(100dvh-4rem)] md:min-h-[calc(100dvh-5rem)]"
          >
            {children}
          </main>
          <Footer />
          <Suspense>
            <Toaster />
          </Suspense>
        </PostHogProvider>
      </body>
    </html>
  );
}
