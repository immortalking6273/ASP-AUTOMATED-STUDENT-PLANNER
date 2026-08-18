export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

export const ALLOWED_EXTENSIONS = [
  ".pdf",
  ".docx",
  ".doc",
  ".pptx",
  ".ppt",
  ".txt",
  ".md",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
];

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateDocumentFile(file: File): FileValidationResult {
  if (!file) {
    return { isValid: false, error: "No file selected." };
  }

  // Size validation
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      isValid: false,
      error: `File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds maximum limit of 50MB.`,
    };
  }

  // Extension validation
  const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return {
      isValid: false,
      error: `Unsupported file type (${ext}). Allowed: PDF, Word, PowerPoint, Text, Markdown, Images.`,
    };
  }

  return { isValid: true };
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}
