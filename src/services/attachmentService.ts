/**
 * Attachment Service
 * Handles file uploads to Supabase Storage
 * 
 * **Feature: supabase-sync**
 * **Validates: Requirements 5.1, 5.2**
 */

import type { OrderAttachmentInsert } from '@/lib/database.types';

const DEFAULT_BUCKET = 'orders';

export interface UploadedFile {
  file: File;
  path: string;
}

export interface AttachmentRecord {
  order_id: string;
  bucket: string;
  path: string;
  filename: string;
  content_type: string | null;
  size: number;
}

/**
 * Generate a unique file path for storage
 */
export function generateFilePath(orderId: string, filename: string): string {
  const timestamp = Date.now();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `${orderId}/${timestamp}_${sanitizedFilename}`;
}

/**
 * Create attachment record for database insertion
 * 
 * @param orderId - Order UUID
 * @param file - Uploaded file
 * @param path - Storage path
 * @param bucket - Storage bucket name
 * @returns Attachment record ready for insertion
 */
export function createAttachmentRecord(
  orderId: string,
  file: File,
  path: string,
  bucket: string = DEFAULT_BUCKET
): AttachmentRecord {
  return {
    order_id: orderId,
    bucket,
    path,
    filename: file.name,
    content_type: file.type || null,
    size: file.size,
  };
}

/**
 * Validate file before upload
 * 
 * @param file - File to validate
 * @param maxSizeMB - Maximum file size in MB
 * @param allowedTypes - Allowed MIME types (empty = all allowed)
 * @returns Validation result
 */
export function validateFile(
  file: File,
  maxSizeMB: number = 10,
  allowedTypes: string[] = []
): { valid: boolean; error?: string } {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (file.size > maxSizeBytes) {
    return { valid: false, error: `File terlalu besar. Maksimal ${maxSizeMB}MB` };
  }

  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Tipe file tidak diizinkan' };
  }

  if (file.size === 0) {
    return { valid: false, error: 'File kosong' };
  }

  return { valid: true };
}

/**
 * Prepare multiple files for upload
 * 
 * @param orderId - Order UUID
 * @param files - Array of files to upload
 * @returns Array of prepared upload data
 */
export function prepareFilesForUpload(
  orderId: string,
  files: File[]
): { file: File; path: string; record: AttachmentRecord }[] {
  return files.map(file => {
    const path = generateFilePath(orderId, file.name);
    const record = createAttachmentRecord(orderId, file, path);
    return { file, path, record };
  });
}

/**
 * Get public URL for an attachment
 * 
 * @param bucket - Storage bucket
 * @param path - File path in bucket
 * @param supabaseUrl - Supabase project URL
 * @returns Public URL
 */
export function getAttachmentUrl(
  bucket: string,
  path: string,
  supabaseUrl: string
): string {
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}

/**
 * Format file size for display
 * 
 * @param bytes - File size in bytes
 * @returns Formatted size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const units = ['B', 'KB', 'MB', 'GB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${units[i]}`;
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()?.toLowerCase() || '' : '';
}

/**
 * Check if file is an image
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

/**
 * Common allowed file types for order attachments
 */
export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip',
  'application/x-rar-compressed',
];
