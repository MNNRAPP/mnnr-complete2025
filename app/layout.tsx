import { Metadata } from 'next';
import Footer from '@/components/ui/Footer';
import Navbar from '@/components/ui/Navbar';
import { Toaster } from '@/components/ui/Toasts/toaster';
import { PostHogProvider } from '@/providers/PostHogProvider';
import { PropsWithChildren, Suspense } from 'react';
import { getURL } from '@/utils/helpers';
import 'styles/main.css';

const title = 'MNNR - Payments for Machines';
const description = 'Pay-per-call for agents/APIs with verifiable receipts. Agent wallets, spend caps, and real-time settlement.';

export const metadata: Metadata = {
  metadataBase: new URL(getURL()),
  title: title,
  description: description,
  openGraph: {
    title: title,
    description: description,
    images: ['/mnnr-logo-full.svg']
  },
  icons: {
    icon: '/mnnr-icon.svg',
    apple: '/mnnr-icon.svg'
  }
};

export default async function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <body className="bg-transparent text-white">
        <PostHogProvider>
          <Navbar />
          <main
            id="skip"
            className="relative min-h-[calc(100dvh-4rem)] md:min-h[calc(100dvh-5rem)]"
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
