# Project Structure

## Directory Layout

```
src/
├── components/           # React components
│   ├── ui/               # Shadcn base components
│   ├── layout/           # Layout components (Header, Footer, etc.)
│   ├── forms/            # Form components
│   └── sections/         # Page sections
├── config/               # Configuration
│   └── supabase.ts       # Supabase client
├── contexts/             # React contexts
├── hooks/                # Custom React hooks
├── i18n/                 # Internationalization
│   └── locales/          # Translation files
├── lib/                  # Utilities and business logic
│   ├── database.types.ts # Supabase generated types
│   ├── currency.ts       # Currency formatting
│   ├── utils.ts          # General utilities
│   └── order/            # Order business logic
│       ├── calc.ts       # Legacy calculations
│       ├── calculator.ts # New amount calculator
│       ├── types.ts      # Order types
│       └── data.ts       # Static data
├── middleware/           # Middleware functions
├── pages/                # Page components
├── services/             # Service layer
│   ├── orderService.ts   # Order operations
│   └── voucherService.ts # Voucher validation
├── App.tsx               # Root component
├── main.tsx              # Entry point
└── index.css             # Global styles

public/                   # Static assets
database/                 # Database schema docs
supabase/                 # Supabase migrations
```

## Key Patterns

### Path Aliases
- `@/*` → `./src/*`

### Component Organization
- UI primitives in `components/ui/`
- Feature components in `components/{feature}/`
- Page sections in `components/sections/`

### Service Layer
- Business logic in `services/`
- Pure calculation functions in `lib/order/calculator.ts`
- Database types in `lib/database.types.ts`

### Testing
- Tests colocated in `__tests__/` folders
- Property tests: `*.property.test.ts`
- Unit tests: `*.test.ts`

### Type Safety
- Database types auto-generated from Supabase
- Zod schemas for runtime validation
- TypeScript strict mode

## Supabase Integration

### Tables
- `orders` - Customer orders
- `order_items` - Order line items
- `order_attachments` - File attachments
- `vouchers` - Discount vouchers
- `profiles` - User profiles
- `payment_transactions` - Payment records
- `audit_logs` - Activity logs

### Storage
- `orders` bucket - Order attachments

### Functions
- `create_order_with_attachments` - Atomic order creation
- `batch_update_order_status` - Bulk status updates
