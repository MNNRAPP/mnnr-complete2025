/**
 * Comprehensive Input Validation Schemas
 * 
 * Using Zod for type-safe runtime validation
 */

import { z } from "zod";

// ============================================================================
// API Key Schemas
// ============================================================================

export const apiKeyCreateSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .regex(/^[a-zA-Z0-9\s\-_]+$/, "Name can only contain letters, numbers, spaces, hyphens, and underscores"),
  mode: z.enum(["live", "test"]).default("live"),
});

export const apiKeyDeleteSchema = z.object({
  id: z.string().uuid("Invalid key ID format"),
});

export const apiKeyUpdateSchema = z.object({
  id: z.string().uuid("Invalid key ID format"),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .optional(),
  is_active: z.boolean().optional(),
});

// ============================================================================
// User Schemas
// ============================================================================

export const userProfileSchema = z.object({
  full_name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name too long")
    .optional(),
  avatar_url: z
    .string()
    .url("Invalid URL format")
    .optional()
    .or(z.literal("")),
  billing_address: z.object({
    line1: z.string().optional(),
    line2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postal_code: z.string().optional(),
    country: z.string().length(2, "Country code must be 2 characters").optional(),
  }).optional(),
});

export const userEmailSchema = z.object({
  email: z
    .string()
    .email("Invalid email format")
    .max(255, "Email too long"),
});

// ============================================================================
// Subscription Schemas
// ============================================================================

export const subscriptionCreateSchema = z.object({
  price_id: z.string().min(1, "Price ID is required"),
  quantity: z.number().int().positive().default(1),
  trial_days: z.number().int().min(0).max(90).optional(),
});

export const subscriptionUpdateSchema = z.object({
  subscription_id: z.string().min(1, "Subscription ID is required"),
  price_id: z.string().min(1, "Price ID is required").optional(),
  quantity: z.number().int().positive().optional(),
  cancel_at_period_end: z.boolean().optional(),
});

// ============================================================================
// Usage Tracking Schemas
// ============================================================================

export const usageEventSchema = z.object({
  api_key_id: z.string().uuid("Invalid API key ID"),
  endpoint: z.string().max(255, "Endpoint too long"),
  method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH"]),
  status_code: z.number().int().min(100).max(599),
  response_time_ms: z.number().int().min(0),
  request_size_bytes: z.number().int().min(0).optional(),
  response_size_bytes: z.number().int().min(0).optional(),
});

// ============================================================================
// Webhook Schemas
// ============================================================================

export const stripeWebhookSchema = z.object({
  id: z.string(),
  object: z.literal("event"),
  type: z.string(),
  data: z.object({
    object: z.record(z.string(), z.any()),
  }),
});

// ============================================================================
// Pagination Schemas
// ============================================================================

export const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().int().positive()),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .pipe(z.number().int().positive().max(100)),
  sort_by: z.string().optional(),
  sort_order: z.enum(["asc", "desc"]).optional().default("desc"),
});

// ============================================================================
// Search Schemas
// ============================================================================

export const searchSchema = z.object({
  query: z
    .string()
    .min(1, "Search query is required")
    .max(100, "Search query too long"),
  filters: z.record(z.string(), z.string()).optional(),
});

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Validate data against a schema and return typed result
 */
export function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, error: result.error };
  }
}

/**
 * Format Zod errors for API responses
 */
export function formatZodError(error: z.ZodError): {
  field: string;
  message: string;
}[] {
  return error.issues.map((err) => ({
    field: err.path.join("."),
    message: err.message,
  }));
}

/**
 * Create validation error response
 */
export function validationErrorResponse(error: z.ZodError) {
  return {
    error: "Validation failed",
    details: formatZodError(error),
  };
}
