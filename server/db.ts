import { createClient, type InArgs, type InStatement } from '@libsql/client';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// Produção (Vercel): Turso via TURSO_DATABASE_URL + TURSO_AUTH_TOKEN.
// Dev local: sem TURSO_DATABASE_URL, usa o arquivo SQLite em DATABASE_PATH.
const url =
  process.env.TURSO_DATABASE_URL ||
  `file:${path.resolve(process.cwd(), process.env.DATABASE_PATH || './data/app.db')}`;

export const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });

type Arg = InArgs extends (infer T)[] ? T : never;

// better-sqlite3 aceitava undefined; o libsql não — trata como NULL.
const toArgs = (args: any[]) => args.map((a) => (a === undefined ? null : a)) as Arg[];

// Pequeno wrapper com a mesma "cara" do better-sqlite3 (get/all/run), só que assíncrono.
export const db = {
  async get<T = any>(sql: string, ...args: any[]): Promise<T | undefined> {
    const rs = await client.execute({ sql, args: toArgs(args) });
    return rs.rows[0] as T | undefined;
  },
  async all<T = any>(sql: string, ...args: any[]): Promise<T[]> {
    const rs = await client.execute({ sql, args: toArgs(args) });
    return rs.rows as unknown as T[];
  },
  async run(sql: string, ...args: any[]) {
    const rs = await client.execute({ sql, args: toArgs(args) });
    return { changes: rs.rowsAffected, lastInsertRowid: rs.lastInsertRowid === undefined ? 0 : Number(rs.lastInsertRowid) };
  },
  // Executa vários comandos atomicamente (substitui db.transaction do better-sqlite3).
  async batch(statements: InStatement[]) {
    return client.batch(statements, 'write');
  },
};

// Cria tabelas e aplica migrações leves e idempotentes. Roda via `npm run db:migrate`
// (e automaticamente no servidor de dev local), nunca a cada requisição na Vercel.
export async function initDb() {
  if (url.startsWith('file:')) {
    fs.mkdirSync(path.dirname(url.slice('file:'.length)), { recursive: true });
  }
  await client.execute('PRAGMA foreign_keys = ON');
  const schema = fs.readFileSync(path.resolve(process.cwd(), 'server/schema.sql'), 'utf-8');
  await client.executeMultiple(schema);

  async function ensureColumn(table: string, column: string, definition: string) {
    const columns = await db.all<{ name: string }>(`PRAGMA table_info(${table})`);
    if (!columns.some((c) => c.name === column)) {
      await client.execute(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
    }
  }

  await ensureColumn('admins', 'bio', "TEXT NOT NULL DEFAULT ''");
  await ensureColumn('client_galleries', 'package_id', 'INTEGER REFERENCES packages(id)');
  await ensureColumn('client_galleries', 'extra_photo_price_cents', 'INTEGER NOT NULL DEFAULT 0');
  await ensureColumn('orders', 'installments', 'INTEGER');
  await ensureColumn('admins', 'instagram_widget_url', "TEXT NOT NULL DEFAULT ''");
  await ensureColumn('client_galleries', 'access_mode', "TEXT NOT NULL DEFAULT 'code'");
  await ensureColumn('client_galleries', 'client_email', "TEXT NOT NULL DEFAULT ''");
  await ensureColumn('portfolio_photos', 'media_type', "TEXT NOT NULL DEFAULT 'photo'");
  await ensureColumn('portfolio_photos', 'credit', "TEXT NOT NULL DEFAULT ''");
  await ensureColumn('album_images', 'album_id', 'TEXT');
  await client.execute('CREATE INDEX IF NOT EXISTS idx_album_images_album ON album_images(album_id, sort_order)');

  // Fotos soltas de antes da criação de álbuns: cada uma vira um álbum próprio, com ela de capa.
  const orphans = await db.all<{ id: string; title: string; description: string; sort_order: number }>(
    'SELECT id, title, description, sort_order FROM album_images WHERE album_id IS NULL ORDER BY sort_order ASC',
  );
  for (const img of orphans) {
    const albumId = crypto.randomUUID();
    await db.batch([
      {
        sql: 'INSERT INTO albums (id, title, description, cover_image_id, sort_order) VALUES (?, ?, ?, ?, ?)',
        args: [albumId, img.title, img.description || '', img.id, img.sort_order],
      },
      { sql: 'UPDATE album_images SET album_id = ?, sort_order = 0 WHERE id = ?', args: [albumId, img.id] },
    ]);
  }
}
