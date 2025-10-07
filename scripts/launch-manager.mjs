#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const requiredEnvKeys = {
  production: [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'POSTHOG_API_KEY',
    'POSTHOG_HOST'
  ],
  shared: [
    'NEXT_PUBLIC_SITE_URL',
    'SUPABASE_JWT_SECRET',
    'VERCEL_PROJECT_ID'
  ]
};

const docsByTask = {
  env: 'VERCEL_DEPLOY_NOW.md',
  migrations: 'APPLY_MIGRATIONS.md',
  securityHeaders: 'SECURITY_IMPLEMENTATION_COMPLETE.md',
  rateLimiting: 'SECURITY_HARDENING_PLAN.md',
  payments: 'TONIGHT_LAUNCH_CHECKLIST.md',
  monitoring: 'ANALYTICS_COMPLETE.md'
};

async function parseEnvFile(filePath) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const lines = raw.split(/\r?\n/);
    const entries = lines
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
      .map((line) => {
        const index = line.indexOf('=');
        if (index === -1) return null;
        const key = line.slice(0, index).trim();
        const value = line.slice(index + 1).trim();
        return [key, value.replace(/^"|"$/g, '')];
      })
      .filter(Boolean);
    return new Map(entries);
  } catch (error) {
    return null;
  }
}

async function loadEnvSources() {
  const files = [
    path.join(repoRoot, '.env.production'),
    path.join(repoRoot, '.env.production.local'),
    path.join(repoRoot, '.env.local'),
    path.join(repoRoot, '.env'),
    path.join(repoRoot, '.env.example')
  ];

  const results = new Map();

  for (const file of files) {
    const envMap = await parseEnvFile(file);
    if (envMap) {
      results.set(path.basename(file), envMap);
    }
  }

  return results;
}

function getEnvStatus(envSources, envKey) {
  for (const [, envMap] of envSources) {
    if (envMap.has(envKey) && envMap.get(envKey)) {
      return 'present';
    }
  }
  if (process.env[envKey]) {
    return 'present';
  }
  return 'missing';
}

async function checkEnvConfiguration() {
  const envSources = await loadEnvSources();
  const statuses = [];

  for (const [scope, keys] of Object.entries(requiredEnvKeys)) {
    for (const key of keys) {
      statuses.push({
        scope,
        key,
        status: getEnvStatus(envSources, key)
      });
    }
  }

  const missing = statuses.filter((entry) => entry.status === 'missing');

  return {
    statuses,
    missing,
    envSources
  };
}

async function fileExists(relativePath) {
  try {
    await fs.access(path.join(repoRoot, relativePath));
    return true;
  } catch {
    return false;
  }
}

async function checkFileContains(relativePath, searchTerms) {
  try {
    const filePath = path.join(repoRoot, relativePath);
    const content = await fs.readFile(filePath, 'utf8');
    return searchTerms.every((term) => content.includes(term));
  } catch {
    return false;
  }
}

async function evaluateReadiness() {
  const [envStatus, hasMigrations, hasSecurityHeaders, hasRateLimiting] = await Promise.all([
    checkEnvConfiguration(),
    fileExists('supabase/migrations'),
    checkFileContains('middleware.ts', [
      'Strict-Transport-Security',
      'Content-Security-Policy',
      'X-Frame-Options'
    ]),
    checkFileContains('utils/rate-limit.ts', ['checkRateLimit', 'Redis'])
  ]);

  const readiness = [];

  readiness.push({
    id: 'env',
    label: 'Production environment variables configured',
    status: envStatus.missing.length === 0 ? 'ready' : 'attention',
    detail: envStatus
  });

  readiness.push({
    id: 'migrations',
    label: 'Supabase migrations available',
    status: hasMigrations ? 'ready' : 'attention',
    detail: hasMigrations
      ? 'Migrations directory detected.'
      : 'No migrations directory found. Review APPLY_MIGRATIONS.md.'
  });

  readiness.push({
    id: 'securityHeaders',
    label: 'Security headers enforced in middleware',
    status: hasSecurityHeaders ? 'ready' : 'attention',
    detail: hasSecurityHeaders
      ? 'Middleware includes core security headers.'
      : 'Update middleware.ts to include security headers.'
  });

  readiness.push({
    id: 'rateLimiting',
    label: 'Enterprise rate limiting utilities present',
    status: hasRateLimiting ? 'ready' : 'attention',
    detail: hasRateLimiting
      ? 'Redis-backed rate limiting utilities detected.'
      : 'Rate limiting utilities missing. See SECURITY_HARDENING_PLAN.md.'
  });

  return readiness;
}

function formatStatus(status) {
  return status === 'ready' ? '✅ READY' : '⚠️ ATTENTION NEEDED';
}

function formatEnvTable(envStatus) {
  const rows = envStatus.statuses.map(({ scope, key, status }) => {
    const label = status === 'present' ? '✅' : '⚠️';
    return `${label} ${key}${scope !== 'shared' ? ` (${scope})` : ''}`;
  });

  return rows.join('\n');
}

function printDocsReminder(taskId) {
  const doc = docsByTask[taskId];
  if (doc) {
    console.log(`   ↳ Reference: ${doc}`);
  }
}

async function main() {
  console.log('🚀 mnnr.app Launch Manager');
  console.log('============================\n');

  const readiness = await evaluateReadiness();
  const envStatus = readiness.find((item) => item.id === 'env').detail;

  console.log('Environment Configuration');
  console.log('--------------------------');
  console.log(formatEnvTable(envStatus));
  if (envStatus.missing.length > 0) {
    console.log('\nMissing variables:');
    envStatus.missing.forEach((entry) => {
      console.log(` - ${entry.key} [${entry.scope}]`);
    });
  }
  console.log('\n');

  console.log('Launch Critical Path');
  console.log('---------------------');
  readiness
    .filter((item) => item.id !== 'env')
    .forEach((item) => {
      console.log(`${formatStatus(item.status)} ${item.label}`);
      if (typeof item.detail === 'string') {
        console.log(`   ${item.detail}`);
      }
      printDocsReminder(item.id);
      console.log('');
    });

  console.log('Next Steps Guidance');
  console.log('--------------------');
  console.log('1. Apply database migrations and confirm RLS policies.');
  console.log('2. Verify Stripe credentials and run webhook tests.');
  console.log('3. Confirm legal pages and analytics scripts are deployed.');
  console.log('4. Run end-to-end smoke test prior to launch.');

  console.log('\nNeed more detail? Use the referenced documentation for step-by-step instructions.');
}

main().catch((error) => {
  console.error('Launch manager failed to run:', error);
  process.exit(1);
});
