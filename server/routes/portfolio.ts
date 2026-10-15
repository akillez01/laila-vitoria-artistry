import { Router } from 'express';
import crypto from 'crypto';
import { db } from '../db.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { makeUploader } from '../upload.js';

export const portfolioRouter = Router();
const uploader = makeUploader('portfolio', { allowVideo: true, maxFileSizeMb: 250 });

interface PortfolioRow {
  id: string;
  title: string;
  category: string;
  url: string;
  description: string;
  location: string;
  date: string;
  camera_json: string | null;
  media_type: string;
  credit: string;
  sort_order: number;
}

function toPhoto(row: PortfolioRow) {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    url: row.url,
    description: row.description,
    location: row.location,
    date: row.date,
    mediaType: row.media_type === 'video' ? 'video' : 'photo',
    credit: row.credit || undefined,
    cameraInfo: row.camera_json ? JSON.parse(row.camera_json) : undefined,
  };
}

portfolioRouter.get('/portfolio', async (_req, res) => {
  const rows = await db.all('SELECT * FROM portfolio_photos ORDER BY sort_order ASC') as PortfolioRow[];
  res.json({ photos: rows.map(toPhoto) });
});

portfolioRouter.post('/admin/portfolio', requireAdmin, async (req, res) => {
  const { title, category, url, description, location, date, cameraInfo, mediaType, credit } = req.body || {};
  if (!title || !category || !url) {
    return res.status(400).json({ error: 'title, category e url são obrigatórios.' });
  }
  const id = crypto.randomUUID();
  const maxOrder = (await db.get('SELECT COALESCE(MAX(sort_order), -1) as m FROM portfolio_photos') as { m: number }).m;
  await db.run(
    `INSERT INTO portfolio_photos (id, title, category, url, description, location, date, camera_json, media_type, credit, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  , 
    id,
    title,
    category,
    url,
    description || '',
    location || '',
    date || '',
    cameraInfo ? JSON.stringify(cameraInfo) : null,
    mediaType === 'video' ? 'video' : 'photo',
    credit || '',
    maxOrder + 1
  );
  const row = await db.get('SELECT * FROM portfolio_photos WHERE id = ?', id) as PortfolioRow;
  res.status(201).json({ photo: toPhoto(row) });
});

portfolioRouter.put('/admin/portfolio/:id', requireAdmin, async (req, res) => {
  const existing = await db.get('SELECT * FROM portfolio_photos WHERE id = ?', req.params.id) as PortfolioRow | undefined;
  if (!existing) return res.status(404).json({ error: 'Foto não encontrada.' });

  const { title, category, url, description, location, date, cameraInfo, mediaType, credit } = req.body || {};
  await db.run(
    `UPDATE portfolio_photos SET title = ?, category = ?, url = ?, description = ?, location = ?, date = ?, camera_json = ?, media_type = ?, credit = ? WHERE id = ?`
  , 
    title ?? existing.title,
    category ?? existing.category,
    url ?? existing.url,
    description ?? existing.description,
    location ?? existing.location,
    date ?? existing.date,
    cameraInfo ? JSON.stringify(cameraInfo) : existing.camera_json,
    mediaType === undefined ? existing.media_type : mediaType === 'video' ? 'video' : 'photo',
    credit === undefined ? existing.credit : credit,
    req.params.id
  );
  const row = await db.get('SELECT * FROM portfolio_photos WHERE id = ?', req.params.id) as PortfolioRow;
  res.json({ photo: toPhoto(row) });
});

portfolioRouter.delete('/admin/portfolio/:id', requireAdmin, async (req, res) => {
  await db.run('DELETE FROM portfolio_photos WHERE id = ?', req.params.id);
  res.json({ ok: true });
});

portfolioRouter.post('/admin/portfolio/upload', requireAdmin, uploader);
