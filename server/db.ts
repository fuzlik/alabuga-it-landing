import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS applications (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      portfolio_url TEXT NOT NULL,
      source TEXT NOT NULL DEFAULT 'desktop',
      resume_original_name TEXT,
      resume_stored_name TEXT,
      resume_file_path TEXT,
      resume_mime_type TEXT,
      resume_size INTEGER,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    ALTER TABLE applications
      ADD COLUMN IF NOT EXISTS resume_original_name TEXT,
      ADD COLUMN IF NOT EXISTS resume_stored_name TEXT,
      ADD COLUMN IF NOT EXISTS resume_file_path TEXT,
      ADD COLUMN IF NOT EXISTS resume_mime_type TEXT,
      ADD COLUMN IF NOT EXISTS resume_size INTEGER,
      ADD COLUMN IF NOT EXISTS resume_files JSONB;
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS applications_created_at_idx
      ON applications (created_at DESC);
  `);
}

export async function insertApplication(data: {
  name: string;
  phone: string;
  portfolioUrl: string;
  source: string;
  resumes: Array<{
    resumeOriginalName: string;
    resumeStoredName: string;
    resumeFilePath: string;
    resumeMimeType: string;
    resumeSize: number;
  }>;
  resumeOriginalName: string;
  resumeStoredName: string;
  resumeFilePath: string;
  resumeMimeType: string;
  resumeSize: number;
}) {
  const result = await pool.query<{ id: number; created_at: string }>(
    `INSERT INTO applications (
      name, phone, portfolio_url, source,
      resume_original_name, resume_stored_name, resume_file_path, resume_mime_type, resume_size,
      resume_files
    )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING id, created_at`,
    [
      data.name,
      data.phone,
      data.portfolioUrl,
      data.source,
      data.resumeOriginalName,
      data.resumeStoredName,
      data.resumeFilePath,
      data.resumeMimeType,
      data.resumeSize,
      JSON.stringify(data.resumes),
    ],
  );
  return result.rows[0];
}

export async function pingDb() {
  await pool.query("SELECT 1");
}

export { pool };
