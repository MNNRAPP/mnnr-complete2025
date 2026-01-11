#!/usr/bin/env tsx
/**
 * MNNR SEO & AI Discoverability Validator
 * 
 * Validates all SEO and AI discovery files are properly configured
 * 
 * Usage: npx tsx scripts/seo-validator.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface ValidationResult {
  file: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
  details?: string[];
}

const results: ValidationResult[] = [];

function validateFile(filePath: string, checks: Array<{ name: string; check: (content: string) => boolean }>): void {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    results.push({
      file: filePath,
      status: 'fail',
      message: 'File not found'
    });
    return;
  }

  const content = fs.readFileSync(fullPath, 'utf-8');
  const failures: string[] = [];

  for (const { name, check } of checks) {
    if (!check(content)) {
      failures.push(name);
    }
  }

  if (failures.length === 0) {
    results.push({
      file: filePath,
      status: 'pass',
      message: 'All checks passed'
    });
  } else {
    results.push({
      file: filePath,
      status: 'fail',
      message: `${failures.length} check(s) failed`,
      details: failures
    });
  }
}

console.log('🔍 MNNR SEO & AI Discoverability Validator\n');
console.log('='.repeat(60));

// 1. Validate robots.txt
console.log('\n📄 Checking robots.txt...');
validateFile('public/robots.txt', [
  { name: 'Has GPTBot allow', check: (c) => c.includes('User-agent: GPTBot') && c.includes('Allow: /') },
  { name: 'Has Claude-Web allow', check: (c) => c.includes('User-agent: Claude-Web') },
  { name: 'Has Anthropic-AI allow', check: (c) => c.includes('User-agent: Anthropic-AI') },
  { name: 'Has PerplexityBot allow', check: (c) => c.includes('User-agent: PerplexityBot') },
  { name: 'Has sitemap reference', check: (c) => c.includes('Sitemap:') },
  { name: 'Has llms.txt reference', check: (c) => c.includes('llms.txt') },
  { name: 'Disallows /api/', check: (c) => c.includes('Disallow: /api/') },
  { name: 'Disallows /dashboard/', check: (c) => c.includes('Disallow: /dashboard/') },
]);

// 2. Validate llms.txt
console.log('\n📄 Checking llms.txt...');
validateFile('public/llms.txt', [
  { name: 'Has MNNR name', check: (c) => c.includes('Name: MNNR') },
  { name: 'Has URL', check: (c) => c.includes('https://mnnr.app') },
  { name: 'Has API base URL', check: (c) => c.includes('https://api.mnnr.app') },
  { name: 'Describes AI billing', check: (c) => c.toLowerCase().includes('ai agent billing') },
  { name: 'Has quick start code', check: (c) => c.includes('import') || c.includes('npm install') },
  { name: 'Has pricing info', check: (c) => c.includes('Free') && c.includes('Pro') },
  { name: 'Has contact info', check: (c) => c.includes('pilot@mnnr.app') },
  { name: 'Has supported models', check: (c) => c.includes('GPT-4') && c.includes('Claude') },
  { name: 'Has keywords section', check: (c) => c.toLowerCase().includes('keywords') },
  { name: 'Minimum 5000 chars', check: (c) => c.length >= 5000 },
]);

// 3. Validate sitemap.xml
console.log('\n📄 Checking sitemap.xml...');
validateFile('public/sitemap.xml', [
  { name: 'Valid XML declaration', check: (c) => c.startsWith('<?xml') },
  { name: 'Has urlset namespace', check: (c) => c.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"') },
  { name: 'Has homepage', check: (c) => c.includes('<loc>https://mnnr.app/</loc>') },
  { name: 'Has pricing page', check: (c) => c.includes('mnnr.app/pricing') },
  { name: 'Has docs page', check: (c) => c.includes('mnnr.app/docs') },
  { name: 'Has signup page', check: (c) => c.includes('mnnr.app/signup') },
  { name: 'Has lastmod dates', check: (c) => c.includes('<lastmod>') },
  { name: 'Has priority values', check: (c) => c.includes('<priority>') },
  { name: 'Has changefreq values', check: (c) => c.includes('<changefreq>') },
]);

// 4. Validate ai-plugin.json
console.log('\n📄 Checking ai-plugin.json...');
validateFile('public/.well-known/ai-plugin.json', [
  { name: 'Valid JSON', check: (c) => { try { JSON.parse(c); return true; } catch { return false; } } },
  { name: 'Has schema_version', check: (c) => c.includes('"schema_version"') },
  { name: 'Has name_for_model', check: (c) => c.includes('"name_for_model"') },
  { name: 'Has description_for_model', check: (c) => c.includes('"description_for_model"') },
  { name: 'References OpenAPI spec', check: (c) => c.includes('openapi.yaml') },
  { name: 'Has logo URL', check: (c) => c.includes('"logo_url"') },
  { name: 'Has keywords', check: (c) => c.includes('"keywords"') },
]);

// 5. Validate openapi.yaml
console.log('\n📄 Checking openapi.yaml...');
validateFile('public/openapi.yaml', [
  { name: 'Has OpenAPI version', check: (c) => c.includes('openapi: 3.') },
  { name: 'Has info section', check: (c) => c.includes('info:') },
  { name: 'Has title', check: (c) => c.includes('title:') && c.includes('MNNR') },
  { name: 'Has servers section', check: (c) => c.includes('servers:') },
  { name: 'Has paths section', check: (c) => c.includes('paths:') },
  { name: 'Has /keys endpoint', check: (c) => c.includes('/keys:') },
  { name: 'Has /usage endpoint', check: (c) => c.includes('/usage') },
  { name: 'Has security schemes', check: (c) => c.includes('securitySchemes:') },
  { name: 'Has components schemas', check: (c) => c.includes('schemas:') },
]);

// 6. Validate security.txt
console.log('\n📄 Checking security.txt...');
validateFile('public/.well-known/security.txt', [
  { name: 'Has Contact field', check: (c) => c.includes('Contact:') },
  { name: 'Has Expires field', check: (c) => c.includes('Expires:') },
  { name: 'Has Policy field', check: (c) => c.includes('Policy:') },
]);

// 7. Check structured data component
console.log('\n📄 Checking structured-data.tsx...');
validateFile('components/structured-data.tsx', [
  { name: 'Has OrganizationSchema', check: (c) => c.includes('OrganizationSchema') },
  { name: 'Has ProductSchema', check: (c) => c.includes('ProductSchema') },
  { name: 'Has FAQSchema', check: (c) => c.includes('FAQSchema') },
  { name: 'Has WebsiteSchema', check: (c) => c.includes('WebsiteSchema') },
  { name: 'Has AIServiceSchema', check: (c) => c.includes('AIServiceSchema') },
  { name: 'Has HowToSchema', check: (c) => c.includes('HowToSchema') },
  { name: 'Uses JSON-LD', check: (c) => c.includes('application/ld+json') },
]);

// Print results
console.log('\n' + '='.repeat(60));
console.log('📊 VALIDATION RESULTS\n');

let passCount = 0;
let failCount = 0;
let warnCount = 0;

for (const result of results) {
  const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
  console.log(`${icon} ${result.file}: ${result.message}`);
  
  if (result.details) {
    for (const detail of result.details) {
      console.log(`   ↳ Missing: ${detail}`);
    }
  }

  if (result.status === 'pass') passCount++;
  else if (result.status === 'fail') failCount++;
  else warnCount++;
}

console.log('\n' + '-'.repeat(60));
console.log(`✅ Passed: ${passCount}`);
console.log(`❌ Failed: ${failCount}`);
console.log(`⚠️ Warnings: ${warnCount}`);

// Overall status
const overallStatus = failCount === 0 ? '🎉 All validations passed!' : `⚠️ ${failCount} file(s) need attention`;
console.log(`\n${overallStatus}`);

// Exit with error code if any failures
process.exit(failCount > 0 ? 1 : 0);
