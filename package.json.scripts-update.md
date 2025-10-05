# Package.json Scripts Update

Add these helpful scripts to your `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",

    // Security & Quality
    "audit:security": "npm audit --production",
    "audit:fix": "npm audit fix",
    "type-check": "tsc --noEmit",
    "validate": "npm run type-check && npm run lint",

    // Testing
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",

    // Production
    "build:production": "NODE_ENV=production next build",
    "analyze": "ANALYZE=true npm run build",

    // Database
    "db:types": "supabase gen types typescript --project-id <your-project-id> > types_db.ts",

    // Stripe
    "stripe:listen": "stripe listen --forward-to localhost:3000/api/webhooks",
    "stripe:trigger": "stripe trigger customer.subscription.created",

    // Development helpers
    "clean": "rm -rf .next node_modules",
    "reinstall": "npm run clean && npm install",
    "format": "prettier --write \"**/*.{js,jsx,ts,tsx,json,md}\""
  }
}
```

## Usage Examples

### Security Audits
```bash
# Check for vulnerabilities
npm run audit:security

# Fix vulnerabilities automatically
npm run audit:fix
```

### Type Checking
```bash
# Validate TypeScript without building
npm run type-check

# Run all validations
npm run validate
```

### Stripe Development
```bash
# Terminal 1: Start development server
npm run dev

# Terminal 2: Listen to webhooks
npm run stripe:listen

# Terminal 3: Trigger test events
npm run stripe:trigger
```

### Production Build
```bash
# Build with production environment
npm run build:production

# Analyze bundle size
npm run analyze
```

## Recommended Dev Dependencies

Add these to `package.json`:

```bash
npm install -D @types/node @types/react @types/react-dom typescript
npm install -D @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install -D prettier eslint-config-prettier
npm install -D jest @testing-library/react @testing-library/jest-dom
npm install -D @next/bundle-analyzer
```

Then update `devDependencies` in package.json:

```json
{
  "devDependencies": {
    "@next/bundle-analyzer": "^14.2.3",
    "@testing-library/jest-dom": "^6.1.5",
    "@testing-library/react": "^14.1.2",
    "@types/node": "^20.10.5",
    "@types/react": "^18.2.45",
    "@types/react-dom": "^18.2.18",
    "@typescript-eslint/eslint-plugin": "^6.15.0",
    "@typescript-eslint/parser": "^6.15.0",
    "eslint-config-prettier": "^9.1.0",
    "jest": "^29.7.0",
    "prettier": "^3.1.1",
    "typescript": "^5.3.3"
  }
}
```
