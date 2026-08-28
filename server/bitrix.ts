import fs from "node:fs";
import type { ValidApplication } from "./validation.js";

type BitrixResponse<T> = {
  result?: T;
  error?: string;
  error_description?: string;
};

export type BitrixSyncResult = {
  leadId: number;
  resumeAttached: boolean;
};

function normalizeWebhookUrl(raw: string | undefined): string | null {
  const value = raw?.trim();
  if (!value) return null;
  return value.endsWith("/") ? value : `${value}/`;
}

export function isBitrixConfigured(): boolean {
  return normalizeWebhookUrl(process.env.BITRIX24_WEBHOOK_URL) !== null;
}

function getWebhookUrl(): string {
  const url = normalizeWebhookUrl(process.env.BITRIX24_WEBHOOK_URL);
  if (!url) {
    throw new Error("BITRIX24_WEBHOOK_URL is not set");
  }
  return url;
}

async function bitrixCall<T>(method: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${getWebhookUrl()}${method}.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = (await res.json().catch(() => ({}))) as BitrixResponse<T>;

  if (!res.ok || data.error) {
    const details = data.error_description ?? data.error ?? `HTTP ${res.status}`;
    throw new Error(`Bitrix ${method}: ${details}`);
  }

  if (data.result === undefined) {
    throw new Error(`Bitrix ${method}: empty response`);
  }

  return data.result;
}

function buildComments(data: ValidApplication, applicationId: number): string {
  const lines = [
    "Заявка с лендинга «Алабуга IT»",
    "",
    `Портфолио: ${data.portfolioUrl}`,
    `Источник формы: ${data.source}`,
    `ID заявки в базе: ${applicationId}`,
  ];

  if (data.resumes.length > 0) {
    lines.push(`Файлы: ${data.resumes.map((file) => file.resumeOriginalName).join(", ")}`);
  } else if (data.resumeOriginalName) {
    lines.push(`Резюме: ${data.resumeOriginalName}`);
  }

  return lines.join("\n");
}

function readResumeBase64(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath).toString("base64");
  } catch (err) {
    console.error("[bitrix] Failed to read resume file:", err);
    return null;
  }
}

function buildLeadFields(
  data: ValidApplication,
  applicationId: number,
): Record<string, unknown> {
  const title =
    process.env.BITRIX24_LEAD_TITLE?.trim() || "Заявка — Алабуга IT";
  const sourceId = process.env.BITRIX24_SOURCE_ID?.trim() || "WEB";
  const portfolioField = process.env.BITRIX24_PORTFOLIO_FIELD?.trim();
  const resumeField = process.env.BITRIX24_RESUME_FIELD?.trim();
  const assignedById = process.env.BITRIX24_ASSIGNED_BY_ID?.trim();

  const fields: Record<string, unknown> = {
    TITLE: title,
    NAME: data.name,
    PHONE: [{ VALUE: data.phone, VALUE_TYPE: "MOBILE" }],
    COMMENTS: buildComments(data, applicationId),
    SOURCE_ID: sourceId,
  };

  if (assignedById) {
    fields.ASSIGNED_BY_ID = Number(assignedById);
  }

  if (portfolioField) {
    fields[portfolioField] = data.portfolioUrl;
  }

  if (resumeField) {
    const fileContent = readResumeBase64(data.resumeFilePath);
    if (fileContent) {
      // Формат пользовательского поля типа «Файл» в REST API Bitrix24
      fields[resumeField] = [data.resumeOriginalName, fileContent];
    }
  }

  return fields;
}

async function attachResumeOnUpdate(
  leadId: number,
  data: ValidApplication,
): Promise<boolean> {
  const resumeField = process.env.BITRIX24_RESUME_FIELD?.trim();
  if (!resumeField) return false;

  const fileContent = readResumeBase64(data.resumeFilePath);
  if (!fileContent) return false;

  await bitrixCall<boolean>("crm.lead.update", {
    id: leadId,
    fields: {
      [resumeField]: [data.resumeOriginalName, fileContent],
    },
  });

  return true;
}

/**
 * Создаёт лид в Bitrix24. Вызывается после сохранения заявки в PostgreSQL.
 * Если BITRIX24_WEBHOOK_URL не задан — функция просто выходит.
 */
export async function sendApplicationToBitrix(
  data: ValidApplication,
  applicationId: number,
): Promise<BitrixSyncResult | null> {
  if (!isBitrixConfigured()) {
    return null;
  }

  const fields = buildLeadFields(data, applicationId);
  const resumeField = process.env.BITRIX24_RESUME_FIELD?.trim();
  let resumeAttached = Boolean(resumeField && fields[resumeField]);

  let leadId: number;

  try {
    leadId = await bitrixCall<number>("crm.lead.add", { fields });
  } catch (err) {
    // Иногда файл нельзя передать сразу в crm.lead.add — пробуем без файла, потом update
    if (resumeField && fields[resumeField]) {
      delete fields[resumeField];
      leadId = await bitrixCall<number>("crm.lead.add", { fields });
      resumeAttached = await attachResumeOnUpdate(leadId, data);
    } else {
      throw err;
    }
  }

  if (!resumeAttached && resumeField) {
    resumeAttached = await attachResumeOnUpdate(leadId, data);
  }

  console.info(`[bitrix] Lead #${leadId} created for application #${applicationId}`);

  return { leadId, resumeAttached };
}
