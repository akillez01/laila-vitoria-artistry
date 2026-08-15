import 'dotenv/config';
import crypto from 'crypto';
import { db } from './db';
import { hashPassword } from './auth';

function generatePassword(): string {
  return crypto.randomBytes(9).toString('base64').replace(/[+/=]/g, '').slice(0, 12) + '!A1';
}

function main() {
  const [, , email, name, role] = process.argv;
  if (!email || !name) {
    console.error('Uso: npm run create-admin -- <email> "<nome>" ["<cargo>"]');
    process.exit(1);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existing = db.prepare('SELECT id FROM admins WHERE email = ?').get(normalizedEmail);
  if (existing) {
    console.error(`Já existe um admin com o email ${normalizedEmail}.`);
    process.exit(1);
  }

  const reference = db.prepare('SELECT * FROM admins ORDER BY id ASC LIMIT 1').get() as any;
  const password = generatePassword();

  db.prepare(
    `INSERT INTO admins (name, email, password_hash, whatsapp, studio_address, role, avatar_url, instagram_handle)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
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

main();
