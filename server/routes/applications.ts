import { Router } from "express";
import multer from "multer";
import { RESUME_MAX_FILES } from "../../shared/resume.js";
import { insertApplication } from "../db.js";
import { sendApplicationToBitrix } from "../services/bitrix.js";
import { sendApplicationToTelegram } from "../services/telegram.js";
import { resumeUpload } from "../upload.js";
import { removeUploadedFiles, validateApplication } from "../validation.js";

export const applicationsRouter = Router();

applicationsRouter.post("/api/applications", (req, res) => {
  resumeUpload.array("resume", RESUME_MAX_FILES)(req, res, async (err) => {
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
