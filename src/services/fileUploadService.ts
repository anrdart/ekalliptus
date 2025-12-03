import { supabase } from "@/config/supabase";

// File upload configuration
const UPLOAD_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB for images/pdf
  maxVideoSize: 100 * 1024 * 1024, // 100MB for videos
  targetVideoSize: 20 * 1024 * 1024, // Target 20MB after compression
  allowedMimeTypes: {
    image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'],
    pdf: ['application/pdf'],
    video: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska']
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

export interface VideoCompressionProgress {
  stage: 'loading' | 'compressing' | 'uploading';
  progress: number;
}

/**
 * Check if file is a video
 */
export const isVideoFile = (file: File): boolean => {
  return UPLOAD_CONFIG.allowedMimeTypes.video.includes(file.type);
};

/**
 * Compress video using canvas and MediaRecorder
 * This is a client-side compression that reduces quality/bitrate
 */
export const compressVideo = async (
  file: File,
  onProgress?: (progress: VideoCompressionProgress) => void
): Promise<File> => {
  // If video is already small enough, skip compression
  if (file.size <= UPLOAD_CONFIG.targetVideoSize) {
    return file;
  }

  onProgress?.({ stage: 'loading', progress: 0 });

  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;

    const videoUrl = URL.createObjectURL(file);
    video.src = videoUrl;

    video.onloadedmetadata = async () => {
      try {
        // Calculate target dimensions (max 720p for compression)
        const maxHeight = 720;
        let width = video.videoWidth;
        let height = video.videoHeight;

        if (height > maxHeight) {
          const ratio = maxHeight / height;
          height = maxHeight;
          width = Math.round(video.videoWidth * ratio);
        }

        // Ensure even dimensions for video encoding
        width = Math.round(width / 2) * 2;
        height = Math.round(height / 2) * 2;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;

        // Calculate target bitrate based on file size
        const duration = video.duration;
        const targetBitrate = Math.min(
          (UPLOAD_CONFIG.targetVideoSize * 8) / duration, // bits per second
          2_000_000 // Max 2 Mbps
        );

        // Use MediaRecorder for compression
        const stream = canvas.captureStream(30);
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'video/webm;codecs=vp9',
          videoBitsPerSecond: targetBitrate
        });

        const chunks: Blob[] = [];
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };

        mediaRecorder.onstop = () => {
          URL.revokeObjectURL(videoUrl);
          const compressedBlob = new Blob(chunks, { type: 'video/webm' });
          const compressedFile = new File(
            [compressedBlob],
            file.name.replace(/\.[^.]+$/, '.webm'),
            { type: 'video/webm' }
          );
          onProgress?.({ stage: 'compressing', progress: 100 });
          resolve(compressedFile);
        };

        mediaRecorder.onerror = () => {
          URL.revokeObjectURL(videoUrl);
          // If compression fails, return original file
          resolve(file);
        };

        mediaRecorder.start();
        video.currentTime = 0;

        const drawFrame = () => {
          if (video.ended || video.paused) {
            mediaRecorder.stop();
            return;
          }
          ctx.drawImage(video, 0, 0, width, height);
          const progress = (video.currentTime / duration) * 100;
          onProgress?.({ stage: 'compressing', progress: Math.round(progress) });
          requestAnimationFrame(drawFrame);
        };

        video.onended = () => mediaRecorder.stop();
        video.play().then(drawFrame).catch(() => {
          URL.revokeObjectURL(videoUrl);
          resolve(file); // Fallback to original if autoplay blocked
        });

      } catch (error) {
        URL.revokeObjectURL(videoUrl);
        resolve(file); // Fallback to original on error
      }
    };

    video.onerror = () => {
      URL.revokeObjectURL(videoUrl);
      reject(new Error('Failed to load video'));
    };
  });
};

/**
 * Get video thumbnail
 */
export const getVideoThumbnail = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;

    const videoUrl = URL.createObjectURL(file);
    video.src = videoUrl;

    video.onloadeddata = () => {
      video.currentTime = Math.min(1, video.duration / 2); // Seek to 1s or middle
    };

    video.onseeked = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(video, 0, 0);
      const thumbnail = canvas.toDataURL('image/jpeg', 0.7);
      URL.revokeObjectURL(videoUrl);
      resolve(thumbnail);
    };

    video.onerror = () => {
      URL.revokeObjectURL(videoUrl);
      resolve(''); // Return empty on error
    };
  });
};

/**
 * Upload a file to Supabase Storage
 */
export const uploadFile = async (
  file: File,
  onProgress?: (progress: VideoCompressionProgress) => void
): Promise<UploadResponse> => {
  try {
    // Validate file type
    const allowedTypes = [
      ...UPLOAD_CONFIG.allowedMimeTypes.image,
      ...UPLOAD_CONFIG.allowedMimeTypes.pdf,
      ...UPLOAD_CONFIG.allowedMimeTypes.video
    ];

    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: "File type not supported. Please upload JPG, PNG, WebP, GIF, SVG, PDF, or video files (MP4, WebM, MOV)."
      };
    }

    // Validate file size based on type
    const isVideo = isVideoFile(file);
    const maxSize = isVideo ? UPLOAD_CONFIG.maxVideoSize : UPLOAD_CONFIG.maxFileSize;

    if (file.size > maxSize) {
      const maxSizeMB = maxSize / 1024 / 1024;
      return {
        success: false,
        error: `File size exceeds maximum limit of ${maxSizeMB}MB.`
      };
    }

    // Compress video if needed
    let fileToUpload = file;
    if (isVideo && file.size > UPLOAD_CONFIG.targetVideoSize) {
      try {
        fileToUpload = await compressVideo(file, onProgress);
      } catch {
        // Continue with original file if compression fails
        fileToUpload = file;
      }
    }

    onProgress?.({ stage: 'uploading', progress: 0 });

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const fileExtension = fileToUpload.name.split(".").pop();
    const fileName = `${UPLOAD_CONFIG.folder}/${timestamp}-${randomStr}.${fileExtension}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(UPLOAD_CONFIG.bucket)
      .upload(fileName, fileToUpload, {
        cacheControl: '3600',
        upsert: false
      });

    onProgress?.({ stage: 'uploading', progress: 100 });

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
    case "mp4":
    case "webm":
    case "mov":
    case "avi":
    case "mkv":
      return "🎬";
    default:
      return "📎";
  }
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};
