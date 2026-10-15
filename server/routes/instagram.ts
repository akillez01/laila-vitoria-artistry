import { Router } from 'express';
import crypto from 'crypto';
import { db } from '../db.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { makeUploader } from '../upload.js';

export const instagramRouter = Router();
const uploader = makeUploader('instagram', { allowVideo: true });

interface InstagramPostRow {
  id: string;
  media_url: string;
  media_type: string;
  caption: string;
  permalink: string;
  sort_order: number;
}

function toPost(row: InstagramPostRow) {
  return {
    id: row.id,
    mediaUrl: row.media_url,
    mediaType: row.media_type,
    caption: row.caption,
    permalink: row.permalink,
  };
}

instagramRouter.get('/instagram', async (_req, res) => {
  const rows = await db.all('SELECT * FROM instagram_posts ORDER BY sort_order ASC') as InstagramPostRow[];
  res.json({ posts: rows.map(toPost) });
});

instagramRouter.post('/admin/instagram', requireAdmin, async (req, res) => {
  const { mediaUrl, mediaType, caption, permalink } = req.body || {};
  if (!mediaUrl) {
    return res.status(400).json({ error: 'mediaUrl é obrigatório.' });
  }
  const id = crypto.randomUUID();
  const maxOrder = (
    await db.get('SELECT COALESCE(MAX(sort_order), -1) as m FROM instagram_posts') as { m: number }
  ).m;
  await db.run(
    `INSERT INTO instagram_posts (id, media_url, media_type, caption, permalink, sort_order)
     VALUES (?, ?, ?, ?, ?, ?)`
  , id, mediaUrl, mediaType === 'video' ? 'video' : 'image', caption || '', permalink || '', maxOrder + 1);
  const row = await db.get('SELECT * FROM instagram_posts WHERE id = ?', id) as InstagramPostRow;
  res.status(201).json({ post: toPost(row) });
});

instagramRouter.delete('/admin/instagram/:id', requireAdmin, async (req, res) => {
  await db.run('DELETE FROM instagram_posts WHERE id = ?', req.params.id);
  res.json({ ok: true });
});

instagramRouter.post('/admin/instagram/upload', requireAdmin, uploader);
