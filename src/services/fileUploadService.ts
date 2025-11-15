import { supabase } from "@/config/supabase";

// File upload configuration
const UPLOAD_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: {
    image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'],
    pdf: ['application/pdf']
  },
  bucket: 'attachments',
  folder: 'order-attachments'
};

export interface UploadResponse {
  success: boolean;
  key?: string;
  url?: string;
  error?: string;
}

/**
 * Upload a file to Supabase Storage
 */
export const uploadFile = async (file: File): Promise<UploadResponse> => {
  try {
    // Validate file type
    const allowedTypes = [
      ...UPLOAD_CONFIG.allowedMimeTypes.image,
      ...UPLOAD_CONFIG.allowedMimeTypes.pdf
    ];

    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: "File type not supported. Please upload JPG, PNG, WebP, GIF, SVG, or PDF files."
      };
    }

    // Validate file size
    if (file.size > UPLOAD_CONFIG.maxFileSize) {
      const maxSizeMB = UPLOAD_CONFIG.maxFileSize / 1024 / 1024;
      return {
        success: false,
        error: `File size exceeds maximum limit of ${maxSizeMB}MB.`
      };
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const fileExtension = file.name.split(".").pop();
    const fileName = `${UPLOAD_CONFIG.folder}/${timestamp}-${randomStr}.${fileExtension}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(UPLOAD_CONFIG.bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error("Supabase upload error:", error);
      return {
        success: false,
        error: `Upload failed: ${error.message}`
      };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(UPLOAD_CONFIG.bucket)
      .getPublicUrl(fileName);

    return {
      success: true,
      key: data.path,
      url: publicUrl
    };
  } catch (error) {
    console.error("Upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed"
    };
  }
};

/**
 * Upload multiple files to Supabase Storage
 */
export const uploadMultipleFiles = async (files: File[]): Promise<UploadResponse[]> => {
  const uploadPromises = files.map(file => uploadFile(file));
  return await Promise.all(uploadPromises);
};

/**
 * Delete a file from Supabase Storage
 */
export const deleteFile = async (key: string): Promise<boolean> => {
  try {
    const { error } = await supabase.storage
      .from(UPLOAD_CONFIG.bucket)
      .remove([key]);

    if (error) {
      console.error("Delete error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Delete error:", error);
    return false;
  }
};

/**
 * Check if file is an image
 */
export const isImageFile = (file: File): boolean => {
  return UPLOAD_CONFIG.allowedMimeTypes.image.includes(file.type);
};

/**
 * Check if file is a PDF
 */
export const isPDFFile = (file: File): boolean => {
  return UPLOAD_CONFIG.allowedMimeTypes.pdf.includes(file.type);
};

/**
 * Get icon emoji for file type
 */
export const getFileIcon = (fileName: string): string => {
  const ext = fileName.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "pdf":
      return "📄";
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "webp":
    case "svg":
      return "🖼️";
    default:
      return "📎";
  }
};
