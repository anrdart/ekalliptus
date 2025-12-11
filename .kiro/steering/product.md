# Ekalliptus Customer Website

Customer-facing website for Ekalliptus digital agency - allowing customers to browse services and submit orders.

## Relationship with Admin Dashboard

This is the **customer website** (Vite + React) that shares the same Supabase database with the **admin dashboard** (Next.js). Orders submitted here appear in the admin dashboard for processing.

```
Customer Website (this project)
        ↓ submits orders
    [Supabase Database]
        ↓ manages orders
Admin Dashboard (separate project)
```

## Core Business Domain

- **Service Catalog**: Website development, WordPress, mobile apps, photo/video editing, device repair
- **Order Submission**: Customers fill forms to request services
- **Payment Flow**: 
  - Online services: 50% deposit → production → settlement
  - Device repair (onsite): 0% deposit → pay on completion
- **Business Logic**: Automatic PPN (11% tax), voucher discounts, urgency multipliers

## Service Types

| Service | Code | Deposit |
|---------|------|---------|
| Website Development | `website` | 50% |
| WordPress Development | `wordpress` | 50% |
| Mobile App Development | `mobile` | 50% |
| Photo & Video Editing | `editing` | 50% |
| Device Repair (Onsite) | `service_device` | 0% |

## Key Features

- Service showcase with pricing
- Order form with file attachments
- Voucher code validation
- Automatic price calculation (subtotal, PPN, deposit)
- WhatsApp integration for customer communication
- Multi-language support (Indonesian primary)

## Order Status Flow

```
waiting_dp → dp_paid → (production) → settlement
waiting_onsite_payment → onsite_paid → (completed)
```

## Currency & Locale

- Primary currency: IDR (Indonesian Rupiah)
- Language: Indonesian (id)
- Number format: Indonesian (1.000.000)

## Integration Points

- **Supabase Auth**: Optional customer accounts
- **Supabase Storage**: Order file attachments
- **Supabase Realtime**: Live order status updates
- **WhatsApp**: Customer communication channel
