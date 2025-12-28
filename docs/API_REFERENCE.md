# API Reference Documentation

**Version**: 1.0.0  
**Last Updated**: December 26, 2025  
**Base URL**: `/api`

---

## Table of Contents

1. [Authentication](#authentication)
2. [User Endpoints](#user-endpoints)
3. [Subscription Endpoints](#subscription-endpoints)
4. [Payment Endpoints](#payment-endpoints)
5. [Invoice Endpoints](#invoice-endpoints)
6. [Usage Endpoints](#usage-endpoints)
7. [Admin Endpoints](#admin-endpoints)
8. [Error Handling](#error-handling)

---

## Authentication

All API endpoints require authentication via Supabase session cookies. Users must be signed in to access these endpoints.

**Authentication Header**: Automatically handled by Supabase client  
**Session Management**: Cookie-based

---

## User Endpoints

### Get User Profile

**Endpoint**: `GET /api/user/profile`  
**Description**: Retrieve the authenticated user's profile information

**Response** (200 OK):
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "John Doe",
  "avatar_url": "https://...",
  "company": "Acme Inc",
  "created_at": "2025-01-01T00:00:00Z"
}
```

### Update User Profile

**Endpoint**: `PATCH /api/user/profile`  
**Description**: Update the authenticated user's profile

**Request Body**:
```json
{
  "full_name": "Jane Doe",
  "company": "New Company"
}
```

**Response** (200 OK):
```json
{
  "id": "uuid",
  "full_name": "Jane Doe",
  "company": "New Company",
  "updated_at": "2025-01-01T00:00:00Z"
}
```

---

## Subscription Endpoints

### List Subscriptions

**Endpoint**: `GET /api/subscriptions`  
**Description**: Get all subscriptions for the authenticated user

**Response** (200 OK):
```json
{
  "subscriptions": [
    {
      "id": "sub_123",
      "status": "active",
      "current_period_start": 1704067200,
      "current_period_end": 1706745600,
      "cancel_at_period_end": false,
      "prices": {
        "id": "price_123",
        "unit_amount": 2000,
        "currency": "usd",
        "interval": "month",
        "products": {
          "id": "prod_123",
          "name": "Pro Plan",
          "description": "Professional features"
        }
      }
    }
  ]
}
```

### Create Subscription

**Endpoint**: `POST /api/subscriptions`  
**Description**: Create a new subscription

**Request Body**:
```json
{
  "priceId": "price_123",
  "paymentMethodId": "pm_123",
  "trialDays": 14
}
```

**Response** (200 OK):
```json
{
  "subscription": {
    "id": "sub_123",
    "status": "trialing",
    "trial_end": 1705276800
  }
}
```

### Cancel Subscription

**Endpoint**: `POST /api/subscriptions/{id}/cancel`  
**Description**: Cancel a subscription

**Request Body**:
```json
{
  "immediately": false
}
```

**Response** (200 OK):
```json
{
  "subscription": {
    "id": "sub_123",
    "status": "active",
    "cancel_at_period_end": true,
    "canceled_at": 1704067200
  }
}
```

---

## Payment Endpoints

### List Payment Methods

**Endpoint**: `GET /api/payments/methods`  
**Description**: Get all payment methods for the authenticated user

**Response** (200 OK):
```json
{
  "payment_methods": [
    {
      "id": "pm_123",
      "type": "card",
      "card": {
        "brand": "visa",
        "last4": "4242",
        "exp_month": 12,
        "exp_year": 2025
      }
    }
  ],
  "default_payment_method": "pm_123"
}
```

### Add Payment Method

**Endpoint**: `POST /api/payments/methods`  
**Description**: Add a new payment method

**Request Body**:
```json
{
  "paymentMethodId": "pm_123",
  "setAsDefault": true
}
```

**Response** (200 OK):
```json
{
  "payment_method": {
    "id": "pm_123",
    "type": "card"
  }
}
```

### Remove Payment Method

**Endpoint**: `DELETE /api/payments/methods`  
**Description**: Remove a payment method

**Request Body**:
```json
{
  "paymentMethodId": "pm_123"
}
```

**Response** (200 OK):
```json
{
  "deleted": true
}
```

---

## Invoice Endpoints

### List Invoices

**Endpoint**: `GET /api/invoices`  
**Description**: Get invoices for the authenticated user

**Query Parameters**:
- `limit` (number, optional): Number of invoices to return (default: 10, max: 100)
- `starting_after` (string, optional): Cursor for pagination
- `status` (string, optional): Filter by status (paid, open, void, uncollectible)

**Response** (200 OK):
```json
{
  "invoices": [
    {
      "id": "in_123",
      "number": "INV-001",
      "status": "paid",
      "amount_paid": 2000,
      "currency": "usd",
      "created": 1704067200,
      "invoice_pdf": "https://...",
      "hosted_invoice_url": "https://..."
    }
  ],
  "has_more": false
}
```

### Get Invoice Details

**Endpoint**: `GET /api/invoices/{id}`  
**Description**: Get detailed information about a specific invoice

**Response** (200 OK):
```json
{
  "id": "in_123",
  "number": "INV-001",
  "status": "paid",
  "amount_paid": 2000,
  "lines": {
    "data": [
      {
        "description": "Pro Plan",
        "amount": 2000
      }
    ]
  }
}
```

---

## Usage Endpoints

### Get Usage Statistics

**Endpoint**: `GET /api/usage`  
**Description**: Get usage statistics for the authenticated user

**Query Parameters**:
- `period` (string, optional): Time period (day, week, month, year, all)
- `metric` (string, optional): Specific metric to retrieve

**Response** (200 OK):
```json
{
  "period": "month",
  "metrics": {
    "api_calls": {
      "total": 1250,
      "average": 41.67,
      "limit": 10000
    },
    "storage_used": {
      "total": 524288000,
      "average": 17476266.67
    }
  },
  "timeline": [
    {
      "date": "2025-01-01",
      "events": 45
    }
  ]
}
```

### Record Usage Event

**Endpoint**: `POST /api/usage`  
**Description**: Record a usage event

**Request Body**:
```json
{
  "metric": "api_calls",
  "value": 1,
  "metadata": {
    "endpoint": "/api/user/profile",
    "method": "GET"
  }
}
```

**Response** (200 OK):
```json
{
  "id": "uuid",
  "metric": "api_calls",
  "value": 1,
  "created_at": "2025-01-01T00:00:00Z"
}
```

---

## Admin Endpoints

**Note**: These endpoints require admin role

### List Users

**Endpoint**: `GET /api/admin/users`  
**Description**: Get all users (admin only)

**Query Parameters**:
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20, max: 100)
- `search` (string, optional): Search by email or name
- `status` (string, optional): Filter by status
- `sort` (string, optional): Sort field (created_at, email, full_name)
- `order` (string, optional): Sort order (asc, desc)

**Response** (200 OK):
```json
{
  "users": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "John Doe",
      "created_at": "2025-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "total_pages": 5
  }
}
```

### Get Analytics

**Endpoint**: `GET /api/admin/analytics`  
**Description**: Get platform-wide analytics (admin only)

**Query Parameters**:
- `period` (string, optional): Time period (day, week, month, year)

**Response** (200 OK):
```json
{
  "period": "month",
  "date_range": {
    "start": "2024-12-01T00:00:00Z",
    "end": "2025-01-01T00:00:00Z"
  },
  "users": {
    "total": 1000,
    "new": 50,
    "growth_rate": "5.26%"
  },
  "subscriptions": {
    "active": 750,
    "trialing": 50,
    "canceled": 100,
    "total": 900
  },
  "revenue": {
    "total": 150000,
    "refunds": 5000,
    "net": 145000,
    "currency": "usd"
  }
}
```

---

## Error Handling

All endpoints return consistent error responses:

**Error Response Format**:
```json
{
  "error": "Error message describing what went wrong"
}
```

**HTTP Status Codes**:
- `200` - Success
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

**Example Error**:
```json
{
  "error": "Unauthorized - Please sign in to access this resource"
}
```

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Authenticated requests**: 1000 requests per hour
- **Unauthenticated requests**: 100 requests per hour

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Time when limit resets (Unix timestamp)

---

## Pagination

List endpoints support cursor-based pagination:

**Request**:
```
GET /api/invoices?limit=10&starting_after=in_123
```

**Response**:
```json
{
  "data": [...],
  "has_more": true,
  "next_cursor": "in_456"
}
```

---

## Versioning

API version is included in the base URL. Current version: `v1`

Breaking changes will result in a new API version. Non-breaking changes are deployed without version changes.

---

## Support

For API support, contact: support@mnnr.app  
Documentation: https://docs.mnnr.app  
Status: https://status.mnnr.app
