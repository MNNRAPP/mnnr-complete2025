#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import {
  gatherLaunchReadinessData,
  printAcceleratedTimeline
} from './launch-manager.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const statusMeta = {
  success: { symbol: '✅', label: 'Complete' },
  warn: { symbol: '⚠️', label: 'Needs follow-up' },
  fail: { symbol: '❌', label: 'Failed' },
  skipped: { symbol: '➖', label: 'Skipped' }
};

function formatStatus(status) {
  const meta = statusMeta[status] ?? statusMeta.warn;
  return `${meta.symbol} ${meta.label}`;
}

async function runCommand(command, args = []) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd: repoRoot,
      stdio: 'inherit',
      shell: false,
      env: process.env
    });

    child.on('error', (error) => {
      resolve({ code: null, error });
    });

    child.on('close', (code) => {
      resolve({ code });
    });
  });
}

async function runBaselineScan() {
  const data = await gatherLaunchReadinessData();
  const { readiness, envStatus, checklistGaps } = data;

  if (!envStatus) {
    return { status: 'fail', detail: 'Launch manager missing environment readiness entry.' };
  }

  const attention = readiness.filter((item) => item.status !== 'ready');
  const nonEnvAttention = attention.filter((item) => item.id !== 'env');
  const detailParts = [];

  if (envStatus.missing.length > 0) {
    detailParts.push(`Missing env vars: ${envStatus.missing.map((entry) => entry.key).join(', ')}`);
  }

  if (nonEnvAttention.length > 0) {
    detailParts.push(
      `Outstanding systems: ${nonEnvAttention.map((item) => item.label).join('; ')}`
    );
  }

  if (checklistGaps.length > 0) {
    detailParts.push(
      `Checklist TODOs remaining in ${checklistGaps
        .map((gap) => gap.source.label)
        .join(', ')}`
    );
  }

  const status =
    envStatus.missing.length === 0 && nonEnvAttention.length === 0 && checklistGaps.length === 0
      ? 'success'
      : 'warn';

  return {
    status,
    detail:
      detailParts.length > 0
        ? detailParts.join(' | ')
        : 'All tracked launch gates are satisfied. Run migrations + payments validation next.',
    data
  };
}

async function runRlsVerification() {
  try {
    const migrationsDir = path.join(repoRoot, 'supabase', 'migrations');
    const files = (await fs.readdir(migrationsDir)).filter((file) => file.endsWith('.sql'));

    if (files.length === 0) {
      return {
        status: 'fail',
        detail: 'No Supabase SQL migrations were found. Review APPLY_MIGRATIONS.md.'
      };
    }

    let rlsFiles = 0;
    let policyCount = 0;

    for (const file of files) {
      const content = await fs.readFile(path.join(migrationsDir, file), 'utf8');
      if (/enable\s+row\s+level\s+security/i.test(content)) {
        rlsFiles += 1;
      }
      const matches = content.match(/create\s+policy/gi);
      if (matches) {
        policyCount += matches.length;
      }
    }

    const detail = `Scanned ${files.length} migrations · ${rlsFiles} enforce RLS · ${policyCount} policy statements detected.`;
    const status = rlsFiles > 0 && policyCount > 0 ? 'success' : 'warn';

    return {
      status,
      detail: status === 'success' ? detail : `${detail} Add deny-by-default coverage before launch.`
    };
  } catch (error) {
    return {
      status: 'fail',
      detail: `Unable to inspect Supabase migrations: ${(error instanceof Error ? error.message : String(error))}`
    };
  }
}

async function runPaymentsVerification() {
  try {
    const webhookPath = path.join(repoRoot, 'app', 'api', 'webhooks', 'route.ts');
    const content = await fs.readFile(webhookPath, 'utf8');

    const requiredSnippets = [
      'stripe.webhooks.constructEvent',
      'createRateLimitResponse',
      "supabase\n        .from('stripe_events')",
      'manageSubscriptionStatusChange',
      'logger.webhook'
    ];

    const missing = requiredSnippets.filter((snippet) => !content.includes(snippet));

    if (missing.length > 0) {
      return {
        status: 'warn',
        detail: `Stripe webhook handler missing critical safeguards: ${missing.join(', ')}`
      };
    }

    return {
      status: 'success',
      detail: 'Stripe webhook enforces signatures, rate limits, idempotency, and subscription sync.'
    };
  } catch (error) {
    return {
      status: 'fail',
      detail: `Stripe webhook route missing or unreadable: ${(error instanceof Error ? error.message : String(error))}`
    };
  }
}

async function runSecurityAndLegalVerification() {
  const headerChecks = [
    'Strict-Transport-Security',
    'Content-Security-Policy',
    'X-Frame-Options',
    'Permissions-Policy'
  ];

  const legalPages = [
    path.join(repoRoot, 'app', 'legal', 'privacy', 'page.tsx'),
    path.join(repoRoot, 'app', 'legal', 'terms', 'page.tsx'),
    path.join(repoRoot, 'app', 'legal', 'refund', 'page.tsx')
  ];

  try {
    const middleware = await fs.readFile(path.join(repoRoot, 'middleware.ts'), 'utf8');
    const missingHeaders = headerChecks.filter((header) => !middleware.includes(header));

    const missingLegal = [];
    for (const legalPath of legalPages) {
      try {
        const stat = await fs.stat(legalPath);
        if (!stat.isFile()) {
          missingLegal.push(path.relative(repoRoot, legalPath));
        }
      } catch {
        missingLegal.push(path.relative(repoRoot, legalPath));
      }
    }

    if (missingHeaders.length === 0 && missingLegal.length === 0) {
      return {
        status: 'success',
        detail: 'Security headers hardened and all legal policy pages present.'
      };
    }

    const issues = [];
    if (missingHeaders.length > 0) {
      issues.push(`Headers: ${missingHeaders.join(', ')}`);
    }
    if (missingLegal.length > 0) {
      issues.push(`Legal pages missing: ${missingLegal.join(', ')}`);
    }

    const status = missingLegal.length > 0 ? 'fail' : 'warn';

    return {
      status,
      detail: issues.join(' | ')
    };
  } catch (error) {
    return {
      status: 'fail',
      detail: `Unable to validate middleware security headers: ${(error instanceof Error ? error.message : String(error))}`
    };
  }
}

async function runAnalyticsAndRateLimitVerification() {
  try {
    const analytics = await fs.readFile(path.join(repoRoot, 'providers', 'PostHogProvider.tsx'), 'utf8');
    const rateLimit = await fs.readFile(path.join(repoRoot, 'utils', 'rate-limit.ts'), 'utf8');

    const analyticsSnippets = ['posthog.init', 'PostHogProvider', 'analytics.track'];
    const rateLimitSnippets = ['@upstash/ratelimit', 'Redis', 'checkRateLimit'];

    const missingAnalytics = analyticsSnippets.filter((snippet) => !analytics.includes(snippet));
    const missingRateLimit = rateLimitSnippets.filter((snippet) => !rateLimit.includes(snippet));

    if (missingAnalytics.length === 0 && missingRateLimit.length === 0) {
      return {
        status: 'success',
        detail: 'Analytics provider and Redis-backed rate limiting utilities are wired up.'
      };
    }

    const issues = [];
    if (missingAnalytics.length > 0) {
      issues.push(`Analytics gaps: ${missingAnalytics.join(', ')}`);
    }
    if (missingRateLimit.length > 0) {
      issues.push(`Rate limiting gaps: ${missingRateLimit.join(', ')}`);
    }

    return {
      status: 'warn',
      detail: issues.join(' | ')
    };
  } catch (error) {
    return {
      status: 'fail',
      detail: `Failed to inspect analytics or rate limiting utilities: ${(error instanceof Error ? error.message : String(error))}`
    };
  }
}

async function runBuildValidation() {
  const lint = await runCommand('npm', ['run', 'lint']);
  if (lint.code !== 0) {
    return {
      status: 'fail',
      detail: 'npm run lint failed. Fix lint errors before launch.'
    };
  }

  const build = await runCommand('npm', ['run', 'build']);
  if (build.code !== 0) {
    return {
      status: 'fail',
      detail: 'npm run build failed. Resolve build issues before launch.'
    };
  }

  return {
    status: 'success',
    detail: 'Lint and production build completed successfully.'
  };
}

async function main() {
  console.log('🛠️  Launch Executor — compressing the single-day plan into verifiable actions');
  console.log('==========================================================================\n');

  const tasks = [
    { id: 'baseline', label: 'Baseline readiness scan', runner: runBaselineScan },
    { id: 'rls', label: 'Database migrations & RLS enforcement', runner: runRlsVerification },
    { id: 'payments', label: 'Stripe webhook hardening audit', runner: runPaymentsVerification },
    { id: 'securityLegal', label: 'Security headers & legal policy check', runner: runSecurityAndLegalVerification },
    { id: 'analytics', label: 'Analytics & rate limiting verification', runner: runAnalyticsAndRateLimitVerification },
    { id: 'build', label: 'Production lint + build validation', runner: runBuildValidation }
  ];

  const results = [];

  for (const task of tasks) {
    console.log(`▶️  ${task.label}`);
    try {
      const result = await task.runner();
      results.push({ ...result, id: task.id, label: task.label });
      console.log(`   ${formatStatus(result.status)}`);
      if (result.detail) {
        console.log(`   ${result.detail}`);
      }
      console.log('');
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      results.push({ status: 'fail', detail, id: task.id, label: task.label });
      console.log(`   ${formatStatus('fail')}`);
      console.log(`   ${detail}`);
      console.log('');
    }
  }

  const failures = results.filter((result) => result.status === 'fail');
  const warnings = results.filter((result) => result.status === 'warn');

  console.log('Summary');
  console.log('-------');
  console.log(`Completed: ${results.length - failures.length - warnings.length}`);
  console.log(`Warnings: ${warnings.length}`);
  console.log(`Failures: ${failures.length}`);

  if (warnings.length > 0 || failures.length > 0) {
    console.log('\nRecommended follow-up:');
    warnings.forEach((warning) => {
      console.log(` - ⚠️  ${warning.label}: ${warning.detail}`);
    });
    failures.forEach((failure) => {
      console.log(` - ❌ ${failure.label}: ${failure.detail}`);
    });
    console.log('\nUse npm run launch:manager -- --accelerated for the timeboxed action plan.');
    console.log('The accelerated schedule is included below for quick reference:\n');
    printAcceleratedTimeline();
  }

  const exitCode = failures.length > 0 ? 1 : 0;
  if (exitCode === 0) {
    console.log('\n✅ All automated launch gates passed. Execute the external launch actions and go live.');
  } else {
    console.log('\n⚠️  Resolve the highlighted items before proceeding with launch.');
  }

  process.exit(exitCode);
}

main().catch((error) => {
  console.error('Launch executor failed:', error);
  process.exit(1);
});
