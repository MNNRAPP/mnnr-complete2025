import Hero from '@/components/ui/Hero/Hero';
import Features from '@/components/ui/Sections/Features';
import Integrations from '@/components/ui/Sections/Integrations';
import CTA from '@/components/ui/Sections/CTA';
import PricingSection from '@/components/ui/Pricing/PricingSection';
import FAQ from '@/components/ui/Sections/FAQ';
import Newsletter from '@/components/ui/Sections/Newsletter';

// Force static generation for maximum performance
// Data fetching moved to client-side in PricingSection
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour

export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <Integrations />
      <PricingSection />
      <FAQ />
      <Newsletter />
      <CTA />
    </>
  );
}
