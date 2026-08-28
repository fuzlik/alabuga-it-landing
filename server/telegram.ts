import fs from "node:fs";
import { File } from "node:buffer";
import type { ValidApplication } from "./validation.js";

export function isTelegramConfigured(): boolean {
  return Boolean(process.env.TELEGRAM_BOT_URL?.trim());
}

export async function sendApplicationToTelegram(
  data: ValidApplication,
  applicationId: number,
): Promise<{ id: number } | null> {
  const url = process.env.TELEGRAM_BOT_URL?.trim();
  if (!url) return null;

  const form = new FormData();
  form.append("name", data.name);
  form.append("phone", data.phone);
  form.append("portfolio", data.portfolioUrl);
  form.append("source", data.source);
    form.append("application_id", String(applicationId));

  for (const resume of data.resumes) {
    form.append("resume_original_name", resume.resumeOriginalName);
    const buf = fs.readFileSync(resume.resumeFilePath);
    form.append(
      "resume",
      new File([buf], resume.resumeOriginalName, {
        type: resume.resumeMimeType || "application/octet-stream",
      }),
    );
  }

  const headers: HeadersInit = {};
  const apiKey = process.env.TELEGRAM_BOT_API_KEY?.trim();
  if (apiKey) {
    headers["X-Api-Key"] = apiKey;
  }

  const res = await fetch(url, { method: "POST", body: form, headers });
  const payload = (await res.json().catch(() => ({}))) as { id?: number; error?: string };

  if (!res.ok) {
    throw new Error(`Telegram bot ${res.status}: ${payload.error ?? "request failed"}`);
  }

  return { id: payload.id ?? applicationId };
}
