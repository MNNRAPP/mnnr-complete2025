/**
 * Input Validation Schemas
 *
 * This module provides comprehensive, type-safe input validation schemas using Zod
 * for the MNNR platform. It ensures data integrity, prevents invalid inputs, and
 * provides excellent TypeScript inference for validated data.
 *
 * **What is Zod?**
 * Zod is a TypeScript-first schema validation library that provides both runtime
 * validation and compile-time type inference. This means you get type safety at
 * development time and runtime validation in production.
 *
 * **Features:**
 * - Type-safe validation with automatic TypeScript inference
 * - Comprehensive validation schemas for all API inputs
 * - Human-readable error messages for better UX
 * - Transformation and coercion support (e.g., string to number)
 * - Composable schemas for complex validation rules
 * - Helper functions for error formatting and responses
 *
 * **Security Benefits:**
 * - Prevents SQL injection by validating input types
 * - Blocks malformed data before it reaches business logic
 * - Enforces length limits to prevent DoS attacks
 * - Validates data formats (email, UUID, etc.)
 * - Sanitizes input through regex patterns
 *
 * **Use Cases:**
 * - API request body validation
 * - Query parameter validation
 * - Form input validation
 * - Database input sanitization
 * - Webhook payload validation
 *
 * @module lib/validations
 * @security Critical for input validation and sanitization
 *
 * @example
 * ```typescript
 * import { apiKeyCreateSchema, validate } from '@/lib/validations';
 *
 * // Validate API request body
 * export async function POST(request: Request) {
 *   const body = await request.json();
 *
 *   const result = validate(apiKeyCreateSchema, body);
 *   if (!result.success) {
 *     return NextResponse.json(
 *       validationErrorResponse(result.error),
 *       { status: 400 }
 *     );
 *   }
 *
 *   // result.data is now type-safe
 *   const { name, mode } = result.data;
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Direct schema parsing
 * try {
 *   const data = userProfileSchema.parse(untrustedInput);
 *   // data is now validated and typed
 *   await updateProfile(data);
 * } catch (error) {
 *   if (error instanceof z.ZodError) {
 *     console.error(formatZodError(error));
 *   }
 * }
 * ```
 */

import { z } from "zod";

// ============================================================================
// API Key Schemas
// ============================================================================

/**
 * API Key Creation Schema
 *
 * Validates input for creating new API keys. Ensures keys have proper naming
 * conventions and mode settings.
 *
 * **Validation Rules:**
 * - Name: Required, 1-100 characters, alphanumeric + spaces, hyphens, underscores
 * - Mode: Must be either "live" or "test", defaults to "live"
 *
 * **Security Considerations:**
 * - Name regex prevents injection attacks through special characters
 * - Length limit prevents DoS through excessive data
 *
 * @constant
 * @type {z.ZodObject}
 *
 * @example
 * ```typescript
 * // Valid API key creation
 * const validData = {
 *   name: "Production API Key",
 *   mode: "live"
 * };
 * const result = apiKeyCreateSchema.parse(validData);
 * // result: { name: "Production API Key", mode: "live" }
 * ```
 *
 * @example
 * ```typescript
 * // Use in API route
 * export async function POST(request: Request) {
 *   const body = await request.json();
 *
 *   try {
 *     const { name, mode } = apiKeyCreateSchema.parse(body);
 *     const apiKey = await createApiKey(userId, name, mode);
 *     return NextResponse.json(apiKey);
 *   } catch (error) {
 *     if (error instanceof z.ZodError) {
 *       return NextResponse.json(
 *         validationErrorResponse(error),
 *         { status: 400 }
 *       );
 *     }
 *   }
 * }
 * ```
 */
export const apiKeyCreateSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .regex(/^[a-zA-Z0-9\s\-_]+$/, "Name can only contain letters, numbers, spaces, hyphens, and underscores"),
  mode: z.enum(["live", "test"]).default("live"),
});

/**
 * API Key Deletion Schema
 *
 * Validates input for deleting API keys. Ensures the key ID is a valid UUID.
 *
 * **Validation Rules:**
 * - ID: Must be a valid UUID v4 format
 *
 * @constant
 * @type {z.ZodObject}
 *
 * @example
 * ```typescript
 * const validData = {
 *   id: "550e8400-e29b-41d4-a716-446655440000"
 * };
 * const result = apiKeyDeleteSchema.parse(validData);
 * ```
 */
export const apiKeyDeleteSchema = z.object({
  id: z.string().uuid("Invalid key ID format"),
});

/**
 * API Key Update Schema
 *
 * Validates input for updating existing API keys. All fields are optional
 * to support partial updates.
 *
 * **Validation Rules:**
 * - ID: Required, must be valid UUID
 * - Name: Optional, 1-100 characters if provided
 * - is_active: Optional boolean to enable/disable key
 *
 * @constant
 * @type {z.ZodObject}
 *
 * @example
 * ```typescript
 * // Update only the name
 * const updateName = {
 *   id: "550e8400-e29b-41d4-a716-446655440000",
 *   name: "Updated Key Name"
 * };
 * const result = apiKeyUpdateSchema.parse(updateName);
 * ```
 *
 * @example
 * ```typescript
 * // Disable a key
 * const disableKey = {
 *   id: "550e8400-e29b-41d4-a716-446655440000",
 *   is_active: false
 * };
 * const result = apiKeyUpdateSchema.parse(disableKey);
 * ```
 */
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

/**
 * User Profile Schema
 *
 * Validates user profile updates including personal information and billing address.
 * All fields are optional to support partial profile updates.
 *
 * **Validation Rules:**
 * - full_name: Optional, 1-100 characters if provided
 * - avatar_url: Optional, must be valid URL or empty string
 * - billing_address: Optional object with address components
 *   - country: Must be 2-character ISO country code (e.g., "US", "GB")
 *
 * **Use Cases:**
 * - Profile settings page updates
 * - Onboarding flow data collection
 * - Billing information updates
 *
 * @constant
 * @type {z.ZodObject}
 *
 * @example
 * ```typescript
 * // Update full name and avatar
 * const profileUpdate = {
 *   full_name: "Alice Johnson",
 *   avatar_url: "https://example.com/avatar.jpg"
 * };
 * const result = userProfileSchema.parse(profileUpdate);
 * ```
 *
 * @example
 * ```typescript
 * // Update billing address
 * const addressUpdate = {
 *   billing_address: {
 *     line1: "123 Main St",
 *     city: "San Francisco",
 *     state: "CA",
 *     postal_code: "94102",
 *     country: "US"
 *   }
 * };
 * const result = userProfileSchema.parse(addressUpdate);
 * ```
 *
 * @example
 * ```typescript
 * // Clear avatar (empty string is valid)
 * const clearAvatar = {
 *   avatar_url: ""
 * };
 * const result = userProfileSchema.parse(clearAvatar);
 * ```
 */
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

/**
 * User Email Schema
 *
 * Validates email address format and length. Used for email updates and
 * email-related operations.
 *
 * **Validation Rules:**
 * - Must be valid email format (RFC 5322 compliant)
 * - Maximum 255 characters (database limit)
 *
 * **Security Considerations:**
 * - Email validation prevents invalid formats
 * - Length limit prevents DoS attacks
 *
 * @constant
 * @type {z.ZodObject}
 *
 * @example
 * ```typescript
 * // Valid email
 * const emailData = {
 *   email: "alice@example.com"
 * };
 * const result = userEmailSchema.parse(emailData);
 * ```
 *
 * @example
 * ```typescript
 * // Use in email update endpoint
 * export async function POST(request: Request) {
 *   const body = await request.json();
 *
 *   const { email } = userEmailSchema.parse(body);
 *   await updateUserEmail(userId, email);
 *
 *   return NextResponse.json({ success: true });
 * }
 * ```
 */
export const userEmailSchema = z.object({
  email: z
    .string()
    .email("Invalid email format")
    .max(255, "Email too long"),
});

// ============================================================================
// Subscription Schemas
// ============================================================================

/**
 * Subscription Creation Schema
 *
 * Validates input for creating new subscriptions via Stripe. Ensures all
 * required fields are present and valid.
 *
 * **Validation Rules:**
 * - price_id: Required Stripe price ID
 * - quantity: Positive integer, defaults to 1 (for seat-based pricing)
 * - trial_days: Optional, 0-90 days (Stripe's maximum trial period)
 *
 * **Use Cases:**
 * - Creating new subscriptions from pricing page
 * - Upgrading from free to paid tier
 * - Adding trial periods for new customers
 *
 * @constant
 * @type {z.ZodObject}
 *
 * @example
 * ```typescript
 * // Create subscription with trial
 * const subscriptionData = {
 *   price_id: "price_1234567890",
 *   quantity: 1,
 *   trial_days: 14
 * };
 * const result = subscriptionCreateSchema.parse(subscriptionData);
 * ```
 *
 * @example
 * ```typescript
 * // Create team subscription (5 seats)
 * const teamSubscription = {
 *   price_id: "price_team_monthly",
 *   quantity: 5
 * };
 * const result = subscriptionCreateSchema.parse(teamSubscription);
 * ```
 *
 * @example
 * ```typescript
 * // Use in subscription creation endpoint
 * export async function POST(request: Request) {
 *   const body = await request.json();
 *
 *   const { price_id, quantity, trial_days } =
 *     subscriptionCreateSchema.parse(body);
 *
 *   const subscription = await stripe.subscriptions.create({
 *     customer: customerId,
 *     items: [{ price: price_id, quantity }],
 *     trial_period_days: trial_days,
 *   });
 *
 *   return NextResponse.json(subscription);
 * }
 * ```
 */
export const subscriptionCreateSchema = z.object({
  price_id: z.string().min(1, "Price ID is required"),
  quantity: z.number().int().positive().default(1),
  trial_days: z.number().int().min(0).max(90).optional(),
});

/**
 * Subscription Update Schema
 *
 * Validates input for updating existing subscriptions. Supports plan changes,
 * quantity updates, and cancellation scheduling.
 *
 * **Validation Rules:**
 * - subscription_id: Required Stripe subscription ID
 * - price_id: Optional, for changing plans
 * - quantity: Optional positive integer, for seat count changes
 * - cancel_at_period_end: Optional boolean, schedules cancellation
 *
 * **Use Cases:**
 * - Upgrading/downgrading subscription plans
 * - Changing seat count for team plans
 * - Scheduling subscription cancellation at period end
 *
 * @constant
 * @type {z.ZodObject}
 *
 * @example
 * ```typescript
 * // Upgrade to higher tier
 * const upgrade = {
 *   subscription_id: "sub_1234567890",
 *   price_id: "price_premium_monthly"
 * };
 * const result = subscriptionUpdateSchema.parse(upgrade);
 * ```
 *
 * @example
 * ```typescript
 * // Increase seat count
 * const addSeats = {
 *   subscription_id: "sub_1234567890",
 *   quantity: 10
 * };
 * const result = subscriptionUpdateSchema.parse(addSeats);
 * ```
 *
 * @example
 * ```typescript
 * // Schedule cancellation at period end
 * const cancel = {
 *   subscription_id: "sub_1234567890",
 *   cancel_at_period_end: true
 * };
 * const result = subscriptionUpdateSchema.parse(cancel);
 * ```
 */
export const subscriptionUpdateSchema = z.object({
  subscription_id: z.string().min(1, "Subscription ID is required"),
  price_id: z.string().min(1, "Price ID is required").optional(),
  quantity: z.number().int().positive().optional(),
  cancel_at_period_end: z.boolean().optional(),
});

// ============================================================================
// Usage Tracking Schemas
// ============================================================================

/**
 * Usage Event Schema
 *
 * Validates API usage tracking events. Used for recording API call metrics,
 * monitoring performance, and generating usage reports.
 *
 * **Validation Rules:**
 * - api_key_id: Must be valid UUID
 * - endpoint: Max 255 characters
 * - method: Must be standard HTTP method
 * - status_code: Valid HTTP status code (100-599)
 * - response_time_ms: Non-negative integer
 * - request_size_bytes: Optional, non-negative
 * - response_size_bytes: Optional, non-negative
 *
 * **Use Cases:**
 * - Recording API usage metrics
 * - Performance monitoring
 * - Usage-based billing calculations
 * - Analytics and reporting
 *
 * @constant
 * @type {z.ZodObject}
 *
 * @example
 * ```typescript
 * // Record successful API call
 * const usageEvent = {
 *   api_key_id: "550e8400-e29b-41d4-a716-446655440000",
 *   endpoint: "/api/users",
 *   method: "GET",
 *   status_code: 200,
 *   response_time_ms: 145,
 *   request_size_bytes: 512,
 *   response_size_bytes: 2048
 * };
 * const result = usageEventSchema.parse(usageEvent);
 * ```
 *
 * @example
 * ```typescript
 * // Record failed API call
 * const failedEvent = {
 *   api_key_id: "550e8400-e29b-41d4-a716-446655440000",
 *   endpoint: "/api/protected",
 *   method: "POST",
 *   status_code: 403,
 *   response_time_ms: 12
 * };
 * const result = usageEventSchema.parse(failedEvent);
 * ```
 */
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

/**
 * Stripe Webhook Event Schema
 *
 * Validates incoming Stripe webhook events. Ensures webhook payloads have
 * the correct structure before processing.
 *
 * **Validation Rules:**
 * - id: Event ID string
 * - object: Must be literal "event"
 * - type: Event type string (e.g., "customer.subscription.created")
 * - data: Object containing the event data
 *
 * **Security Note:**
 * This schema validates structure only. Always verify webhook signatures
 * using Stripe's signature verification before trusting the data.
 *
 * @constant
 * @type {z.ZodObject}
 * @security Always verify Stripe webhook signatures
 *
 * @example
 * ```typescript
 * // Validate Stripe webhook
 * export async function POST(request: Request) {
 *   const body = await request.text();
 *   const signature = request.headers.get('stripe-signature');
 *
 *   // Verify signature first (security critical!)
 *   const event = stripe.webhooks.constructEvent(
 *     body,
 *     signature,
 *     process.env.STRIPE_WEBHOOK_SECRET
 *   );
 *
 *   // Then validate structure
 *   const validatedEvent = stripeWebhookSchema.parse(event);
 *
 *   // Process event safely
 *   await handleStripeEvent(validatedEvent);
 * }
 * ```
 */
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

/**
 * Pagination Schema
 *
 * Validates and transforms pagination parameters from query strings. Handles
 * string-to-number conversion and provides sensible defaults.
 *
 * **Validation Rules:**
 * - page: Transforms string to positive integer, defaults to 1
 * - limit: Transforms string to positive integer (max 100), defaults to 10
 * - sort_by: Optional field name for sorting
 * - sort_order: Either "asc" or "desc", defaults to "desc"
 *
 * **Features:**
 * - Automatic type coercion from query string
 * - Enforces maximum page size to prevent DoS
 * - Provides sensible defaults
 *
 * @constant
 * @type {z.ZodObject}
 *
 * @example
 * ```typescript
 * // Parse URL search params
 * const url = new URL(request.url);
 * const searchParams = Object.fromEntries(url.searchParams);
 *
 * const { page, limit, sort_by, sort_order } =
 *   paginationSchema.parse(searchParams);
 *
 * const data = await db
 *   .from('items')
 *   .select('*')
 *   .order(sort_by || 'created_at', { ascending: sort_order === 'asc' })
 *   .range((page - 1) * limit, page * limit - 1);
 * ```
 *
 * @example
 * ```typescript
 * // With defaults (page=1, limit=10)
 * const params = paginationSchema.parse({});
 * // Result: { page: 1, limit: 10, sort_order: "desc" }
 * ```
 *
 * @example
 * ```typescript
 * // String to number transformation
 * const params = paginationSchema.parse({
 *   page: "3",
 *   limit: "25",
 *   sort_by: "created_at",
 *   sort_order: "asc"
 * });
 * // Result: { page: 3, limit: 25, sort_by: "created_at", sort_order: "asc" }
 * ```
 */
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

/**
 * Search Schema
 *
 * Validates search query inputs with optional filters. Prevents excessively
 * long queries and ensures proper filter structure.
 *
 * **Validation Rules:**
 * - query: Required, 1-100 characters
 * - filters: Optional key-value pairs for advanced filtering
 *
 * **Security Considerations:**
 * - Length limit prevents DoS attacks
 * - Query is not executed directly (always use parameterized queries)
 *
 * @constant
 * @type {z.ZodObject}
 *
 * @example
 * ```typescript
 * // Basic search
 * const searchData = {
 *   query: "api keys"
 * };
 * const result = searchSchema.parse(searchData);
 * ```
 *
 * @example
 * ```typescript
 * // Search with filters
 * const advancedSearch = {
 *   query: "production",
 *   filters: {
 *     mode: "live",
 *     status: "active"
 *   }
 * };
 * const result = searchSchema.parse(advancedSearch);
 * ```
 *
 * @example
 * ```typescript
 * // Use in search endpoint
 * export async function GET(request: Request) {
 *   const url = new URL(request.url);
 *   const query = url.searchParams.get('query');
 *   const filters = url.searchParams.get('filters');
 *
 *   const { query: searchQuery, filters: searchFilters } =
 *     searchSchema.parse({
 *       query,
 *       filters: filters ? JSON.parse(filters) : undefined
 *     });
 *
 *   const results = await searchDatabase(searchQuery, searchFilters);
 *   return NextResponse.json(results);
 * }
 * ```
 */
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
 * Validate data against a schema with discriminated union result
 *
 * This is a type-safe wrapper around Zod's safeParse that returns a discriminated
 * union for easier handling in TypeScript. The result can be checked with
 * `result.success` to narrow the type automatically.
 *
 * **Why Use This?**
 * - Type-safe error handling without try-catch
 * - Discriminated union allows TypeScript to narrow types
 * - Cleaner code flow for validation checks
 * - Better than throwing exceptions for expected validation failures
 *
 * @template T - The type that the schema validates to
 * @param {z.ZodSchema<T>} schema - The Zod schema to validate against
 * @param {unknown} data - The untrusted data to validate
 * @returns {{ success: true; data: T } | { success: false; error: z.ZodError }}
 *   Success case returns typed data, failure case returns ZodError
 *
 * @example
 * ```typescript
 * // Type-safe validation in API route
 * export async function POST(request: Request) {
 *   const body = await request.json();
 *
 *   const result = validate(apiKeyCreateSchema, body);
 *
 *   if (!result.success) {
 *     // result.error is ZodError
 *     return NextResponse.json(
 *       validationErrorResponse(result.error),
 *       { status: 400 }
 *     );
 *   }
 *
 *   // result.data is fully typed as { name: string; mode: "live" | "test" }
 *   const { name, mode } = result.data;
 *   const apiKey = await createApiKey(name, mode);
 *
 *   return NextResponse.json(apiKey);
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Validation with custom error handling
 * const result = validate(userProfileSchema, untrustedData);
 *
 * if (!result.success) {
 *   console.error('Validation failed:', formatZodError(result.error));
 *   return;
 * }
 *
 * await updateProfile(result.data);
 * ```
 *
 * @example
 * ```typescript
 * // Multiple validation checks
 * const bodyResult = validate(subscriptionCreateSchema, body);
 * const paramsResult = validate(paginationSchema, params);
 *
 * if (!bodyResult.success || !paramsResult.success) {
 *   return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
 * }
 *
 * // Both are now typed correctly
 * const subscription = bodyResult.data;
 * const pagination = paramsResult.data;
 * ```
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
 * Format Zod validation errors for API responses
 *
 * Transforms Zod's error format into a user-friendly array of field-specific
 * error messages. This makes it easy to display validation errors in forms
 * or return them from API endpoints.
 *
 * **Error Format:**
 * Each error includes:
 * - field: Dot-notation path to the invalid field (e.g., "billing_address.country")
 * - message: Human-readable error message
 *
 * **Use Cases:**
 * - API error responses
 * - Form validation error display
 * - Error logging and debugging
 *
 * @param {z.ZodError} error - The Zod validation error to format
 * @returns {{ field: string; message: string }[]} Array of formatted errors
 *
 * @example
 * ```typescript
 * // Format validation errors
 * const result = validate(apiKeyCreateSchema, invalidData);
 *
 * if (!result.success) {
 *   const errors = formatZodError(result.error);
 *   console.log(errors);
 *   // Output: [
 *   //   { field: "name", message: "Name is required" },
 *   //   { field: "mode", message: "Invalid enum value" }
 *   // ]
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Use in form error display
 * const errors = formatZodError(zodError);
 * const errorMap = Object.fromEntries(
 *   errors.map(e => [e.field, e.message])
 * );
 *
 * // Display field-specific errors
 * <input name="email" />
 * {errorMap.email && <span className="error">{errorMap.email}</span>}
 * ```
 *
 * @example
 * ```typescript
 * // Nested field errors
 * const errors = formatZodError(error);
 * // [
 * //   { field: "billing_address.line1", message: "Required" },
 * //   { field: "billing_address.country", message: "Must be 2 characters" }
 * // ]
 * ```
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
 * Create standardized validation error response
 *
 * Generates a consistent error response object for validation failures.
 * This ensures all validation errors follow the same format across the API.
 *
 * **Response Structure:**
 * ```json
 * {
 *   "error": "Validation failed",
 *   "details": [
 *     { "field": "name", "message": "Name is required" },
 *     { "field": "email", "message": "Invalid email format" }
 *   ]
 * }
 * ```
 *
 * @param {z.ZodError} error - The Zod validation error
 * @returns {{ error: string; details: Array<{ field: string; message: string }> }}
 *   Standardized error response object
 *
 * @example
 * ```typescript
 * // Use in API route
 * export async function POST(request: Request) {
 *   const body = await request.json();
 *
 *   const result = validate(userProfileSchema, body);
 *   if (!result.success) {
 *     return NextResponse.json(
 *       validationErrorResponse(result.error),
 *       { status: 400 }
 *     );
 *   }
 *
 *   // Process valid data...
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Client receives consistent error format
 * try {
 *   const response = await fetch('/api/users', {
 *     method: 'POST',
 *     body: JSON.stringify(invalidData)
 *   });
 *
 *   const result = await response.json();
 *   if (!response.ok) {
 *     // result = {
 *     //   error: "Validation failed",
 *     //   details: [...]
 *     // }
 *     result.details.forEach(({ field, message }) => {
 *       showFieldError(field, message);
 *     });
 *   }
 * } catch (error) {
 *   console.error(error);
 * }
 * ```
 */
export function validationErrorResponse(error: z.ZodError) {
  return {
    error: "Validation failed",
    details: formatZodError(error),
  };
}
