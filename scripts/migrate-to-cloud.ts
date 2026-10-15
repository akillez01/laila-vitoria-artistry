// Migra os dados do servidor antigo para a nuvem:
//   1. envia todos os arquivos de ./uploads para o bucket R2 (mesma estrutura de pastas);
//   2. copia todas as tabelas do SQLite local (./data/app.db) para o Turso, trocando as
//      URLs "/uploads/..." pela URL pública do R2.
//
// Uso:  npm run migrate:cloud            (faz tudo)
//       npm run migrate:cloud -- --skip-files   (só o banco)
//
// Requer no .env: TURSO_DATABASE_URL, TURSO_AUTH_TOKEN e as variáveis R2_*.
// É seguro rodar de novo: arquivos são sobrescritos e as linhas usam INSERT OR REPLACE.
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { createClient } from '@libsql/client';
import { client as turso, initDb } from '../server/db.js';
import { putLocalFile, publicBaseUrl } from '../server/upload.js';

const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
const LOCAL_DB = path.resolve(process.cwd(), process.env.DATABASE_PATH || './data/app.db');

// Ordem respeita as chaves estrangeiras.
const TABLES = [
  'admins',
  'packages',
  'portfolio_photos',
  'album_images',
  'instagram_posts',
  'client_galleries',
  'gallery_photos',
  'orders',
];

const contentTypes: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.mp4': 'video/mp4',
  '.mov': 'video/quicktime',
  '.webm': 'video/webm',
};

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    return e.isDirectory() ? walk(full) : [full];
  });
}

async function migrateFiles() {
  const files = walk(UPLOADS_DIR).filter((f) => contentTypes[path.extname(f).toLowerCase()]);
  console.log(`Enviando ${files.length} arquivos para o R2...`);
  let done = 0;
  for (const file of files) {
    const key = path.relative(UPLOADS_DIR, file).split(path.sep).join('/');
    await putLocalFile(key, file, contentTypes[path.extname(file).toLowerCase()]);
    done++;
    if (done % 10 === 0 || done === files.length) console.log(`  ${done}/${files.length}`);
  }
}

async function migrateDatabase() {
  if (!process.env.TURSO_DATABASE_URL) {
    throw new Error('TURSO_DATABASE_URL não configurado — o destino seria o próprio SQLite local.');
  }
  const local = createClient({ url: `file:${LOCAL_DB}` });
  const base = publicBaseUrl();
  const rewrite = (v: unknown) =>
    typeof v === 'string' && v.startsWith('/uploads/') ? `${base}/${v.slice('/uploads/'.length)}` : v;

  await initDb();

  for (const table of TABLES) {
    const rs = await local.execute(`SELECT * FROM ${table}`);
    if (rs.rows.length === 0) {
      console.log(`${table}: vazio`);
      continue;
    }
    const cols = rs.columns;
    const sql = `INSERT OR REPLACE INTO ${table} (${cols.join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`;
    await turso.batch(
      rs.rows.map((row) => ({ sql, args: cols.map((c) => rewrite(row[c]) as any) })),
      'write',
    );
    console.log(`${table}: ${rs.rows.length} linhas`);
  }
}

async function main() {
  if (!process.argv.includes('--skip-files')) await migrateFiles();
  await migrateDatabase();
  console.log('\n✅ Migração concluída.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
