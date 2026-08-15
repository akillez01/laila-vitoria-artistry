import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const DATABASE_PATH = process.env.DATABASE_PATH || './data/app.db';
const resolvedPath = path.resolve(process.cwd(), DATABASE_PATH);
fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });

export const db = new Database(resolvedPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const schema = fs.readFileSync(path.resolve(process.cwd(), 'server/schema.sql'), 'utf-8');
db.exec(schema);

// Migrações leves e idempotentes para bancos criados antes de novas colunas existirem.
function ensureColumn(table: string, column: string, definition: string) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
  if (!columns.some((c) => c.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

ensureColumn('admins', 'bio', "TEXT NOT NULL DEFAULT ''");
ensureColumn('client_galleries', 'package_id', 'INTEGER REFERENCES packages(id)');
ensureColumn('client_galleries', 'extra_photo_price_cents', 'INTEGER NOT NULL DEFAULT 0');
ensureColumn('orders', 'installments', 'INTEGER');
ensureColumn('admins', 'instagram_widget_url', "TEXT NOT NULL DEFAULT ''");
ensureColumn('client_galleries', 'access_mode', "TEXT NOT NULL DEFAULT 'code'");
ensureColumn('client_galleries', 'client_email', "TEXT NOT NULL DEFAULT ''");
ensureColumn('portfolio_photos', 'media_type', "TEXT NOT NULL DEFAULT 'photo'");
ensureColumn('portfolio_photos', 'credit', "TEXT NOT NULL DEFAULT ''");
