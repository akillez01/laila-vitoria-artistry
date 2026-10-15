import { Router } from 'express';
import crypto from 'crypto';
import { db } from '../db.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { makeUploader } from '../upload.js';

export const galleriesRouter = Router();
const uploader = makeUploader('galleries');

interface GalleryRow {
  id: number;
  code: string;
  client_name: string;
  event_type: string;
  event_date: string;
  cover_image: string;
  max_selections: number;
  drive_link: string | null;
  selection_submitted_at: string | null;
  package_id: number | null;
  extra_photo_price_cents: number;
  access_mode: string;
  client_email: string;
}

interface GalleryPhotoRow {
  id: string;
  gallery_id: number;
  url: string;
  title: string;
  selected: number;
  note: string | null;
}

async function toGallery(row: GalleryRow) {
  const photos = await db.all('SELECT * FROM gallery_photos WHERE gallery_id = ? ORDER BY sort_order ASC', row.id) as GalleryPhotoRow[];

  const pkg = row.package_id
    ? (await db.get('SELECT name, price_cents FROM packages WHERE id = ?', row.package_id) as
        | { name: string; price_cents: number }
        | undefined)
    : undefined;

  return {
    code: row.code,
    clientName: row.client_name,
    eventType: row.event_type,
    eventDate: row.event_date,
    coverImage: row.cover_image,
    totalPhotos: photos.length,
    maxSelections: row.max_selections,
    driveLink: row.drive_link || undefined,
    selectionSubmittedAt: row.selection_submitted_at || undefined,
    packageId: row.package_id,
    packageName: pkg?.name,
    packagePriceCents: pkg?.price_cents,
    extraPhotoPriceCents: row.extra_photo_price_cents,
    accessMode: row.access_mode === 'email' ? 'email' : 'code',
    clientEmail: row.client_email || undefined,
    photos: photos.map((p) => ({
      id: p.id,
      url: p.url,
      title: p.title,
      selected: !!p.selected,
      note: p.note || undefined,
    })),
  };
}

async function saveSelection(galleryId: number, items: any[]) {
  await db.batch([
    ...items.map((item) => ({
      sql: 'UPDATE gallery_photos SET selected = ?, note = ? WHERE id = ? AND gallery_id = ?',
      args: [item.selected ? 1 : 0, item.note ?? null, item.id, galleryId],
    })),
    { sql: "UPDATE client_galleries SET selection_submitted_at = datetime('now') WHERE id = ?", args: [galleryId] },
  ]);
}

async function findGalleryByCode(code: string): Promise<GalleryRow | undefined> {
  return await db.get('SELECT * FROM client_galleries WHERE code = ?', code.trim().toUpperCase()) as
    | GalleryRow
    | undefined;
}

// Public: client accesses gallery by code
galleriesRouter.get('/galleries/:code', async (req, res) => {
  const row = await findGalleryByCode(String(req.params.code));
  if (!row) return res.status(404).json({ error: 'Galeria não encontrada.' });
  res.json({ gallery: await toGallery(row) });
});

// Public: client accesses a free gallery by the email registered for it
galleriesRouter.post('/galleries/access-by-email', async (req, res) => {
  const { email } = req.body || {};
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Informe o e-mail usado na sua galeria.' });
  }
  const row = await db.get("SELECT * FROM client_galleries WHERE access_mode = 'email' AND lower(client_email) = lower(?)", email.trim()) as GalleryRow | undefined;
  if (!row) {
    return res.status(404).json({ error: 'Nenhuma galeria gratuita encontrada para esse e-mail. Confira com a fotógrafa.' });
  }
  res.json({ gallery: await toGallery(row) });
});

// Public: client submits/updates their photo selection
galleriesRouter.patch('/galleries/:code/selection', async (req, res) => {
  const row = await findGalleryByCode(String(req.params.code));
  if (!row) return res.status(404).json({ error: 'Galeria não encontrada.' });

  const { photos } = req.body || {};
  if (!Array.isArray(photos)) {
    return res.status(400).json({ error: 'photos deve ser um array de { id, selected, note? }.' });
  }

  await saveSelection(row.id, photos);

  const fresh = await db.get('SELECT * FROM client_galleries WHERE id = ?', row.id) as GalleryRow;
  res.json({ gallery: await toGallery(fresh) });
});

// Public: client finalizes selection AND creates an order to pay for it
galleriesRouter.post('/galleries/:code/checkout', async (req, res) => {
  const row = await findGalleryByCode(String(req.params.code));
  if (!row) return res.status(404).json({ error: 'Galeria não encontrada.' });

  const { photos, clientEmail, clientPhone } = req.body || {};
  if (!Array.isArray(photos)) {
    return res.status(400).json({ error: 'photos deve ser um array de { id, selected, note? }.' });
  }
  if (!clientEmail) {
    return res.status(400).json({ error: 'clientEmail é obrigatório para gerar o pagamento.' });
  }

  if (!row.package_id && row.extra_photo_price_cents === 0) {
    return res
      .status(400)
      .json({ error: 'Esta galeria ainda não tem um pacote ou valor por foto configurado. Fale com a fotógrafa.' });
  }

  await saveSelection(row.id, photos);

  const selectedCount = (photos as any[]).filter((p) => p.selected).length;
  const pkg = row.package_id
    ? (await db.get('SELECT price_cents FROM packages WHERE id = ?', row.package_id) as
        | { price_cents: number }
        | undefined)
    : undefined;

  const basePrice = pkg?.price_cents || 0;
  const extraCount = Math.max(0, selectedCount - row.max_selections);
  const amountCents = basePrice + extraCount * row.extra_photo_price_cents;

  const info = await db.run(
      `INSERT INTO orders (package_id, gallery_code, client_name, client_email, client_phone, amount_cents, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`
    , row.package_id, row.code, row.client_name, clientEmail, clientPhone || null, amountCents);

  const fresh = await db.get('SELECT * FROM client_galleries WHERE id = ?', row.id) as GalleryRow;
  res.status(201).json({ gallery: await toGallery(fresh), orderId: info.lastInsertRowid, amountCents });
});

// Admin: list all galleries
galleriesRouter.get('/admin/galleries', requireAdmin, async (_req, res) => {
  const rows = await db.all('SELECT * FROM client_galleries ORDER BY created_at DESC') as GalleryRow[];
  res.json({ galleries: await Promise.all(rows.map(toGallery)) });
});

// Admin: create gallery
galleriesRouter.post('/admin/galleries', requireAdmin, async (req, res) => {
  const {
    code,
    clientName,
    eventType,
    eventDate,
    coverImage,
    maxSelections,
    driveLink,
    packageId,
    extraPhotoPriceCents,
    accessMode,
    clientEmail,
  } = req.body || {};
  const mode = accessMode === 'email' ? 'email' : 'code';
  if (mode === 'email' && !clientEmail) {
    return res.status(400).json({ error: 'clientEmail é obrigatório para galerias de acesso por e-mail.' });
  }
  if (!clientName || !eventType || !eventDate) {
    return res.status(400).json({ error: 'clientName, eventType e eventDate são obrigatórios.' });
  }
  const finalCode = code ? String(code).trim().toUpperCase() : crypto.randomUUID().slice(0, 8).toUpperCase();

  try {
    const info = await db.run(
        `INSERT INTO client_galleries
          (code, client_name, event_type, event_date, cover_image, max_selections, drive_link, package_id, extra_photo_price_cents, access_mode, client_email)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      , 
        finalCode,
        clientName,
        eventType,
        eventDate,
        coverImage || '',
        maxSelections || 0,
        driveLink || null,
        packageId || null,
        extraPhotoPriceCents || 0,
        mode,
        (clientEmail || '').trim().toLowerCase()
      );
    const row = await db.get('SELECT * FROM client_galleries WHERE id = ?', info.lastInsertRowid) as GalleryRow;
    res.status(201).json({ gallery: await toGallery(row) });
  } catch (err: any) {
    if (String(err.message).includes('UNIQUE')) {
      return res.status(409).json({ error: 'Já existe uma galeria com esse código.' });
    }
    throw err;
  }
});

// Admin: update gallery metadata
galleriesRouter.put('/admin/galleries/:code', requireAdmin, async (req, res) => {
  const row = await findGalleryByCode(String(req.params.code));
  if (!row) return res.status(404).json({ error: 'Galeria não encontrada.' });

  const {
    clientName,
    eventType,
    eventDate,
    coverImage,
    maxSelections,
    driveLink,
    packageId,
    extraPhotoPriceCents,
    accessMode,
    clientEmail,
  } = req.body || {};
  await db.run(
    `UPDATE client_galleries SET client_name = ?, event_type = ?, event_date = ?, cover_image = ?, max_selections = ?,
      drive_link = ?, package_id = ?, extra_photo_price_cents = ?, access_mode = ?, client_email = ? WHERE id = ?`
  , 
    clientName ?? row.client_name,
    eventType ?? row.event_type,
    eventDate ?? row.event_date,
    coverImage ?? row.cover_image,
    maxSelections ?? row.max_selections,
    driveLink ?? row.drive_link,
    packageId === undefined ? row.package_id : packageId || null,
    extraPhotoPriceCents === undefined ? row.extra_photo_price_cents : extraPhotoPriceCents,
    accessMode === undefined ? row.access_mode : accessMode === 'email' ? 'email' : 'code',
    clientEmail === undefined ? row.client_email : String(clientEmail).trim().toLowerCase(),
    row.id
  );
  const fresh = await db.get('SELECT * FROM client_galleries WHERE id = ?', row.id) as GalleryRow;
  res.json({ gallery: await toGallery(fresh) });
});

// Admin: delete gallery
galleriesRouter.delete('/admin/galleries/:code', requireAdmin, async (req, res) => {
  const row = await findGalleryByCode(String(req.params.code));
  if (!row) return res.status(404).json({ error: 'Galeria não encontrada.' });
  // Apaga as fotos explicitamente: no Turso cada requisição é uma conexão nova, então não
  // dá para contar com PRAGMA foreign_keys = ON para o ON DELETE CASCADE.
  await db.batch([
    { sql: 'DELETE FROM gallery_photos WHERE gallery_id = ?', args: [row.id] },
    { sql: 'DELETE FROM client_galleries WHERE id = ?', args: [row.id] },
  ]);
  res.json({ ok: true });
});

// Admin: add a photo to a gallery (metadata only, url already known)
galleriesRouter.post('/admin/galleries/:code/photos', requireAdmin, async (req, res) => {
  const row = await findGalleryByCode(String(req.params.code));
  if (!row) return res.status(404).json({ error: 'Galeria não encontrada.' });

  const { url, title } = req.body || {};
  if (!url || !title) return res.status(400).json({ error: 'url e title são obrigatórios.' });

  const id = crypto.randomUUID();
  const maxOrder = (
    await db.get('SELECT COALESCE(MAX(sort_order), -1) as m FROM gallery_photos WHERE gallery_id = ?', row.id) as {
      m: number;
    }
  ).m;
  await db.run(
    'INSERT INTO gallery_photos (id, gallery_id, url, title, selected, sort_order) VALUES (?, ?, ?, ?, 0, ?)'
  , id, row.id, url, title, maxOrder + 1);

  const fresh = await db.get('SELECT * FROM client_galleries WHERE id = ?', row.id) as GalleryRow;
  res.status(201).json({ gallery: await toGallery(fresh) });
});

// Admin: upload a photo file for a gallery, returns the URL to then call POST .../photos
galleriesRouter.post('/admin/galleries/:code/upload', requireAdmin, uploader);

// Admin: remove a photo from a gallery
galleriesRouter.delete('/admin/galleries/:code/photos/:photoId', requireAdmin, async (req, res) => {
  const row = await findGalleryByCode(String(req.params.code));
  if (!row) return res.status(404).json({ error: 'Galeria não encontrada.' });
  await db.run('DELETE FROM gallery_photos WHERE id = ? AND gallery_id = ?', req.params.photoId, row.id);
  res.json({ ok: true });
});
