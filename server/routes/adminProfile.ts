import { Router } from 'express';
import { db } from '../db.js';
import { requireAdmin, type AuthedRequest } from '../middleware/requireAdmin.js';
import { makeUploader } from '../upload.js';

export const adminProfileRouter = Router();
const avatarUploader = makeUploader('avatars');

adminProfileRouter.post('/admin/profile/avatar', requireAdmin, avatarUploader);

// Público: usado pela home para exibir o widget de Instagram ao vivo, se configurado.
adminProfileRouter.get('/site-settings', async (_req, res) => {
  const row = await db.get('SELECT instagram_widget_url FROM admins ORDER BY id ASC LIMIT 1') as
    | { instagram_widget_url: string }
    | undefined;
  res.json({ instagramWidgetUrl: row?.instagram_widget_url || '' });
});

adminProfileRouter.patch('/admin/profile', requireAdmin, async (req: AuthedRequest, res) => {
  const existing = await db.get('SELECT * FROM admins WHERE id = ?', req.adminId) as
    | Record<string, any>
    | undefined;
  if (!existing) return res.status(404).json({ error: 'Admin não encontrado.' });

  const { name, email, whatsapp, studioAddress, avatarUrl, instagramHandle, instagramWidgetUrl, bio, notifications } =
    req.body || {};

  await db.run(
    `UPDATE admins SET
      name = ?, email = ?, whatsapp = ?, studio_address = ?, avatar_url = ?, instagram_handle = ?,
      instagram_widget_url = ?, bio = ?,
      notify_new_orders = ?, notify_payment_alerts = ?, notify_weekly_summary = ?
     WHERE id = ?`
  , 
    name ?? existing.name,
    email ?? existing.email,
    whatsapp ?? existing.whatsapp,
    studioAddress ?? existing.studio_address,
    avatarUrl ?? existing.avatar_url,
    instagramHandle ?? existing.instagram_handle,
    instagramWidgetUrl ?? existing.instagram_widget_url,
    bio ?? existing.bio,
    notifications?.newOrders === undefined ? existing.notify_new_orders : notifications.newOrders ? 1 : 0,
    notifications?.paymentAlerts === undefined ? existing.notify_payment_alerts : notifications.paymentAlerts ? 1 : 0,
    notifications?.weeklySummary === undefined ? existing.notify_weekly_summary : notifications.weeklySummary ? 1 : 0,
    req.adminId
  );

  const row = await db.get('SELECT * FROM admins WHERE id = ?', req.adminId) as Record<string, any>;
  res.json({
    profile: {
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
    },
  });
});
