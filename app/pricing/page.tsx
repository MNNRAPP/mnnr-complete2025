import Pricing from '@/components/ui/Pricing/Pricing';
import { getAuthenticatedUser } from '@/lib/auth';
import { db } from '@/lib/db';

export default async function PricingPage() {
  const user = await getAuthenticatedUser();

  const products = await db.getActiveProductsWithPrices();

  let subscription = null;
  if (user) {
    const sub = await db.getActiveSubscription(user.id);
    if (sub) {
      // Enrich subscription with price and product data for Pricing component
      const price = sub.price_id ? await db.getPriceById(sub.price_id) : null;
      const product = price?.product_id ? await db.getProductById(price.product_id) : null;
      subscription = {
        ...sub,
        prices: price ? { ...price, products: product } : null,
      };
    }
  }

  return (
    <Pricing
      user={user}
      products={products ?? []}
      subscription={subscription}
    />
  );
}
