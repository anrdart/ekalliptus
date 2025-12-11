# Design Document

## Overview

Menambahkan fitur-fitur baru ke order form tanpa menghilangkan fitur yang sudah ada. Fitur baru meliputi: file attachments upload, voucher code input dengan validasi, price summary display, dan urgency selection. Semua fitur existing (service selection, customer details, dynamic service fields, project details) tetap dipertahankan.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         pages/order.vue                                  │
├─────────────────────────────────────────────────────────────────────────┤
│  EXISTING SECTIONS (DO NOT MODIFY):                                      │
│  ├── Step 1: Service Selection (6 services with icons)                  │
│  ├── Step 2: Customer Details (name, email, phone, company)             │
│  ├── Step 3: Service-Specific Details (dynamic fields)                  │
│  └── Step 4: Project Details (name, description, budget, timeline)      │
│                                                                          │
│  NEW SECTIONS TO ADD:                                                    │
│  ├── Step 5: File Attachments (drag-drop upload)                        │
│  ├── Step 6: Urgency Selection (normal/express/priority)                │
│  ├── Step 7: Voucher Code Input (with apply button)                     │
│  └── Price Summary Panel (subtotal, discount, PPN, total, deposit)      │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         Composables                                      │
├─────────────────────────────────────────────────────────────────────────┤
│  useSupabase.ts (EXISTING)                                              │
│  ├── uploadAttachment() - upload to Storage                             │
│  └── createOrder() - with attachments support                           │
│                                                                          │
│  useVoucherService.ts (EXISTING)                                        │
│  └── validateVoucher() - check code validity                            │
│                                                                          │
│  useOrderCalculation.ts (EXISTING)                                      │
│  └── calculateOrder() - with urgency multiplier                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         Supabase                                         │
├─────────────────────────────────────────────────────────────────────────┤
│  Storage: orders bucket                                                  │
│  Tables: orders, order_attachments, vouchers                            │
└─────────────────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. File Upload Component (NEW)

```vue
<!-- components/FileUpload.vue -->
<template>
  <div 
    @drop.prevent="handleDrop"
    @dragover.prevent="isDragging = true"
    @dragleave="isDragging = false"
    class="border-2 border-dashed rounded-xl p-6 text-center"
    :class="isDragging ? 'border-primary bg-primary/5' : 'border-muted'"
  >
    <Upload class="h-8 w-8 mx-auto text-muted-foreground" />
    <p>Drag & drop files or click to browse</p>
    <input type="file" multiple @change="handleSelect" />
  </div>
  
  <!-- File previews -->
  <div v-for="file in files" :key="file.name">
    <img v-if="isImage(file)" :src="preview(file)" />
    <span>{{ file.name }}</span>
    <button @click="removeFile(file)">Remove</button>
  </div>
</template>
```

### 2. Voucher Input Component (NEW)

```vue
<!-- In order.vue -->
<div class="flex gap-2">
  <input v-model="voucherCode" placeholder="Kode Voucher" />
  <button @click="applyVoucher" :disabled="isValidating">
    {{ isValidating ? 'Checking...' : 'Apply' }}
  </button>
</div>
<div v-if="appliedVoucher" class="text-green-500">
  Diskon: {{ formatCurrency(appliedVoucher.discount) }}
  <button @click="removeVoucher">Hapus</button>
</div>
```

### 3. Price Summary Component (NEW)

```vue
<!-- In order.vue -->
<div class="glass-panel rounded-xl p-4 sticky top-20">
  <h3>Ringkasan Harga</h3>
  <div class="space-y-2">
    <div class="flex justify-between">
      <span>Subtotal</span>
      <span>{{ formatCurrency(calculation.subtotal) }}</span>
    </div>
    <div v-if="calculation.discount > 0" class="flex justify-between text-green-500">
      <span>Diskon</span>
      <span>-{{ formatCurrency(calculation.discount) }}</span>
    </div>
    <div class="flex justify-between">
      <span>DPP</span>
      <span>{{ formatCurrency(calculation.dpp) }}</span>
    </div>
    <div class="flex justify-between">
      <span>PPN (11%)</span>
      <span>{{ formatCurrency(calculation.ppn) }}</span>
    </div>
    <div class="border-t pt-2 flex justify-between font-bold">
      <span>Total</span>
      <span>{{ formatCurrency(calculation.grandTotal) }}</span>
    </div>
    <div v-if="calculation.depositPercentage > 0" class="text-sm text-muted-foreground">
      <div>DP ({{ calculation.depositPercentage }}%): {{ formatCurrency(calculation.deposit) }}</div>
      <div>Sisa: {{ formatCurrency(calculation.remaining) }}</div>
    </div>
    <div v-else class="text-sm text-primary">
      Bayar di Tempat
    </div>
  </div>
</div>
```

### 4. Urgency Selection (NEW)

```vue
<!-- In order.vue -->
<div class="grid grid-cols-3 gap-3">
  <button 
    v-for="opt in urgencyOptions" 
    :key="opt.value"
    @click="selectedUrgency = opt.value"
    :class="selectedUrgency === opt.value ? 'ring-2 ring-primary' : ''"
  >
    <span>{{ opt.label }}</span>
    <span v-if="opt.multiplier > 1" class="text-xs">+{{ (opt.multiplier - 1) * 100 }}%</span>
  </button>
</div>
```

## Data Models

### Order Attachments Table (EXISTING)

| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| order_id | uuid | FK to orders |
| bucket | text | Storage bucket name |
| path | text | File path in storage |
| filename | text | Original filename |
| content_type | text | MIME type |
| size | integer | File size in bytes |
| created_at | timestamp | Upload timestamp |

### File Upload Constraints

- Max file size: 10MB per file
- Max total files: 5 files
- Allowed types: image/*, application/pdf, .doc, .docx, .xls, .xlsx

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: PPN Calculation Consistency
*For any* order calculation with valid DPP, the PPN amount SHALL equal exactly 11% of DPP (rounded to nearest integer)
**Validates: Requirements 4.2**

### Property 2: Urgency Multiplier Application
*For any* urgency level, the subtotal SHALL equal base_price * urgency_multiplier where multipliers are: normal=1.0, express=1.25, priority=1.5
**Validates: Requirements 5.2**

### Property 3: Discount Cap
*For any* voucher discount applied, the discount amount SHALL NOT exceed the subtotal
**Validates: Requirements 3.3**

### Property 4: Deposit Percentage by Service Type
*For any* service type, the deposit percentage SHALL be 0% for service_device and 50% for all other service types
**Validates: Requirements 4.3, 4.4**

### Property 5: File Size Validation
*For any* uploaded file, the system SHALL reject files larger than 10MB
**Validates: Requirements 2.2**

## Error Handling

- File too large: Display "File terlalu besar (max 10MB)" error
- Invalid file type: Display "Tipe file tidak didukung" error
- Upload failure: Log error, allow retry, don't block order submission
- Voucher not found: Display "Voucher tidak ditemukan"
- Voucher expired: Display "Voucher sudah kadaluarsa"
- Voucher usage limit: Display "Voucher sudah habis digunakan"
- Voucher minimum spend: Display "Minimum pembelian Rp X"

## Testing Strategy

### Unit Tests
- Test file type validation
- Test file size validation
- Test voucher validation responses
- Test urgency multiplier calculation

### Property-Based Tests
- Use fast-check library
- Test PPN calculation across random DPP values
- Test urgency multiplier for all urgency levels
- Test discount never exceeds subtotal
- Test deposit percentage for all service types
