# Requirements Document

## Introduction

Menambahkan fitur-fitur baru ke order form customer website untuk sinkronisasi dengan database Supabase dan admin dashboard. Fitur yang sudah ada (service selection, customer details, service-specific fields, project details) HARUS dipertahankan. Fokus pada penambahan fitur: file attachments, voucher code input, price summary display, dan urgency selection.

## Glossary

- **Supabase**: Backend-as-a-Service yang menyediakan PostgreSQL database, authentication, dan storage
- **Supabase Storage**: Object storage untuk menyimpan file attachments
- **Attachment**: File yang dilampirkan customer (gambar referensi, dokumen brief, dll)
- **Voucher**: Kode diskon yang bisa digunakan customer
- **PPN**: Pajak Pertambahan Nilai (11%)
- **DPP**: Dasar Pengenaan Pajak (tax base)
- **Service Type**: Jenis layanan (website, wordpress, mobile, editing, service_device)
- **Urgency**: Tingkat urgensi (normal, express, priority)

## Requirements

### Requirement 1 (EXISTING - DO NOT MODIFY)

**User Story:** As a customer, I want to select a service and fill in my details, so that I can submit an order request.

#### Acceptance Criteria

1. WHEN a customer visits the order page THEN the system SHALL display service selection cards with icons, titles, descriptions, and starting prices
2. WHEN a customer selects a service THEN the system SHALL display service-specific detail fields dynamically
3. WHEN a customer fills customer details THEN the system SHALL capture name, email, phone, and optional company
4. WHEN a customer fills project details THEN the system SHALL capture project name, description, budget, and timeline

### Requirement 2 (NEW)

**User Story:** As a customer, I want to upload reference files with my order, so that the team can better understand my requirements.

#### Acceptance Criteria

1. WHEN a customer wants to attach files THEN the system SHALL display a drag-and-drop file upload area
2. WHEN a customer drops or selects files THEN the system SHALL validate file type (images, PDFs, documents) and size (max 10MB per file)
3. WHEN files are selected THEN the system SHALL display file previews with remove option
4. WHEN order is submitted with attachments THEN the system SHALL upload files to Supabase Storage bucket 'orders'
5. WHEN files are uploaded THEN the system SHALL save attachment metadata to order_attachments table

### Requirement 3 (NEW)

**User Story:** As a customer, I want to apply a voucher code, so that I can get a discount on my order.

#### Acceptance Criteria

1. WHEN a customer has a voucher code THEN the system SHALL display a voucher input field
2. WHEN a customer enters a voucher code and clicks apply THEN the system SHALL validate the voucher against Supabase
3. WHEN voucher is valid THEN the system SHALL display the discount amount and update price summary
4. WHEN voucher is invalid THEN the system SHALL display appropriate error message (not found, expired, usage limit, minimum spend)
5. WHEN voucher is applied THEN the system SHALL allow customer to remove the voucher

### Requirement 4 (NEW)

**User Story:** As a customer, I want to see a price summary before submitting, so that I understand the total cost.

#### Acceptance Criteria

1. WHEN a customer selects a service THEN the system SHALL display a price summary section
2. WHEN price summary is displayed THEN the system SHALL show subtotal, discount (if voucher applied), DPP, PPN (11%), and grand total
3. WHEN service type is online THEN the system SHALL show deposit amount (50%) and remaining balance
4. WHEN service type is service_device THEN the system SHALL show "Bayar di Tempat" (pay on site) indicator
5. WHEN urgency is changed THEN the system SHALL recalculate and update price summary

### Requirement 5 (NEW)

**User Story:** As a customer, I want to select urgency level, so that I can get faster service if needed.

#### Acceptance Criteria

1. WHEN a customer views the order form THEN the system SHALL display urgency selection (Normal, Express +25%, Priority +50%)
2. WHEN a customer selects urgency THEN the system SHALL apply the multiplier to the base price
3. WHEN urgency is changed THEN the system SHALL update the price summary immediately

### Requirement 6 (EXISTING - ENHANCED)

**User Story:** As a customer, I want to submit my order with all details and attachments, so that the admin team can process it.

#### Acceptance Criteria

1. WHEN a customer submits an order THEN the system SHALL save order data to Supabase orders table
2. WHEN order has attachments THEN the system SHALL upload files and save metadata to order_attachments table
3. WHEN order has voucher THEN the system SHALL save voucher_code to order record
4. WHEN order is saved successfully THEN the system SHALL redirect to order-success page with order ID
5. WHEN order save fails THEN the system SHALL display error message and allow retry
