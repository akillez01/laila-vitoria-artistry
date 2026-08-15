import { Router } from 'express';
import crypto from 'crypto';
import { db } from '../db';
import { requireAdmin } from '../middleware/requireAdmin';
import { makeUploader, publicUrlFor } from '../upload';

export const portfolioRouter = Router();
const uploader = makeUploader('portfolio', { allowVideo: true });

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

portfolioRouter.get('/portfolio', (_req, res) => {
  const rows = db.prepare('SELECT * FROM portfolio_photos ORDER BY sort_order ASC').all() as PortfolioRow[];
  res.json({ photos: rows.map(toPhoto) });
});

portfolioRouter.post('/admin/portfolio', requireAdmin, (req, res) => {
  const { title, category, url, description, location, date, cameraInfo, mediaType, credit } = req.body || {};
  if (!title || !category || !url) {
    return res.status(400).json({ error: 'title, category e url são obrigatórios.' });
  }
  const id = crypto.randomUUID();
  const maxOrder = (db.prepare('SELECT COALESCE(MAX(sort_order), -1) as m FROM portfolio_photos').get() as { m: number }).m;
  db.prepare(
    `INSERT INTO portfolio_photos (id, title, category, url, description, location, date, camera_json, media_type, credit, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
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
  const row = db.prepare('SELECT * FROM portfolio_photos WHERE id = ?').get(id) as PortfolioRow;
  res.status(201).json({ photo: toPhoto(row) });
});

portfolioRouter.put('/admin/portfolio/:id', requireAdmin, (req, res) => {
  const existing = db.prepare('SELECT * FROM portfolio_photos WHERE id = ?').get(req.params.id) as PortfolioRow | undefined;
  if (!existing) return res.status(404).json({ error: 'Foto não encontrada.' });

  const { title, category, url, description, location, date, cameraInfo, mediaType, credit } = req.body || {};
  db.prepare(
    `UPDATE portfolio_photos SET title = ?, category = ?, url = ?, description = ?, location = ?, date = ?, camera_json = ?, media_type = ?, credit = ? WHERE id = ?`
  ).run(
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
  const row = db.prepare('SELECT * FROM portfolio_photos WHERE id = ?').get(req.params.id) as PortfolioRow;
  res.json({ photo: toPhoto(row) });
});

portfolioRouter.delete('/admin/portfolio/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM portfolio_photos WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

portfolioRouter.post('/admin/portfolio/upload', requireAdmin, uploader.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nenhuma imagem enviada.' });
  res.json({ url: publicUrlFor('portfolio', req.file.filename) });
});
