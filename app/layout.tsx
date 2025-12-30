import { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Footer from '@/components/ui/Footer';
import Navbar from '@/components/ui/Navbar';
import { Toaster } from '@/components/ui/Toasts/toaster';
import { PostHogProvider } from '@/providers/PostHogProvider';
import { CurrencyProvider } from '@/components/providers/CurrencyProvider';
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

const title = 'MNNR - Payments Infrastructure for the Machine Economy';
const description = 'The universal billing layer for autonomous systems. One API to track usage, enforce limits, and collect payments from any machine, agent, or protocol.';

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
  keywords: [
    'AI billing', 
    'API monetization', 
    'usage tracking', 
    'machine payments', 
    'agent billing', 
    'LLM billing',
    'machine economy',
    'autonomous systems',
    'crypto payments',
    'x402 protocol',
    'agent wallets',
    'M2M payments'
  ],
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
    alternateLocale: ['zh_CN', 'es_ES'],
    url: getURL(),
    siteName: 'MNNR',
    title: title,
    description: description,
    images: [
      {
        url: '/mnnr-logo-full.svg',
        width: 1200,
        height: 630,
        alt: 'MNNR - Payments Infrastructure for the Machine Economy',
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
    icon: '/mnnr-icon-animated.svg',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
    other: [
      { rel: 'icon', type: 'image/png', sizes: '32x32', url: '/favicon-32.png' },
      { rel: 'icon', type: 'image/png', sizes: '16x16', url: '/favicon-16.png' },
      { rel: 'icon', type: 'image/png', sizes: '192x192', url: '/icon-192.png' },
      { rel: 'icon', type: 'image/png', sizes: '512x512', url: '/icon-512.png' },
    ],
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
        <link rel="preload" href="/mnnr-icon-animated.svg" as="image" type="image/svg+xml" />
        {/* Alternate language versions for SEO */}
        <link rel="alternate" hrefLang="en" href={getURL()} />
        <link rel="alternate" hrefLang="zh" href={`${getURL()}?lang=zh`} />
        <link rel="alternate" hrefLang="es" href={`${getURL()}?lang=es`} />
        <link rel="alternate" hrefLang="x-default" href={getURL()} />
      </head>
      <body className={`${inter.className} bg-black antialiased`}>
        <PostHogProvider>
          <CurrencyProvider>
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
          </CurrencyProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
