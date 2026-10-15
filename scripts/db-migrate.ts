// Cria/atualiza as tabelas no banco configurado (Turso se TURSO_DATABASE_URL existir).
import 'dotenv/config';
import { initDb } from '../server/db.js';

await initDb();
console.log(`✅ Schema aplicado em ${process.env.TURSO_DATABASE_URL || 'SQLite local'}`);
