import { Router } from 'express';
import { db } from '../db.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

export const packagesRouter = Router();

interface PackageRow {
  id: number;
  name: string;
  description: string;
  price_cents: number;
  category: string;
  active: number;
  sort_order: number;
}

function toPackage(row: PackageRow) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    priceCents: row.price_cents,
    category: row.category,
    active: !!row.active,
  };
}

packagesRouter.get('/packages', async (_req, res) => {
  const rows = await db.all('SELECT * FROM packages WHERE active = 1 ORDER BY sort_order ASC') as PackageRow[];
  res.json({ packages: rows.map(toPackage) });
});

packagesRouter.get('/admin/packages', requireAdmin, async (_req, res) => {
  const rows = await db.all('SELECT * FROM packages ORDER BY sort_order ASC') as PackageRow[];
  res.json({ packages: rows.map(toPackage) });
});

packagesRouter.post('/admin/packages', requireAdmin, async (req, res) => {
  const { name, description, priceCents, category } = req.body || {};
  if (!name || !priceCents) {
    return res.status(400).json({ error: 'name e priceCents são obrigatórios.' });
  }
  const maxOrder = (await db.get('SELECT COALESCE(MAX(sort_order), -1) as m FROM packages') as { m: number }).m;
  const info = await db.run('INSERT INTO packages (name, description, price_cents, category, sort_order) VALUES (?, ?, ?, ?, ?)', name, description || '', priceCents, category || 'casamentos', maxOrder + 1);
  const row = await db.get('SELECT * FROM packages WHERE id = ?', info.lastInsertRowid) as PackageRow;
  res.status(201).json({ package: toPackage(row) });
});

packagesRouter.put('/admin/packages/:id', requireAdmin, async (req, res) => {
  const existing = await db.get('SELECT * FROM packages WHERE id = ?', req.params.id) as PackageRow | undefined;
  if (!existing) return res.status(404).json({ error: 'Pacote não encontrado.' });

  const { name, description, priceCents, category, active } = req.body || {};
  await db.run('UPDATE packages SET name = ?, description = ?, price_cents = ?, category = ?, active = ? WHERE id = ?', 
    name ?? existing.name,
    description ?? existing.description,
    priceCents ?? existing.price_cents,
    category ?? existing.category,
    active === undefined ? existing.active : active ? 1 : 0,
    req.params.id
  );
  const row = await db.get('SELECT * FROM packages WHERE id = ?', req.params.id) as PackageRow;
  res.json({ package: toPackage(row) });
});

packagesRouter.delete('/admin/packages/:id', requireAdmin, async (req, res) => {
  await db.run('DELETE FROM packages WHERE id = ?', req.params.id);
  res.json({ ok: true });
});
