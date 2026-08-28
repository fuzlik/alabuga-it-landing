export const RESUME_MAX_BYTES = 10 * 1024 * 1024;
export const RESUME_MAX_FILES = 5;
export const RESUME_EXT = [".pdf", ".doc", ".docx"] as const;
export const RESUME_MIME = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
