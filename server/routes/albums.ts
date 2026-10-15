import { Router } from 'express';
import crypto from 'crypto';
import { db } from '../db.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { makeUploader } from '../upload.js';

export const albumsRouter = Router();
const uploader = makeUploader('albums');

interface AlbumRow {
  id: string;
  title: string;
  description: string;
  url: string;
  sort_order: number;
}

function toImage(row: AlbumRow) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    url: row.url,
  };
}

albumsRouter.get('/albums', async (_req, res) => {
  const rows = await db.all('SELECT * FROM album_images ORDER BY sort_order ASC') as AlbumRow[];
  res.json({ images: rows.map(toImage) });
});

albumsRouter.post('/admin/albums', requireAdmin, async (req, res) => {
  const { title, url, description } = req.body || {};
  if (!title || !url) {
    return res.status(400).json({ error: 'title e url são obrigatórios.' });
  }
  const id = crypto.randomUUID();
  const maxOrder = (await db.get('SELECT COALESCE(MAX(sort_order), -1) as m FROM album_images') as { m: number }).m;
  await db.run(
    `INSERT INTO album_images (id, title, description, url, sort_order) VALUES (?, ?, ?, ?, ?)`
  , id, title, description || '', url, maxOrder + 1);
  const row = await db.get('SELECT * FROM album_images WHERE id = ?', id) as AlbumRow;
  res.status(201).json({ image: toImage(row) });
});

albumsRouter.put('/admin/albums/:id', requireAdmin, async (req, res) => {
  const existing = await db.get('SELECT * FROM album_images WHERE id = ?', req.params.id) as AlbumRow | undefined;
  if (!existing) return res.status(404).json({ error: 'Imagem não encontrada.' });

  const { title, url, description } = req.body || {};
  await db.run('UPDATE album_images SET title = ?, description = ?, url = ? WHERE id = ?', 
    title ?? existing.title,
    description ?? existing.description,
    url ?? existing.url,
    req.params.id
  );
  const row = await db.get('SELECT * FROM album_images WHERE id = ?', req.params.id) as AlbumRow;
  res.json({ image: toImage(row) });
});

albumsRouter.delete('/admin/albums/:id', requireAdmin, async (req, res) => {
  await db.run('DELETE FROM album_images WHERE id = ?', req.params.id);
  res.json({ ok: true });
});

albumsRouter.post('/admin/albums/upload', requireAdmin, uploader);
