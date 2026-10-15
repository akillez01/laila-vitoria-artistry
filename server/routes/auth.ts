import { Router } from 'express';
import { db } from '../db.js';
import { hashPassword, verifyPassword, signToken, setAuthCookie, clearAuthCookie } from '../auth.js';
import { requireAdmin, type AuthedRequest } from '../middleware/requireAdmin.js';

export const authRouter = Router();

interface AdminRow {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  whatsapp: string;
  studio_address: string;
  role: string;
  avatar_url: string;
  instagram_handle: string;
  instagram_widget_url: string;
  bio: string;
  notify_new_orders: number;
  notify_payment_alerts: number;
  notify_weekly_summary: number;
}

function toProfile(row: AdminRow) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    whatsapp: row.whatsapp,
    studioAddress: row.studio_address,
    role: row.role,
    avatarUrl: row.avatar_url,
    instagramHandle: row.instagram_handle,
    instagramWidgetUrl: row.instagram_widget_url,
    bio: row.bio,
    notifications: {
      newOrders: !!row.notify_new_orders,
      paymentAlerts: !!row.notify_payment_alerts,
      weeklySummary: !!row.notify_weekly_summary,
    },
  };
}

authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
  }

  const row = await db.get('SELECT * FROM admins WHERE email = ?', String(email).trim().toLowerCase()) as AdminRow | undefined;

  if (!row || !verifyPassword(password, row.password_hash)) {
    return res.status(401).json({ error: 'Email ou senha inválidos.' });
  }

  const token = signToken(row.id);
  setAuthCookie(res, token);
  res.json({ profile: toProfile(row) });
});

authRouter.post('/logout', async (_req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
});

authRouter.get('/me', requireAdmin, async (req: AuthedRequest, res) => {
  const row = await db.get('SELECT * FROM admins WHERE id = ?', req.adminId) as AdminRow | undefined;
  if (!row) return res.status(404).json({ error: 'Admin não encontrado.' });
  res.json({ profile: toProfile(row) });
});

authRouter.patch('/password', requireAdmin, async (req: AuthedRequest, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword || String(newPassword).length < 8) {
    return res.status(400).json({ error: 'Senha atual e nova senha (mín. 8 caracteres) são obrigatórias.' });
  }

  const row = await db.get('SELECT * FROM admins WHERE id = ?', req.adminId) as AdminRow | undefined;
  if (!row || !verifyPassword(currentPassword, row.password_hash)) {
    return res.status(401).json({ error: 'Senha atual incorreta.' });
  }

  await db.run('UPDATE admins SET password_hash = ? WHERE id = ?', hashPassword(newPassword), row.id);
  res.json({ ok: true });
});
