import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { uploadFile, deleteFile, isImageFile, isPDFFile, getFileIcon } from "@/services/fileUploadService";
import { useTranslation } from "react-i18next";

interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
  url?: string;
  uploading: boolean;
  progress: number;
  error?: string;
}

interface FileUploadProps {
  onFilesUploaded?: (files: { key: string; url: string; name: string }[]) => void;
  maxFiles?: number;
  maxSize?: number;
  className?: string;
}

export default function FileUpload({
  onFilesUploaded,
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
  className = ""
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const { t } = useTranslation();
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const currentFilesCount = uploadedFiles.length;
    const remainingSlots = maxFiles - currentFilesCount;

    if (acceptedFiles.length > remainingSlots) {
      toast({
        title: "Too many files",
        description: `You can only upload ${maxFiles} files maximum`,
        variant: "destructive"
      });
      return;
    }

    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: isImageFile(file) ? URL.createObjectURL(file) : undefined,
      uploading: true,
      progress: 0
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);

    // Upload files sequentially
    const uploadResults: { key: string; url: string; name: string }[] = [];

    for (const newFile of newFiles) {
      try {
        const result = await uploadFile(newFile.file);

        setUploadedFiles(prev =>
          prev.map(f =>
            f.id === newFile.id
              ? {
                  ...f,
                  uploading: false,
                  progress: 100,
                  url: result.success ? result.url : undefined,
                  error: result.success ? undefined : result.error
                }
              : f
          )
        );

        if (!result.success) {
          toast({
            title: "Upload failed",
            description: result.error,
            variant: "destructive"
          });
        } else if (result.url && result.key) {
          uploadResults.push({
            key: result.key,
            url: result.url,
            name: newFile.file.name
          });
        }
      } catch (error) {
        setUploadedFiles(prev =>
          prev.map(f =>
            f.id === newFile.id
              ? { ...f, uploading: false, error: "Upload failed" }
              : f
          )
        );
      }
    }

    // Notify parent component with successfully uploaded files
    if (uploadResults.length > 0 && onFilesUploaded) {
      // Merge with existing uploaded files
      const allUploadedFiles = [...(uploadedFiles.filter(f => f.url).map(f => ({
        key: f.id,
        url: f.url!,
        name: f.file.name
      }))), ...uploadResults];
      onFilesUploaded(allUploadedFiles);
    }
  }, [uploadedFiles, maxFiles, onFilesUploaded, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"],
      "application/pdf": [".pdf"]
    },
    maxSize,
    maxFiles
  });

  const removeFile = async (id: string) => {
    const file = uploadedFiles.find(f => f.id === id);
    if (file?.url) {
      // Extract key from URL (assuming URL format: https://domain/key)
      const key = file.url.split("/").pop();
      if (key) {
        await deleteFile(key);
      }
    }

    setUploadedFiles(prev => {
      const updated = prev.filter(f => f.id !== id);
      // Revoke preview URL to free memory
      const removedFile = prev.find(f => f.id === id);
      if (removedFile?.preview) {
        URL.revokeObjectURL(removedFile.preview);
      }
      return updated;
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50"
          }
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <svg
            className="w-12 h-12 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <div className="text-sm text-muted-foreground">
            {isDragActive ? (
              <p>Drop files here...</p>
            ) : (
              <>
                <p>{t("order.fields.attachment.uploadText")}</p>
                <p className="text-xs mt-1">
                  {t("order.fields.attachment.fileTypes")} (Max: {maxSize / 1024 / 1024}MB)
                </p>
              </>
            )}
          </div>
          {!isDragActive && (
            <Button type="button" variant="outline" size="sm" className="mt-2">
              {t("order.fields.attachment.choose")}
            </Button>
          )}
        </div>
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">{t("order.fields.attachment.selected")}</h4>
          <div className="space-y-2">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 p-3 border rounded-lg bg-card"
              >
                {/* File Preview or Icon */}
                <div className="flex-shrink-0 w-12 h-12 rounded overflow-hidden bg-muted flex items-center justify-center">
                  {file.preview ? (
                    <img
                      src={file.preview}
                      alt={file.file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl">{getFileIcon(file.file.name)}</span>
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>

                  {/* Upload Progress */}
                  {file.uploading && (
                    <Progress value={file.progress} className="mt-2 h-1" />
                  )}

                  {/* Error Message */}
                  {file.error && (
                    <p className="text-xs text-destructive mt-1">{file.error}</p>
                  )}

                  {/* Success Message */}
                  {file.url && !file.uploading && !file.error && (
                    <p className="text-xs text-green-600 mt-1">
                      {t("order.fields.attachment.uploaded")}
                    </p>
                  )}
                </div>

                {/* Remove Button */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(file.id)}
                  disabled={file.uploading}
                  className="flex-shrink-0"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
