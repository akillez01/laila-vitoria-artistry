import { Router } from 'express';
import crypto from 'crypto';
import { db } from '../db';
import { requireAdmin } from '../middleware/requireAdmin';
import { makeUploader, publicUrlFor } from '../upload';

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

albumsRouter.get('/albums', (_req, res) => {
  const rows = db.prepare('SELECT * FROM album_images ORDER BY sort_order ASC').all() as AlbumRow[];
  res.json({ images: rows.map(toImage) });
});

albumsRouter.post('/admin/albums', requireAdmin, (req, res) => {
  const { title, url, description } = req.body || {};
  if (!title || !url) {
    return res.status(400).json({ error: 'title e url são obrigatórios.' });
  }
  const id = crypto.randomUUID();
  const maxOrder = (db.prepare('SELECT COALESCE(MAX(sort_order), -1) as m FROM album_images').get() as { m: number }).m;
  db.prepare(
    `INSERT INTO album_images (id, title, description, url, sort_order) VALUES (?, ?, ?, ?, ?)`
  ).run(id, title, description || '', url, maxOrder + 1);
  const row = db.prepare('SELECT * FROM album_images WHERE id = ?').get(id) as AlbumRow;
  res.status(201).json({ image: toImage(row) });
});

albumsRouter.put('/admin/albums/:id', requireAdmin, (req, res) => {
  const existing = db.prepare('SELECT * FROM album_images WHERE id = ?').get(req.params.id) as AlbumRow | undefined;
  if (!existing) return res.status(404).json({ error: 'Imagem não encontrada.' });

  const { title, url, description } = req.body || {};
  db.prepare('UPDATE album_images SET title = ?, description = ?, url = ? WHERE id = ?').run(
    title ?? existing.title,
    description ?? existing.description,
    url ?? existing.url,
    req.params.id
  );
  const row = db.prepare('SELECT * FROM album_images WHERE id = ?').get(req.params.id) as AlbumRow;
  res.json({ image: toImage(row) });
});

albumsRouter.delete('/admin/albums/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM album_images WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

albumsRouter.post('/admin/albums/upload', requireAdmin, uploader.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nenhuma imagem enviada.' });
  res.json({ url: publicUrlFor('albums', req.file.filename) });
});
