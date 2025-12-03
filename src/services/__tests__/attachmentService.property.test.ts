/**
 * Property-Based Tests for Attachment Service
 * 
 * **Feature: supabase-sync, Property 5: Attachment Record Completeness**
 * **Validates: Requirements 5.2**
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  createAttachmentRecord,
  generateFilePath,
  validateFile,
  formatFileSize,
  getFileExtension,
} from '../attachmentService';

// Mock File class for testing
class MockFile {
  name: string;
  type: string;
  size: number;

  constructor(name: string, type: string, size: number) {
    this.name = name;
    this.type = type;
    this.size = size;
  }
}

// Arbitraries
const uuidArb = fc.uuid();
const filenameArb = fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0);
const mimeTypeArb = fc.constantFrom(
  'image/jpeg',
  'image/png',
  'application/pdf',
  'text/plain',
  'application/zip'
);
const fileSizeArb = fc.integer({ min: 1, max: 100_000_000 }); // Up to 100MB

describe('Attachment Service - Property Tests', () => {
  /**
   * **Feature: supabase-sync, Property 5: Attachment Record Completeness**
   * **Validates: Requirements 5.2**
   * 
   * For any uploaded file, the created attachment record SHALL contain:
   * - order_id matching the parent order
   * - bucket = 'orders'
   * - path containing the file location
   * - filename matching the original filename
   * - size > 0
   */
  describe('Property 5: Attachment Record Completeness', () => {
    it('should create record with matching order_id', () => {
      fc.assert(
        fc.property(
          uuidArb,
          filenameArb,
          mimeTypeArb,
          fileSizeArb,
          (orderId, filename, mimeType, size) => {
            const file = new MockFile(filename, mimeType, size) as unknown as File;
            const path = generateFilePath(orderId, filename);
            const record = createAttachmentRecord(orderId, file, path);

            expect(record.order_id).toBe(orderId);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should create record with default bucket "orders"', () => {
      fc.assert(
        fc.property(
          uuidArb,
          filenameArb,
          mimeTypeArb,
          fileSizeArb,
          (orderId, filename, mimeType, size) => {
            const file = new MockFile(filename, mimeType, size) as unknown as File;
            const path = generateFilePath(orderId, filename);
            const record = createAttachmentRecord(orderId, file, path);

            expect(record.bucket).toBe('orders');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should create record with non-empty path', () => {
      fc.assert(
        fc.property(
          uuidArb,
          filenameArb,
          mimeTypeArb,
          fileSizeArb,
          (orderId, filename, mimeType, size) => {
            const file = new MockFile(filename, mimeType, size) as unknown as File;
            const path = generateFilePath(orderId, filename);
            const record = createAttachmentRecord(orderId, file, path);

            expect(record.path).toBeTruthy();
            expect(record.path.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should create record with matching filename', () => {
      fc.assert(
        fc.property(
          uuidArb,
          filenameArb,
          mimeTypeArb,
          fileSizeArb,
          (orderId, filename, mimeType, size) => {
            const file = new MockFile(filename, mimeType, size) as unknown as File;
            const path = generateFilePath(orderId, filename);
            const record = createAttachmentRecord(orderId, file, path);

            expect(record.filename).toBe(filename);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should create record with correct size', () => {
      fc.assert(
        fc.property(
          uuidArb,
          filenameArb,
          mimeTypeArb,
          fileSizeArb,
          (orderId, filename, mimeType, size) => {
            const file = new MockFile(filename, mimeType, size) as unknown as File;
            const path = generateFilePath(orderId, filename);
            const record = createAttachmentRecord(orderId, file, path);

            expect(record.size).toBe(size);
            expect(record.size).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should create record with content_type from file', () => {
      fc.assert(
        fc.property(
          uuidArb,
          filenameArb,
          mimeTypeArb,
          fileSizeArb,
          (orderId, filename, mimeType, size) => {
            const file = new MockFile(filename, mimeType, size) as unknown as File;
            const path = generateFilePath(orderId, filename);
            const record = createAttachmentRecord(orderId, file, path);

            expect(record.content_type).toBe(mimeType);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should generate path containing order_id', () => {
      fc.assert(
        fc.property(
          uuidArb,
          filenameArb,
          (orderId, filename) => {
            const path = generateFilePath(orderId, filename);

            expect(path).toContain(orderId);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('File Validation', () => {
    it('should reject files larger than max size', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 11, max: 100 }), // Size in MB > 10
          (sizeMB) => {
            const sizeBytes = sizeMB * 1024 * 1024;
            const file = new MockFile('test.pdf', 'application/pdf', sizeBytes) as unknown as File;
            const result = validateFile(file, 10);

            expect(result.valid).toBe(false);
            expect(result.error).toContain('besar');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should accept files within size limit', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10 * 1024 * 1024 }), // Up to 10MB in bytes
          (sizeBytes) => {
            const file = new MockFile('test.pdf', 'application/pdf', sizeBytes) as unknown as File;
            const result = validateFile(file, 10);

            expect(result.valid).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject empty files', () => {
      const file = new MockFile('empty.txt', 'text/plain', 0) as unknown as File;
      const result = validateFile(file);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('kosong');
    });
  });

  describe('Utility Functions', () => {
    it('formatFileSize should return non-empty string for any positive size', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10_000_000_000 }),
          (bytes) => {
            const formatted = formatFileSize(bytes);

            expect(formatted).toBeTruthy();
            expect(formatted.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('getFileExtension should return lowercase extension', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('test.PDF', 'image.JPG', 'doc.DOCX', 'file.Txt'),
          (filename) => {
            const ext = getFileExtension(filename);

            expect(ext).toBe(ext.toLowerCase());
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
