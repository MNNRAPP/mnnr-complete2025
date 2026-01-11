#!/usr/bin/env tsx
/**
 * MNNR Social Card Generator
 * 
 * Generates Open Graph and Twitter card images for SEO
 * 
 * Usage: npx tsx scripts/generate-social-cards.ts
 */

// This script provides templates for social media cards
// In production, use @vercel/og or similar for dynamic generation

const SOCIAL_CARDS = {
  homepage: {
    title: 'MNNR - AI Agent Billing Infrastructure',
    description: 'The universal billing layer for AI agents, LLMs, and autonomous systems',
    image: '/og-home.png',
    dimensions: { width: 1200, height: 630 }
  },
  pricing: {
    title: 'MNNR Pricing - Start Free, Scale Infinitely',
    description: 'Free tier with 10K API calls. Pro at $49/mo for 1M calls. Enterprise custom.',
    image: '/og-pricing.png',
    dimensions: { width: 1200, height: 630 }
  },
  docs: {
    title: 'MNNR Documentation - Get Started in 5 Minutes',
    description: 'Quick start guides, API reference, and SDK documentation for AI billing',
    image: '/og-docs.png',
    dimensions: { width: 1200, height: 630 }
  },
  blog: {
    title: 'MNNR Blog - AI Billing Insights',
    description: 'Learn about AI agent billing, per-token pricing, and the machine economy',
    image: '/og-blog.png',
    dimensions: { width: 1200, height: 630 }
  }
};

const TWITTER_CARDS = {
  homepage: {
    title: 'MNNR - Stripe for AI Agents',
    description: 'Bill AI agents per token. Track usage. Collect payments. 5-minute integration.',
    image: '/twitter-home.png',
    card: 'summary_large_image'
  }
};

console.log('🎨 MNNR Social Card Templates\n');
console.log('='.repeat(60));

console.log('\n📸 Open Graph Cards (1200x630):');
for (const [page, card] of Object.entries(SOCIAL_CARDS)) {
  console.log(`\n  ${page}:`);
  console.log(`    Title: ${card.title}`);
  console.log(`    Description: ${card.description}`);
  console.log(`    Image: ${card.image}`);
}

console.log('\n🐦 Twitter Cards:');
for (const [page, card] of Object.entries(TWITTER_CARDS)) {
  console.log(`\n  ${page}:`);
  console.log(`    Title: ${card.title}`);
  console.log(`    Description: ${card.description}`);
  console.log(`    Card Type: ${card.card}`);
}

console.log('\n' + '='.repeat(60));
console.log('\n💡 To generate actual images, use:');
console.log('   - Vercel OG (@vercel/og) for dynamic generation');
console.log('   - Figma exports for static images');
console.log('   - Cloudinary for on-the-fly image generation');

// Export for use in Next.js metadata
export { SOCIAL_CARDS, TWITTER_CARDS };
