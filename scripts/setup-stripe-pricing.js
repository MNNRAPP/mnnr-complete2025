#!/usr/bin/env node

/**
 * MNNR Stripe Pricing Setup
 *
 * Creates all products and pricing tiers in Stripe for MNNR agent payment infrastructure.
 * Run: node scripts/setup-stripe-pricing.js
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const PRODUCTS = [
  {
    name: 'MNNR Pilot',
    description: 'Payment infrastructure for autonomous agents. 0% transaction fees during pilot period. First 10 integrations only.',
    metadata: {
      tier: 'pilot',
      transaction_fee: '0',
      max_volume: 'unlimited',
      features: 'all'
    },
    prices: [
      {
        unit_amount: 0, // Free
        currency: 'usd',
        recurring: { interval: 'month' },
        nickname: 'Pilot Monthly'
      }
    ]
  },
  {
    name: 'MNNR Starter',
    description: 'Payment infrastructure for AI agents. Perfect for early-stage integrations and testing. Up to $10k/month transaction volume.',
    metadata: {
      tier: 'starter',
      transaction_fee: '2.5',
      max_volume: '10000',
      features: 'multi_rail,receipts,basic_controls,standard_support'
    },
    prices: [
      {
        unit_amount: 9900, // $99/month
        currency: 'usd',
        recurring: { interval: 'month' },
        nickname: 'Starter Monthly'
      },
      {
        unit_amount: 99000, // $990/year (17% discount)
        currency: 'usd',
        recurring: { interval: 'year' },
        nickname: 'Starter Annual'
      }
    ]
  },
  {
    name: 'MNNR Growth',
    description: 'Scaled payment infrastructure for growing agent platforms and GPU providers. Up to $100k/month transaction volume. Priority support.',
    metadata: {
      tier: 'growth',
      transaction_fee: '1.9',
      max_volume: '100000',
      features: 'multi_rail,receipts,custom_limits,priority_support,webhook_retries,multi_wallet',
      recommended: 'true'
    },
    prices: [
      {
        unit_amount: 49900, // $499/month
        currency: 'usd',
        recurring: { interval: 'month' },
        nickname: 'Growth Monthly'
      },
      {
        unit_amount: 499000, // $4,990/year (17% discount)
        currency: 'usd',
        recurring: { interval: 'year' },
        nickname: 'Growth Annual'
      }
    ]
  },
  {
    name: 'MNNR Enterprise',
    description: 'Custom payment infrastructure for high-volume agent commerce. $100k+/month volume. Dedicated infrastructure, SLA guarantees, compliance assistance.',
    metadata: {
      tier: 'enterprise',
      transaction_fee: 'custom',
      max_volume: 'unlimited',
      features: 'all,dedicated_infra,custom_integrations,sla,compliance,volume_discounts',
      contact_sales: 'true'
    },
    prices: [] // No prices - contact sales
  }
];

const ADDONS = [
  {
    name: 'USDC Priority Settlement',
    description: 'Fast crypto settlement (< 1 minute) with lower transaction fees on crypto rails.',
    metadata: {
      type: 'addon',
      category: 'settlement'
    },
    prices: [
      {
        unit_amount: 4900, // $49/month
        currency: 'usd',
        recurring: { interval: 'month' },
        nickname: 'USDC Priority Monthly'
      }
    ]
  },
  {
    name: 'Advanced Analytics',
    description: 'Real-time transaction dashboard with agent spend insights and receipt verification metrics.',
    metadata: {
      type: 'addon',
      category: 'analytics'
    },
    prices: [
      {
        unit_amount: 9900, // $99/month
        currency: 'usd',
        recurring: { interval: 'month' },
        nickname: 'Analytics Monthly'
      }
    ]
  }
];

async function createProductsAndPrices() {
  console.log('🚀 Setting up MNNR Stripe products and pricing...\n');

  const results = {
    products: [],
    prices: [],
    errors: []
  };

  // Create main products
  for (const productData of PRODUCTS) {
    try {
      console.log(`📦 Creating product: ${productData.name}...`);

      const product = await stripe.products.create({
        name: productData.name,
        description: productData.description,
        metadata: productData.metadata
      });

      console.log(`   ✅ Product created: ${product.id}`);
      results.products.push(product);

      // Create prices for this product
      for (const priceData of productData.prices) {
        try {
          console.log(`   💰 Creating price: ${priceData.nickname}...`);

          const price = await stripe.prices.create({
            product: product.id,
            unit_amount: priceData.unit_amount,
            currency: priceData.currency,
            recurring: priceData.recurring,
            nickname: priceData.nickname
          });

          console.log(`      ✅ Price created: ${price.id} (${formatPrice(price)})`);
          results.prices.push(price);
        } catch (error) {
          console.error(`      ❌ Error creating price: ${error.message}`);
          results.errors.push({ product: productData.name, price: priceData.nickname, error: error.message });
        }
      }

      console.log('');
    } catch (error) {
      console.error(`   ❌ Error creating product: ${error.message}\n`);
      results.errors.push({ product: productData.name, error: error.message });
    }
  }

  // Create add-ons
  console.log('\n🔌 Creating add-on products...\n');

  for (const addonData of ADDONS) {
    try {
      console.log(`📦 Creating add-on: ${addonData.name}...`);

      const product = await stripe.products.create({
        name: addonData.name,
        description: addonData.description,
        metadata: addonData.metadata
      });

      console.log(`   ✅ Product created: ${product.id}`);
      results.products.push(product);

      // Create prices for this add-on
      for (const priceData of addonData.prices) {
        try {
          console.log(`   💰 Creating price: ${priceData.nickname}...`);

          const price = await stripe.prices.create({
            product: product.id,
            unit_amount: priceData.unit_amount,
            currency: priceData.currency,
            recurring: priceData.recurring,
            nickname: priceData.nickname
          });

          console.log(`      ✅ Price created: ${price.id} (${formatPrice(price)})`);
          results.prices.push(price);
        } catch (error) {
          console.error(`      ❌ Error creating price: ${error.message}`);
          results.errors.push({ product: addonData.name, price: priceData.nickname, error: error.message });
        }
      }

      console.log('');
    } catch (error) {
      console.error(`   ❌ Error creating add-on: ${error.message}\n`);
      results.errors.push({ product: addonData.name, error: error.message });
    }
  }

  return results;
}

function formatPrice(price) {
  const amount = price.unit_amount / 100;
  const interval = price.recurring?.interval || 'one-time';
  return `$${amount}/${interval}`;
}

async function setupWebhook() {
  console.log('\n🔗 Setting up webhook endpoint...\n');

  const webhookUrl = 'https://mnnr.app/api/webhooks';

  const events = [
    'checkout.session.completed',
    'customer.subscription.created',
    'customer.subscription.updated',
    'customer.subscription.deleted',
    'product.created',
    'product.updated',
    'product.deleted',
    'price.created',
    'price.updated',
    'price.deleted'
  ];

  try {
    // Check if webhook already exists
    const existingWebhooks = await stripe.webhookEndpoints.list({ limit: 100 });
    const existing = existingWebhooks.data.find(wh => wh.url === webhookUrl);

    if (existing) {
      console.log(`   ℹ️  Webhook already exists: ${existing.id}`);
      console.log(`   📍 URL: ${webhookUrl}`);
      console.log(`   ✅ Events: ${existing.enabled_events.length} configured`);
      return existing;
    }

    // Create new webhook
    const webhook = await stripe.webhookEndpoints.create({
      url: webhookUrl,
      enabled_events: events,
      description: 'MNNR production webhook for payment and product events'
    });

    console.log(`   ✅ Webhook created: ${webhook.id}`);
    console.log(`   📍 URL: ${webhookUrl}`);
    console.log(`   🔑 Secret: ${webhook.secret}`);
    console.log(`\n   ⚠️  IMPORTANT: Add this to Vercel environment variables:`);
    console.log(`   STRIPE_WEBHOOK_SECRET=${webhook.secret}\n`);

    return webhook;
  } catch (error) {
    console.error(`   ❌ Error setting up webhook: ${error.message}\n`);
    return null;
  }
}

async function main() {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('❌ STRIPE_SECRET_KEY environment variable not set!');
      console.error('   Run: export STRIPE_SECRET_KEY=sk_test_...');
      process.exit(1);
    }

    console.log('🏦 MNNR Stripe Setup\n');
    console.log('═══════════════════════════════════════════════════\n');

    const results = await createProductsAndPrices();
    const webhook = await setupWebhook();

    console.log('\n═══════════════════════════════════════════════════');
    console.log('\n📊 SUMMARY\n');
    console.log(`   ✅ Products created: ${results.products.length}`);
    console.log(`   ✅ Prices created: ${results.prices.length}`);
    console.log(`   ${webhook ? '✅' : '❌'} Webhook configured: ${webhook ? 'Yes' : 'No'}`);

    if (results.errors.length > 0) {
      console.log(`\n   ⚠️  Errors encountered: ${results.errors.length}`);
      results.errors.forEach(err => {
        console.log(`      - ${err.product}: ${err.error}`);
      });
    }

    console.log('\n🎉 Setup complete! Products are now available at:');
    console.log('   https://dashboard.stripe.com/products\n');

    console.log('📋 Next steps:');
    console.log('   1. Verify products in Stripe dashboard');
    console.log('   2. Products will auto-sync to Supabase via webhooks');
    console.log('   3. Test checkout flow at https://mnnr.app/pricing');
    console.log('   4. Monitor webhook events in Stripe dashboard\n');

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { createProductsAndPrices, setupWebhook };
