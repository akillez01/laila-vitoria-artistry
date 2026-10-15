import 'dotenv/config';
import crypto from 'crypto';
import { db, initDb } from './db.js';
import { hashPassword } from './auth.js';

function generatePassword(): string {
  return crypto.randomBytes(9).toString('base64').replace(/[+/=]/g, '').slice(0, 12) + '!A1';
}

async function main() {
  await initDb();
  const [, , email, name, role] = process.argv;
  if (!email || !name) {
    console.error('Uso: npm run create-admin -- <email> "<nome>" ["<cargo>"]');
    process.exit(1);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existing = await db.get('SELECT id FROM admins WHERE email = ?', normalizedEmail);
  if (existing) {
    console.error(`Já existe um admin com o email ${normalizedEmail}.`);
    process.exit(1);
  }

  const reference = await db.get('SELECT * FROM admins ORDER BY id ASC LIMIT 1') as any;
  const password = generatePassword();

  await db.run(
    `INSERT INTO admins (name, email, password_hash, whatsapp, studio_address, role, avatar_url, instagram_handle)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  , 
    name,
    normalizedEmail,
    hashPassword(password),
    reference?.whatsapp || '',
    reference?.studio_address || '',
    role || 'FOTÓGRAFA PRINCIPAL',
    reference?.avatar_url || '',
    reference?.instagram_handle || ''
  );

  console.log('\n✅ Novo admin criado.');
  console.log('\n=== CREDENCIAIS (guarde e troque a senha depois) ===');
  console.log(`Email: ${normalizedEmail}`);
  console.log(`Senha: ${password}`);
  console.log('======================================================\n');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
