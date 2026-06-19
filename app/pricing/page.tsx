/**
 * Pricing Page — Clerk + Prisma (post-Supabase migration 2026-06-19).
 *
 * Products / prices were stored in Supabase tables that no longer exist;
 * the Pricing component now reads its catalog from Stripe directly. We pass
 * the current Clerk user (or null) and an empty subscription — the active
 * subscription is fetched client-side on /dashboard where it actually
 * matters; the pricing page just needs to know whether the visitor is
 * signed in.
 */

import Pricing from '@/components/ui/Pricing/Pricing';
import { auth, currentUser } from '@clerk/nextjs/server';
import Stripe from 'stripe';

export default async function PricingPage() {
  const { userId: clerkId } = auth();
  const cu = clerkId ? await currentUser() : null;
  const primaryId = cu?.primaryEmailAddressId;
  const user = cu
    ? {
        id: cu.id,
        email:
          cu.emailAddresses?.find((e) => e.id === primaryId)?.emailAddress ??
          cu.emailAddresses?.[0]?.emailAddress ??
          '',
      }
    : null;

  let products: Array<{
    id: string;
    name: string;
    description: string | null;
    active: boolean;
    prices: Array<{
      id: string;
      unit_amount: number | null;
      currency: string;
      interval: string | null;
      type: string;
    }>;
  }> = [];

  if (process.env.STRIPE_SECRET_KEY) {
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2023-10-16',
      });
      const [productList, priceList] = await Promise.all([
        stripe.products.list({ active: true, limit: 100 }),
        stripe.prices.list({ active: true, limit: 100 }),
      ]);
      const pricesByProduct = new Map<string, typeof priceList.data>();
      for (const p of priceList.data) {
        const pid = typeof p.product === 'string' ? p.product : p.product.id;
        if (!pricesByProduct.has(pid)) pricesByProduct.set(pid, []);
        pricesByProduct.get(pid)!.push(p);
      }
      products = productList.data.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        active: p.active,
        prices: (pricesByProduct.get(p.id) ?? []).map((pr) => ({
          id: pr.id,
          unit_amount: pr.unit_amount,
          currency: pr.currency,
          interval: pr.recurring?.interval ?? null,
          type: pr.type,
        })),
      }));
    } catch (err) {
      console.error('Pricing page Stripe lookup failed', err);
    }
  }

  return <Pricing user={user as any} products={products as any} subscription={null} />;
}
