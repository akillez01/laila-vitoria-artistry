import React, { useEffect, useState } from 'react';
import { Trash2, Plus, AlertCircle, X, Pencil, EyeOff, Eye } from 'lucide-react';
import { Package } from '../types';
import { api, ApiError } from '../lib/api';

const CATEGORIES = ['casamentos', 'retratos', 'moda', 'cultura', 'esporte', 'aniversarios', 'eventos', 'videos'];

export const AdminPackagesManager: React.FC = () => {
  const [packages, setPackages] = useState<Package[] | null>(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<Package | 'new' | null>(null);

  const loadPackages = () => {
    api<{ packages: Package[] }>('/api/admin/packages')
      .then(({ packages }) => setPackages(packages))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Não foi possível carregar os pacotes.'));
  };

  useEffect(() => {
    loadPackages();
  }, []);

  const handleDelete = async (pkg: Package) => {
    if (!window.confirm(`Excluir o pacote "${pkg.name}"? Isso não pode ser desfeito.`)) return;
    try {
      await api(`/api/admin/packages/${pkg.id}`, { method: 'DELETE' });
      setPackages((prev) => prev?.filter((p) => p.id !== pkg.id) || null);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? 'Este pacote está vinculado a pedidos ou galerias existentes — desative-o em vez de excluir.'
          : 'Não foi possível remover o pacote.'
      );
    }
  };

  const toggleActive = async (pkg: Package) => {
    try {
      const { package: updated } = await api<{ package: Package }>(`/api/admin/packages/${pkg.id}`, {
        method: 'PUT',
        body: JSON.stringify({ active: !pkg.active }),
      });
      setPackages((prev) => prev?.map((p) => (p.id === updated.id ? updated : p)) || null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível atualizar o pacote.');
    }
  };

  const formatPrice = (cents: number) =>
    (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <main className="px-5 sm:px-8 md:px-16 max-w-4xl mx-auto mt-8">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-playfair text-xl font-bold text-neutral-900 dark:text-white">Pacotes & Preços</h2>
        <button
          onClick={() => setEditing('new')}
          className="flex items-center gap-1.5 bg-neutral-900 dark:bg-amber-500 text-white dark:text-neutral-950 px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-md hover:bg-neutral-800 dark:hover:bg-amber-400 transition-all"
        >
          <Plus className="w-4 h-4" /> Novo Pacote
        </button>
      </div>
      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-6">
        Pacotes ativos aparecem automaticamente em "Coleções & Pacotes" no site público e podem ser vinculados a
        galerias de clientes. Use a categoria "videos" para pacotes de vídeo.
      </p>

      {error && (
        <div className="flex items-center gap-2 text-xs text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/50 p-3 rounded-md border border-red-200 dark:border-red-900 mb-4">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {packages === null ? (
        <p className="text-sm text-neutral-500">Carregando...</p>
      ) : packages.length === 0 ? (
        <p className="text-sm text-neutral-500">Nenhum pacote cadastrado ainda.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`bg-white dark:bg-[#181a1d] border rounded-lg p-4 flex items-center gap-4 ${
                pkg.active
                  ? 'border-neutral-200 dark:border-neutral-800'
                  : 'border-neutral-200 dark:border-neutral-800 opacity-50'
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-neutral-900 dark:text-white truncate">
                  {pkg.name} — {formatPrice(pkg.priceCents)}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                  {pkg.category} {!pkg.active && '· inativo (não aparece no site)'}
                </p>
              </div>
              <button
                onClick={() => toggleActive(pkg)}
                className="text-neutral-400 hover:text-amber-600 dark:hover:text-amber-400 shrink-0"
                title={pkg.active ? 'Desativar (esconder do site)' : 'Ativar (mostrar no site)'}
              >
                {pkg.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setEditing(pkg)}
                className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white shrink-0"
                title="Editar"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(pkg)}
                className="text-neutral-400 hover:text-red-600 dark:hover:text-red-400 shrink-0"
                title="Excluir"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <PackageFormModal
          pkg={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={(pkg) => {
            setPackages((prev) => {
              if (!prev) return [pkg];
              const exists = prev.some((p) => p.id === pkg.id);
              return exists ? prev.map((p) => (p.id === pkg.id ? pkg : p)) : [...prev, pkg];
            });
            setEditing(null);
          }}
        />
      )}
    </main>
  );
};

const PackageFormModal: React.FC<{
  pkg: Package | null;
  onClose: () => void;
  onSaved: (pkg: Package) => void;
}> = ({ pkg, onClose, onSaved }) => {
  const [name, setName] = useState(pkg?.name || '');
  const [description, setDescription] = useState(pkg?.description || '');
  const [price, setPrice] = useState(pkg ? (pkg.priceCents / 100).toString() : '');
  const [category, setCategory] = useState(pkg?.category || 'casamentos');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const body = JSON.stringify({
        name,
        description,
        priceCents: Math.round(Number(price) * 100),
        category,
      });
      const { package: saved } = pkg
        ? await api<{ package: Package }>(`/api/admin/packages/${pkg.id}`, { method: 'PUT', body })
        : await api<{ package: Package }>('/api/admin/packages', { method: 'POST', body });
      onSaved(saved);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível salvar o pacote.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center px-4 animate-fadeIn">
      <div className="bg-white dark:bg-[#181a1d] rounded-lg max-w-md w-full p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="font-playfair text-xl font-bold text-neutral-900 dark:text-white mb-4">
          {pkg ? 'Editar Pacote' : 'Novo Pacote'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            required
            placeholder="Nome do pacote (ex: Casamento Fine Art)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md py-2.5 px-3 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500"
          />

          <textarea
            placeholder="Descrição (o que está incluso)"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md py-2.5 px-3 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500 resize-none"
          />

          <div className="flex gap-3">
            <div className="w-1/2 flex flex-col gap-1">
              <label className="text-xs text-neutral-600 dark:text-neutral-400">Preço (R$)</label>
              <input
                type="number"
                required
                min={0}
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md py-2.5 px-3 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="w-1/2 flex flex-col gap-1">
              <label className="text-xs text-neutral-600 dark:text-neutral-400">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md py-2.5 px-3 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/50 p-3 rounded-md border border-red-200 dark:border-red-900">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-neutral-900 dark:bg-amber-500 text-white dark:text-neutral-950 px-4 py-3 text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 dark:hover:bg-amber-400 transition-all rounded-md disabled:opacity-50"
          >
            {saving ? 'Salvando...' : pkg ? 'Salvar Alterações' : 'Criar Pacote'}
          </button>
        </form>
      </div>
    </div>
  );
};
