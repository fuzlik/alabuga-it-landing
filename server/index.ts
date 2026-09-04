import "dotenv/config";
import cors from "cors";
import express from "express";
import { initDb } from "./db.js";
import { applicationsRouter } from "./routes/applications.js";
import { healthRouter } from "./routes/health.js";
import { isBitrixConfigured } from "./services/bitrix.js";
import { isTelegramConfigured } from "./services/telegram.js";

const app = express();
const port = Number(process.env.PORT) || 3001;

const corsOrigin = process.env.CORS_ORIGIN;
app.use(
  cors({
    origin: corsOrigin ? corsOrigin.split(",").map((v) => v.trim()) : true,
  }),
);

app.use(healthRouter);
app.use(applicationsRouter);

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
