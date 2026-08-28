import fs from "node:fs";
import path from "node:path";
import "dotenv/config";
import cors from "cors";
import express from "express";
import multer from "multer";
import { RESUME_EXT, RESUME_MAX_BYTES, RESUME_MAX_FILES, RESUME_MIME } from "../shared/resume.js";
import { initDb, insertApplication, pingDb } from "./db.js";
import { isBitrixConfigured, sendApplicationToBitrix } from "./bitrix.js";
import { isTelegramConfigured, sendApplicationToTelegram } from "./telegram.js";
import { removeUploadedFiles, validateApplication } from "./validation.js";

const app = express();
const port = Number(process.env.PORT) || 3001;
const uploadDir = path.resolve("uploads", "resumes");

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safeOriginal = file.originalname.replace(/[^a-zA-Z0-9._-]+/g, "_");
    cb(null, `${Date.now()}-${safeOriginal}`);
  },
});

const upload = multer({
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

const corsOrigin = process.env.CORS_ORIGIN;
app.use(
  cors({
    origin: corsOrigin ? corsOrigin.split(",").map((v) => v.trim()) : true,
  }),
);

app.get("/api/health", async (_req, res) => {
  try {
    await pingDb();
    res.json({ ok: true, db: true, bitrix: isBitrixConfigured() });
  } catch {
    res.status(503).json({ ok: false, db: false, bitrix: isBitrixConfigured() });
  }
});

app.post("/api/applications", (req, res) => {
  upload.array("resume", RESUME_MAX_FILES)(req, res, async (err) => {
    const uploaded = Array.isArray(req.files) ? req.files : [];

    if (err instanceof multer.MulterError) {
      removeUploadedFiles(uploaded);
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ error: "Каждый файл не больше 10 МБ" });
      }
      if (err.code === "LIMIT_FILE_COUNT") {
        return res.status(400).json({ error: `Можно прикрепить не больше ${RESUME_MAX_FILES} файлов` });
      }
      return res.status(400).json({ error: "Не удалось загрузить файл" });
    }

    if (err instanceof Error && err.message === "INVALID_RESUME_TYPE") {
      removeUploadedFiles(uploaded);
      return res.status(400).json({ error: "Допустимые форматы: PDF, DOC, DOCX" });
    }

    if (err) {
      removeUploadedFiles(uploaded);
      console.error("Upload failed:", err);
      return res.status(500).json({ error: "Не удалось загрузить файл" });
    }

    const parsed = validateApplication({
      name: req.body?.name,
      phone: req.body?.phone,
      portfolio: req.body?.portfolio,
      source: req.body?.source,
      resume: uploaded,
    });

    if ("errors" in parsed) {
      removeUploadedFiles(uploaded);
      return res.status(400).json({ error: parsed.errors[0], errors: parsed.errors });
    }

    try {
      const row = await insertApplication(parsed.data);

      void sendApplicationToBitrix(parsed.data, row.id).catch((bitrixErr) => {
        console.error("[bitrix] Failed to sync application:", bitrixErr);
      });

      void sendApplicationToTelegram(parsed.data, row.id).catch((telegramErr) => {
        console.error("[telegram] Failed to sync application:", telegramErr);
      });

      return res.status(201).json({ id: row.id, createdAt: row.created_at });
    } catch (dbErr) {
      removeUploadedFiles(uploaded);
      console.error("Failed to save application:", dbErr);
      return res.status(500).json({ error: "Не удалось сохранить заявку" });
    }
  });
});

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  await initDb();
  app.listen(port, "127.0.0.1", () => {
    console.log(`API listening on http://127.0.0.1:${port}`);
    if (isBitrixConfigured()) {
      console.log("[bitrix] Webhook configured — leads will sync to Bitrix24");
    } else {
      console.log("[bitrix] BITRIX24_WEBHOOK_URL not set — CRM sync disabled");
    }
    if (isTelegramConfigured()) {
      console.log("[telegram] Bot URL configured — applications will sync to Telegram");
    } else {
      console.log("[telegram] TELEGRAM_BOT_URL not set — Telegram sync disabled");
    }
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
