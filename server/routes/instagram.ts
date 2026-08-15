import { Router } from 'express';
import crypto from 'crypto';
import { db } from '../db';
import { requireAdmin } from '../middleware/requireAdmin';
import { makeUploader, publicUrlFor } from '../upload';

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

instagramRouter.get('/instagram', (_req, res) => {
  const rows = db.prepare('SELECT * FROM instagram_posts ORDER BY sort_order ASC').all() as InstagramPostRow[];
  res.json({ posts: rows.map(toPost) });
});

instagramRouter.post('/admin/instagram', requireAdmin, (req, res) => {
  const { mediaUrl, mediaType, caption, permalink } = req.body || {};
  if (!mediaUrl) {
    return res.status(400).json({ error: 'mediaUrl é obrigatório.' });
  }
  const id = crypto.randomUUID();
  const maxOrder = (
    db.prepare('SELECT COALESCE(MAX(sort_order), -1) as m FROM instagram_posts').get() as { m: number }
  ).m;
  db.prepare(
    `INSERT INTO instagram_posts (id, media_url, media_type, caption, permalink, sort_order)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(id, mediaUrl, mediaType === 'video' ? 'video' : 'image', caption || '', permalink || '', maxOrder + 1);
  const row = db.prepare('SELECT * FROM instagram_posts WHERE id = ?').get(id) as InstagramPostRow;
  res.status(201).json({ post: toPost(row) });
});

instagramRouter.delete('/admin/instagram/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM instagram_posts WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

instagramRouter.post('/admin/instagram/upload', requireAdmin, uploader.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
  const mediaType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
  res.json({ url: publicUrlFor('instagram', req.file.filename), mediaType });
});
