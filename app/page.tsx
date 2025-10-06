import Hero from '@/components/ui/Hero/Hero';
import Features from '@/components/ui/Sections/Features';
import Integrations from '@/components/ui/Sections/Integrations';
import CTA from '@/components/ui/Sections/CTA';
import Pricing from '@/components/ui/Pricing/Pricing';
import Analytics from '@/components/Analytics/Analytics';
import { createClient } from '@/utils/supabase/server';
import {
  getProducts,
  getSubscription,
  getUser
} from '@/utils/supabase/queries';

export default async function HomePage() {
  const supabase = createClient();
  const [user, products, subscription] = await Promise.all([
    getUser(supabase),
    getProducts(supabase),
    getSubscription(supabase)
  ]);

  return (
    <>
      <Analytics 
        eventName="Homepage Visited" 
        properties={{ 
          section: 'landing',
          user_authenticated: !!user,
          products_count: products?.length || 0 
        }} 
      />
      <Hero />
      <Features />
      <Integrations />
      <CTA />
      <Pricing
        user={user}
        products={products ?? []}
        subscription={subscription}
      />
    </>
  );
}
