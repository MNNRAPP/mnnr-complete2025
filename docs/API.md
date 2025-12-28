# MNNR API Documentation

Complete API reference for MNNR platform integration.

---

## Base URL

```
Production: https://mnnr.app/api
Development: http://localhost:3000/api
```

---

## Authentication

MNNR uses Supabase Auth with JWT tokens.

### Get Access Token

```typescript
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();
const { data: { session } } = await supabase.auth.getSession();
const accessToken = session?.access_token;
```

### Include in Requests

```http
Authorization: Bearer <access_token>
```

---

## API Endpoints

### Health Check

Check API health status.

**Endpoint:** `GET /api/health`

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-26T12:00:00.000Z",
  "version": "1.0.0"
}
```

---

### Payments

#### Create Payment Intent

Create a new payment intent for processing.

**Endpoint:** `POST /api/payments/create`

**Headers:**
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "amount": 10000,
  "currency": "usd",
  "metadata": {
    "deviceId": "device_123",
    "machineType": "vending"
  }
}
```

**Response:**
```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx",
  "amount": 10000,
  "currency": "usd"
}
```

#### Confirm Payment

Confirm a payment intent.

**Endpoint:** `POST /api/payments/confirm`

**Request Body:**
```json
{
  "paymentIntentId": "pi_xxx",
  "paymentMethodId": "pm_xxx"
}
```

**Response:**
```json
{
  "status": "succeeded",
  "paymentIntentId": "pi_xxx",
  "amount": 10000
}
```

#### Get Payment Status

Retrieve payment status.

**Endpoint:** `GET /api/payments/:paymentId`

**Response:**
```json
{
  "id": "pi_xxx",
  "status": "succeeded",
  "amount": 10000,
  "currency": "usd",
  "created": "2025-12-26T12:00:00.000Z"
}
```

---

### Subscriptions

#### Create Checkout Session

Create a Stripe Checkout session for subscription.

**Endpoint:** `POST /api/subscriptions/checkout`

**Request Body:**
```json
{
  "priceId": "price_xxx",
  "successUrl": "https://mnnr.app/dashboard",
  "cancelUrl": "https://mnnr.app/pricing"
}
```

**Response:**
```json
{
  "sessionId": "cs_xxx",
  "url": "https://checkout.stripe.com/pay/cs_xxx"
}
```

#### Get Subscription Status

Get current subscription status.

**Endpoint:** `GET /api/subscriptions/status`

**Response:**
```json
{
  "subscriptionId": "sub_xxx",
  "status": "active",
  "currentPeriodEnd": "2026-01-26T12:00:00.000Z",
  "plan": {
    "name": "Professional",
    "amount": 19900,
    "interval": "month"
  }
}
```

#### Cancel Subscription

Cancel an active subscription.

**Endpoint:** `POST /api/subscriptions/cancel`

**Request Body:**
```json
{
  "subscriptionId": "sub_xxx",
  "cancelAtPeriodEnd": true
}
```

**Response:**
```json
{
  "subscriptionId": "sub_xxx",
  "status": "active",
  "cancelAtPeriodEnd": true,
  "currentPeriodEnd": "2026-01-26T12:00:00.000Z"
}
```

---

### Devices

#### Register Device

Register a new IoT device.

**Endpoint:** `POST /api/devices/register`

**Request Body:**
```json
{
  "deviceId": "device_123",
  "deviceType": "vending_machine",
  "location": {
    "latitude": 37.7749,
    "longitude": -122.4194,
    "address": "123 Main St, San Francisco, CA"
  },
  "metadata": {
    "manufacturer": "ACME Corp",
    "model": "VM-2000"
  }
}
```

**Response:**
```json
{
  "deviceId": "device_123",
  "apiKey": "mnnr_device_xxx",
  "status": "active",
  "createdAt": "2025-12-26T12:00:00.000Z"
}
```

#### Get Device Status

Get device status and metrics.

**Endpoint:** `GET /api/devices/:deviceId`

**Response:**
```json
{
  "deviceId": "device_123",
  "status": "active",
  "lastSeen": "2025-12-26T12:00:00.000Z",
  "metrics": {
    "totalTransactions": 1523,
    "totalRevenue": 152300,
    "uptime": 99.8
  }
}
```

#### Update Device

Update device information.

**Endpoint:** `PATCH /api/devices/:deviceId`

**Request Body:**
```json
{
  "status": "maintenance",
  "metadata": {
    "lastMaintenance": "2025-12-26T12:00:00.000Z"
  }
}
```

---

### Analytics

#### Get Transaction Analytics

Get transaction analytics for a time period.

**Endpoint:** `GET /api/analytics/transactions`

**Query Parameters:**
- `startDate` (ISO 8601 date)
- `endDate` (ISO 8601 date)
- `deviceId` (optional)

**Example:**
```http
GET /api/analytics/transactions?startDate=2025-12-01&endDate=2025-12-31
```

**Response:**
```json
{
  "period": {
    "start": "2025-12-01T00:00:00.000Z",
    "end": "2025-12-31T23:59:59.000Z"
  },
  "summary": {
    "totalTransactions": 15234,
    "totalRevenue": 1523400,
    "averageTransaction": 10000,
    "successRate": 98.5
  },
  "daily": [
    {
      "date": "2025-12-01",
      "transactions": 523,
      "revenue": 52300
    }
  ]
}
```

#### Get Device Analytics

Get analytics for specific device.

**Endpoint:** `GET /api/analytics/devices/:deviceId`

**Response:**
```json
{
  "deviceId": "device_123",
  "period": "last_30_days",
  "metrics": {
    "transactions": 1234,
    "revenue": 123400,
    "uptime": 99.8,
    "errorRate": 0.2
  },
  "trends": {
    "transactionsChange": 15.3,
    "revenueChange": 18.7
  }
}
```

---

### AI Services

#### Natural Language Query

Process natural language queries.

**Endpoint:** `POST /api/ai/query`

**Request Body:**
```json
{
  "query": "Show me failed payments from the last hour",
  "context": {
    "userId": "user_123",
    "deviceId": "device_123"
  }
}
```

**Response:**
```json
{
  "intent": "search_failed_payments",
  "results": [
    {
      "paymentId": "pi_xxx",
      "amount": 10000,
      "failureReason": "card_declined",
      "timestamp": "2025-12-26T11:30:00.000Z"
    }
  ],
  "summary": "Found 3 failed payments in the last hour totaling $300"
}
```

#### Voice Command

Process voice commands.

**Endpoint:** `POST /api/ai/voice`

**Request Body:**
```json
{
  "text": "Approve pending payments",
  "deviceType": "smartwatch",
  "userId": "user_123"
}
```

**Response:**
```json
{
  "action": "approve_payments",
  "confirmation": "Approved 5 pending payments totaling $500",
  "affectedPayments": ["pi_xxx", "pi_yyy"]
}
```

#### Predictive Analytics

Get predictions and anomaly detection.

**Endpoint:** `POST /api/ai/predictions`

**Request Body:**
```json
{
  "metric": "payment_volume",
  "horizon": 24,
  "deviceId": "device_123"
}
```

**Response:**
```json
{
  "metric": "payment_volume",
  "predictions": [
    {
      "timestamp": "2025-12-27T00:00:00.000Z",
      "predicted": 523,
      "confidence": 0.85
    }
  ],
  "anomalies": [
    {
      "timestamp": "2025-12-26T15:00:00.000Z",
      "value": 1234,
      "expected": 523,
      "severity": "high"
    }
  ]
}
```

---

### Audit Logs

#### Get Audit Logs

Retrieve audit logs with filtering.

**Endpoint:** `GET /api/audit/logs`

**Query Parameters:**
- `startDate` (ISO 8601 date)
- `endDate` (ISO 8601 date)
- `eventType` (optional)
- `userId` (optional)
- `limit` (default: 100, max: 1000)

**Example:**
```http
GET /api/audit/logs?startDate=2025-12-26&eventType=payment_completed&limit=50
```

**Response:**
```json
{
  "logs": [
    {
      "id": "log_xxx",
      "eventType": "payment_completed",
      "userId": "user_123",
      "resource": "payment_abc",
      "timestamp": "2025-12-26T12:00:00.000Z",
      "metadata": {
        "amount": 10000,
        "currency": "usd"
      },
      "signature": "hmac_sha256_signature",
      "previousHash": "hash_of_previous_event"
    }
  ],
  "total": 523,
  "page": 1,
  "hasMore": true
}
```

#### Verify Audit Trail

Verify integrity of audit trail.

**Endpoint:** `POST /api/audit/verify`

**Request Body:**
```json
{
  "startDate": "2025-12-01T00:00:00.000Z",
  "endDate": "2025-12-31T23:59:59.000Z"
}
```

**Response:**
```json
{
  "valid": true,
  "totalEvents": 15234,
  "invalidEvents": [],
  "brokenChains": 0,
  "verifiedAt": "2025-12-26T12:00:00.000Z"
}
```

---

## Webhooks

MNNR sends webhooks for important events.

### Webhook Events

- `payment.created`
- `payment.succeeded`
- `payment.failed`
- `subscription.created`
- `subscription.updated`
- `subscription.canceled`
- `device.registered`
- `device.status_changed`

### Webhook Payload

```json
{
  "id": "evt_xxx",
  "type": "payment.succeeded",
  "createdAt": "2025-12-26T12:00:00.000Z",
  "data": {
    "paymentId": "pi_xxx",
    "amount": 10000,
    "currency": "usd",
    "deviceId": "device_123"
  }
}
```

### Webhook Signature Verification

```typescript
import crypto from 'crypto';

function verifyWebhook(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

---

## Rate Limits

| Endpoint Type | Rate Limit |
|--------------|------------|
| Authentication | 5 requests / 15 minutes |
| Payments | 60 requests / minute |
| Analytics | 30 requests / minute |
| Webhooks | 100 requests / minute |
| AI Services | 10 requests / minute |

**Rate Limit Headers:**
```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1640000000
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |
| 503 | Service Unavailable - Temporary outage |

### Error Response Format

```json
{
  "error": {
    "code": "invalid_request",
    "message": "Missing required parameter: amount",
    "details": {
      "field": "amount",
      "reason": "required"
    }
  }
}
```

---

## SDKs & Libraries

### JavaScript/TypeScript

```bash
npm install @mnnr/sdk
```

```typescript
import { MNNRClient } from '@mnnr/sdk';

const client = new MNNRClient({
  apiKey: 'your_api_key',
  environment: 'production'
});

// Create payment
const payment = await client.payments.create({
  amount: 10000,
  currency: 'usd'
});
```

### Python

```bash
pip install mnnr
```

```python
import mnnr

client = mnnr.Client(api_key='your_api_key')

# Create payment
payment = client.payments.create(
    amount=10000,
    currency='usd'
)
```

### cURL Examples

#### Create Payment

```bash
curl -X POST https://mnnr.app/api/payments/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 10000,
    "currency": "usd"
  }'
```

#### Get Analytics

```bash
curl -X GET "https://mnnr.app/api/analytics/transactions?startDate=2025-12-01&endDate=2025-12-31" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Testing

### Test Mode

Use test API keys for development:

```
Test Publishable Key: pk_test_xxx
Test Secret Key: sk_test_xxx
```

### Test Cards

| Card Number | Scenario |
|-------------|----------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 0002 | Card declined |
| 4000 0000 0000 9995 | Insufficient funds |

---

## Support

- **Email:** pilot@mnnr.app
- **Documentation:** https://docs.mnnr.app
- **Status:** https://status.mnnr.app

---

**API Version:** v1  
**Last Updated:** December 26, 2025
