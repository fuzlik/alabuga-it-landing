import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { RESUME_EXT, RESUME_MAX_BYTES, RESUME_MAX_FILES, RESUME_MIME } from "../shared/resume.js";

const uploadDir = path.resolve("uploads", "resumes");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safeOriginal = file.originalname.replace(/[^a-zA-Z0-9._-]+/g, "_");
    cb(null, `${Date.now()}-${safeOriginal}`);
  },
});

export const resumeUpload = multer({
  storage,
  limits: { fileSize: RESUME_MAX_BYTES, files: RESUME_MAX_FILES },
  fileFilter: (_req, file, cb) => {
    const lowerName = file.originalname.toLowerCase();
    const hasAllowedExt = RESUME_EXT.some((ext) => lowerName.endsWith(ext));
    const hasAllowedMime = RESUME_MIME.has(file.mimetype);
    if (hasAllowedExt || hasAllowedMime) {
      cb(null, true);
      return;
    }
    cb(new Error("INVALID_RESUME_TYPE"));
  },
});
