# Implementation Plan

## COMPLETED TASKS (Foundation)

- [x] 1. TypeScript Types & Supabase Client (DONE)
  - [x] 1.1 types/database.types.ts created with all table types
  - [x] 1.2 composables/useSupabase.ts with typed client
  - [x] 1.3 composables/useOrderCalculation.ts with pricing logic
  - [x] 1.4 Order form submission working with Supabase

## NEW TASKS (Feature Additions)

- [x] 2. Add File Attachments Feature






  - [x] 2.1 Create FileUpload component


    - Create components/FileUpload.vue
    - Implement drag-and-drop zone with visual feedback
    - Add file input for click-to-browse
    - Display file previews (images) and file info (non-images)
    - Add remove button for each file
    - _Requirements: 2.1, 2.3_


  - [x] 2.2 Implement file validation

    - Validate file size (max 10MB per file)
    - Validate file type (images, PDFs, documents)
    - Limit total files to 5
    - Display validation errors
    - _Requirements: 2.2_

  - [ ]* 2.3 Write property test for file size validation
    - **Property 5: File Size Validation**
    - **Validates: Requirements 2.2**

  - [x] 2.4 Integrate FileUpload into order.vue


    - Add Step 5: File Attachments section after Project Details
    - Bind files array to form state
    - Preserve existing form sections (DO NOT MODIFY Steps 1-4)
    - _Requirements: 2.1_

  - [x] 2.5 Implement file upload on submit


    - Upload files to Supabase Storage 'orders' bucket
    - Save attachment metadata to order_attachments table
    - Handle upload errors gracefully (don't block order)
    - _Requirements: 2.4, 2.5_

- [x] 3. Add Urgency Selection Feature






  - [x] 3.1 Add urgency selection UI to order.vue


    - Add Step 6: Urgency Selection section
    - Display 3 options: Normal, Express (+25%), Priority (+50%)
    - Style as selectable cards with price indicator
    - _Requirements: 5.1_


  - [x] 3.2 Connect urgency to price calculation

    - Update calculateOrder call with selected urgency
    - Recalculate on urgency change
    - _Requirements: 5.2, 5.3_

  - [ ]* 3.3 Write property test for urgency multiplier
    - **Property 2: Urgency Multiplier Application**
    - **Validates: Requirements 5.2**

- [x] 4. Add Voucher Code Feature










  - [x] 4.1 Add voucher input UI to order.vue

    - Add Step 7: Voucher Code section
    - Input field with Apply button
    - Loading state during validation
    - _Requirements: 3.1_


  - [x] 4.2 Implement voucher validation

    - Call validateVoucher from useVoucherService
    - Display success with discount amount
    - Display error messages for invalid vouchers
    - Add remove voucher button
    - _Requirements: 3.2, 3.3, 3.4, 3.5_

  - [ ]* 4.3 Write property test for discount cap
    - **Property 3: Discount Cap**
    - **Validates: Requirements 3.3**


  - [x] 4.4 Connect voucher to price calculation

    - Pass voucher discount to calculateOrder
    - Update price summary on voucher apply/remove
    - Save voucher_code to order on submit
    - _Requirements: 3.3, 6.3_

- [x] 5. Add Price Summary Panel







  - [x] 5.1 Create price summary UI

    - Add sticky price summary panel on right side (desktop)
    - Show: Subtotal, Discount, DPP, PPN (11%), Grand Total
    - Show deposit info for online services
    - Show "Bayar di Tempat" for service_device
    - _Requirements: 4.1, 4.2, 4.3, 4.4_


  - [x] 5.2 Make price summary reactive

    - Update on service selection change
    - Update on urgency change
    - Update on voucher apply/remove
    - _Requirements: 4.5_

  - [ ]* 5.3 Write property test for deposit percentage
    - **Property 4: Deposit Percentage by Service Type**
    - **Validates: Requirements 4.3, 4.4**

- [x] 6. Add i18n Translations for New Features







  - [x] 6.1 Add translation keys for attachments

    - order.attachments.title, order.attachments.dragDrop, etc.
    - Add to all 7 locale files
    - _Requirements: 2.1_


  - [x] 6.2 Add translation keys for urgency
    - order.urgency.title, order.urgency.normal, etc.
    - Add to all 7 locale files
    - _Requirements: 5.1_


  - [x] 6.3 Add translation keys for voucher
    - order.voucher.title, order.voucher.apply, etc.
    - Add to all 7 locale files

    - _Requirements: 3.1_

  - [x] 6.4 Add translation keys for price summary
    - order.summary.subtotal, order.summary.discount, etc.
    - Add to all 7 locale files
    - _Requirements: 4.1_

- [x] 7. Final Checkpoint






  - Ensure all tests pass, ask the user if questions arise.
  - Test complete order flow with attachments, voucher, and urgency
  - Verify order appears correctly in admin dashboard
