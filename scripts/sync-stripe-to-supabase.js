#!/usr/bin/env node

/**
 * Sync Stripe Products to Supabase
 *
 * Manually syncs all Stripe products and prices to Supabase database.
 * Normally this happens via webhooks, but this is useful for initial sync.
 *
 * Run: node scripts/sync-stripe-to-supabase.js
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function syncProducts() {
  console.log('🔄 Syncing Stripe products to Supabase...\n');

  try {
    // Fetch all products from Stripe
    const { data: stripeProducts } = await stripe.products.list({
      limit: 100,
      active: true
    });

    console.log(`📦 Found ${stripeProducts.length} active products in Stripe\n`);

    const syncResults = {
      products: { inserted: 0, updated: 0, errors: 0 },
      prices: { inserted: 0, updated: 0, errors: 0 }
    };

    for (const product of stripeProducts) {
      try {
        console.log(`📦 Syncing product: ${product.name} (${product.id})`);

        // Upsert product to Supabase
        const productData = {
          id: product.id,
          active: product.active,
          name: product.name,
          description: product.description || null,
          image: product.images?.[0] || null,
          metadata: product.metadata || {}
        };

        const { error: productError } = await supabase
          .from('products')
          .upsert([productData], { onConflict: 'id' });

        if (productError) {
          console.error(`   ❌ Error syncing product: ${productError.message}`);
          syncResults.products.errors++;
          continue;
        }

        console.log(`   ✅ Product synced to Supabase`);
        syncResults.products.inserted++;

        // Fetch and sync prices for this product
        const { data: prices } = await stripe.prices.list({
          product: product.id,
          limit: 100
        });

        console.log(`   💰 Found ${prices.length} prices for this product`);

        for (const price of prices) {
          try {
            const priceData = {
              id: price.id,
              product_id: product.id,
              active: price.active,
              currency: price.currency,
              type: price.type,
              unit_amount: price.unit_amount,
              interval: price.recurring?.interval || null,
              interval_count: price.recurring?.interval_count || null,
              trial_period_days: price.recurring?.trial_period_days || null,
              metadata: price.metadata || {}
            };

            const { error: priceError } = await supabase
              .from('prices')
              .upsert([priceData], { onConflict: 'id' });

            if (priceError) {
              console.error(`      ❌ Error syncing price ${price.id}: ${priceError.message}`);
              syncResults.prices.errors++;
            } else {
              const formattedPrice = formatPrice(price);
              console.log(`      ✅ Price synced: ${formattedPrice}`);
              syncResults.prices.inserted++;
            }
          } catch (error) {
            console.error(`      ❌ Error processing price: ${error.message}`);
            syncResults.prices.errors++;
          }
        }

        console.log('');
      } catch (error) {
        console.error(`   ❌ Error processing product: ${error.message}\n`);
        syncResults.products.errors++;
      }
    }

    return syncResults;
  } catch (error) {
    console.error(`❌ Fatal error: ${error.message}`);
    throw error;
  }
}

function formatPrice(price) {
  if (price.unit_amount === null) return 'Custom pricing';
  const amount = price.unit_amount / 100;
  const interval = price.recurring?.interval || 'one-time';
  return `$${amount}/${interval}`;
}

async function verifySync() {
  console.log('🔍 Verifying sync...\n');

  try {
    // Check products in Supabase
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, active');

    if (productsError) {
      console.error(`❌ Error querying products: ${productsError.message}`);
      return;
    }

    console.log(`✅ Products in Supabase: ${products.length}`);
    products.forEach(p => {
      console.log(`   - ${p.name} (${p.id}) ${p.active ? '🟢' : '🔴'}`);
    });

    // Check prices in Supabase
    const { data: prices, error: pricesError } = await supabase
      .from('prices')
      .select('id, product_id, unit_amount, interval, active');

    if (pricesError) {
      console.error(`❌ Error querying prices: ${pricesError.message}`);
      return;
    }

    console.log(`\n✅ Prices in Supabase: ${prices.length}`);

    // Group by product
    const pricesByProduct = {};
    prices.forEach(p => {
      if (!pricesByProduct[p.product_id]) {
        pricesByProduct[p.product_id] = [];
      }
      pricesByProduct[p.product_id].push(p);
    });

    products.forEach(product => {
      const productPrices = pricesByProduct[product.id] || [];
      console.log(`   ${product.name}: ${productPrices.length} price(s)`);
      productPrices.forEach(price => {
        const amount = price.unit_amount ? `$${price.unit_amount / 100}` : 'Custom';
        const interval = price.interval || 'one-time';
        console.log(`      - ${amount}/${interval} ${price.active ? '🟢' : '🔴'}`);
      });
    });

  } catch (error) {
    console.error(`❌ Error verifying sync: ${error.message}`);
  }
}

async function main() {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('❌ STRIPE_SECRET_KEY not set!');
      process.exit(1);
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ Supabase environment variables not set!');
      process.exit(1);
    }

    console.log('🏦 MNNR Stripe → Supabase Sync\n');
    console.log('═══════════════════════════════════════════════════\n');

    const results = await syncProducts();

    console.log('═══════════════════════════════════════════════════');
    console.log('\n📊 SYNC SUMMARY\n');
    console.log(`   Products:`);
    console.log(`      ✅ Synced: ${results.products.inserted}`);
    console.log(`      ❌ Errors: ${results.products.errors}`);
    console.log(`   Prices:`);
    console.log(`      ✅ Synced: ${results.prices.inserted}`);
    console.log(`      ❌ Errors: ${results.prices.errors}`);

    console.log('\n');
    await verifySync();

    console.log('\n═══════════════════════════════════════════════════');
    console.log('\n✅ Sync complete!\n');
    console.log('🎯 Next: Visit https://mnnr.app/pricing to see your products\n');

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { syncProducts, verifySync };
