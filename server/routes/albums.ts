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
  cover_image_id: string | null;
  sort_order: number;
  created_at: string;
  cover_url: string | null;
  photo_count: number;
}

interface AlbumImageRow {
  id: string;
  album_id: string;
  title: string;
  description: string;
  url: string;
  sort_order: number;
}

// Capa = foto escolhida; se não houver (ou foi apagada), a primeira foto do álbum.
const ALBUM_SELECT = `
  SELECT a.*,
    COALESCE(
      (SELECT url FROM album_images WHERE id = a.cover_image_id AND album_id = a.id),
      (SELECT url FROM album_images WHERE album_id = a.id ORDER BY sort_order ASC LIMIT 1)
    ) AS cover_url,
    (SELECT COUNT(*) FROM album_images WHERE album_id = a.id) AS photo_count
  FROM albums a`;

function toAlbum(row: AlbumRow) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    coverImageId: row.cover_image_id,
    coverUrl: row.cover_url || '',
    photoCount: Number(row.photo_count) || 0,
    createdAt: row.created_at,
  };
}

function toImage(row: AlbumImageRow) {
  return {
    id: row.id,
    albumId: row.album_id,
    title: row.title,
    description: row.description,
    url: row.url,
  };
}

async function getAlbum(id: string) {
  return (await db.get(`${ALBUM_SELECT} WHERE a.id = ?`, id)) as AlbumRow | undefined;
}

// ---------- Público ----------

albumsRouter.get('/albums', async (_req, res) => {
  const rows = (await db.all(`${ALBUM_SELECT} ORDER BY a.sort_order ASC, a.created_at DESC`)) as AlbumRow[];
  res.json({ albums: rows.map(toAlbum) });
});

albumsRouter.get('/albums/:id', async (req, res) => {
  const album = await getAlbum(String(req.params.id));
  if (!album) return res.status(404).json({ error: 'Álbum não encontrado.' });
  const images = (await db.all(
    'SELECT * FROM album_images WHERE album_id = ? ORDER BY sort_order ASC',
    String(req.params.id),
  )) as AlbumImageRow[];
  res.json({ album: toAlbum(album), images: images.map(toImage) });
});

// ---------- Admin: álbuns ----------

albumsRouter.post('/admin/albums/upload', requireAdmin, uploader);

albumsRouter.post('/admin/albums', requireAdmin, async (req, res) => {
  const { title, description } = req.body || {};
  if (!title || !String(title).trim()) {
    return res.status(400).json({ error: 'O título do álbum é obrigatório.' });
  }
  const id = crypto.randomUUID();
  // Álbum novo aparece primeiro.
  const minOrder = ((await db.get('SELECT COALESCE(MIN(sort_order), 1) as m FROM albums')) as { m: number }).m;
  await db.run(
    'INSERT INTO albums (id, title, description, sort_order) VALUES (?, ?, ?, ?)',
    id,
    String(title).trim(),
    description || '',
    minOrder - 1,
  );
  res.status(201).json({ album: toAlbum((await getAlbum(id))!) });
});

albumsRouter.put('/admin/albums/:id', requireAdmin, async (req, res) => {
  const existing = await getAlbum(String(req.params.id));
  if (!existing) return res.status(404).json({ error: 'Álbum não encontrado.' });

  const { title, description, coverImageId } = req.body || {};
  if (coverImageId) {
    const img = await db.get('SELECT id FROM album_images WHERE id = ? AND album_id = ?', coverImageId, String(req.params.id));
    if (!img) return res.status(400).json({ error: 'A capa precisa ser uma foto deste álbum.' });
  }
  await db.run(
    'UPDATE albums SET title = ?, description = ?, cover_image_id = ? WHERE id = ?',
    title !== undefined && String(title).trim() ? String(title).trim() : existing.title,
    description ?? existing.description,
    coverImageId !== undefined ? coverImageId : existing.cover_image_id,
    String(req.params.id),
  );
  res.json({ album: toAlbum((await getAlbum(String(req.params.id)))!) });
});

albumsRouter.delete('/admin/albums/:id', requireAdmin, async (req, res) => {
  await db.batch([
    { sql: 'DELETE FROM album_images WHERE album_id = ?', args: [String(req.params.id)] },
    { sql: 'DELETE FROM albums WHERE id = ?', args: [String(req.params.id)] },
  ]);
  res.json({ ok: true });
});

// ---------- Admin: fotos do álbum ----------

albumsRouter.post('/admin/albums/:id/images', requireAdmin, async (req, res) => {
  const album = await getAlbum(String(req.params.id));
  if (!album) return res.status(404).json({ error: 'Álbum não encontrado.' });

  const { url, title, description } = req.body || {};
  if (!url) return res.status(400).json({ error: 'url é obrigatória.' });

  const id = crypto.randomUUID();
  const maxOrder = ((await db.get(
    'SELECT COALESCE(MAX(sort_order), -1) as m FROM album_images WHERE album_id = ?',
    String(req.params.id),
  )) as { m: number }).m;
  await db.run(
    'INSERT INTO album_images (id, album_id, title, description, url, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
    id,
    String(req.params.id),
    title || '',
    description || '',
    url,
    maxOrder + 1,
  );
  // Primeira foto vira a capa automaticamente.
  if (!album.cover_image_id) {
    await db.run('UPDATE albums SET cover_image_id = ? WHERE id = ?', id, String(req.params.id));
  }
  const row = (await db.get('SELECT * FROM album_images WHERE id = ?', id)) as AlbumImageRow;
  res.status(201).json({ image: toImage(row) });
});

albumsRouter.put('/admin/album-images/:id', requireAdmin, async (req, res) => {
  const existing = (await db.get('SELECT * FROM album_images WHERE id = ?', String(req.params.id))) as AlbumImageRow | undefined;
  if (!existing) return res.status(404).json({ error: 'Foto não encontrada.' });

  const { title, description, url } = req.body || {};
  await db.run(
    'UPDATE album_images SET title = ?, description = ?, url = ? WHERE id = ?',
    title ?? existing.title,
    description ?? existing.description,
    url ?? existing.url,
    String(req.params.id),
  );
  const row = (await db.get('SELECT * FROM album_images WHERE id = ?', String(req.params.id))) as AlbumImageRow;
  res.json({ image: toImage(row) });
});

albumsRouter.delete('/admin/album-images/:id', requireAdmin, async (req, res) => {
  await db.batch([
    { sql: 'UPDATE albums SET cover_image_id = NULL WHERE cover_image_id = ?', args: [String(req.params.id)] },
    { sql: 'DELETE FROM album_images WHERE id = ?', args: [String(req.params.id)] },
  ]);
  res.json({ ok: true });
});
