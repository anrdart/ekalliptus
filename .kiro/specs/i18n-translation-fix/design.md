# Design Document

## Overview

Menambahkan missing translation keys ke semua 7 locale files untuk menghilangkan warning intlify di console. Keys yang perlu ditambahkan adalah `orderSuccess.*` dan `services.orderNow`.

## Architecture

```
i18n/
└── locales/
    ├── id.json    (Indonesian - primary)
    ├── en.json    (English)
    ├── ja.json    (Japanese)
    ├── ko.json    (Korean)
    ├── ru.json    (Russian)
    ├── ar.json    (Arabic)
    └── tr.json    (Turkish)
```

## Components and Interfaces

### Missing Translation Keys

```json
{
  "orderSuccess": {
    "title": "Order Berhasil",
    "heading": "Terima Kasih!",
    "message": "Pesanan Anda telah kami terima. Tim kami akan menghubungi Anda segera.",
    "backHome": "Kembali ke Beranda",
    "contactWhatsApp": "Hubungi via WhatsApp"
  },
  "services": {
    "orderNow": "Pesan Sekarang"
  }
}
```

## Data Models

### Locale File Structure

Each locale file follows this structure:
- `nav.*` - Navigation labels
- `hero.*` - Hero section content
- `services.*` - Services section content
- `order.*` - Order form labels
- `orderSuccess.*` - Order success page content (NEW)
- `privacyPolicy.*` - Privacy policy content
- `termsOfService.*` - Terms of service content

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Translation Key Completeness
*For any* translation key used in the application, all 7 locale files SHALL contain that key with a non-empty string value
**Validates: Requirements 1.1, 1.2**

### Property 2: OrderSuccess Keys Presence
*For any* locale file, the orderSuccess object SHALL contain all 5 required keys (title, heading, message, backHome, contactWhatsApp)
**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**

## Error Handling

- If a translation key is missing, intlify will display the key path as fallback
- Console warning will be logged for missing keys

## Testing Strategy

### Manual Testing
- Load application in each language
- Navigate to order success page
- Verify no console warnings
- Verify correct translations displayed

### Property-Based Tests
- Validate all locale files have same key structure
- Validate no empty string values for required keys
