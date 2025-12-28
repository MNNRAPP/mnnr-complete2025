/**
 * OpenAPI/Swagger Documentation Configuration
 * 
 * Generates interactive API documentation
 */

export const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "MNNR API",
    version: "1.0.0",
    description: "API for managing API keys, subscriptions, and usage tracking",
    contact: {
      name: "MNNR Support",
      email: "support@mnnr.app",
      url: "https://mnnr.app",
    },
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT",
    },
  },
  servers: [
    {
      url: "https://mnnr.app/api",
      description: "Production server",
    },
    {
      url: "http://localhost:3000/api",
      description: "Development server",
    },
  ],
  tags: [
    {
      name: "API Keys",
      description: "Manage API keys for authentication",
    },
    {
      name: "Subscriptions",
      description: "Manage Stripe subscriptions",
    },
    {
      name: "Usage",
      description: "Track API usage and analytics",
    },
    {
      name: "Health",
      description: "Health check endpoints",
    },
  ],
  paths: {
    "/keys": {
      get: {
        tags: ["API Keys"],
        summary: "List all API keys",
        description: "Retrieve all API keys for the authenticated user",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "List of API keys",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    keys: {
                      type: "array",
                      items: { $ref: "#/components/schemas/ApiKey" },
                    },
                  },
                },
              },
            },
          },
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "429": {
            description: "Rate limit exceeded",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RateLimitError" },
              },
            },
          },
        },
      },
      post: {
        tags: ["API Keys"],
        summary: "Create a new API key",
        description: "Generate a new API key for the authenticated user",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name"],
                properties: {
                  name: {
                    type: "string",
                    minLength: 1,
                    maxLength: 100,
                    pattern: "^[a-zA-Z0-9\\s\\-_]+$",
                    example: "Production API Key",
                  },
                  mode: {
                    type: "string",
                    enum: ["live", "test"],
                    default: "live",
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "API key created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    apiKey: {
                      allOf: [
                        { $ref: "#/components/schemas/ApiKey" },
                        {
                          type: "object",
                          properties: {
                            key: {
                              type: "string",
                              description: "Full API key (only shown once)",
                              example: "sk_live_abc123def456",
                            },
                          },
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ValidationError" },
              },
            },
          },
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "429": {
            description: "Rate limit exceeded",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RateLimitError" },
              },
            },
          },
        },
      },
      delete: {
        tags: ["API Keys"],
        summary: "Delete an API key",
        description: "Deactivate an API key (soft delete)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "query",
            required: true,
            schema: {
              type: "string",
              format: "uuid",
            },
            description: "API key ID to delete",
          },
        ],
        responses: {
          "200": {
            description: "API key deleted successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                  },
                },
              },
            },
          },
          "400": {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ValidationError" },
              },
            },
          },
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        description: "Check if the API is healthy",
        responses: {
          "200": {
            description: "API is healthy",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ok" },
                    timestamp: { type: "string", format: "date-time" },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      ApiKey: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          user_id: { type: "string", format: "uuid" },
          name: { type: "string" },
          key_prefix: { type: "string", example: "sk_live_" },
          is_active: { type: "boolean" },
          created_at: { type: "string", format: "date-time" },
          last_used_at: { type: "string", format: "date-time", nullable: true },
        },
      },
      Error: {
        type: "object",
        properties: {
          error: { type: "string" },
          message: { type: "string" },
        },
      },
      ValidationError: {
        type: "object",
        properties: {
          error: { type: "string", example: "Validation error" },
          details: {
            type: "array",
            items: {
              type: "object",
              properties: {
                field: { type: "string" },
                message: { type: "string" },
              },
            },
          },
        },
      },
      RateLimitError: {
        type: "object",
        properties: {
          error: { type: "string", example: "Rate limit exceeded" },
          message: { type: "string" },
          retryAfter: { type: "integer", description: "Seconds until retry" },
        },
      },
    },
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Supabase JWT token",
      },
    },
  },
};
