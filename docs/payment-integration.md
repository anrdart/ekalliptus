# Payment Integration Documentation

## Overview

The Ekalliptus payment system provides a flexible, multi-gateway payment processing solution supporting Indonesian payment gateways. The system handles:

- **Full payments**: Complete payment for orders
- **Deposit (DP) payments**: Initial deposit with remaining balance due on-site
- **Remaining payments**: Final payment for consultation completion

### Supported Payment Gateways

1. **Midtrans** (Priority 1)
   - Payment methods: Credit card, bank transfer, e-wallet, QRIS
   - Transaction fee: 0.7%
   - QR support: Yes

2. **Pakasir** (Priority 2)
   - Payment methods: QRIS, bank transfer, e-wallet
   - Transaction fee: 0.65%
   - QR support: Yes

3. **Qiospay** (Priority 3)
   - Payment methods: QRIS, virtual account, e-wallet
   - Transaction fee: 0.7%
   - QR support: Yes

4. **Sanpay** (Priority 4)
   - Payment methods: QRIS, bank transfer
   - Transaction fee: 0.7%
   - QR support: Yes

5. **Tripay** (Priority 5)
   - Payment methods: QRIS, virtual account, e-wallet, retail outlet
   - Transaction fee: 0.7%
   - QR support: Yes

## Architecture

### Payment Flow Diagram

```
┌─────────────┐
│   Customer  │
└──────┬──────┘
       │ 1. Select gateway & payment type
       ▼
┌─────────────────────┐
│  Payment Page       │
│  (frontend)         │
└──────┬──────────────┘
       │ 2. POST /api/payment/create
       ▼
┌─────────────────────┐
│  Payment Service    │
│  - Validate order   │
│  - Calculate fees   │
│  - Create payment   │
└──────┬──────────────┘
       │ 3. Create transaction
       ▼
┌─────────────────────┐
│  Gateway Adapter    │
│  (Midtrans/Pakasir) │
└──────┬──────────────┘
       │ 4. Return payment URL/QR
       ▼
┌─────────────────────┐
│  Customer           │
│  - Redirect to URL  │
│  - Scan QR code     │
└──────┬──────────────┘
       │ 5. Complete payment
       ▼
┌─────────────────────┐
│  Gateway            │
│  Process payment    │
└──────┬──────────────┘
       │ 6. Send webhook
       ▼
┌─────────────────────┐
│  Webhook Endpoint   │
│  /api/webhook/{gw}  │
└──────┬──────────────┘
       │ 7. Update payment status
       ▼
┌─────────────────────┐
│  Webhook Service    │
│  - Verify signature │
│  - Update status    │
│  - Update order     │
│  - Create consult   │
└─────────────────────┘
```

### Database Schema

**payments**
- `id`: UUID (primary key)
- `order_id`: UUID (foreign key → orders)
- `gateway`: TEXT (midtrans, pakasir, qiospay, sanpay, tripay)
- `gateway_transaction_id`: TEXT
- `amount`: NUMERIC (including gateway fees)
- `payment_type`: TEXT (full, dp, remaining)
- `status`: TEXT (pending, processing, paid, failed, expired, refunded)
- `payment_url`: TEXT
- `qr_string`: TEXT
- `expires_at`: TIMESTAMPTZ
- `paid_at`: TIMESTAMPTZ
- `webhook_received_at`: TIMESTAMPTZ
- `metadata`: JSONB

**payment_gateway_configs**
- `id`: UUID (primary key)
- `name`: TEXT (unique gateway identifier)
- `display_name`: TEXT (human-readable name)
- `is_active`: BOOLEAN
- `priority`: INTEGER (for ordering)
- `config`: JSONB (API keys, credentials)
- `fee_percent`: NUMERIC
- `fee_flat`: NUMERIC

**payment_logs**
- `id`: UUID (primary key)
- `payment_id`: UUID (foreign key → payments)
- `gateway`: TEXT
- `event_type`: TEXT
- `request_data`: JSONB
- `response_data`: JSONB
- `status`: TEXT
- `error_message`: TEXT

## Configuration

### Environment Variables

Add these variables to your `.env` file:

```env
# Payment Gateway Configuration
PUBLIC_URL=https://ekalliptus.com

# Midtrans
MIDTRANS_CLIENT_KEY=your_client_key
MIDTRANS_SERVER_KEY=your_server_key
MIDTRANS_IS_PRODUCTION=false

# Pakasir
PAKASIR_API_KEY=your_api_key
PAKASIR_MERCHANT_CODE=your_merchant_code
PAKASIR_IS_PRODUCTION=false

# Qiospay
QIOSPAY_API_KEY=your_api_key
QIOSPAY_MERCHANT_CODE=your_merchant_code
QIOSPAY_IS_PRODUCTION=false

# Sanpay
SANPAY_API_KEY=your_api_key
SANPAY_MERCHANT_CODE=your_merchant_code
SANPAY_IS_PRODUCTION=false

# Tripay
TRIPAY_API_KEY=your_api_key
TRIPAY_PRIVATE_KEY=your_private_key
TRIPAY_MERCHANT_CODE=your_merchant_code
TRIPAY_IS_PRODUCTION=false
```

### Supabase Setup

1. **Run migration**:
```bash
supabase migration up
```

2. **Enable RLS**: Row Level Security is enabled by default
3. **Configure policies**: Service role has full access, users can view their payments

### Gateway Dashboard Configuration

Configure these webhook URLs in your payment gateway dashboards:

**Midtrans**
```
Production: https://ekalliptus.com/api/webhook/midtrans
Sandbox: https://ekalliptus.com/api/webhook/midtrans
```

**Pakasir**
```
Production: https://ekalliptus.com/api/webhook/pakasir
Sandbox: https://ekalliptus.com/api/webhook/pakasir
```

**Qiospay**
```
Production: https://ekalliptus.com/api/webhook/qiospay
Sandbox: https://ekalliptus.com/api/webhook/qiospay
```

**Sanpay**
```
Production: https://ekalliptus.com/api/webhook/sanpay
Sandbox: https://ekalliptus.com/api/webhook/sanpay
```

**Tripay**
```
Production: https://ekalliptus.com/api/webhook/tripay
Sandbox: https://ekalliptus.com/api/webhook/tripay
```

## API Reference

### Create Payment

**Endpoint**: `POST /api/payment/create`

**Request Body**:
```json
{
  "orderId": "uuid",
  "gateway": "midtrans",
  "amount": 150000,
  "paymentType": "dp"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "paymentId": "uuid",
    "transactionId": "gateway_transaction_id",
    "paymentUrl": "https://gateway.payment/xyz",
    "qrString": "data:image/png;base64,...",
    "expiresAt": "2024-01-02T15:00:00Z"
  }
}
```

### Get Payment Status

**Endpoint**: `GET /api/payment/{paymentId}`

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "order_id": "uuid",
    "gateway": "midtrans",
    "amount": 150000,
    "status": "paid",
    "payment_type": "dp",
    "paid_at": "2024-01-02T10:30:00Z"
  }
}
```

### Get Payments by Order

**Endpoint**: `GET /api/payment/by-order/{orderId}`

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "gateway": "midtrans",
      "amount": 150000,
      "status": "paid",
      "payment_type": "dp"
    }
  ]
}
```

### Webhook Endpoints

**Endpoints**:
- `POST /api/webhook/midtrans`
- `POST /api/webhook/pakasir`
- `POST /api/webhook/qiospay`
- `POST /api/webhook/sanpay`
- `POST /api/webhook/tripay`

**Headers**:
- Gateway-specific signature verification headers
- Content-Type: application/json

**Response**:
- `200 OK`: Webhook processed successfully
- `400 Bad Request`: Invalid signature or payload
- `404 Not Found`: Payment not found

## Testing Guide

### Sandbox Mode

All gateways support sandbox/testing mode. Set `IS_PRODUCTION=false` in environment variables.

### Test Cards (Midtrans)

**Visa (Success)**
- Card number: 4000 0012 3456 7890
- Expiry: Any future date
- CVV: Any 3 digits

**Visa (Denied)**
- Card number: 4000 0011 1111 1111
- Expiry: Any future date
- CVV: Any 3 digits

### Test Workflow

1. **Create test order** via checkout flow
2. **Select payment gateway** (Midtrans/Pakasir)
3. **Choose payment type** (Full/DP)
4. **Complete payment** using test credentials
5. **Verify webhook** received in payment_logs table
6. **Check order status** updated to `dp_paid` or `onsite_paid`
7. **Verify consultation created** (for DP payments)

### Manual Testing Commands

```bash
# Check active gateways
curl -X GET https://ekalliptus.com/api/admin/gateways

# Get payment by ID
curl -X GET https://ekalliptus.com/api/payment/{paymentId}

# Get payments by order
curl -X GET https://ekalliptus.com/api/payment/by-order/{orderId}
```

## Troubleshooting

### Common Issues

**1. Webhook not received**
- Check firewall allows inbound traffic from gateway IPs
- Verify webhook URL in gateway dashboard
- Check payment_logs table for errors
- Ensure `PUBLIC_URL` is set correctly

**2. Payment status not updating**
- Check webhook signature verification
- Verify `webhook_received_at` timestamp
- Check payment_logs for error messages
- Ensure gateway credentials are correct

**3. Gateway adapter creation failed**
- Verify gateway configuration in `payment_gateway_configs` table
- Check environment variables are set
- Ensure gateway is active (`is_active = true`)
- Check API keys are valid for current environment

**4. Amount mismatch error**
- Verify amount includes gateway fees
- Check payment_type matches expected amount
- Ensure order grand_total/deposit/remaining is correct
- Allow small difference for fee variations (±1000)

**5. Order status not updating**
- Check payment_logs for webhook errors
- Verify payment status is 'paid'
- Ensure order exists and is accessible
- Check RLS policies allow service role updates

### Debug Mode

Enable detailed logging:

```typescript
// In payment service
console.log('Payment creation request:', request)
console.log('Gateway config:', gatewayConfig)
console.log('Gateway response:', paymentResponse)
```

### Health Check

```bash
# Check payment system health
curl -X GET https://ekalliptus.com/api/health
```

## Security Considerations

1. **Webhook Signature Verification**: All webhooks must be signed
2. **Row Level Security**: Enabled on all payment tables
3. **API Key Storage**: Store in environment variables, never commit
4. **HTTPS Only**: All payment endpoints require HTTPS
5. **Idempotency**: Duplicate webhook handling prevents double-payment
6. **Rate Limiting**: Consider implementing rate limits on payment endpoints

## Fee Calculation

Gateway fees are automatically calculated:

```
total_amount = order_amount + (order_amount × fee_percent) + fee_flat
```

Example (Midtrans):
- Order amount: 150,000 IDR
- Fee percent: 0.7%
- Fee flat: 0 IDR
- Gateway fee: 1,050 IDR
- Total amount: 151,050 IDR

## Order Status Flow

1. **pending** → Order created
2. **dp_paid** → Deposit payment received
3. **onsite_paid** → Remaining payment received
4. **completed** → Order fulfilled

## Consultation Creation

Consultations are automatically created when:
- Payment type is 'dp'
- Payment status is 'paid'
- Order has `consultation_required = true`

## Support

For issues or questions:
1. Check payment_logs table for detailed error messages
2. Review gateway dashboard for transaction details
3. Verify webhook configuration in gateway dashboard
4. Check environment variables are correctly set

## Changelog

**v1.0.0** (2024-01-20)
- Initial payment integration
- Midtrans and Pakasir support
- Webhook processing
- Admin dashboard for gateway management
