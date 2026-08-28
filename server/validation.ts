import fs from "node:fs";
import path from "node:path";
import type { Express } from "express";
import { RESUME_EXT, RESUME_MAX_BYTES, RESUME_MAX_FILES, RESUME_MIME } from "../shared/resume.js";

export type ApplicationInput = {
  name?: unknown;
  phone?: unknown;
  portfolio?: unknown;
  source?: unknown;
  resume?: Express.Multer.File | Express.Multer.File[];
};

export type ResumeFileRecord = {
  resumeOriginalName: string;
  resumeStoredName: string;
  resumeFilePath: string;
  resumeMimeType: string;
  resumeSize: number;
};

export type ValidApplication = {
  name: string;
  phone: string;
  portfolioUrl: string;
  source: "desktop" | "mobile";
  resumes: ResumeFileRecord[];
  resumeOriginalName: string;
  resumeStoredName: string;
  resumeFilePath: string;
  resumeMimeType: string;
  resumeSize: number;
};

function phoneDigits(value: string): string {
  let d = value.replace(/\D/g, "");
  if (!d) return "";
  if (d.startsWith("8")) d = `7${d.slice(1)}`;
  if (d.startsWith("9")) d = `7${d}`;
  if (!d.startsWith("7")) d = `7${d}`;
  return d.slice(0, 11);
}

function validateName(value: string): string | null {
  const t = value.trim();
  if (!t) return "Введите ваше имя";
  if (t.length < 2) return "Слишком короткое имя";
  if (!/^[a-zA-Zа-яА-ЯёЁ]+(?:[-\s'][a-zA-Zа-яА-ЯёЁ]+)*$/u.test(t)) {
    return "Имя содержит недопустимые символы";
  }
  return null;
}

function validatePhone(value: string): string | null {
  if (!value.trim()) return "Введите номер телефона";
  const d = phoneDigits(value);
  if (d.length < 11) return "Введите номер полностью";
  if (!/^79\d{9}$/.test(d)) return "Введите корректный мобильный номер";
  return null;
}

function normalizePortfolio(value: string): { url: string } | { error: string } {
  const t = value.trim();
  if (!t) return { error: "Вставьте ссылку на портфолио" };
  try {
    const url = new URL(/^https?:\/\//i.test(t) ? t : `https://${t}`);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return { error: "Введите корректную ссылку" };
    }
    if (!url.hostname.includes(".")) return { error: "Введите корректную ссылку" };
    return { url: url.toString() };
  } catch {
    return { error: "Введите корректную ссылку" };
  }
}

function validateResumeFile(file: Express.Multer.File): string | null {
  if (file.size > RESUME_MAX_BYTES) {
    return `«${file.originalname}» больше 10 МБ`;
  }

  const lowerName = file.originalname.toLowerCase();
  const hasAllowedExt = RESUME_EXT.some((ext) => lowerName.endsWith(ext));
  const hasAllowedMime = RESUME_MIME.has(file.mimetype);

  if (!hasAllowedExt && !hasAllowedMime) {
    return "Допустимые форматы: PDF, DOC, DOCX";
  }

  return null;
}

function normalizeResumeInput(
  resume: Express.Multer.File | Express.Multer.File[] | undefined,
): Express.Multer.File[] {
  if (!resume) return [];
  return Array.isArray(resume) ? resume : [resume];
}

function validateResumes(files: Express.Multer.File[]): string | null {
  if (files.length === 0) return "Прикрепите резюме";
  if (files.length > RESUME_MAX_FILES) {
    return `Можно прикрепить не больше ${RESUME_MAX_FILES} файлов`;
  }

  for (const file of files) {
    const error = validateResumeFile(file);
    if (error) return error;
  }

  return null;
}

function decodeUploadName(name: string): string {
  const restored = Buffer.from(name, "latin1").toString("utf8");
  const originalHasCyrillic = /[А-Яа-яЁё]/.test(name);
  const restoredHasCyrillic = /[А-Яа-яЁё]/.test(restored);
  if (!originalHasCyrillic && restoredHasCyrillic && !restored.includes("\uFFFD")) {
    return restored;
  }
  return name;
}

function toResumeRecord(file: Express.Multer.File): ResumeFileRecord {
  return {
    resumeOriginalName: decodeUploadName(file.originalname),
    resumeStoredName: path.basename(file.filename ?? file.originalname),
    resumeFilePath: file.path,
    resumeMimeType: file.mimetype,
    resumeSize: file.size,
  };
}

export function validateApplication(
  input: ApplicationInput,
): { data: ValidApplication } | { errors: string[] } {
  const errors: string[] = [];

  const name = typeof input.name === "string" ? input.name : "";
  const phone = typeof input.phone === "string" ? input.phone : "";
  const portfolio = typeof input.portfolio === "string" ? input.portfolio : "";
  const sourceRaw = typeof input.source === "string" ? input.source : "desktop";
  const source = sourceRaw === "mobile" ? "mobile" : "desktop";
  const resumeFiles = normalizeResumeInput(input.resume);

  const nameError = validateName(name);
  if (nameError) errors.push(nameError);

  const phoneError = validatePhone(phone);
  if (phoneError) errors.push(phoneError);

  const portfolioResult = normalizePortfolio(portfolio);
  let portfolioUrl = "";
  if ("error" in portfolioResult) {
    errors.push(portfolioResult.error);
  } else {
    portfolioUrl = portfolioResult.url;
  }

  const resumeError = validateResumes(resumeFiles);
  if (resumeError) errors.push(resumeError);

  if (errors.length > 0) return { errors };

  const resumes = resumeFiles.map(toResumeRecord);
  const first = resumes[0];
  const digits = phoneDigits(phone);

  return {
    data: {
      name: name.trim(),
      phone: `+${digits}`,
      portfolioUrl,
      source,
      resumes,
      resumeOriginalName: first.resumeOriginalName,
      resumeStoredName: first.resumeStoredName,
      resumeFilePath: first.resumeFilePath,
      resumeMimeType: first.resumeMimeType,
      resumeSize: first.resumeSize,
    },
  };
}

export function removeUploadedFile(filePath: string | undefined) {
  if (!filePath) return;
  fs.promises.unlink(filePath).catch(() => undefined);
}

export function removeUploadedFiles(files: Express.Multer.File[] | undefined) {
  files?.forEach((file) => removeUploadedFile(file.path));
}
