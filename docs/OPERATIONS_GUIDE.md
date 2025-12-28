# Operations Guide

**Version**: 1.0.0  
**Last Updated**: December 26, 2025

---

## Table of Contents

1. [Environment Setup](#environment-setup)
2. [Development Workflow](#development-workflow)
3. [Testing](#testing)
4. [Deployment](#deployment)
5. [Monitoring](#monitoring)
6. [Backup & Recovery](#backup--recovery)
7. [Troubleshooting](#troubleshooting)

---

## Environment Setup

### Prerequisites

- **Node.js**: >= 20.0.0
- **pnpm**: >= 8.0.0
- **Git**: Latest version
- **Supabase CLI**: For local development
- **Stripe CLI**: For webhook testing

### Initial Setup

```bash
# Clone repository
git clone https://github.com/MNNRAPP/mnnr-complete2025.git
cd mnnr-complete2025

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local

# Configure environment variables
# Edit .env.local with your credentials

# Start Supabase local instance
pnpm supabase:start

# Run database migrations
pnpm supabase:push

# Start development server
pnpm dev
```

### Environment Variables

Required variables in `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Sentry (Optional)
SENTRY_DSN=your_sentry_dsn
SENTRY_ORG=your_org
SENTRY_PROJECT=your_project

# App
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## Development Workflow

### Branch Strategy

- `main` - Production branch (protected)
- `develop` - Development branch
- `feature/*` - Feature branches
- `hotfix/*` - Hotfix branches

### Commit Convention

Follow Conventional Commits:

```
feat: Add new feature
fix: Bug fix
docs: Documentation update
style: Code style changes
refactor: Code refactoring
test: Add tests
chore: Maintenance tasks
```

### Pre-commit Hooks

Pre-commit hooks automatically run:
- Secret scanning (Gitleaks, detect-secrets)
- Code formatting (Prettier)
- Linting (ESLint)
- Type checking (TypeScript)

Install hooks:
```bash
# Unix/Linux/macOS
./scripts/setup-pre-commit-hooks.sh

# Windows
.\scripts\setup-pre-commit-hooks.ps1
```

### Code Review Checklist

- [ ] Tests pass locally
- [ ] Code follows style guide
- [ ] No secrets in code
- [ ] Documentation updated
- [ ] Breaking changes documented
- [ ] Performance impact assessed

---

## Testing

### Run Tests

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:coverage

# CI mode
pnpm test:ci
```

### Test Structure

```
__tests__/
├── api/           # API endpoint tests
├── components/    # Component tests
├── hooks/         # React hooks tests
├── utils/         # Utility function tests
└── integration/   # Integration tests
```

### Writing Tests

```typescript
// Example test
import { render, screen } from '@testing-library/react';
import Component from '@/components/Component';

describe('Component', () => {
  it('should render correctly', () => {
    render(<Component />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

---

## Deployment

### Production Deployment

**Platform**: Vercel

```bash
# Deploy to production
pnpm deploy

# Or use Vercel CLI
vercel --prod
```

### Environment Variables

Set in Vercel dashboard:
1. Go to Project Settings
2. Navigate to Environment Variables
3. Add all production variables
4. Redeploy

### Database Migrations

```bash
# Generate migration
pnpm supabase:generate-migration

# Apply to production
pnpm supabase:push
```

### Deployment Checklist

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Stripe webhooks configured
- [ ] Monitoring enabled
- [ ] Backup configured

---

## Monitoring

### Sentry Integration

Error tracking and performance monitoring:

```typescript
// Automatic error capture
import * as Sentry from '@sentry/nextjs';

Sentry.captureException(error);
```

### Performance Monitoring

- **Vercel Analytics**: Built-in performance metrics
- **Web Vitals**: Core Web Vitals tracking
- **Custom Metrics**: Track specific operations

### Health Checks

```bash
# Check application health
curl https://your-app.vercel.app/api/health

# Check database connection
curl https://your-app.vercel.app/api/health/db
```

### Alerts

Configure alerts for:
- Error rate > 1%
- Response time > 2s
- Database connection failures
- Payment processing errors

---

## Backup & Recovery

### Database Backup

**Automated**: Supabase automatic backups (daily)

**Manual Backup**:
```bash
# Backup database
pnpm supabase:generate-seed

# Restore from backup
psql -h your-db-host -U postgres -d postgres < supabase/seed.sql
```

### Disaster Recovery

1. **Database Failure**:
   - Restore from latest Supabase backup
   - Point-in-time recovery available

2. **Application Failure**:
   - Vercel automatic rollback
   - Deploy previous version manually

3. **Data Loss**:
   - Restore from daily backups
   - Maximum 24-hour data loss

### Backup Schedule

- **Database**: Daily at 2:00 AM UTC
- **File Storage**: Continuous replication
- **Retention**: 30 days

---

## Troubleshooting

### Common Issues

#### 1. Build Failures

**Symptom**: Deployment fails during build

**Solutions**:
```bash
# Clear cache
rm -rf .next node_modules
pnpm install
pnpm build

# Check for type errors
pnpm type-check

# Check for lint errors
pnpm lint
```

#### 2. Database Connection Errors

**Symptom**: Cannot connect to Supabase

**Solutions**:
- Verify environment variables
- Check Supabase project status
- Verify network connectivity
- Check connection pooling limits

#### 3. Stripe Webhook Failures

**Symptom**: Webhooks not processing

**Solutions**:
```bash
# Test webhook locally
stripe listen --forward-to localhost:3000/api/webhooks

# Verify webhook secret
echo $STRIPE_WEBHOOK_SECRET

# Check webhook logs in Stripe dashboard
```

#### 4. Performance Issues

**Symptom**: Slow page loads

**Solutions**:
- Enable Next.js caching
- Optimize database queries
- Add database indexes
- Enable CDN caching
- Optimize images

### Debug Mode

Enable debug logging:

```bash
# .env.local
DEBUG=true
LOG_LEVEL=debug
```

### Support Escalation

1. **Level 1**: Check documentation and logs
2. **Level 2**: Review error tracking (Sentry)
3. **Level 3**: Contact platform support
   - Vercel: https://vercel.com/support
   - Supabase: https://supabase.com/support
   - Stripe: https://support.stripe.com

---

## Maintenance

### Regular Tasks

**Daily**:
- Monitor error rates
- Check system health
- Review security alerts

**Weekly**:
- Update dependencies
- Review performance metrics
- Check backup integrity

**Monthly**:
- Security audit
- Performance optimization
- Documentation updates
- Dependency updates

### Update Dependencies

```bash
# Check for updates
pnpm outdated

# Update all dependencies
pnpm update

# Update specific package
pnpm update package-name

# Update with breaking changes
pnpm update --latest
```

### Security Updates

```bash
# Check for vulnerabilities
pnpm audit

# Fix vulnerabilities
pnpm audit --fix

# Review Dependabot PRs
# Merge security updates promptly
```

---

## Performance Optimization

### Bundle Size

```bash
# Analyze bundle
pnpm build
pnpm analyze

# Reduce bundle size
# - Code splitting
# - Dynamic imports
# - Tree shaking
# - Remove unused dependencies
```

### Database Optimization

```bash
# Add indexes
CREATE INDEX idx_users_email ON users(email);

# Analyze query performance
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'user@example.com';

# Enable RLS policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
```

### Caching Strategy

- **Static Pages**: ISR with 60s revalidation
- **API Routes**: Cache-Control headers
- **Database**: Query result caching
- **CDN**: Edge caching for assets

---

## Compliance

### GDPR

- Data export functionality
- Right to deletion
- Privacy policy
- Cookie consent

### PCI DSS

- Stripe handles card data
- No card storage in database
- Secure webhook handling
- Regular security audits

### SOC 2

- Access controls
- Audit logging
- Incident response
- Regular reviews

---

## Contact

**DevOps Team**: devops@mnnr.app  
**Security**: security@mnnr.app  
**Support**: support@mnnr.app

**On-call**: Use PagerDuty for emergencies
