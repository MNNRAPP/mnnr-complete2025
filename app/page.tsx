import Hero from '@/components/ui/Hero/Hero';
import Features from '@/components/ui/Sections/Features';
import PerformanceMetrics from '@/components/ui/Sections/PerformanceMetrics';
import Integrations from '@/components/ui/Sections/Integrations';
import CTA from '@/components/ui/Sections/CTA';
import PricingSection from '@/components/ui/Pricing/PricingSection';
import PricingComparison from '@/components/ui/Pricing/PricingComparison';
import FAQ from '@/components/ui/Sections/FAQ';
import Newsletter from '@/components/ui/Sections/Newsletter';
import Testimonials from '@/components/ui/Sections/Testimonials';

// Force static generation for maximum performance
// Data fetching moved to client-side in PricingSection
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour

export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <PerformanceMetrics />
      <Integrations />
      <PricingSection />
      <PricingComparison />
      <Testimonials />
      <FAQ />
      <Newsletter />
      <CTA />
    </>
  );
}
