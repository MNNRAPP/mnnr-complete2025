import { defineConfig, type PluginOption } from 'vitest/config';
import path from 'path';

// Load @vitejs/plugin-react lazily so the config still loads in environments
// where the React plugin isn't installed (e.g. CI workspaces that only run the
// node-only lib + api tests). React component tests will still need the plugin.
let reactPlugin: PluginOption | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
  const react = require('@vitejs/plugin-react');
  reactPlugin = (react.default ?? react)();
} catch {
  // No-op — node-only test suites don't need it.
}

export default defineConfig({
  plugins: reactPlugin ? [reactPlugin] : [],
  test: {
    // Default to `node` since lib/* + app/api/* are server code. Component
    // tests in __tests__/components/* opt into jsdom via their own /* @vitest-environment jsdom */
    // header.
    environment: 'node',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    exclude: [
      'node_modules/**',
      'e2e/**',
      '**/*.spec.ts',
    ],
    coverage: {
      provider: 'v8',
      // text + html for local triage, lcov for CI codecov-style upload.
      reporter: ['text', 'html', 'lcov', 'json'],
      // Only measure the source surfaces we own and want to gate on.
      include: ['lib/**', 'app/api/**'],
      exclude: [
        'node_modules/',
        '.next/',
        'out/',
        'e2e/',
        '**/*.config.ts',
        '**/*.config.js',
        '**/types_db.ts',
        '**/*.module.css',
        '**/index.ts',
        '**/toasts.ts',
        '**/*.d.ts',
      ],
      thresholds: {
        // Coverage gate. Set per the task spec.
        lines: 70,
        functions: 70,
        statements: 70,
        branches: 60,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
