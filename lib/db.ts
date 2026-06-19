// lib/db.ts — Server-only Prisma client bound to Neon Postgres.
//
// IMPORTANT
//   - This module MUST NOT be imported from client / browser code. The Neon
//     connection string never belongs in a bundle that ships to the user.
//   - In development we cache the client on `globalThis` to survive HMR.
//   - In production we throw on missing `NEON_DATABASE_URL` so we fail fast
//     instead of silently constructing a Prisma client with no datasource.

import { PrismaClient } from '@prisma/client';

const NEON_URL = process.env.NEON_DATABASE_URL;

if (!NEON_URL) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('NEON_DATABASE_URL required in production');
  }
}

if (typeof window !== 'undefined') {
  throw new Error('lib/db must never be imported from browser code');
}

declare global {
   
  var __prisma: PrismaClient | undefined;
}

export const db =
  global.__prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['warn', 'error']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = db;
}
