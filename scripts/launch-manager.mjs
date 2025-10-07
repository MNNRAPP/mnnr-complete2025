#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
function parseLaunchManagerArgs(argv = []) {
  const normalized = new Set(argv);
  return {
    help: normalized.has('--help') || normalized.has('-h'),
    accelerated: normalized.has('--accelerated') || normalized.has('-a')
  };
}

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
  legalPages: 'TONIGHT_LAUNCH_CHECKLIST.md',
  analytics: 'ANALYTICS_COMPLETE.md'
};

const checklistSources = [
  {
    id: 'launchReadiness',
    label: 'Launch Readiness 10/10',
    path: 'LAUNCH_READINESS_10_10.md'
  },
  {
    id: 'tonightChecklist',
    label: 'Tonight Launch Checklist',
    path: 'TONIGHT_LAUNCH_CHECKLIST.md'
  },
  {
    id: 'securityHardening',
    label: 'Security Hardening Plan',
    path: 'SECURITY_HARDENING_PLAN.md'
  }
];

const legalPages = [
  {
    path: 'app/legal/privacy/page.tsx',
    label: 'Privacy Policy page'
  },
  {
    path: 'app/legal/terms/page.tsx',
    label: 'Terms of Service page'
  },
  {
    path: 'app/legal/refund/page.tsx',
    label: 'Refund Policy page'
  }
];

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

function extractOutstandingChecklistItems(content) {
  const lines = content.split(/\r?\n/);
  const outstanding = [];
  let currentHeading = null;

  const headingRegex = /^(#{1,6})\s+(.+)$/;
  const taskRegexes = [
    /^\s*[-*]\s+\[ \]\s+(.*)$/,
    /^\s*\d+\.\s+\[ \]\s+(.*)$/
  ];

  for (const line of lines) {
    const headingMatch = line.match(headingRegex);
    if (headingMatch) {
      currentHeading = headingMatch[2].trim();
      continue;
    }

    for (const regex of taskRegexes) {
      const taskMatch = line.match(regex);
      if (taskMatch) {
        outstanding.push({
          text: taskMatch[1].trim(),
          heading: currentHeading || null
        });
        break;
      }
    }
  }

  return outstanding;
}

async function loadChecklistGaps(relativePath) {
  try {
    const filePath = path.join(repoRoot, relativePath);
    const content = await fs.readFile(filePath, 'utf8');
    return extractOutstandingChecklistItems(content);
  } catch {
    return [];
  }
}

export async function collectChecklistGaps() {
  const results = [];

  for (const source of checklistSources) {
    const items = await loadChecklistGaps(source.path);
    if (items.length > 0) {
      results.push({
        source,
        items
      });
    }
  }

  return results;
}

export async function evaluateReadiness() {
  const [
    envStatus,
    hasMigrations,
    hasSecurityHeaders,
    hasRateLimiting,
    legalStatus,
    hasAnalytics
  ] = await Promise.all([
    checkEnvConfiguration(),
    fileExists('supabase/migrations'),
    checkFileContains('middleware.ts', [
      'Strict-Transport-Security',
      'Content-Security-Policy',
      'X-Frame-Options'
    ]),
    checkFileContains('utils/rate-limit.ts', ['checkRateLimit', 'Redis']),
    Promise.all(legalPages.map((entry) => fileExists(entry.path))),
    checkFileContains('providers/PostHogProvider.tsx', ['PostHogProvider', 'posthog-js'])
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

  const missingLegalPages = legalPages
    .map((entry, index) => ({ entry, exists: legalStatus[index] }))
    .filter((item) => !item.exists)
    .map((item) => item.entry.label);

  readiness.push({
    id: 'legalPages',
    label: 'Legal policy pages published',
    status: missingLegalPages.length === 0 ? 'ready' : 'attention',
    detail:
      missingLegalPages.length === 0
        ? 'Privacy, terms, and refund policy pages detected.'
        : `Missing: ${missingLegalPages.join(', ')}`
  });

  readiness.push({
    id: 'analytics',
    label: 'Analytics instrumentation ready',
    status: hasAnalytics ? 'ready' : 'attention',
    detail: hasAnalytics
      ? 'PostHog provider present – configure keys to activate.'
      : 'PostHog provider not detected. Review ANALYTICS_COMPLETE.md.'
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

function printDocsReminder(taskId, output = console) {
  const doc = docsByTask[taskId];
  if (doc) {
    output.log(`   ↳ Reference: ${doc}`);
  }
}

export function printAcceleratedTimeline(output = console) {
  const blocks = [
    {
      label: 'Hour 0–1 — Launch Kickoff & Guardrails',
      tasks: [
        'Run npm run launch:manager -- --accelerated to capture gaps before you start.',
        'Patch production Supabase + Stripe environment variables inside Vercel.',
        'Queue the SECURITY_HARDENING_PLAN.md SQL so deny-by-default RLS is ready immediately after migrations.'
      ]
    },
    {
      label: 'Hour 1–3 — Database & Authentication Hardening',
      tasks: [
        'Apply all Supabase migrations and confirm RLS policies are active (APPLY_MIGRATIONS.md).',
        'Execute the deny-by-default RLS SQL across the public schema.',
        'Exercise signup, email verification, password reset, and session persistence flows.'
      ]
    },
    {
      label: 'Hour 3–5 — Payments & Billing Validation',
      tasks: [
        'Validate Stripe credentials, run checkout, and confirm webhook signature enforcement.',
        'Inspect webhook handler idempotency so duplicate events cannot desync state.'
      ]
    },
    {
      label: 'Hour 5–7 — Domain, Security Headers & Legal',
      tasks: [
        'Point mnnr.app to Vercel and verify SSL provisioning.',
        'Lock in HSTS, CSP, X-Frame-Options, and related headers in middleware.ts.',
        'Publish Privacy Policy, Terms of Service, and Refund Policy pages.'
      ]
    },
    {
      label: 'Hour 7–8 — Analytics, Monitoring & Rate Limiting',
      tasks: [
        'Configure PostHog (or equivalent) production keys for analytics + error visibility.',
        'Enable Redis-backed rate limiting via Vercel Edge Config + Upstash/Vercel KV.'
      ]
    },
    {
      label: 'Hour 8–9 — UX Polish & Multi-Device QA',
      tasks: [
        'Review mobile/desktop/tablet flows, tightening loading, success, and error states.',
        'Confirm onboarding, dashboard, and legal pages render crisply across browsers.'
      ]
    },
    {
      label: 'Hour 9–10 — End-to-End Testing & Launch Collateral',
      tasks: [
        'Run a full journey: signup → payment → onboarding → dashboard → cancellation/refund.',
        'Validate production headers via securityheaders.com (or similar).',
        'Assemble announcement copy, screenshots, and social assets.'
      ]
    },
    {
      label: 'Hour 10+ — Launch Execution & Monitoring',
      tasks: [
        'Perform a final smoke test and go live.',
        'Monitor analytics, Supabase logs, and Stripe alerts for rapid triage.'
      ]
    }
  ];

  output.log('Accelerated Launch Timeline');
  output.log('-----------------------------');
  blocks.forEach((block) => {
    output.log(`• ${block.label}`);
    block.tasks.forEach((task) => {
      output.log(`   - ${task}`);
    });
    output.log('');
  });
  output.log('Reference docs/three-day-launch-plan.md for detailed context on each block.');
}

export async function gatherLaunchReadinessData() {
  const readiness = await evaluateReadiness();
  const envEntry = readiness.find((item) => item.id === 'env');
  const envStatus = envEntry ? envEntry.detail : null;
  const checklistGaps = await collectChecklistGaps();

  return {
    readiness,
    envStatus,
    checklistGaps
  };
}

export async function runLaunchManager({ accelerated = false, output = console } = {}) {
  const { readiness, envStatus, checklistGaps } = await gatherLaunchReadinessData();

  if (!envStatus) {
    throw new Error('Environment readiness entry missing from evaluation.');
  }

  output.log('🚀 mnnr.app Launch Manager');
  output.log('============================\n');

  output.log('Environment Configuration');
  output.log('--------------------------');
  output.log(formatEnvTable(envStatus));
  if (envStatus.missing.length > 0) {
    output.log('\nMissing variables:');
    envStatus.missing.forEach((entry) => {
      output.log(` - ${entry.key} [${entry.scope}]`);
    });
  }
  output.log('\n');

  output.log('Launch Critical Path');
  output.log('---------------------');
  readiness
    .filter((item) => item.id !== 'env')
    .forEach((item) => {
      output.log(`${formatStatus(item.status)} ${item.label}`);
      if (typeof item.detail === 'string') {
        output.log(`   ${item.detail}`);
      }
      printDocsReminder(item.id, output);
      output.log('');
    });

  output.log('Checklist Watch');
  output.log('----------------');
  if (checklistGaps.length === 0) {
    output.log('All tracked checklists are ✅ complete.');
  } else {
    checklistGaps.forEach(({ source, items }) => {
      output.log(`⚠️  ${source.label}`);
      items.slice(0, 5).forEach((item) => {
        const scope = item.heading ? ` (${item.heading})` : '';
        output.log(`   • ${item.text}${scope}`);
      });
      if (items.length > 5) {
        output.log(`   … and ${items.length - 5} more pending tasks`);
      }
      output.log('');
    });
    output.log('   ↳ Reference these documents to knock out remaining TODOs.');
  }

  output.log('Next Steps Guidance');
  output.log('--------------------');
  output.log('1. Apply database migrations and confirm RLS policies.');
  output.log('2. Verify Stripe credentials and run webhook tests.');
  output.log('3. Confirm legal pages and analytics scripts are deployed.');
  output.log('4. Run end-to-end smoke test prior to launch.');

  output.log('\nNeed more detail? Use the referenced documentation for step-by-step instructions.');

  if (accelerated) {
    output.log('\n');
    printAcceleratedTimeline(output);
  }

  return { readiness, envStatus, checklistGaps };
}

async function main(argv = process.argv.slice(2)) {
  const options = parseLaunchManagerArgs(argv);

  if (options.help) {
    console.log('Usage: npm run launch:manager [-- [options]]');
    console.log('Options:');
    console.log('  -a, --accelerated   Append the compressed one-day launch timeline.');
    console.log('  -h, --help          Show this help message.');
    return;
  }

  await runLaunchManager({ accelerated: options.accelerated });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((error) => {
    console.error('Launch manager failed to run:', error);
    process.exit(1);
  });
}

export { parseLaunchManagerArgs };
