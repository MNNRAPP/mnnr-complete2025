import Pricing from '@/components/ui/Pricing/Pricing';
import { getAuthenticatedUser } from '@/lib/auth';
import { db } from '@/lib/db';

export default async function PricingPage() {
  const user = await getAuthenticatedUser();

  const products = await db.getActiveProducts();
  const subscription = user ? await db.getActiveSubscription(user.id) : null;

  return (
    <Pricing
      user={user}
      products={products ?? []}
      subscription={subscription}
    />
  );
}
