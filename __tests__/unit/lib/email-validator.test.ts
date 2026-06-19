/**
 * Unit tests for lib/email-validator.ts
 */
import { describe, it, expect } from 'vitest';
import { validateEmail } from '@/lib/email-validator';

describe('lib/email-validator validateEmail', () => {
  it('accepts a simple valid email and returns normalized lowercase form', () => {
    const r = validateEmail('Alice@Example.COM');
    expect(r.valid).toBe(true);
    expect(r.normalized).toBe('alice@example.com');
    expect(r.reason).toBeUndefined();
  });

  it('accepts emails with plus addressing', () => {
    const r = validateEmail('user+tag@example.com');
    expect(r.valid).toBe(true);
    expect(r.normalized).toBe('user+tag@example.com');
  });

  it('accepts emails with dots in the local part', () => {
    const r = validateEmail('first.last@example.co.uk');
    expect(r.valid).toBe(true);
    expect(r.normalized).toBe('first.last@example.co.uk');
  });

  it('rejects non-string input', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(validateEmail(123 as any).valid).toBe(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(validateEmail(null as any).valid).toBe(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(validateEmail(undefined as any).valid).toBe(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(validateEmail({} as any).valid).toBe(false);
  });

  it('rejects empty / whitespace-only strings', () => {
    expect(validateEmail('').valid).toBe(false);
    expect(validateEmail('   ').valid).toBe(false);
  });

  it('rejects strings longer than 320 chars (RFC 5321 §4.5.3.1.3)', () => {
    const local = 'a'.repeat(64);
    const domain = 'b'.repeat(250) + '.com';
    const tooLong = `${local}@${domain}${'x'.repeat(50)}`;
    expect(tooLong.length).toBeGreaterThan(320);
    const r = validateEmail(tooLong);
    expect(r.valid).toBe(false);
    expect(r.reason).toMatch(/maximum length/i);
  });

  it('rejects strings missing the @ separator', () => {
    const r = validateEmail('nope-no-at-sign');
    expect(r.valid).toBe(false);
    expect(r.reason).toMatch(/missing @/i);
  });

  it('rejects empty local part', () => {
    const r = validateEmail('@example.com');
    expect(r.valid).toBe(false);
    expect(r.reason).toMatch(/local part/i);
  });

  it('rejects empty domain', () => {
    const r = validateEmail('user@');
    expect(r.valid).toBe(false);
    expect(r.reason).toMatch(/domain/i);
  });

  it('rejects bare hostnames (no dot in domain)', () => {
    const r = validateEmail('user@localhost');
    expect(r.valid).toBe(false);
    expect(r.reason).toMatch(/dot/i);
  });

  it('rejects local part > 64 chars', () => {
    const local = 'a'.repeat(65);
    const r = validateEmail(`${local}@example.com`);
    expect(r.valid).toBe(false);
    expect(r.reason).toMatch(/local part/i);
  });

  it('rejects emails with invalid characters', () => {
    const r = validateEmail('user space@example.com');
    expect(r.valid).toBe(false);
    expect(r.reason).toMatch(/format/i);
  });

  it('rejects emails with comma in local part', () => {
    const r = validateEmail('a,b@example.com');
    expect(r.valid).toBe(false);
  });

  it('trims whitespace before validating', () => {
    const r = validateEmail('  user@example.com  ');
    expect(r.valid).toBe(true);
    expect(r.normalized).toBe('user@example.com');
  });
});
