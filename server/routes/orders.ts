import { Router } from 'express';
import path from 'path';
import { db } from '../db.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { Readable } from 'stream';

export const ordersRouter = Router();

export interface OrderRow {
  id: number;
  package_id: number | null;
  gallery_code: string | null;
  client_name: string;
  client_email: string;
  client_phone: string | null;
  amount_cents: number;
  status: string;
  payment_method: string | null;
  mp_preference_id: string | null;
  mp_payment_id: string | null;
  installments: number | null;
  created_at: string;
  paid_at: string | null;
}

export function toOrder(row: OrderRow) {
  return {
    id: row.id,
    packageId: row.package_id,
    galleryCode: row.gallery_code || undefined,
    clientName: row.client_name,
    clientEmail: row.client_email,
    clientPhone: row.client_phone || undefined,
    amountCents: row.amount_cents,
    status: row.status,
    paymentMethod: row.payment_method || undefined,
    mpPaymentId: row.mp_payment_id || undefined,
    installments: row.installments || undefined,
    createdAt: row.created_at,
    paidAt: row.paid_at || undefined,
  };
}

// Public: client creates an order (pending) for a package before checking out
ordersRouter.post('/orders', async (req, res) => {
  const { packageId, galleryCode, clientName, clientEmail, clientPhone } = req.body || {};
  if (!packageId || !clientName || !clientEmail) {
    return res.status(400).json({ error: 'packageId, clientName e clientEmail são obrigatórios.' });
  }

  const pkg = await db.get('SELECT * FROM packages WHERE id = ? AND active = 1', packageId) as
    | { id: number; price_cents: number }
    | undefined;
  if (!pkg) return res.status(404).json({ error: 'Pacote não encontrado ou inativo.' });

  const info = await db.run(
      `INSERT INTO orders (package_id, gallery_code, client_name, client_email, client_phone, amount_cents, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`
    , pkg.id, galleryCode || null, clientName, clientEmail, clientPhone || null, pkg.price_cents);

  const row = await db.get('SELECT * FROM orders WHERE id = ?', info.lastInsertRowid) as OrderRow;
  res.status(201).json({ order: toOrder(row) });
});

// Public: poll order status (e.g. after returning from Mercado Pago checkout)
ordersRouter.get('/orders/:id', async (req, res) => {
  const row = await db.get('SELECT * FROM orders WHERE id = ?', req.params.id) as OrderRow | undefined;
  if (!row) return res.status(404).json({ error: 'Pedido não encontrado.' });
  res.json({ order: toOrder(row) });
});

// Public: download a .zip of the selected photos for a paid order
ordersRouter.get('/orders/:id/download', async (req, res) => {
  // archiver is ESM-only; the production server is bundled as CJS by esbuild,
  // so it must be loaded via dynamic import() rather than a static import.
  const { ZipArchive } = await import('archiver');
  const order = await db.get('SELECT * FROM orders WHERE id = ?', req.params.id) as OrderRow | undefined;
  if (!order) return res.status(404).json({ error: 'Pedido não encontrado.' });
  if (order.status !== 'approved') {
    return res.status(409).json({ error: 'Este pedido ainda não foi confirmado como pago.' });
  }
  if (!order.gallery_code) {
    return res.status(404).json({ error: 'Este pedido não está vinculado a uma galeria.' });
  }

  const gallery = await db.get('SELECT id FROM client_galleries WHERE code = ?', order.gallery_code) as
    | { id: number }
    | undefined;
  if (!gallery) return res.status(404).json({ error: 'Galeria não encontrada.' });

  const photos = await db.all('SELECT url, title FROM gallery_photos WHERE gallery_id = ? AND selected = 1', gallery.id) as { url: string; title: string }[];
  if (photos.length === 0) {
    return res.status(404).json({ error: 'Nenhuma foto selecionada para este pedido.' });
  }

  const zipName = `${order.client_name.replace(/[^a-zA-Z0-9]+/g, '-')}-fotos.zip`;
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="${zipName}"`);

  const archive = new ZipArchive({ zlib: { level: 9 } });
  archive.on('error', (err) => {
    console.error('Erro ao gerar zip de fotos:', err);
    res.status(500).end();
  });
  archive.pipe(res);

  // As fotos ficam no R2: baixa uma por vez e vai adicionando ao zip em streaming,
  // sem carregar tudo na memória da função.
  const usedNames = new Set<string>();
  for (const photo of photos) {
    const upstream = await fetch(photo.url);
    if (!upstream.ok || !upstream.body) {
      console.error(`Foto indisponível para o zip (${upstream.status}): ${photo.url}`);
      continue;
    }
    const urlPath = new URL(photo.url).pathname;
    const ext = path.extname(urlPath);
    const safeTitle = (photo.title || path.basename(urlPath, ext)).replace(/[\\/]/g, '-');
    let name = `${safeTitle}${ext}`;
    if (usedNames.has(name)) {
      name = `${safeTitle}-${usedNames.size}${ext}`;
    }
    usedNames.add(name);
    const entryDone = new Promise((resolve) => archive.once('entry', resolve));
    archive.append(Readable.fromWeb(upstream.body as any), { name });
    await entryDone;
  }

  archive.finalize();
});

// Admin: list orders
ordersRouter.get('/admin/orders', requireAdmin, async (_req, res) => {
  const rows = await db.all('SELECT * FROM orders ORDER BY created_at DESC') as OrderRow[];
  res.json({ orders: rows.map(toOrder) });
});

const VALID_STATUSES = ['pending', 'approved', 'rejected', 'cancelled'];

// Admin: manually update an order's status (e.g. confirm a Pix received outside Mercado Pago)
ordersRouter.patch('/admin/orders/:id', requireAdmin, async (req, res) => {
  const row = await db.get('SELECT * FROM orders WHERE id = ?', req.params.id) as OrderRow | undefined;
  if (!row) return res.status(404).json({ error: 'Pedido não encontrado.' });

  const { status, paymentMethod } = req.body || {};
  if (!status || !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `status deve ser um de: ${VALID_STATUSES.join(', ')}.` });
  }

  const paidAt = status === 'approved' ? new Date().toISOString() : row.paid_at;
  await db.run('UPDATE orders SET status = ?, payment_method = ?, paid_at = ? WHERE id = ?', 
    status,
    paymentMethod ?? row.payment_method,
    paidAt,
    row.id
  );

  const fresh = await db.get('SELECT * FROM orders WHERE id = ?', row.id) as OrderRow;
  res.json({ order: toOrder(fresh) });
});
