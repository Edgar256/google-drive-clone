import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-hot-toast";

interface UploadedFile {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  createdAt: string;
}

interface UseFileUploadProps {
  onUploadComplete: (file: UploadedFile) => void;
  onError: (error: Error) => void;
  maxSize?: number; // in bytes
  acceptedFileTypes?: string[];
}

export const useFileUpload = ({ onUploadComplete, onError, maxSize = 10 * 1024 * 1024, acceptedFileTypes = ["image/*", "application/pdf", "text/*"] }: UseFileUploadProps) => {
  const onDrop = useCallback(async (acceptedFiles: globalThis.File[]) => {
    try {
      for (const file of acceptedFiles) {
        if (file.size > maxSize) {
          toast.error(`File ${file.name} is too large`);
          continue;
        }

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to upload file");
        }

        const uploadedFile = await response.json();
        onUploadComplete(uploadedFile);
        toast.success(`File ${file.name} uploaded successfully`);
      }
    } catch (error) {
      onError(error instanceof Error ? error : new Error("Failed to upload file"));
      toast.error("Failed to upload file");
    }
  }, [onUploadComplete, onError, maxSize]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize,
    accept: acceptedFileTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
  });

  return {
    getRootProps,
    getInputProps,
    isDragActive,
  };
}; 