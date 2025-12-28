# Contributing to MNNR

Thank you for your interest in contributing to MNNR! This document provides guidelines and information for contributors.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Security](#security)

---

## Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please:

- Be respectful and considerate
- Use inclusive language
- Accept constructive criticism gracefully
- Focus on what's best for the project

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Git
- Supabase CLI (optional, for database work)

### Development Setup

```bash
# Clone the repository
git clone https://github.com/MNNRAPP/mnnr-complete2025.git
cd mnnr-complete2025

# Install dependencies
npm install --legacy-peer-deps

# Copy environment template
cp .env.example .env.local

# Start development server
npm run dev
```

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe (Required for billing features)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Upstash Redis (Required for rate limiting)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Monitoring (Optional)
SENTRY_DSN=
NEXT_PUBLIC_POSTHOG_KEY=
```

---

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Enable strict mode
- Define types for all function parameters and return values
- Avoid `any` type - use `unknown` if type is truly unknown

```typescript
// ✅ Good
function processUser(user: User): ProcessedUser {
  return { ...user, processed: true };
}

// ❌ Bad
function processUser(user: any): any {
  return { ...user, processed: true };
}
```

### React Components

- Use functional components with hooks
- Use TypeScript interfaces for props
- Keep components small and focused
- Extract reusable logic into custom hooks

```typescript
// ✅ Good
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button className={`btn btn-${variant}`} onClick={onClick}>
      {label}
    </button>
  );
}
```

### File Naming

- Components: `PascalCase.tsx` (e.g., `ApiKeyManager.tsx`)
- Utilities: `kebab-case.ts` (e.g., `rate-limit.ts`)
- Tests: `*.test.ts` or `*.spec.ts`
- Types: `types.ts` or `*.types.ts`

### Imports

- Use absolute imports with `@/` prefix
- Group imports: React, external, internal, types
- Sort alphabetically within groups

```typescript
// React
import { useState, useEffect } from 'react';

// External
import { z } from 'zod';

// Internal
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

// Types
import type { User } from '@/types';
```

---

## Testing Guidelines

### Test Structure

```
__tests__/
├── api/           # API route tests
├── integration/   # Integration tests
└── unit/          # Unit tests

e2e/               # End-to-end tests (Playwright)
```

### Writing Tests

```typescript
import { describe, it, expect, vi } from 'vitest';

describe('ApiKeyManager', () => {
  it('should generate a valid API key', async () => {
    const key = await generateApiKey();
    
    expect(key).toMatch(/^sk_live_[a-zA-Z0-9]{32}$/);
  });

  it('should handle errors gracefully', async () => {
    vi.spyOn(crypto, 'randomBytes').mockImplementation(() => {
      throw new Error('Random generation failed');
    });

    await expect(generateApiKey()).rejects.toThrow();
  });
});
```

### Running Tests

```bash
# Unit tests
npm test

# With coverage
npm run test:coverage

# E2E tests
npm run test:e2e

# All tests
npm run test:ci
```

### Coverage Requirements

- Minimum 80% code coverage
- All new features must include tests
- Critical paths require 100% coverage

---

## Pull Request Process

### Before Submitting

1. **Create a branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following coding standards

3. **Run tests**:
   ```bash
   npm test
   npm run lint
   npm run type-check
   ```

4. **Commit with conventional commits**:
   ```bash
   git commit -m "feat: add API key rotation feature"
   ```

### Commit Message Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

Examples:
```
feat(api): add rate limiting to API keys endpoint
fix(auth): resolve session expiration issue
docs(readme): update installation instructions
test(api): add integration tests for Stripe webhooks
```

### PR Checklist

- [ ] Tests pass locally
- [ ] Code follows style guidelines
- [ ] Documentation updated (if needed)
- [ ] No console.log statements
- [ ] No hardcoded secrets
- [ ] Commits are squashed/rebased

### Review Process

1. Submit PR with clear description
2. Automated checks run (lint, tests, build)
3. Code review by maintainer
4. Address feedback
5. Merge when approved

---

## Security

### Reporting Vulnerabilities

**Do NOT open public issues for security vulnerabilities.**

Email security concerns to: pilot@mnnr.app

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Security Best Practices

- Never commit secrets or API keys
- Use environment variables for configuration
- Validate all user input with Zod
- Use parameterized queries (Supabase handles this)
- Implement rate limiting on all endpoints
- Use CSRF tokens for state-changing operations

---

## Questions?

- Email: pilot@mnnr.app
- Documentation: [docs.mnnr.app](https://docs.mnnr.app)

Thank you for contributing to MNNR! 🚀
