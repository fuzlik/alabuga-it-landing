import { Router } from "express";
import { pingDb } from "../db.js";
import { isBitrixConfigured } from "../services/bitrix.js";

export const healthRouter = Router();

healthRouter.get("/api/health", async (_req, res) => {
  try {
    await pingDb();
    res.json({ ok: true, db: true, bitrix: isBitrixConfigured() });
  } catch {
    res.status(503).json({ ok: false, db: false, bitrix: isBitrixConfigured() });
  }
});
