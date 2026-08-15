import { Router } from 'express';
import { db } from '../db';
import { requireAdmin } from '../middleware/requireAdmin';

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

packagesRouter.get('/packages', (_req, res) => {
  const rows = db
    .prepare('SELECT * FROM packages WHERE active = 1 ORDER BY sort_order ASC')
    .all() as PackageRow[];
  res.json({ packages: rows.map(toPackage) });
});

packagesRouter.get('/admin/packages', requireAdmin, (_req, res) => {
  const rows = db.prepare('SELECT * FROM packages ORDER BY sort_order ASC').all() as PackageRow[];
  res.json({ packages: rows.map(toPackage) });
});

packagesRouter.post('/admin/packages', requireAdmin, (req, res) => {
  const { name, description, priceCents, category } = req.body || {};
  if (!name || !priceCents) {
    return res.status(400).json({ error: 'name e priceCents são obrigatórios.' });
  }
  const maxOrder = (db.prepare('SELECT COALESCE(MAX(sort_order), -1) as m FROM packages').get() as { m: number }).m;
  const info = db
    .prepare('INSERT INTO packages (name, description, price_cents, category, sort_order) VALUES (?, ?, ?, ?, ?)')
    .run(name, description || '', priceCents, category || 'casamentos', maxOrder + 1);
  const row = db.prepare('SELECT * FROM packages WHERE id = ?').get(info.lastInsertRowid) as PackageRow;
  res.status(201).json({ package: toPackage(row) });
});

packagesRouter.put('/admin/packages/:id', requireAdmin, (req, res) => {
  const existing = db.prepare('SELECT * FROM packages WHERE id = ?').get(req.params.id) as PackageRow | undefined;
  if (!existing) return res.status(404).json({ error: 'Pacote não encontrado.' });

  const { name, description, priceCents, category, active } = req.body || {};
  db.prepare('UPDATE packages SET name = ?, description = ?, price_cents = ?, category = ?, active = ? WHERE id = ?').run(
    name ?? existing.name,
    description ?? existing.description,
    priceCents ?? existing.price_cents,
    category ?? existing.category,
    active === undefined ? existing.active : active ? 1 : 0,
    req.params.id
  );
  const row = db.prepare('SELECT * FROM packages WHERE id = ?').get(req.params.id) as PackageRow;
  res.json({ package: toPackage(row) });
});

packagesRouter.delete('/admin/packages/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM packages WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});
