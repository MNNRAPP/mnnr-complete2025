import Hero from '@/components/ui/Hero/Hero';
import AuthorityGap from '@/components/ui/Sections/AuthorityGap';
import RailArchitecture from '@/components/ui/Sections/RailArchitecture';
import TrustPrimitives from '@/components/ui/Sections/TrustPrimitives';
import Features from '@/components/ui/Sections/Features';
import Compliance from '@/components/ui/Sections/Compliance';
import Comparison from '@/components/ui/Sections/Comparison';
import EuropeanTimeline from '@/components/ui/Sections/EuropeanTimeline';
import ApiPreview from '@/components/ui/Sections/ApiPreview';
import CTA from '@/components/ui/Sections/CTA';

// Force static generation for maximum performance
export const dynamic = 'force-static';
export const revalidate = 3600;

export default function HomePage() {
  return (
    <>
      <Hero />
      <AuthorityGap />
      <RailArchitecture />
      <TrustPrimitives />
      <Features />
      <Compliance />
      <Comparison />
      <EuropeanTimeline />
      <ApiPreview />
      <CTA />
    </>
  );
}
