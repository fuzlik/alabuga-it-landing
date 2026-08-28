/** Russian mobile phone: +7 (9XX) XXX-XX-XX */

import { RESUME_EXT, RESUME_MAX_BYTES, RESUME_MAX_FILES, RESUME_MIME } from "../../shared/resume";

export function phoneDigits(value: string): string {
  let d = value.replace(/\D/g, "");
  if (!d) return "";
  if (d.startsWith("8")) d = `7${d.slice(1)}`;
  if (d.startsWith("9")) d = `7${d}`;
  if (!d.startsWith("7")) d = `7${d}`;
  return d.slice(0, 11);
}

/** Format digit string (7XXXXXXXXXX) as +7 (XXX) XXX-XX-XX. Empty → "". */
export function formatPhoneDigits(d: string): string {
  if (!d) return "";

  const local = d.startsWith("7") ? d.slice(1) : d;
  if (!local) return "";

  if (local.length <= 3) {
    return `+7 (${local}`;
  }

  let out = `+7 (${local.slice(0, 3)}) ${local.slice(3, 6)}`;
  if (local.length <= 6) return out;

  out += `-${local.slice(6, 8)}`;
  if (local.length <= 8) return out;

  return `${out}-${local.slice(8, 10)}`;
}

/** @deprecated use formatPhoneDigits */
export function formatPhoneInput(value: string): string {
  return formatPhoneDigits(normalizePhoneDigits(value));
}

function normalizePhoneDigits(raw: string): string {
  let d = raw.replace(/\D/g, "");
  if (!d) return "";
  if (d.startsWith("8")) d = `7${d.slice(1)}`;
  else if (d.startsWith("9")) d = `7${d}`;
  else if (!d.startsWith("7")) d = `7${d}`;
  return d.slice(0, 11);
}

/** Update stored phone digits from controlled input, handling deletions correctly. */
export function applyPhoneInputChange(prevDigits: string, inputValue: string): string {
  const incoming = inputValue.replace(/\D/g, "").slice(0, 11);
  if (!incoming) return "";

  const prevFormatted = formatPhoneDigits(prevDigits);

  // Удалили символ маски (скобку, пробел, дефис) — убираем последнюю цифру
  if (incoming.length === prevDigits.length && inputValue.length < prevFormatted.length) {
    const next = prevDigits.slice(0, -1);
    if (!next || next === "7") return "";
    return next;
  }

  if (incoming.length < prevDigits.length) {
    if (incoming === "7" || incoming === "8") return "";
    if (prevDigits.startsWith("7") && incoming === prevDigits.slice(1)) return "";
    if (incoming.startsWith("7")) return incoming;
    if (incoming.startsWith("8")) return `7${incoming.slice(1)}`.slice(0, 11);

    const local = prevDigits.startsWith("7") ? prevDigits.slice(1) : prevDigits;
    if (local.startsWith(incoming)) return `7${incoming}`.slice(0, 11);

    return "";
  }

  return normalizePhoneDigits(incoming);
}

export function validatePhone(value: string): string | null {
  if (!value.trim()) return "Введите номер телефона";
  const d = phoneDigits(value);
  if (d.length < 11) return "Введите номер полностью";
  if (!/^79\d{9}$/.test(d)) return "Введите корректный мобильный номер";
  return null;
}

export function validateName(value: string): string | null {
  const t = value.trim();
  if (!t) return "Введите ваше имя";
  if (t.length < 2) return "Слишком короткое имя";
  if (!/^[a-zA-Zа-яА-ЯёЁ]+(?:[-\s'][a-zA-Zа-яА-ЯёЁ]+)*$/u.test(t)) {
    return "Имя содержит недопустимые символы";
  }
  return null;
}

export function validatePortfolio(value: string): string | null {
  const t = value.trim();
  if (!t) return "Вставьте ссылку на портфолио";
  try {
    const url = new URL(/^https?:\/\//i.test(t) ? t : `https://${t}`);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return "Введите корректную ссылку";
    }
    if (!url.hostname.includes(".")) return "Введите корректную ссылку";
    return null;
  } catch {
    return "Введите корректную ссылку";
  }
}

export function validateResumeFile(file: File | null): string | null {
  return validateResumeFiles(file ? [file] : []);
}

export function validateResumeFiles(files: File[]): string | null {
  if (files.length === 0) return "Прикрепите резюме";
  if (files.length > RESUME_MAX_FILES) {
    return `Можно прикрепить не больше ${RESUME_MAX_FILES} файлов`;
  }

  for (const file of files) {
    if (file.size > RESUME_MAX_BYTES) {
      return `«${file.name}» больше 10 МБ`;
    }

    const lowerName = file.name.toLowerCase();
    const hasAllowedExt = RESUME_EXT.some((ext) => lowerName.endsWith(ext));
    const hasAllowedMime = RESUME_MIME.has(file.type);

    if (!hasAllowedExt && !hasAllowedMime) {
      return "Допустимые форматы: PDF, DOC, DOCX";
    }
  }

  return null;
}
